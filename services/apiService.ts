// API service for SlangSupport backend integration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

interface ApiResponse<T> {
    data?: T;
    error?: string;
    message?: string;
}

class ApiClient {
    private baseURL: string;
    private token: string | null = null;

    constructor(baseURL: string) {
        this.baseURL = baseURL;
        this.token = localStorage.getItem('auth_token');
    }

    setToken(token: string) {
        this.token = token;
        localStorage.setItem('auth_token', token);
    }

    clearToken() {
        this.token = null;
        localStorage.removeItem('auth_token');
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        const url = `${this.baseURL}${endpoint}`;
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (this.token) {
            headers.Authorization = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers,
            });

            const data = await response.json();

            if (!response.ok) {
                return { error: data.error || 'Request failed' };
            }

            return { data };
        } catch (error) {
            return { error: 'Network error' };
        }
    }

    // Auth endpoints
    async register(email: string, username: string, password: string) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, username, password }),
        });
    }

    async login(email: string, password: string) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    }

    async getProfile() {
        return this.request('/user/profile');
    }

    async updateProfile(data: { username?: string; email?: string }) {
        return this.request('/user/profile', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteAccount() {
        return this.request('/user/account', {
            method: 'DELETE',
        });
    }

    // Search endpoints
    async saveSearch(searchData: {
        term: string;
        meaning: string;
        example: string;
        category?: string;
        relatedTerms?: Array<{ term: string; reason: string }>;
    }) {
        return this.request('/search/save', {
            method: 'POST',
            body: JSON.stringify(searchData),
        });
    }

    async getSuggestions(query: string) {
        return this.request(`/search/suggestions?q=${encodeURIComponent(query)}`);
    }

    async getPopularTerms(limit = 20) {
        return this.request(`/search/popular?limit=${limit}`);
    }

    // Favorites endpoints
    async getFavorites(page = 1, limit = 50, search?: string) {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });
        if (search) params.append('search', search);

        return this.request(`/favorites?${params}`);
    }

    async addFavorite(favoriteData: {
        term: string;
        meaning: string;
        example: string;
        category?: string;
    }) {
        return this.request('/favorites', {
            method: 'POST',
            body: JSON.stringify(favoriteData),
        });
    }

    async removeFavorite(term: string) {
        return this.request(`/favorites/${encodeURIComponent(term)}`, {
            method: 'DELETE',
        });
    }

    async checkFavorite(term: string) {
        return this.request(`/favorites/${encodeURIComponent(term)}/check`);
    }

    async clearFavorites() {
        return this.request('/favorites', {
            method: 'DELETE',
        });
    }

    // History endpoints
    async getHistory(page = 1, limit = 50, search?: string) {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });
        if (search) params.append('search', search);

        return this.request(`/history?${params}`);
    }

    async removeHistoryItem(id: string) {
        return this.request(`/history/${id}`, {
            method: 'DELETE',
        });
    }

    async clearHistory() {
        return this.request('/history', {
            method: 'DELETE',
        });
    }

    async getHistoryStats() {
        return this.request('/history/stats');
    }

    // Quiz endpoints
    async saveQuizScore(score: number, total: number) {
        return this.request('/quiz/score', {
            method: 'POST',
            body: JSON.stringify({ score, total }),
        });
    }

    async getQuizScores(page = 1, limit = 20) {
        return this.request(`/quiz/scores?page=${page}&limit=${limit}`);
    }

    async getQuizStats() {
        return this.request('/quiz/stats');
    }

    async generateQuiz(limit = 5) {
        return this.request(`/quiz/generate?limit=${limit}`);
    }

    // Preferences endpoints
    async getPreferences() {
        return this.request('/preferences');
    }

    async updatePreferences(preferences: {
        autoSpeak?: boolean;
        theme?: 'dark' | 'light';
        lastWordOfDay?: string;
        lastWordOfDayDate?: string;
    }) {
        return this.request('/preferences', {
            method: 'PUT',
            body: JSON.stringify(preferences),
        });
    }

    async exportData() {
        return this.request('/preferences/export');
    }

    async importData(data: any) {
        return this.request('/preferences/import', {
            method: 'POST',
            body: JSON.stringify({ data }),
        });
    }

    async clearAllData() {
        return this.request('/preferences/clear', {
            method: 'DELETE',
        });
    }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;
