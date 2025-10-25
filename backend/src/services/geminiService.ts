import { GoogleGenAI, Type, Modality } from "@google/genai";

if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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

export const getSlangDefinition = async (term: string) => {
    try {
        const prompt = `Define the slang term or abbreviation: "${term}". Explain its meaning and provide an example of its use in a sentence. Also categorize it and provide 3-5 related terms with brief explanations. If the term is nonsensical or not a real slang/abbreviation, state that you couldn't find a definition.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: definitionSchema,
            },
        });

        const jsonString = response.text?.trim() || '';
        const parsedResponse = JSON.parse(jsonString);

        if (!parsedResponse.meaning || !parsedResponse.example) {
            throw new Error("Invalid response structure from API.");
        }

        return parsedResponse;
    } catch (error) {
        console.error("Error fetching slang definition:", error);
        throw new Error("Failed to get definition. The term might be invalid or there was a network issue.");
    }
};

export const getSpeech = async (text: string): Promise<ArrayBuffer> => {
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

        // Convert base64 to ArrayBuffer
        const binaryString = atob(base64Audio);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        return bytes.buffer;
    } catch (error) {
        console.error("Error generating speech:", error);
        throw new Error("Failed to generate speech.");
    }
};
