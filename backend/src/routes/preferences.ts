import { Router, Response } from 'express';
import Joi from 'joi';
import { prisma } from '../index';
import { AuthRequest, authenticateToken } from '../middleware/auth';

const router = Router();

// Get user preferences
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const preferences = await prisma.userPreferences.findUnique({
      where: { userId: req.user!.id },
    });

    if (!preferences) {
      // Create default preferences if they don't exist
      const newPreferences = await prisma.userPreferences.create({
        data: { userId: req.user!.id },
      });
      return res.json({ preferences: newPreferences });
    }

    res.json({ preferences });
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({ error: 'Failed to get preferences' });
  }
});

// Update user preferences
router.put('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const schema = Joi.object({
      autoSpeak: Joi.boolean(),
      speechRate: Joi.number().min(0.5).max(2),
      speechVoice: Joi.string(),
      theme: Joi.string().valid('dark', 'light'),
      showHistory: Joi.boolean(),
      showFavorites: Joi.boolean(),
      lastWordOfDay: Joi.string(),
      lastWordOfDayDate: Joi.string(),
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const preferences = await prisma.userPreferences.upsert({
      where: { userId: req.user!.id },
      update: value,
      create: {
        userId: req.user!.id,
        ...value,
      },
    });

    res.json({
      message: 'Preferences updated successfully',
      preferences,
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

// Reset preferences to default
router.post('/reset', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const defaultPreferences = {
      autoSpeak: true,
      speechRate: 1.0,
      speechVoice: 'default',
      theme: 'dark',
      showHistory: true,
      showFavorites: true,
      lastWordOfDay: '',
      lastWordOfDayDate: '',
      searchCount: 0,
      favoriteCount: 0,
      quizHighScore: 0,
      totalQuizAttempts: 0,
    };

    const preferences = await prisma.userPreferences.upsert({
      where: { userId: req.user!.id },
      update: defaultPreferences,
      create: {
        userId: req.user!.id,
        ...defaultPreferences,
      },
    });

    res.json({
      message: 'Preferences reset to default',
      preferences,
    });
  } catch (error) {
    console.error('Reset preferences error:', error);
    res.status(500).json({ error: 'Failed to reset preferences' });
  }
});

export default router;