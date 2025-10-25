import { GoogleGenAI, Type, Modality } from "@google/genai";
import { SlangDefinition, Category, RelatedTerm } from '../types';

// Check for API key with fallback
const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || process.env.API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY environment variable not set. Gemini features will be disabled.");
}

// Only initialize AI if API key is available
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

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
    },
    category: {
      type: Type.STRING,
      description: "The category this term belongs to. Choose from: Internet, Gaming, Gen Z, AAVE, Abbreviations, Memes, Social Media, Music, Sports, or General."
    },
    relatedTerms: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          term: {
            type: Type.STRING,
            description: "A related slang term or abbreviation"
          },
          reason: {
            type: Type.STRING,
            description: "Brief explanation of why this term is related"
          }
        },
        required: ['term', 'reason']
      },
      description: "3-5 related slang terms with brief explanations of their connection"
    }
  },
  required: ['meaning', 'example', 'category', 'relatedTerms'],
};

export const getSlangDefinition = async (term: string): Promise<SlangDefinition> => {
  try {
    // If no API key, return a fallback response
    if (!ai) {
      return {
        meaning: `"${term}" is a slang term. To get a detailed definition, please set up your Gemini API key in the environment variables.`,
        example: `Here's how "${term}" might be used: "That was so ${term}!"`,
        category: 'General',
        relatedTerms: [
          { term: 'slang', reason: 'General category' },
          { term: 'trending', reason: 'Likely popular term' },
          { term: 'casual', reason: 'Informal usage' }
        ]
      };
    }

    const prompt = `Define the slang term or abbreviation: "${term}". Explain its meaning and provide an example of its use in a sentence. Also categorize it and provide 3-5 related terms with brief explanations. If the term is nonsensical or not a real slang/abbreviation, state that you couldn't find a definition.`;

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
    // If no API key, return mock audio
    if (!ai) {
      return 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
    }

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