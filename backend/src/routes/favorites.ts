import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import Joi from 'joi';

const router = Router();
const prisma = new PrismaClient();

// Validation schema
const favoriteSchema = Joi.object({
    term: Joi.string().min(1).max(100).required(),
    meaning: Joi.string().required(),
    example: Joi.string().required(),
    category: Joi.string().optional()
});

// Get user's favorites
export const getFavorites = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id;
        const { page = '1', limit = '50', search } = req.query;

        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const skip = (pageNum - 1) * limitNum;

        const whereClause: any = { userId };

        if (search) {
            whereClause.OR = [
                { term: { contains: search as string, mode: 'insensitive' } },
                { meaning: { contains: search as string, mode: 'insensitive' } }
            ];
        }

        const [favorites, total] = await Promise.all([
            prisma.favorite.findMany({
                where: whereClause,
                orderBy: { savedAt: 'desc' },
                skip,
                take: limitNum,
                select: {
                    id: true,
                    term: true,
                    meaning: true,
                    example: true,
                    category: true,
                    savedAt: true
                }
            }),
            prisma.favorite.count({ where: whereClause })
        ]);

        res.json({
            favorites,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error('Get favorites error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Add favorite
export const addFavorite = async (req: AuthRequest, res: Response) => {
    try {
        const { error, value } = favoriteSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { term, meaning, example, category } = value;
        const userId = req.user!.id;

        // Check if already favorited
        const existingFavorite = await prisma.favorite.findUnique({
            where: {
                term_userId: {
                    term: term.toLowerCase(),
                    userId
                }
            }
        });

        if (existingFavorite) {
            return res.status(409).json({ error: 'Term already in favorites' });
        }

        const favorite = await prisma.favorite.create({
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
                meaning: true,
                example: true,
                category: true,
                savedAt: true
            }
        });

        res.status(201).json({
            message: 'Added to favorites',
            favorite
        });
    } catch (error) {
        console.error('Add favorite error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Remove favorite
export const removeFavorite = async (req: AuthRequest, res: Response) => {
    try {
        const { term } = req.params;
        const userId = req.user!.id;

        const favorite = await prisma.favorite.findUnique({
            where: {
                term_userId: {
                    term: term.toLowerCase(),
                    userId
                }
            }
        });

        if (!favorite) {
            return res.status(404).json({ error: 'Favorite not found' });
        }

        await prisma.favorite.delete({
            where: { id: favorite.id }
        });

        res.json({ message: 'Removed from favorites' });
    } catch (error) {
        console.error('Remove favorite error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Check if term is favorited
export const checkFavorite = async (req: AuthRequest, res: Response) => {
    try {
        const { term } = req.params;
        const userId = req.user!.id;

        const favorite = await prisma.favorite.findUnique({
            where: {
                term_userId: {
                    term: term.toLowerCase(),
                    userId
                }
            }
        });

        res.json({ isFavorited: !!favorite });
    } catch (error) {
        console.error('Check favorite error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Clear all favorites
export const clearFavorites = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id;

        await prisma.favorite.deleteMany({
            where: { userId }
        });

        res.json({ message: 'All favorites cleared' });
    } catch (error) {
        console.error('Clear favorites error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Routes
router.get('/', authenticateToken, getFavorites);
router.post('/', authenticateToken, addFavorite);
router.delete('/:term', authenticateToken, removeFavorite);
router.get('/:term/check', authenticateToken, checkFavorite);
router.delete('/', authenticateToken, clearFavorites);

export default router;
