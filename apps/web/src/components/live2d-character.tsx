"use client";

import { useEffect, useRef, useState } from "react";
import PIXI from "../lib/pixi-setup";

interface Live2DCharacterProps {
  modelUrl: string;
  visible?: boolean;
  scale?: number;
  offsetY?: number;
  mouthOpen?: number;
  mouthOpenRef?: { current: number };
}

export function Live2DCharacter({
  modelUrl,
  visible = true,
  scale: customScale = 0.9,
  offsetY = 0,
  mouthOpen = 0,
  mouthOpenRef,
}: Live2DCharacterProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(false);
  const modelRef = useRef<any>(null);

  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const ticker = () => {
      const model = modelRef.current;
      if (model?.internalModel?.coreModel) {
        const coreModel = model.internalModel.coreModel;
        const paramId = coreModel.getParameterIndex("ParamMouthOpenY");
        if (paramId >= 0) {
          const val = mouthOpenRef ? mouthOpenRef.current : mouthOpen;
          coreModel.setParameterValue(paramId, val);
        }
      }
      requestAnimationFrame(ticker);
    };

    const raf = requestAnimationFrame(ticker);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (!visible || !containerRef.current) return;

    let app: PIXI.Application | null = null;
    let model: any | null = null; // Use any to avoid complex PIXI types for the model

    const loadLive2D = async () => {
      try {
        // Wait for Live2D Cubism Core to be available
        await new Promise<void>((resolve, reject) => {
          const checkInterval = setInterval(() => {
            if ((window as any).Live2DCubismCore) {
              clearInterval(checkInterval);
              resolve();
            }
          }, 100);

          setTimeout(() => {
            clearInterval(checkInterval);
            reject(new Error("Live2D Cubism Core failed to load"));
          }, 10000);
        });

        // Get container size
        const container = containerRef.current;
        if (!container) return;

        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        // Create canvas element
        const canvas = document.createElement("canvas");
        canvas.width = containerWidth;
        canvas.height = containerHeight;
        canvas.style.position = "absolute";
        canvas.style.top = "0";
        canvas.style.left = "0";
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.style.objectFit = "contain";

        container.appendChild(canvas);
        canvasRef.current = canvas;

        // Import Live2D from cubism4
        const { Live2DModel } = await import("pixi-live2d-display/cubism4");

        // Create PixiJS application
        app = new PIXI.Application({
          view: canvas,
          autoStart: true,
          resizeTo: container, // Use container resize for precise fitting
          backgroundColor: 0x000000,
          backgroundAlpha: 0,
          antialias: true,
          powerPreference: "low-power",
        });

        // Wait a moment for PIXI application to fully initialize
        await new Promise((resolve) => setTimeout(resolve, 200));

        if (!app || !app.stage) {
          throw new Error("PIXI Application or stage is not properly initialized");
        }

        // Load Live2D model
        console.log("[Live2DCharacter] Loading model:", modelUrl);
        model = await Live2DModel.from(modelUrl);

        if (!model) {
          throw new Error("Failed to load Live2D model");
        }

        modelRef.current = model;

        // Add model to PIXI stage
        app.stage.addChild(model);

        // Adjust model size and position
        const updatePosition = () => {
          if (!container || !model || !app) return;

          // Use natural size of the model from internal cubism core if possible
          // otherwise fallback to height/scale
          const coreModel = model.internalModel?.coreModel;
          const modelHeight = coreModel?.canvasHeight || (model.height / model.scale.y);
          const modelWidth = coreModel?.canvasWidth || (model.width / model.scale.x);

          if (modelHeight === 0) {
            console.warn("[Live2DCharacter] Model height is 0, retrying position update...");
            setTimeout(updatePosition, 100);
            return;
          }

          // Calculate scale to fit container height
          const baseScale = container.clientHeight / modelHeight;
          const finalScale = baseScale * customScale;

          model.scale.set(finalScale);

          // Center horizontally
          model.x = (container.clientWidth - (modelWidth * finalScale)) / 2;

          // Position vertically based on offsetY
          // Note: model.y 0 is top. 
          model.y = (container.clientHeight - (modelHeight * finalScale)) / 2 + offsetY;

          console.log("[Live2DCharacter] Position updated:", {
            scale: finalScale,
            x: model.x,
            y: model.y,
            container: { w: container.clientWidth, h: container.clientHeight }
          });
        };

        // Initial position
        updatePosition();

        // Listen for window resize
        const handleResize = () => {
          if (app) {
            updatePosition();
          }
        };
        window.addEventListener("resize", handleResize);

        if (isMounted.current) {
          setIsLoaded(true);
          console.log("[Live2DCharacter] Model loaded successfully at scale", customScale);
        }

        // Store cleanup for the resize listener in the effect cleanup
        (window as any)._live2dResizeHandler = handleResize;

      } catch (err) {
        console.error("Error loading Live2D:", err);
        if (isMounted.current) {
          setError(err instanceof Error ? err.message : "Failed to load model");
        }
      }
    };

    loadLive2D();

    return () => {
      console.log("[Live2DCharacter] Cleaning up Live2D resources");

      const handleResize = (window as any)._live2dResizeHandler;
      if (handleResize) {
        window.removeEventListener("resize", handleResize);
        delete (window as any)._live2dResizeHandler;
      }

      if (app && isMounted.current) {
        try {
          // Stop the application first
          app.stop();

          // Destroy with aggressive cleanup
          app.destroy(true, {
            children: true,
            texture: true,
            baseTexture: true,
          });

          // Clear the canvas context
          if (canvasRef.current) {
            const ctx = canvasRef.current.getContext("2d");
            if (ctx) {
              ctx.clearRect(
                0,
                0,
                canvasRef.current.width,
                canvasRef.current.height,
              );
            }
          }
        } catch (destroyError) {
          console.warn(
            "[Live2DCharacter] Error destroying PIXI app:",
            destroyError,
          );
        }
        app = null;
      }
      modelRef.current = null;
      if (canvasRef.current && containerRef.current) {
        containerRef.current.removeChild(canvasRef.current);
        canvasRef.current = null;
      }
    };
  }, [modelUrl, visible]);

  if (!visible) return null;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      style={{ background: "transparent" }}
    >
      {error && (
        <div className="absolute inset-x-0 top-0 text-center text-xs text-red-400 p-2 z-10">
          {error}
        </div>
      )}
      {!isLoaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
        </div>
      )}
    </div>
  );
}
