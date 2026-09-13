import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import { GoogleGenAI, Modality } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '20mb' }));

// Helper to convert 16-bit linear PCM (24000Hz, 1 channel) to WAV Buffer
function pcmToWav(pcmData: Buffer, sampleRate = 24000, numChannels = 1, bitsPerSample = 16): Buffer {
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = pcmData.length;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF chunk descriptor
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // 'fmt ' sub-chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size for PCM
  buffer.writeUInt16LE(1, 20);  // AudioFormat 1 = PCM
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);

  // 'data' sub-chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  pcmData.copy(buffer, 44);
  return buffer;
}

// Convert WAV buffer to high-quality MP3 using ffmpeg
function wavToMp3(wavBuffer: Buffer, bitrate = '192k'): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn(
      'ffmpeg',
      [
        '-i', 'pipe:0',
        '-f', 'mp3',
        '-codec:a', 'libmp3lame',
        '-b:a', bitrate,
        'pipe:1',
      ],
      { stdio: ['pipe', 'pipe', 'ignore'] }
    );

    const chunks: Buffer[] = [];
    ffmpeg.stdout.on('data', (chunk) => chunks.push(chunk));
    ffmpeg.on('close', (code) => {
      if (code === 0) {
        resolve(Buffer.concat(chunks));
      } else {
        reject(new Error(`ffmpeg conversion failed with exit code ${code}`));
      }
    });
    ffmpeg.on('error', reject);
    ffmpeg.stdin.end(wavBuffer);
  });
}

let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', model: 'gemini-3.1-flash-tts-preview' });
});

// Presets endpoint
app.get('/api/presets', (req, res) => {
  res.json({
    presets: [
      {
        id: 'waqt-95-saal',
        title: '95 Saal Ka Waqt (The Reference Dialogue)',
        category: 'Legendary Timekeeper',
        hindi: 'मैंने 95 साल तक दुनिया के वक्त को रोका... लेकिन अब मेरा वक्त पूरा हो चुका है।',
        roman: 'Maine 95 saal tak duniya ke waqt ko roka... Lekin ab mera waqt poora ho chuka hai.',
        englishTranslation: 'For 95 years I halted the flow of world time... But now, my own time has come to an end.',
        suggestedVoice: 'Charon',
        suggestedStyle: 'Speak in a deep, ancient, raspy, dramatic cinematic voice with slow, heavy pauses and dark solemnity'
      },
      {
        id: 'waqt-shikari',
        title: 'Waqt Sabse Bada Shikari',
        category: 'Philosophical Nemesis',
        hindi: 'वक्त सबसे बड़ा शिकारी है... और इस कायनात में कोई भी उससे बचकर नहीं भाग सकता।',
        roman: 'Waqt sabse bada shikari hai... aur is kaynat mein koi bhi usse bachkar nahi bhaag sakta.',
        englishTranslation: 'Time is the greatest hunter... and in this entire universe, no one can outrun it.',
        suggestedVoice: 'Fenrir',
        suggestedStyle: 'Speak with gravelly, threatening intensity and cold measured authority'
      },
      {
        id: 'sadiyon-ke-lamhe',
        title: 'Sadiyon Ke Lamhe',
        category: 'Weary Immortal',
        hindi: 'मैंने सदियों को रेत की तरह फिसलते देखा है... आज आखिरी दाना भी गिर गया।',
        roman: 'Maine sadiyon ko ret ki tarah phisalte dekha hai... aaj aakhri daana bhi gir gaya.',
        englishTranslation: 'I have watched centuries slip away like grains of sand... today the very last grain has fallen.',
        suggestedVoice: 'Charon',
        suggestedStyle: 'Speak in a heavy, weary, melancholic breath-infused voice with deep baritone timbre'
      },
      {
        id: 'ghadi-ki-suiyan',
        title: 'Ghadi Ki Ulti Suiyan',
        category: 'Temporal Anomaly',
        hindi: 'सुनो ध्यान से... घड़ी की सुइयां उल्टी चलने लगी हैं। वक्त अब लौट रहा है।',
        roman: 'Suno dhyan se... ghadi ki suiyan ulti chalne lagi hain. Waqt ab laut raha hai.',
        englishTranslation: 'Listen closely... the clock hands have started ticking backwards. Time is reversing now.',
        suggestedVoice: 'Puck',
        suggestedStyle: 'Speak in an ominous, raspy, eerie whisper with unsettling mystery'
      },
      {
        id: 'kainaat-ka-aakhri-pal',
        title: 'Kainaat Ka Aakhri Pal',
        category: 'Cosmic Fate',
        hindi: 'जब यह घड़ी रुक जाएगी, तो यह पूरी दुनिया हमेशा के लिए जम जाएगी।',
        roman: 'Jab yeh ghadi ruk jayegi, toh yeh poori duniya hamesha ke liye jam jayegi.',
        englishTranslation: 'When this chronograph ceases to tick, the entire world will freeze forever.',
        suggestedVoice: 'Zephyr',
        suggestedStyle: 'Speak with solemn grandeur and echoing cinematic weight'
      }
    ],
    voices: [
      { id: 'Charon', name: 'Charon', description: 'Deep, resonant, solemn & majestic baritone (Closest to reference)', pitch: 'Very Deep', gender: 'Male' },
      { id: 'Fenrir', name: 'Fenrir', description: 'Gravelly, rugged, intense & menacing', pitch: 'Deep / Rough', gender: 'Male' },
      { id: 'Puck', name: 'Puck', description: 'Raspy, dynamic, dramatic & expressive', pitch: 'Mid / Textural', gender: 'Male' },
      { id: 'Zephyr', name: 'Zephyr', description: 'Balanced, calm, cinematic & clear', pitch: 'Neutral', gender: 'Balanced' },
      { id: 'Kore', name: 'Kore', description: 'Ethereal, measured, mysterious & solemn', pitch: 'Warm', gender: 'Female' }
    ]
  });
});

