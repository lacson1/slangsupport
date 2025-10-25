export interface SlangDefinition {
  meaning: string;
  example: string;
  vibe: {
    formality: string;
    description: string;
  };
  relatedTerms: string[];
  oppositeTerms: string[];
  origin: string;
  popularity: 'Trending Up' | 'Established' | 'Fading' | 'Niche';
}