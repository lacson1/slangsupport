import { SlangDefinition, Category, RelatedTerm } from '../types';

// Mock API service for development - replace with real Gemini API
const MOCK_DEFINITIONS: Record<string, SlangDefinition> = {
  'rizz': {
    meaning: 'Charisma, charm, or attractiveness, especially in romantic contexts',
    example: 'He\'s got serious rizz - everyone wants to talk to him at parties',
    category: Category.GEN_Z,
    relatedTerms: [
      { term: 'charisma', reason: 'Similar concept of personal magnetism' },
      { term: 'game', reason: 'Related to romantic appeal' },
      { term: 'swagger', reason: 'Confident, attractive demeanor' }
    ]
  },
  'based': {
    meaning: 'Authentic, true to oneself, or expressing genuine opinions without caring about others\' reactions',
    example: 'That take was so based - you said exactly what everyone was thinking',
    category: Category.INTERNET,
    relatedTerms: [
      { term: 'real', reason: 'Authentic and genuine' },
      { term: 'facts', reason: 'Speaking truth' },
      { term: 'unfiltered', reason: 'Honest without filters' }
    ]
  },
  'slay': {
    meaning: 'To do something exceptionally well or look amazing',
    example: 'She absolutely slayed that presentation today!',
    category: Category.GENERAL,
    relatedTerms: [
      { term: 'killed it', reason: 'Performed exceptionally well' },
      { term: 'crushed', reason: 'Succeeded impressively' },
      { term: 'nailed', reason: 'Executed perfectly' }
    ]
  },
  'no cap': {
    meaning: 'No lie, telling the truth, being genuine',
    example: 'That movie was amazing, no cap!',
    category: Category.AAVE,
    relatedTerms: [
      { term: 'fr', reason: 'For real, genuine' },
      { term: 'deadass', reason: 'Seriously, truly' },
      { term: 'on god', reason: 'Swearing to truth' }
    ]
  },
  'bet': {
    meaning: 'Agreement, confirmation, or "okay"',
    example: 'Want to grab lunch? Bet, let\'s go!',
    category: Category.GEN_Z,
    relatedTerms: [
      { term: 'ok', reason: 'Agreement' },
      { term: 'sure', reason: 'Confirmation' },
      { term: 'deal', reason: 'Agreement' }
    ]
  }
};

export const getSlangDefinition = async (term: string): Promise<SlangDefinition> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const lowerTerm = term.toLowerCase();
  
  if (MOCK_DEFINITIONS[lowerTerm]) {
    return MOCK_DEFINITIONS[lowerTerm];
  }
  
  // Generate a mock definition for unknown terms
  return {
    meaning: `A slang term meaning "${term}" - this is a mock definition for development`,
    example: `"That's so ${term}!" - example usage`,
    category: Category.GENERAL,
    relatedTerms: [
      { term: 'cool', reason: 'Similar positive expression' },
      { term: 'awesome', reason: 'Related positive term' },
      { term: 'great', reason: 'Similar meaning' }
    ]
  };
};

export const getSpeech = async (text: string): Promise<ArrayBuffer> => {
  // Mock speech synthesis - in production, this would call Gemini TTS
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Return empty audio buffer for now
  return new ArrayBuffer(0);
};
