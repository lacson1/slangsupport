import { GoogleGenerativeAI } from '@google/generative-ai';
import { SlangDefinition, Category, RelatedTerm } from '../../types';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const getSlangDefinition = async (term: string): Promise<SlangDefinition> => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
    You are a slang dictionary expert. Provide a comprehensive definition for the slang term "${term}".

    Please respond with a JSON object containing:
    - meaning: A clear, detailed explanation of what this slang term means
    - example: A realistic example sentence showing how the term is used
    - category: One of these categories: Internet, Gaming, Gen Z, AAVE, Abbreviations, Memes, Social Media, Music, Sports, General
    - relatedTerms: An array of 2-3 related slang terms with explanations

    Format your response as valid JSON only, no additional text.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the JSON response
    const definition = JSON.parse(text);

    // Validate and structure the response
    return {
      meaning: definition.meaning || `A slang term meaning "${term}"`,
      example: definition.example || `"That's so ${term}!" - example usage`,
      category: definition.category || Category.GENERAL,
      relatedTerms: definition.relatedTerms || [
        { term: 'cool', reason: 'Similar positive expression' },
        { term: 'awesome', reason: 'Related positive term' }
      ]
    };
  } catch (error) {
    console.error('Error getting slang definition:', error);
    
    // Fallback definition
    return {
      meaning: `A slang term meaning "${term}" - definition unavailable`,
      example: `"That's so ${term}!" - example usage`,
      category: Category.GENERAL,
      relatedTerms: [
        { term: 'cool', reason: 'Similar positive expression' },
        { term: 'awesome', reason: 'Related positive term' }
      ]
    };
  }
};

export const getSpeech = async (text: string): Promise<ArrayBuffer> => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // For now, return empty buffer as Gemini TTS is not available in the current API
    // In production, you would integrate with a TTS service like Google Cloud Text-to-Speech
    console.log(`Speech requested for: ${text}`);
    
    return new ArrayBuffer(0);
  } catch (error) {
    console.error('Error generating speech:', error);
    throw new Error('Failed to generate speech');
  }
};

export const generateQuizQuestions = async (terms: string[]): Promise<any[]> => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
    Generate 5 quiz questions about these slang terms: ${terms.join(', ')}.

    For each question, provide:
    - term: The slang term being asked about
    - correctAnswer: The correct definition
    - options: An array of 4 options (including the correct one)
    - definition: The full definition object

    Format as JSON array.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return JSON.parse(text);
  } catch (error) {
    console.error('Error generating quiz questions:', error);
    return [];
  }
};