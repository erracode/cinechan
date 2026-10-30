/\*\*

- Ejemplos de uso del Voice Pipeline
-
- Este archivo demuestra cómo usar la arquitectura del voice pipeline
- con diferentes proveedores y configuraciones.
  \*/

import { PipelineBuilder } from './pipeline.js';
import { getVoiceConfig } from './config.js';
import type { VoiceConfig } from './config.js';

// ============================================
// Ejemplo 1: Uso Básico con Configuración por Defecto
// ============================================

async function ejemplo1_UsoBasico() {
console.log('=== Ejemplo 1: Uso Básico ===');

// Crear pipeline con configuración por defecto
const pipeline = await PipelineBuilder.build();

// Procesar audio
const audioBuffer = Buffer.from('audio data...');
const result = await pipeline.process(audioBuffer);

console.log('Audio generado:', result.length, 'bytes');
}

// ============================================
// Ejemplo 2: Uso con Configuración Personalizada
// ============================================

async function ejemplo2_ConfiguracionPersonalizada() {
console.log('=== Ejemplo 2: Configuración Personalizada ===');

const customConfig: VoiceConfig = {
tts: {
provider: 'kokoro',
defaultVoice: 'af_heart',
defaultLanguage: 'en',
providers: {
kokoro: {
voice: 'am_michael', // Cambiar a voz masculina
speed: 1.2, // Más rápido
dtype: 'q4f16', // Más eficiente
},
},
},
stt: {
provider: 'whisper',
defaultLanguage: 'en',
providers: {
whisper: {
model: 'Xenova/whisper-base',
},
},
},
};

const pipeline = await PipelineBuilder.build(customConfig);
const audioBuffer = Buffer.from('audio data...');
const result = await pipeline.process(audioBuffer);

console.log('Audio generado:', result.length, 'bytes');
}

// ============================================
// Ejemplo 3: Cambiar Proveedor TTS
// ============================================

async function ejemplo3_CambiarProveedorTTS() {
console.log('=== Ejemplo 3: Cambiar Proveedor TTS ===');

const config = getVoiceConfig();

// Cambiar a Qwen3-TTS
config.tts.provider = 'qwen3';
config.tts.defaultVoice = 'Vivian';
config.tts.defaultLanguage = 'zh';
config.tts.providers.qwen3 = {
model: '1.7B',
voice: 'Vivian',
streaming: true,
};

const pipeline = await PipelineBuilder.build(config);
const audioBuffer = Buffer.from('audio data...');
const result = await pipeline.process(audioBuffer);

console.log('Audio generado:', result.length, 'bytes');
}

// ============================================
// Ejemplo 4: Voice Design con Qwen3-TTS
// ============================================

async function ejemplo4_VoiceDesign() {
console.log('=== Ejemplo 4: Voice Design ===');

const config = getVoiceConfig();
config.tts.provider = 'qwen3';
config.tts.providers.qwen3 = {
model: '1.7B',
};

const pipeline = await PipelineBuilder.build(config);

// Usar voice design para personalidad
const text = 'Hola, soy Cinechan, tu asistente de cine!';
const voiceDesign = {
instruct: 'Female, 25 years old, enthusiastic cinema assistant, friendly and helpful',
};

const result = await pipeline.processText(text, voiceDesign);

console.log('Audio generado:', result.length, 'bytes');
}

// ============================================
// Ejemplo 5: Voice Clone con Qwen3-TTS
// ============================================

async function ejemplo5_VoiceClone() {
console.log('=== Ejemplo 5: Voice Clone ===');

const config = getVoiceConfig();
config.tts.provider = 'qwen3';
config.tts.providers.qwen3 = {
model: '1.7B',
};

const pipeline = await PipelineBuilder.build(config);

// Clonar voz personalizada
const refAudio = 'reference_audio.wav';
const refText = 'Reference text for voice';

// Nota: Esto requiere implementación adicional en Qwen3TTS
// const result = await pipeline.processWithVoiceClone(text, refAudio, refText);

console.log('Voice clone requerido');
}

// ============================================
// Ejemplo 6: Manejo de Errores
// ============================================

async function ejemplo6_ManejoDeErrores() {
console.log('=== Ejemplo 6: Manejo de Errores ===');

try {
const pipeline = await PipelineBuilder.build();
const audioBuffer = Buffer.from('audio data...');
const result = await pipeline.process(audioBuffer);

    console.log('Audio generado:', result.length, 'bytes');

} catch (error) {
console.error('Error en pipeline:', error);

    // Manejar error específico
    if (error instanceof Error) {
      if (error.message.includes('TTS provider')) {
        console.error('Proveedor TTS no soportado');
      } else if (error.message.includes('STT provider')) {
        console.error('Proveedor STT no soportado');
      } else if (error.message.includes('not initialized')) {
        console.error('Proveedor no inicializado');
      } else {
        console.error('Error desconocido:', error.message);
      }
    }

}
}

