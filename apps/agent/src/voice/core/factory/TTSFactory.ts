import type { TTSProvider, TTSConfig } from "../interfaces/ITTS.js";

export type TTSProviderType = "kokoro" | "edgetts" | "qwen3" | "elevenlabs" | "deepgram";

export class TTSFactory {
  private static providers: Map<TTSProviderType, new () => TTSProvider> =
    new Map();

  static register(type: TTSProviderType, providerClass: new () => TTSProvider) {
    this.providers.set(type, providerClass);
  }

  static async create(
    type: TTSProviderType,
    config: TTSConfig,
  ): Promise<TTSProvider> {
    const ProviderClass = this.providers.get(type);

    if (!ProviderClass) {
      throw new Error(
        `TTS provider '${type}' not supported. Available: ${this.getSupportedProviders().join(", ")}`,
      );
    }

    const provider = new ProviderClass();
    await provider.initialize(config);
    return provider;
  }

  static getSupportedProviders(): TTSProviderType[] {
    return Array.from(this.providers.keys());
  }

  static isProviderSupported(type: string): type is TTSProviderType {
    return this.providers.has(type as TTSProviderType);
  }
}
