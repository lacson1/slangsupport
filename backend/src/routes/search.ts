import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import Joi from 'joi';

const router = Router();
const prisma = new PrismaClient();

// Validation schema
const searchSchema = Joi.object({
    term: Joi.string().min(1).max(100).required(),
    meaning: Joi.string().required(),
    example: Joi.string().required(),
    category: Joi.string().optional(),
    relatedTerms: Joi.array().items(
        Joi.object({
            term: Joi.string().required(),
            reason: Joi.string().required()
        })
    ).optional()
});

// Save search to history
export const saveSearch = async (req: AuthRequest, res: Response) => {
    try {
        const { error, value } = searchSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { term, meaning, example, category, relatedTerms } = value;
        const userId = req.user!.id;

        // Check if search already exists for this user
        const existingSearch = await prisma.searchHistory.findFirst({
            where: {
                userId,
                term: term.toLowerCase()
            }
        });

        if (existingSearch) {
            // Update timestamp
            const updatedSearch = await prisma.searchHistory.update({
                where: { id: existingSearch.id },
                data: { timestamp: new Date() },
                select: {
                    id: true,
                    term: true,
                    timestamp: true,
                    meaning: true,
                    example: true,
                    category: true
                }
            });

            return res.json({
                message: 'Search updated successfully',
                search: updatedSearch
            });
        }

        // Create new search history entry
        const searchHistory = await prisma.searchHistory.create({
            data: {
                term: term.toLowerCase(),
                meaning,
                example,
                category,
                userId
            },
            select: {
                id: true,
                term: true,
                timestamp: true,
                meaning: true,
                example: true,
                category: true
            }
        });

        // Save related terms if provided
        if (relatedTerms && relatedTerms.length > 0) {
            await Promise.all(
                relatedTerms.map(relatedTerm =>
                    prisma.relatedTerm.create({
                        data: {
                            term: relatedTerm.term,
                            reason: relatedTerm.reason
                        }
                    }).catch(() => {
                        // Ignore duplicates
                    })
                )
            );
        }

        res.status(201).json({
            message: 'Search saved successfully',
            search: searchHistory
        });
    } catch (error) {
        console.error('Save search error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get search suggestions
export const getSuggestions = async (req: Request, res: Response) => {
    try {
        const { q } = req.query;

        if (!q || typeof q !== 'string') {
            return res.status(400).json({ error: 'Query parameter required' });
        }

        // Get suggestions from search history
        const suggestions = await prisma.searchHistory.findMany({
            where: {
                term: {
                    contains: q.toLowerCase(),
                    mode: 'insensitive'
                }
            },
            select: {
                term: true,
                meaning: true,
                category: true
            },
            distinct: ['term'],
            take: 10,
            orderBy: {
                timestamp: 'desc'
            }
        });

        res.json({ suggestions });
    } catch (error) {
        console.error('Get suggestions error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get popular terms
export const getPopularTerms = async (req: Request, res: Response) => {
    try {
        const { limit = '20' } = req.query;
        const limitNum = parseInt(limit as string, 10);

        const popularTerms = await prisma.searchHistory.groupBy({
            by: ['term'],
            _count: {
                term: true
            },
            orderBy: {
                _count: {
                    term: 'desc'
                }
            },
            take: limitNum
        });

        res.json({
            popularTerms: popularTerms.map(item => ({
                term: item.term,
                count: item._count.term
            }))
        });
    } catch (error) {
        console.error('Get popular terms error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Routes
router.post('/save', authenticateToken, saveSearch);
router.get('/suggestions', getSuggestions);
router.get('/popular', getPopularTerms);

export default router;
