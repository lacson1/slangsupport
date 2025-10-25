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
    },
    vibe: {
        type: Type.OBJECT,
        description: "An analysis of the term's social context and formality.",
        properties: {
            formality: {
                type: Type.STRING,
                description: "A short, one-or-two-word classification of the term's formality. Examples: 'Extremely Casual', 'Online', 'Ironic', 'Neutral', 'Slightly Formal'."
            },
            description: {
                type: Type.STRING,
                description: "A brief, one-sentence description of the social context or 'vibe' of the term. For example, 'Used ironically online to express disappointment.'"
            }
        },
        required: ['formality', 'description'],
    },
    relatedTerms: {
        type: Type.ARRAY,
        description: "A list of 3-5 similar or related slang terms.",
        items: {
            type: Type.STRING
        }
    }
  },
  required: ['meaning', 'example', 'vibe', 'relatedTerms'],
};

export const getSlangDefinition = async (term: string): Promise<SlangDefinition> => {
  try {
    const prompt = `Provide a comprehensive analysis for the slang term or abbreviation: "${term}".
    
    Your response must include:
    1.  A clear definition ("meaning").
    2.  An example sentence ("example").
    3.  A "vibe" analysis, including a short "formality" classification and a one-sentence "description" of its social context.
    4.  A list of 3-5 "relatedTerms".

    If the term is nonsensical, not real slang, or you cannot find a definition, your response must explicitly state this in the "meaning" field, with other fields being "N/A" or empty arrays.`;

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

    const lowerCaseMeaning = parsedResponse.meaning.toLowerCase();
    if (lowerCaseMeaning.includes("could not find a definition") || lowerCaseMeaning.includes("couldn't find a definition")) {
      throw new Error(`Term not found: ${term}`);
    }
    
    return parsedResponse;
  } catch (error: any) {
    console.error("Error fetching slang definition:", error);
    if (error.message?.startsWith('Term not found:')) {
        throw error;
    }
    throw new Error("Failed to get definition. The term might be invalid or there was a network issue.");
  }
};

export const getSpeech = async (text: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      // FIX: Use the full, explicit Content object structure, specifying the role.
      // This resolves ambiguity and ensures the TTS model correctly processes the request.
      contents: [{ role: 'user', parts: [{ text }] }],
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
      // Add more detailed logging for debugging when no audio is returned.
      const textResponse = response.text;
      if (textResponse) {
          console.error("TTS API returned a text response instead of audio:", textResponse);
      }
      if (response.promptFeedback) {
          console.error("Prompt Feedback:", JSON.stringify(response.promptFeedback, null, 2));
      }
      throw new Error("No audio data received from API.");
    }
    
    return base64Audio;
  } catch (error: any) {
    console.error("Error generating speech:", error);
    // FIX: Propagate the actual error message instead of a generic one.
    throw new Error(error.message || "Failed to generate speech.");
  }
};