import type { STTProvider, STTConfig } from "../interfaces/ISTT.js";

export type STTProviderType = "whisper" | "deepgram" | "google";

export class STTFactory {
  private static providers: Map<STTProviderType, new () => STTProvider> =
    new Map();

  static register(type: STTProviderType, providerClass: new () => STTProvider) {
    this.providers.set(type, providerClass);
  }

  static async create(
    type: STTProviderType,
    config: STTConfig,
  ): Promise<STTProvider> {
    const ProviderClass = this.providers.get(type);

    if (!ProviderClass) {
      throw new Error(
        `STT provider '${type}' not supported. Available: ${this.getSupportedProviders().join(", ")}`,
      );
    }

    const provider = new ProviderClass();
    await provider.initialize(config);
    return provider;
  }

  static getSupportedProviders(): STTProviderType[] {
    return Array.from(this.providers.keys());
  }

  static isProviderSupported(type: string): type is STTProviderType {
    return this.providers.has(type as STTProviderType);
  }
}
