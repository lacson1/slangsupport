import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import Joi from 'joi';

const router = Router();
const prisma = new PrismaClient();

// Validation schema
const quizScoreSchema = Joi.object({
    score: Joi.number().integer().min(0).required(),
    total: Joi.number().integer().min(1).required()
});

// Save quiz score
export const saveQuizScore = async (req: AuthRequest, res: Response) => {
    try {
        const { error, value } = quizScoreSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { score, total } = value;
        const userId = req.user!.id;

        if (score > total) {
            return res.status(400).json({ error: 'Score cannot be greater than total' });
        }

        const quizScore = await prisma.quizScore.create({
            data: {
                score,
                total,
                userId
            },
            select: {
                id: true,
                score: true,
                total: true,
                date: true
            }
        });

        res.status(201).json({
            message: 'Quiz score saved',
            quizScore
        });
    } catch (error) {
        console.error('Save quiz score error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get user's quiz scores
export const getQuizScores = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id;
        const { page = '1', limit = '20' } = req.query;

        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const skip = (pageNum - 1) * limitNum;

        const [scores, total] = await Promise.all([
            prisma.quizScore.findMany({
                where: { userId },
                orderBy: { date: 'desc' },
                skip,
                take: limitNum,
                select: {
                    id: true,
                    score: true,
                    total: true,
                    date: true
                }
            }),
            prisma.quizScore.count({ where: { userId } })
        ]);

        res.json({
            scores,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error('Get quiz scores error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get quiz statistics
export const getQuizStats = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id;

        const [
            totalQuizzes,
            averageScore,
            bestScore,
            recentScores
        ] = await Promise.all([
            prisma.quizScore.count({ where: { userId } }),
            prisma.quizScore.aggregate({
                where: { userId },
                _avg: {
                    score: true
                }
            }),
            prisma.quizScore.findFirst({
                where: { userId },
                orderBy: { score: 'desc' },
                select: {
                    score: true,
                    total: true,
                    date: true
                }
            }),
            prisma.quizScore.findMany({
                where: { userId },
                orderBy: { date: 'desc' },
                take: 5,
                select: {
                    score: true,
                    total: true,
                    date: true
                }
            })
        ]);

        const averagePercentage = averageScore._avg.score
            ? Math.round((averageScore._avg.score / 5) * 100) // Assuming 5 questions per quiz
            : 0;

        res.json({
            stats: {
                totalQuizzes,
                averageScore: averagePercentage,
                bestScore: bestScore ? {
                    score: bestScore.score,
                    total: bestScore.total,
                    percentage: Math.round((bestScore.score / bestScore.total) * 100),
                    date: bestScore.date
                } : null,
                recentScores: recentScores.map(score => ({
                    ...score,
                    percentage: Math.round((score.score / score.total) * 100)
                }))
            }
        });
    } catch (error) {
        console.error('Get quiz stats error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Generate quiz questions
export const generateQuiz = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id;
        const { limit = '5' } = req.query;
        const limitNum = parseInt(limit as string, 10);

        // Get user's search history and favorites for quiz material
        const [history, favorites] = await Promise.all([
            prisma.searchHistory.findMany({
                where: { userId },
                select: {
                    term: true,
                    meaning: true,
                    example: true,
                    category: true
                },
                distinct: ['term']
            }),
            prisma.favorite.findMany({
                where: { userId },
                select: {
                    term: true,
                    meaning: true,
                    example: true,
                    category: true
                }
            })
        ]);

        // Combine and deduplicate
        const allTerms = [...history, ...favorites];
        const uniqueTerms = allTerms.filter((term, index, self) =>
            index === self.findIndex(t => t.term === term.term)
        );

        if (uniqueTerms.length < 3) {
            return res.status(400).json({
                error: 'Not enough terms for quiz. Search for more terms first.'
            });
        }

        // Shuffle and select terms
        const shuffledTerms = uniqueTerms.sort(() => Math.random() - 0.5);
        const selectedTerms = shuffledTerms.slice(0, Math.min(limitNum, uniqueTerms.length));

        // Generate quiz questions
        const questions = selectedTerms.map(term => {
            // Get wrong answers from other terms
            const wrongAnswers = shuffledTerms
                .filter(t => t.term !== term.term)
                .slice(0, 3)
                .map(t => t.meaning);

            // Shuffle options
            const options = [term.meaning, ...wrongAnswers]
                .sort(() => Math.random() - 0.5);

            return {
                term: term.term,
                correctAnswer: term.meaning,
                options,
                definition: {
                    meaning: term.meaning,
                    example: term.example,
                    category: term.category
                }
            };
        });

        res.json({ questions });
    } catch (error) {
        console.error('Generate quiz error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Routes
router.post('/score', authenticateToken, saveQuizScore);
router.get('/scores', authenticateToken, getQuizScores);
router.get('/stats', authenticateToken, getQuizStats);
router.get('/generate', authenticateToken, generateQuiz);

export default router;
