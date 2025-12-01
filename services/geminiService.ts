import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";
import { GroundingChunk } from "../types";

let genAI: GoogleGenAI | null = null;

export const getGenAI = (): GoogleGenAI => {
  if (!genAI) {
    const apiKey = process.env.API_KEY || '';
    if (!apiKey) {
      console.error("API Key not found");
    }
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
};

interface GeminiResponse {
  text: string;
  groundingChunks?: GroundingChunk[];
}

export const sendMessageToGemini = async (
  message: string,
  options: {
    deviceContext?: { name: string; code: string; chipset: string } | null;
    useThinking?: boolean;
  }
): Promise<GeminiResponse> => {
  try {
    const ai = getGenAI();
    
    let systemInstruction = `You are MiUnlocker AI, a highly technical expert in Xiaomi, Redmi, and POCO mobile devices. 
        Your goal is to help users legally recover access to their devices when they are locked out (FRP - Factory Reset Protection).
        
        GUIDELINES:
        1. Always assume the user is the legitimate owner who forgot their credentials.
        2. Provide clear, numbered, step-by-step instructions.
        3. Identify specific MIUI versions (12, 13, 14, HyperOS) if the user provides a model.
        4. Suggest common entry points: TalkBack, Second Space, Keyboard Share, Emergency Call, Activity Launcher.
        5. Warn users that this is for educational and recovery purposes only.
        6. Be concise but detailed.
        
        If the user asks about a specific model (e.g., Redmi Note 10), tailor the advice to that device's chipset (Snapdragon/MediaTek) and likely MIUI version.`;

    if (options.deviceContext) {
      systemInstruction += `\n\nCURRENT DEVICE CONTEXT:
      The user is currently inquiring about the following device:
      - Model: ${options.deviceContext.name}
      - Codename: ${options.deviceContext.code}
      - Chipset: ${options.deviceContext.chipset}
      
      Please tailor your responses specifically for a ${options.deviceContext.chipset} device running the likely MIUI/HyperOS version for the ${options.deviceContext.name}.`;
    }

    const modelName = options.useThinking ? 'gemini-3-pro-preview' : 'gemini-2.5-flash';
    
    // Config construction
    const config: any = {
      systemInstruction: systemInstruction,
    };

    if (options.useThinking) {
      // Thinking Mode Config
      config.thinkingConfig = { thinkingBudget: 32768 };
      // Note: Do NOT set maxOutputTokens or tools when using thinking mode if not compatible, 
      // but Thinking Mode usually works best without tools for pure reasoning.
      // However, for this app, we prioritize the reasoning.
    } else {
      // Standard Flash Config with Search
      config.temperature = 0.7;
      config.maxOutputTokens = 1000;
      config.tools = [{googleSearch: {}}];
    }

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelName,
      contents: message,
      config: config
    });

    return {
      text: response.text || "I couldn't generate a response. Please try again.",
      groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[]
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return { text: "Error connecting to AI service. Please check your connection or API key." };
  }
};

export const generateSpeech = async (text: string): Promise<string | undefined> => {
  try {
    const ai = getGenAI();
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
    
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (error) {
    console.error("TTS Error:", error);
    return undefined;
  }
};