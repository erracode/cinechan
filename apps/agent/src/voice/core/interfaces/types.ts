export type AudioFormat = "wav" | "mp3" | "pcm" | "ogg";
export type Gender = "male" | "female" | "neutral";

export interface VoiceInfo {
  id: string;
  name: string;
  language: string;
  gender?: Gender;
  description?: string;
  preview?: string;
}

export interface AudioMetadata {
  format: AudioFormat;
  sampleRate: number;
  channels?: number;
  duration?: number;
}
