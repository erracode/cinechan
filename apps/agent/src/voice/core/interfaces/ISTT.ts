export interface STTConfig {
  language?: string;
  model?: string;
  [key: string]: unknown;
}

export interface STTResult {
  text: string;
  confidence?: number;
  language?: string;
  duration?: number;
}

export interface STTProvider {
  readonly name: string;
  readonly supportedLanguages: string[];

  initialize(config: STTConfig): Promise<void>;
  transcribe(audio: Buffer, config?: Partial<STTConfig>): Promise<STTResult>;
  transcribeStream?(audioChunk: Buffer): Promise<STTResult>;
  isReady(): boolean;
}
