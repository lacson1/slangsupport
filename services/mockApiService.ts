// Mock data service for SlangSupport - No external API dependencies
import { SlangDefinition } from '../types';

// Mock slang definitions database
const MOCK_SLANG_DATABASE: Record<string, SlangDefinition> = {
    'yeet': {
        meaning: 'To throw something with force, or to express excitement or approval',
        example: 'I\'m going to yeet this ball across the field!',
        category: 'Gen Z',
        relatedTerms: [
            { term: 'throw', reason: 'Similar action' },
            { term: 'launch', reason: 'Forceful movement' },
            { term: 'excitement', reason: 'Emotional expression' }
        ]
    },
    'no cap': {
        meaning: 'No lie, telling the truth, being genuine',
        example: 'That movie was amazing, no cap!',
        category: 'Gen Z',
        relatedTerms: [
            { term: 'fr', reason: 'For real, similar meaning' },
            { term: 'facts', reason: 'Agreement with truth' },
            { term: 'genuine', reason: 'Being authentic' }
        ]
    },
    'slay': {
        meaning: 'To do something exceptionally well, to look amazing, or to succeed',
        example: 'You absolutely slayed that presentation!',
        category: 'Gen Z',
        relatedTerms: [
            { term: 'killed it', reason: 'Similar success expression' },
            { term: 'nailed it', reason: 'Perfect execution' },
            { term: 'crushed it', reason: 'Outstanding performance' }
        ]
    },
    'bet': {
        meaning: 'Agreement, confirmation, or "okay"',
        example: 'Want to grab lunch? Bet!',
        category: 'Gen Z',
        relatedTerms: [
            { term: 'okay', reason: 'Simple agreement' },
            { term: 'sure', reason: 'Casual confirmation' },
            { term: 'deal', reason: 'Agreement to terms' }
        ]
    },
    'periodt': {
        meaning: 'Emphatic way to end a statement, emphasizing finality',
        example: 'That outfit is fire, periodt!',
        category: 'Gen Z',
        relatedTerms: [
            { term: 'period', reason: 'End of discussion' },
            { term: 'end of story', reason: 'Final statement' },
            { term: 'that\'s it', reason: 'Conclusion' }
        ]
    },
    'main character': {
        meaning: 'Someone who acts like they\'re the protagonist of their own story',
        example: 'She\'s really living her main character moment today.',
        category: 'Gen Z',
        relatedTerms: [
            { term: 'protagonist', reason: 'Story hero' },
            { term: 'center of attention', reason: 'Focus point' },
            { term: 'dramatic', reason: 'Theatrical behavior' }
        ]
    },
    'stan': {
        meaning: 'To be an extremely enthusiastic fan of someone or something',
        example: 'I stan this artist so hard!',
        category: 'Gen Z',
        relatedTerms: [
            { term: 'fan', reason: 'Supporter' },
            { term: 'obsessed', reason: 'Extreme interest' },
            { term: 'idolize', reason: 'Worship' }
        ]
    },
    'flex': {
        meaning: 'To show off or boast about something',
        example: 'He\'s always flexing his new car.',
        category: 'Gen Z',
        relatedTerms: [
            { term: 'show off', reason: 'Display proudly' },
            { term: 'brag', reason: 'Boast about' },
            { term: 'flaunt', reason: 'Display ostentatiously' }
        ]
    },
    'salty': {
        meaning: 'Being upset, bitter, or resentful about something',
        example: 'Don\'t be salty just because you lost the game.',
        category: 'Gen Z',
        relatedTerms: [
            { term: 'bitter', reason: 'Resentful feeling' },
            { term: 'upset', reason: 'Emotional state' },
            { term: 'annoyed', reason: 'Irritated' }
        ]
    },
    'vibe': {
        meaning: 'The atmosphere, feeling, or energy of a situation',
        example: 'I\'m not feeling the vibe at this party.',
        category: 'Gen Z',
        relatedTerms: [
            { term: 'atmosphere', reason: 'Environmental feeling' },
            { term: 'energy', reason: 'Vibrational quality' },
            { term: 'mood', reason: 'Emotional state' }
        ]
    },
    'ghost': {
        meaning: 'To suddenly stop responding to someone\'s messages or calls',
        example: 'He ghosted me after our first date.',
        category: 'Gen Z',
        relatedTerms: [
            { term: 'ignore', reason: 'Not respond' },
            { term: 'disappear', reason: 'Vanish suddenly' },
            { term: 'cut off', reason: 'End communication' }
        ]
    },
    'ship': {
        meaning: 'To support or want a romantic relationship between two people',
        example: 'I totally ship them together!',
        category: 'Gen Z',
        relatedTerms: [
            { term: 'relationship', reason: 'Romantic connection' },
            { term: 'couple', reason: 'Paired individuals' },
            { term: 'match', reason: 'Good pairing' }
        ]
    },
    'tea': {
        meaning: 'Gossip, drama, or juicy information',
        example: 'Spill the tea about what happened last night!',
        category: 'Gen Z',
        relatedTerms: [
            { term: 'gossip', reason: 'Rumors and news' },
            { term: 'drama', reason: 'Exciting events' },
            { term: 'juice', reason: 'Interesting information' }
        ]
    },
    'snatched': {
        meaning: 'Looking amazing, perfect, or on point',
        example: 'Your outfit is absolutely snatched!',
        category: 'Gen Z',
        relatedTerms: [
            { term: 'perfect', reason: 'Flawless' },
            { term: 'on point', reason: 'Exactly right' },
            { term: 'amazing', reason: 'Impressive' }
        ]
    },
    'sus': {
        meaning: 'Suspicious or questionable behavior',
        example: 'That person is acting really sus.',
        category: 'Gen Z',
        relatedTerms: [
            { term: 'suspicious', reason: 'Questionable' },
            { term: 'sketchy', reason: 'Doubtful' },
            { term: 'fishy', reason: 'Not trustworthy' }
        ]
    }
};

// Generate a mock definition for unknown terms
const generateMockDefinition = (term: string): SlangDefinition => {
    const categories: string[] = ['Gen Z', 'Internet', 'Gaming', 'Social Media', 'General'];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];

    return {
        meaning: `"${term}" is a slang term that's popular in casual conversation. While I don't have a specific definition for this term, it's likely used to express a particular feeling or situation.`,
        example: `Here's how "${term}" might be used: "That was so ${term}!" or "I can't believe how ${term} that was!"`,
        category: randomCategory,
        relatedTerms: [
            { term: 'slang', reason: 'General category' },
            { term: 'trending', reason: 'Likely popular term' },
            { term: 'casual', reason: 'Informal usage' },
            { term: 'expression', reason: 'Way of communicating' }
        ]
    };
};

// Mock API service that simulates backend calls
export const getSlangDefinition = async (term: string): Promise<SlangDefinition> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    const normalizedTerm = term.toLowerCase().trim();

    // Check if we have a definition in our mock database
    if (MOCK_SLANG_DATABASE[normalizedTerm]) {
        return MOCK_SLANG_DATABASE[normalizedTerm];
    }

    // Generate a mock definition for unknown terms
    return generateMockDefinition(term);
};

// Mock speech service - returns a simple audio placeholder
export const getSpeech = async (text: string): Promise<string> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Return a simple mock audio data URL
    // This is a very short silent audio file
    return 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
};
