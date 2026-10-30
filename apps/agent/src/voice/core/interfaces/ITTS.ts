import type { AudioMetadata, VoiceInfo } from "./types.js";

export { VoiceInfo };

export interface TTSConfig {
  voice?: string;
  speed?: number;
  language?: string;
  [key: string]: unknown;
}

export interface TTSResult {
  audio: Buffer;
  metadata: AudioMetadata;
}

export interface TTSProvider {
  readonly name: string;
  readonly supportedLanguages: string[];
  readonly supportedVoices: string[];

  initialize(config: TTSConfig): Promise<void>;
  synthesize(text: string, config?: Partial<TTSConfig>): Promise<TTSResult>;
  synthesizeStream?(
    text: string,
    onChunk: (chunk: Buffer) => void,
  ): Promise<void>;
  isReady(): boolean;
  listVoices(): string[];
  getVoiceInfo(voiceId: string): VoiceInfo | undefined;
}
