import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

let genAI: GoogleGenAI | null = null;

const getGenAI = (): GoogleGenAI => {
  if (!genAI) {
    const apiKey = process.env.API_KEY || '';
    if (!apiKey) {
      console.error("API Key not found");
      // In a real app we might throw here, but for UI stability we'll log
    }
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
};

export const sendMessageToGemini = async (
  message: string,
  modelName: string = 'gemini-2.5-flash',
  deviceContext?: { name: string; code: string; chipset: string } | null
): Promise<string> => {
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

    if (deviceContext) {
      systemInstruction += `\n\nCURRENT DEVICE CONTEXT:
      The user is currently inquiring about the following device:
      - Model: ${deviceContext.name}
      - Codename: ${deviceContext.code}
      - Chipset: ${deviceContext.chipset}
      
      Please tailor your responses specifically for a ${deviceContext.chipset} device running the likely MIUI/HyperOS version for the ${deviceContext.name}.`;
    }

    // Using a chat structure for better context retention if we expanded this, 
    // but a single generateContent call is sufficient for the "Ask a question" feature request.
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelName,
      contents: message,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
        maxOutputTokens: 1000,
        tools: [{googleSearch: {}}]
      }
    });

    return response.text || "I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error connecting to AI service. Please check your connection or API key.";
  }
};