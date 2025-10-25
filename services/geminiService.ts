import { GoogleGenAI, Type, Modality } from "@google/genai";
import { SlangDefinition } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const definitionSchema = {
  type: Type.OBJECT,
  properties: {
    meaning: {
      type: Type.STRING,
      description: "A clear and concise definition of the slang term or abbreviation."
    },
    example: {
      type: Type.STRING,
      description: "An example sentence demonstrating the correct usage of the term."
    }
  },
  required: ['meaning', 'example'],
};

export const getSlangDefinition = async (term: string): Promise<SlangDefinition> => {
  try {
    const prompt = `Define the slang term or abbreviation: "${term}". Explain its meaning and provide an example of its use in a sentence. If the term is nonsensical or not a real slang/abbreviation, state that you couldn't find a definition.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: definitionSchema,
      },
    });

    const jsonString = response.text.trim();
    const parsedResponse: SlangDefinition = JSON.parse(jsonString);

    if (!parsedResponse.meaning || !parsedResponse.example) {
      throw new Error("Invalid response structure from API.");
    }
    
    return parsedResponse;
  } catch (error) {
    console.error("Error fetching slang definition:", error);
    throw new Error("Failed to get definition. The term might be invalid or there was a network issue.");
  }
};

export const getSpeech = async (text: string): Promise<string> => {
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

    if (!base64Audio) {
      throw new Error("No audio data received from API.");
    }
    
    return base64Audio;
  } catch (error) {
    console.error("Error generating speech:", error);
    throw new Error("Failed to generate speech.");
  }
};
