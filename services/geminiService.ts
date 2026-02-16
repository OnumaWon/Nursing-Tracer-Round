
import { GoogleGenAI, Modality } from "@google/genai";

// Manual implementation of encode/decode as required by guidelines
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const analyzeRounds = async (rounds: any[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Analyze the following nursing tracer rounds data and provide a concise summary of strengths, major development areas (weaknesses), and 3 specific actionable recommendations for the nursing department. 
  Data: ${JSON.stringify(rounds)}`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      temperature: 0.7,
    }
  });

  return response.text;
};

export const analyzeSingleRound = async (round: any) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Provide a professional, high-level executive summary of this specific nursing tracer round. 
  Focus on identifying the most critical findings, summarizing the development issues, and highlighting noteworthy appreciations. 
  Keep it concise and formatted in professional bullet points.
  Round Data: ${JSON.stringify(round)}`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      temperature: 0.5,
    }
  });

  return response.text;
};

export const analyzeSection = async (sectionTitle: string, sectionData: any) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `As a clinical nursing audit expert, provide a brief, insightful summary of the findings for the "${sectionTitle}" section of a tracer round. 
  Identify patterns in the compliance items and provide 1-2 targeted suggestions for improvement based on these specific results. 
  Section Data: ${JSON.stringify(sectionData)}`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      temperature: 0.4,
    }
  });

  return response.text;
};

export const chatWithAssistant = async (history: { role: string; content: string }[], message: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const chat = ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: "You are a specialized clinical nursing audit assistant. Your role is to help nurses interpret tracer round data, suggest improvements based on JCI or hospital standards, and answer clinical documentation questions. Be professional, encouraging, and accurate.",
    }
  });

  const response = await chat.sendMessage({ message });
  return response.text;
};

export const speakText = async (text: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const audioBytes = decode(base64Audio);
    const audioBuffer = await decodeAudioData(audioBytes, audioContext, 24000, 1);
    
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    const outputNode = audioContext.createGain();
    source.connect(outputNode);
    outputNode.connect(audioContext.destination);
    source.start();
  } catch (error) {
    console.error("TTS Error:", error);
  }
};
