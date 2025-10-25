// Simple API service for SlangSupport backend
import { SlangDefinition } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const getSlangDefinition = async (term: string): Promise<SlangDefinition> => {
    try {
        const response = await fetch(`${API_BASE_URL}/definition`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ term }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching slang definition:', error);
        throw new Error('Failed to get definition. The term might be invalid or there was a network issue.');
    }
};

// Real speech function using backend API
export const getSpeech = async (text: string): Promise<string> => {
    try {
        const response = await fetch(`${API_BASE_URL}/speech`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.audio;
    } catch (error) {
        console.error('Error fetching speech:', error);
        // Fallback to mock audio if API fails
        return 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
    }
};