// ============================================
// Ejemplo 7: Probar Diferentes Voces
// ============================================

async function ejemplo7_ProbarVoces() {
console.log('=== Ejemplo 7: Probar Diferentes Voces ===');

const config = getVoiceConfig();
config.tts.provider = 'kokoro';

const voices = config.tts.providers.kokoro?.voice?.split(',') || ['af_heart'];

for (const voice of voices) {
console.log(`\nTesting voice: ${voice}`);
config.tts.providers.kokoro!.voice = voice;

    try {
      const pipeline = await PipelineBuilder.build(config);
      const text = 'Hello world';
      const result = await pipeline.processText(text);

      console.log(`✅ Voice ${voice} works (${result.length} bytes)`);
    } catch (error) {
      console.error(`❌ Voice ${voice} failed:`, error);
    }

}
}

// ============================================
// Ejemplo 8: Configuración desde Environment
// ============================================

async function ejemplo8_ConfiguracionDesdeEnvironment() {
console.log('=== Ejemplo 8: Configuración desde Environment ===');

// La configuración se lee automáticamente de .env
const config = getVoiceConfig();

console.log('TTS Provider:', config.tts.provider);
console.log('STT Provider:', config.stt.provider);
console.log('Default Language:', config.tts.defaultLanguage);
console.log('Default Voice:', config.tts.defaultVoice);

const pipeline = await PipelineBuilder.build(config);
const audioBuffer = Buffer.from('audio data...');
const result = await pipeline.process(audioBuffer);

console.log('Audio generado:', result.length, 'bytes');
}

// ============================================
// Ejemplo 9: Testing con Mock
// ============================================

async function ejemplo9_TestingConMock() {
console.log('=== Ejemplo 9: Testing con Mock ===');

// Configuración para testing
const testConfig = {
tts: {
provider: 'kokoro',
defaultVoice: 'af_heart',
defaultLanguage: 'en',
providers: {
kokoro: {
voice: 'af_heart',
speed: 1.0,
dtype: 'q8',
},
},
},
stt: {
provider: 'whisper',
defaultLanguage: 'en',
providers: {
whisper: {
model: 'Xenova/whisper-tiny',
},
},
},
};

const pipeline = await PipelineBuilder.build(testConfig);

// Procesar con datos mock
const mockAudio = Buffer.from('mock audio data...');
const result = await pipeline.process(mockAudio);

console.log('Audio generado:', result.length, 'bytes');
}

// ============================================
// Ejemplo 10: Validar Configuración
// ============================================

function ejemplo10_ValidarConfiguracion() {
console.log('=== Ejemplo 10: Validar Configuración ===');

const config = getVoiceConfig();

// Validar configuración
const validation = config.tts.provider === 'kokoro'
? { valid: true, errors: [] }
: { valid: false, errors: ['TTS provider not supported'] };

console.log('Configuración válida:', validation.valid);

if (!validation.valid) {
console.log('Errores:', validation.errors);
}
}

// ============================================
// Ejemplo 11: Pipeline con Streaming (Futuro)
// ============================================

async function ejemplo11_PipelineConStreaming() {
console.log('=== Ejemplo 11: Pipeline con Streaming ===');

const config = getVoiceConfig();
config.tts.provider = 'qwen3';
config.tts.providers.qwen3 = {
model: '1.7B',
streaming: true,
};

const pipeline = await PipelineBuilder.build(config);

// Nota: Implementar streaming en TTSProvider
// const result = await pipeline.processStream(audioBuffer);

console.log('Streaming requerido - implementar en TTSProvider');
}

// ============================================
// Ejemplo 12: Migrar entre Proveedores
// ============================================

async function ejemplo12_MigrarEntreProveedores() {
console.log('=== Ejemplo 12: Migrar entre Proveedores ===');

const config = getVoiceConfig();

// Migrar de Kokoro a Qwen3-TTS
const oldConfig = {
...config,
tts: {
...config.tts,
provider: 'qwen3',
defaultVoice: 'Vivian', // Mapear voz
defaultLanguage: 'zh',
providers: {
qwen3: {
...config.tts.providers.qwen3,
model: '1.7B',
},
},
},
};

const pipeline = await PipelineBuilder.build(oldConfig);
const audioBuffer = Buffer.from('audio data...');
const result = await pipeline.process(audioBuffer);

console.log('Audio generado:', result.length, 'bytes');
}

// ============================================
// Ejemplo 13: Debug Pipeline
// ============================================