// TTS Generation Endpoint
app.post('/api/tts', async (req, res) => {
  try {
    const {
      text,
      voiceName = 'Charon',
      stylePrompt = 'Speak in a deep, ancient, raspy, dramatic cinematic voice with slow, ominous pauses',
      format = 'mp3',
    } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text prompt is required.' });
    }

    const ai = getAI();

    // Construct directed prompt for gemini-3.1-flash-tts-preview
    const directedPrompt = stylePrompt && stylePrompt.trim()
      ? `${stylePrompt.trim()}: "${text.trim()}"`
      : text.trim();

    console.log(`[TTS] Generating (${format.toUpperCase()}) with voice: ${voiceName}, text: "${text.substring(0, 50)}..."`);

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-tts-preview',
      contents: [
        {
          parts: [{ text: directedPrompt }],
        },
      ],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName || 'Charon' },
          },
        },
      },
    });

    const candidate = response.candidates?.[0];
    const audioPart = candidate?.content?.parts?.find(p => p.inlineData?.data);

    if (!audioPart || !audioPart.inlineData?.data) {
      return res.status(502).json({
        error: 'No audio data was returned by the TTS model. Please try again.',
      });
    }

    const rawBase64 = audioPart.inlineData.data;
    const pcmBuffer = Buffer.from(rawBase64, 'base64');
    const wavBuffer = pcmToWav(pcmBuffer, 24000, 1, 16);
    const wavBase64 = wavBuffer.toString('base64');
    const durationSeconds = pcmBuffer.length / (24000 * 2); // 16-bit = 2 bytes per sample

    // Convert to MP3
    let mp3Buffer: Buffer;
    try {
      mp3Buffer = await wavToMp3(wavBuffer, '192k');
    } catch (mp3Err) {
      console.warn('[TTS] Failed to convert to MP3, falling back to WAV:', mp3Err);
      mp3Buffer = wavBuffer;
    }
    const mp3Base64 = mp3Buffer.toString('base64');

    const isMp3 = format.toLowerCase() === 'mp3';
    const primaryBase64 = isMp3 ? mp3Base64 : wavBase64;
    const primaryMime = isMp3 ? 'audio/mp3' : 'audio/wav';

    res.json({
      success: true,
      format: isMp3 ? 'mp3' : 'wav',
      audioBase64: primaryBase64,
      mp3Base64: mp3Base64,
      wavBase64: wavBase64,
      mimeType: primaryMime,
      sampleRate: 24000,
      bitrate: isMp3 ? '192 kbps' : '768 kbps',
      duration: Number(durationSeconds.toFixed(2)),
      voice: voiceName,
      text: text.trim(),
      stylePrompt: stylePrompt || '',
    });
  } catch (error: any) {
    console.error('[TTS Error]:', error);
    let errorMessage = error?.message || 'An error occurred while generating speech.';
    let isQuotaExceeded = false;
    let retryAfterSeconds: number | null = null;

    try {
      const rawText = typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage);
      const parsed = typeof errorMessage === 'object' ? errorMessage : JSON.parse(rawText);
      if (parsed.error) {
        if (parsed.error.code === 429 || parsed.error.status === 'RESOURCE_EXHAUSTED' || (parsed.error.message && parsed.error.message.includes('quota'))) {
          isQuotaExceeded = true;
          const retryDetail = parsed.error.details?.find((d: any) => d.retryDelay);
          if (retryDetail?.retryDelay) {
            const sec = parseInt(String(retryDetail.retryDelay).replace('s', ''), 10);
            if (!isNaN(sec)) retryAfterSeconds = sec;
          }
          errorMessage = `Gemini TTS Rate Limit (Free Tier quota reached). Please wait ${retryAfterSeconds ? `${retryAfterSeconds} seconds` : 'about 45 seconds'} before generating new takes, or use existing takes in the library.`;
        } else if (parsed.error.message) {
          errorMessage = parsed.error.message;
        }
      }
    } catch {
      if (typeof errorMessage === 'string' && (errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('quota'))) {
        isQuotaExceeded = true;
        const match = errorMessage.match(/retry in\s+([\d\.]+)s/i);
        if (match && match[1]) {
          retryAfterSeconds = Math.ceil(parseFloat(match[1]));
          errorMessage = `Gemini TTS Rate Limit reached. Please wait ${retryAfterSeconds} seconds before trying again.`;
        } else {
          errorMessage = 'Gemini TTS Rate Limit reached. Please wait about 45 seconds before trying again.';
        }
      }
    }

    res.status(isQuotaExceeded ? 429 : 500).json({
      error: errorMessage,
      isQuotaExceeded,
      retryAfterSeconds,
    });
  }
});

// Conversion endpoint: convert any WAV to MP3
app.post('/api/convert-to-mp3', async (req, res) => {
  try {
    const { wavBase64 } = req.body;
    if (!wavBase64) {
      return res.status(400).json({ error: 'wavBase64 is required.' });
    }
    const wavBuffer = Buffer.from(wavBase64, 'base64');
    const mp3Buffer = await wavToMp3(wavBuffer, '192k');
    res.json({
      success: true,
      mp3Base64: mp3Buffer.toString('base64'),
      mimeType: 'audio/mp3',
    });
  } catch (err: any) {
    console.error('[Convert Error]:', err);
    res.status(500).json({ error: err.message || 'Failed to convert audio to MP3.' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TTS Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
