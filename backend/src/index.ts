import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { getSlangDefinition, getSpeech } from './services/geminiService';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env['PORT'] || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env['FRONTEND_URL'] || 'http://localhost:3000',
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Compression and logging
app.use(compression());
app.use(morgan('combined'));

// Health check endpoint
app.get('/health', (_req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Basic API routes for now
app.get('/api/test', (_req, res) => {
    res.json({ message: 'SlangSupport API is running!' });
});

// Real definition endpoint using Gemini API
app.post('/api/definition', async (req, res) => {
    try {
        const { term } = req.body;

        if (!term) {
            return res.status(400).json({ error: 'Term is required' });
        }

        // Validate term length and content
        if (term.length > 100) {
            return res.status(400).json({ error: 'Term too long' });
        }

        // Get definition from Gemini API
        const definition = await getSlangDefinition(term);
        res.json(definition);
    } catch (error: any) {
        console.error('Error in definition endpoint:', error);

        // Provide fallback response for API errors
        const fallbackDefinition = {
            meaning: `"${req.body.term}" is a slang term. While I couldn't get a specific definition right now, it's likely used in casual conversation or social media.`,
            example: `Here's how "${req.body.term}" might be used: "That was so ${req.body.term}!"`,
            category: 'General',
            relatedTerms: [
                { term: 'slang', reason: 'General category' },
                { term: 'trending', reason: 'Likely popular term' },
                { term: 'casual', reason: 'Informal usage' }
            ]
        };

        res.json(fallbackDefinition);
    }
});

// Speech endpoint using Gemini TTS
app.post('/api/speech', async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        // Validate text length
        if (text.length > 500) {
            return res.status(400).json({ error: 'Text too long' });
        }

        // Get speech from Gemini TTS
        const audioBuffer = await getSpeech(text);

        // Set appropriate headers for audio response
        res.setHeader('Content-Type', 'audio/wav');
        res.setHeader('Content-Length', audioBuffer.byteLength);
        res.send(Buffer.from(audioBuffer));
    } catch (error: any) {
        console.error('Error in speech endpoint:', error);

        // Fallback to mock audio if TTS fails
        const mockAudio = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';

        res.setHeader('Content-Type', 'audio/wav');
        res.send(mockAudio);
    }
});

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: process.env['NODE_ENV'] === 'development' ? err.message : 'Internal server error'
    });
});

// 404 handler
app.use('*', (_req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔧 Test endpoint: http://localhost:${PORT}/api/test`);
});

export default app;