async function ejemplo13_DebugPipeline() {
console.log('=== Ejemplo 13: Debug Pipeline ===');

const config = getVoiceConfig();

console.log('Configuración cargada:');
console.log('- TTS Provider:', config.tts.provider);
console.log('- STT Provider:', config.stt.provider);
console.log('- Default Language:', config.tts.defaultLanguage);
console.log('- Default Voice:', config.tts.defaultVoice);

const pipeline = await PipelineBuilder.build(config);

console.log('\nPipeline inicializado:');
console.log('- TTS Ready:', pipeline.config.tts.isReady());
console.log('- STT Ready:', pipeline.config.stt.isReady());
console.log('- TTS Voices:', pipeline.config.tts.listVoices());
console.log('- STT Languages:', pipeline.config.stt.supportedLanguages);

// Probar con audio mock
const mockAudio = Buffer.from('mock audio data...');
const result = await pipeline.process(mockAudio);

console.log('\n✅ Pipeline funcionando correctamente');
console.log('- Audio generado:', result.length, 'bytes');
}

// ============================================
// Ejemplo 14: Uso en API Endpoint
// ============================================

async function ejemplo14_UsoEnAPIEndpoint() {
console.log('=== Ejemplo 14: Uso en API Endpoint ===');

// Este es el ejemplo real que usarías en server.ts
let voicePipeline: Awaited<ReturnType<typeof PipelineBuilder.build>> | null =
null;

async function getPipeline(): Promise<Awaited<ReturnType<typeof PipelineBuilder.build>>> {
if (!voicePipeline) {
voicePipeline = await PipelineBuilder.build();
}
return voicePipeline;
}

// En tu endpoint
app.post('/api/voice', async (c) => {
try {
const pipeline = await getPipeline();
const body = await c.req.json();
const { audio } = body;

      if (!audio || typeof audio !== 'string') {
        return c.json({ error: 'Audio data is required' }, 400);
      }

      const audioBuffer = Buffer.from(audio, 'base64');
      const audioData = await pipeline.process(audioBuffer);

      return c.json({
        audio: audioData.toString('base64'),
        text: 'Audio generated successfully',
      });
    } catch (error) {
      console.error('Voice pipeline error:', error);
      return c.json({ error: 'Error processing voice request' }, 500);
    }

});
}

// ============================================
// Ejemplo 15: Configuración Completa con Multiple Providers
// ============================================

async function ejemplo15_ConfiguracionCompleta() {
console.log('=== Ejemplo 15: Configuración Completa ===');

const config: VoiceConfig = {
tts: {
provider: 'kokoro',
defaultVoice: 'af_heart',
defaultLanguage: 'en',
providers: {
kokoro: {
voice: 'af_heart',
speed: 1.0,
dtype: 'q8',
},
qwen3: {
model: '1.7B',
voice: 'Vivian',
streaming: true,
},
},
},
stt: {
provider: 'whisper',
defaultLanguage: 'en',
providers: {
whisper: {
model: 'Xenova/whisper-tiny',
},
deepgram: {
apiKey: process.env.DEEPGRAM_API_KEY,
},
},
},
};

const pipeline = await PipelineBuilder.build(config);
const audioBuffer = Buffer.from('audio data...');
const result = await pipeline.process(audioBuffer);

console.log('Audio generado:', result.length, 'bytes');
console.log('Configuración completa cargada');
}

// ============================================
// Ejecutar todos los ejemplos
// ============================================

async function main() {
console.log('🎬 Ejemplos de uso del Voice Pipeline\n');

await ejemplo1_UsoBasico();
await ejemplo2_ConfiguracionPersonalizada();
await ejemplo3_CambiarProveedorTTS();
await ejemplo4_VoiceDesign();
await ejemplo5_VoiceClone();
await ejemplo6_ManejoDeErrores();
await ejemplo7_ProbarVoces();
await ejemplo8_ConfiguracionDesdeEnvironment();
await ejemplo9_TestingConMock();
await ejemplo10_ValidarConfiguracion();
await ejemplo11_PipelineConStreaming();
await ejemplo12_MigrarEntreProveedores();
await ejemplo13_DebugPipeline();
await ejemplo14_UsoEnAPIEndpoint();
await ejemplo15_ConfiguracionCompleta();

console.log('\n✅ Todos los ejemplos completados');
}

// Solo ejecutar si es el archivo principal
if (import.meta.url === `file://${process.argv[1]}`) {
main().catch(console.error);
}

export {
ejemplo1_UsoBasico,
ejemplo2_ConfiguracionPersonalizada,
ejemplo3_CambiarProveedorTTS,
ejemplo4_VoiceDesign,
ejemplo5_VoiceClone,
ejemplo6_ManejoDeErrores,
ejemplo7_ProbarVoces,
ejemplo8_ConfiguracionDesdeEnvironment,
ejemplo9_TestingConMock,
ejemplo10_ValidarConfiguracion,
ejemplo11_PipelineConStreaming,
ejemplo12_MigrarEntreProveedores,
ejemplo13_DebugPipeline,
ejemplo14_UsoEnAPIEndpoint,
ejemplo15_ConfiguracionCompleta,
};
