import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get user's search history
export const getHistory = async (req: AuthRequest, res: Response) => {
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

        const [history, total] = await Promise.all([
            prisma.searchHistory.findMany({
                where: whereClause,
                orderBy: { timestamp: 'desc' },
                skip,
                take: limitNum,
                select: {
                    id: true,
                    term: true,
                    timestamp: true,
                    meaning: true,
                    example: true,
                    category: true
                }
            }),
            prisma.searchHistory.count({ where: whereClause })
        ]);

        res.json({
            history,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Remove specific history item
export const removeHistoryItem = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user!.id;

        const historyItem = await prisma.searchHistory.findFirst({
            where: {
                id,
                userId
            }
        });

        if (!historyItem) {
            return res.status(404).json({ error: 'History item not found' });
        }

        await prisma.searchHistory.delete({
            where: { id }
        });

        res.json({ message: 'History item removed' });
    } catch (error) {
        console.error('Remove history item error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Clear all history
export const clearHistory = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id;

        await prisma.searchHistory.deleteMany({
            where: { userId }
        });

        res.json({ message: 'All history cleared' });
    } catch (error) {
        console.error('Clear history error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get history statistics
export const getHistoryStats = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id;

        const [
            totalSearches,
            todaySearches,
            categoryStats,
            recentSearches
        ] = await Promise.all([
            prisma.searchHistory.count({ where: { userId } }),
            prisma.searchHistory.count({
                where: {
                    userId,
                    timestamp: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0))
                    }
                }
            }),
            prisma.searchHistory.groupBy({
                by: ['category'],
                where: { userId },
                _count: { category: true },
                orderBy: { _count: { category: 'desc' } },
                take: 10
            }),
            prisma.searchHistory.findMany({
                where: { userId },
                orderBy: { timestamp: 'desc' },
                take: 5,
                select: {
                    term: true,
                    timestamp: true,
                    category: true
                }
            })
        ]);

        res.json({
            stats: {
                totalSearches,
                todaySearches,
                categoryStats: categoryStats.map(stat => ({
                    category: stat.category || 'Uncategorized',
                    count: stat._count.category
                })),
                recentSearches
            }
        });
    } catch (error) {
        console.error('Get history stats error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Routes
router.get('/', authenticateToken, getHistory);
router.delete('/:id', authenticateToken, removeHistoryItem);
router.delete('/', authenticateToken, clearHistory);
router.get('/stats', authenticateToken, getHistoryStats);

export default router;
