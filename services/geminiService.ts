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
    },
    oppositeTerms: {
        type: Type.ARRAY,
        description: "A list of 2-3 terms that are opposite in meaning. If no direct opposites exist, this should be an empty array.",
        items: {
            type: Type.STRING
        }
    },
    origin: {
        type: Type.STRING,
        description: "A brief, one or two-sentence explanation of the term's origin or etymology."
    },
    popularity: {
        type: Type.STRING,
        description: "A single-word classification of the term's current popularity. Must be one of: 'Trending Up', 'Established', 'Fading', or 'Niche'.",
        enum: ['Trending Up', 'Established', 'Fading', 'Niche']
    }
  },
  required: ['meaning', 'example', 'vibe', 'relatedTerms', 'oppositeTerms', 'origin', 'popularity'],
};

export const getSlangDefinition = async (term: string): Promise<SlangDefinition> => {
  try {
    const prompt = `Provide a comprehensive analysis for the slang term or abbreviation: "${term}".
    
    Your response must include:
    1.  A clear definition ("meaning").
    2.  An example sentence ("example").
    3.  A "vibe" analysis, including a short "formality" classification and a one-sentence "description" of its social context.
    4.  A list of 3-5 "relatedTerms".
    5.  A list of 2-3 "oppositeTerms" (antonyms or terms with opposite connotations). If none exist, provide an empty array.
    6.  A brief "origin" story or etymology (1-2 sentences).
    7.  A "popularity" classification from the following options only: 'Trending Up', 'Established', 'Fading', 'Niche'.

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
      // Fix: The `contents` field for a TTS request should not include a `role`.
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
    throw new Error(error.message || "Failed to generate speech.");
  }
};