import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import Joi from 'joi';

const router = Router();
const prisma = new PrismaClient();

// Validation schema
const preferencesSchema = Joi.object({
    autoSpeak: Joi.boolean().optional(),
    theme: Joi.string().valid('dark', 'light').optional(),
    lastWordOfDay: Joi.string().optional(),
    lastWordOfDayDate: Joi.string().optional()
});

// Get user preferences
export const getPreferences = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id;

        let preferences = await prisma.userPreferences.findUnique({
            where: { userId }
        });

        // Create default preferences if none exist
        if (!preferences) {
            preferences = await prisma.userPreferences.create({
                data: {
                    userId,
                    autoSpeak: false,
                    theme: 'dark',
                    lastWordOfDay: '',
                    lastWordOfDayDate: ''
                }
            });
        }

        res.json({ preferences });
    } catch (error) {
        console.error('Get preferences error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update user preferences
export const updatePreferences = async (req: AuthRequest, res: Response) => {
    try {
        const { error, value } = preferencesSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const userId = req.user!.id;

        const preferences = await prisma.userPreferences.upsert({
            where: { userId },
            update: value,
            create: {
                userId,
                autoSpeak: value.autoSpeak ?? false,
                theme: value.theme ?? 'dark',
                lastWordOfDay: value.lastWordOfDay ?? '',
                lastWordOfDayDate: value.lastWordOfDayDate ?? ''
            }
        });

        res.json({
            message: 'Preferences updated successfully',
            preferences
        });
    } catch (error) {
        console.error('Update preferences error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Export user data
export const exportData = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id;

        const [user, searchHistory, favorites, quizScores, preferences] = await Promise.all([
            prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    email: true,
                    username: true,
                    createdAt: true
                }
            }),
            prisma.searchHistory.findMany({
                where: { userId },
                orderBy: { timestamp: 'desc' },
                select: {
                    term: true,
                    meaning: true,
                    example: true,
                    category: true,
                    timestamp: true
                }
            }),
            prisma.favorite.findMany({
                where: { userId },
                orderBy: { savedAt: 'desc' },
                select: {
                    term: true,
                    meaning: true,
                    example: true,
                    category: true,
                    savedAt: true
                }
            }),
            prisma.quizScore.findMany({
                where: { userId },
                orderBy: { date: 'desc' },
                select: {
                    score: true,
                    total: true,
                    date: true
                }
            }),
            prisma.userPreferences.findUnique({
                where: { userId }
            })
        ]);

        const exportData = {
            user,
            searchHistory,
            favorites,
            quizScores,
            preferences,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="slangsupport-backup-${new Date().toISOString().split('T')[0]}.json"`);
        res.json(exportData);
    } catch (error) {
        console.error('Export data error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Import user data
export const importData = async (req: AuthRequest, res: Response) => {
    try {
        const { data } = req.body;
        const userId = req.user!.id;

        if (!data || data.version !== '1.0') {
            return res.status(400).json({ error: 'Invalid data format' });
        }

        // Start transaction
        await prisma.$transaction(async (tx) => {
            // Clear existing data
            await Promise.all([
                tx.searchHistory.deleteMany({ where: { userId } }),
                tx.favorite.deleteMany({ where: { userId } }),
                tx.quizScore.deleteMany({ where: { userId } }),
                tx.userPreferences.deleteMany({ where: { userId } })
            ]);

            // Import new data
            if (data.searchHistory && data.searchHistory.length > 0) {
                await tx.searchHistory.createMany({
                    data: data.searchHistory.map((item: any) => ({
                        ...item,
                        userId,
                        timestamp: new Date(item.timestamp)
                    }))
                });
            }

            if (data.favorites && data.favorites.length > 0) {
                await tx.favorite.createMany({
                    data: data.favorites.map((item: any) => ({
                        ...item,
                        userId,
                        savedAt: new Date(item.savedAt)
                    }))
                });
            }

            if (data.quizScores && data.quizScores.length > 0) {
                await tx.quizScore.createMany({
                    data: data.quizScores.map((item: any) => ({
                        ...item,
                        userId,
                        date: new Date(item.date)
                    }))
                });
            }

            if (data.preferences) {
                await tx.userPreferences.create({
                    data: {
                        ...data.preferences,
                        userId
                    }
                });
            }
        });

        res.json({ message: 'Data imported successfully' });
    } catch (error) {
        console.error('Import data error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Clear all user data
export const clearAllData = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id;

        await prisma.$transaction(async (tx) => {
            await Promise.all([
                tx.searchHistory.deleteMany({ where: { userId } }),
                tx.favorite.deleteMany({ where: { userId } }),
                tx.quizScore.deleteMany({ where: { userId } }),
                tx.userPreferences.deleteMany({ where: { userId } })
            ]);
        });

        res.json({ message: 'All data cleared successfully' });
    } catch (error) {
        console.error('Clear all data error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Routes
router.get('/', authenticateToken, getPreferences);
router.put('/', authenticateToken, updatePreferences);
router.get('/export', authenticateToken, exportData);
router.post('/import', authenticateToken, importData);
router.delete('/clear', authenticateToken, clearAllData);

export default router;
