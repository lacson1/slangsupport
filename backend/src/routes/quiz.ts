import { Router, Response } from 'express';
import Joi from 'joi';
import { prisma } from '../index';
import { AuthRequest, authenticateToken } from '../middleware/auth';

const router = Router();

// Get user's quiz scores
router.get('/scores', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const scores = await prisma.quizScore.findMany({
      where: { userId: req.user!.id },
      orderBy: { date: 'desc' },
      take: 20,
    });

    res.json({ scores });
  } catch (error) {
    console.error('Get quiz scores error:', error);
    res.status(500).json({ error: 'Failed to get quiz scores' });
  }
});

// Save quiz score
router.post('/score', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const schema = Joi.object({
      score: Joi.number().min(0).required(),
      total: Joi.number().min(1).required(),
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { score, total } = value;

    const quizScore = await prisma.quizScore.create({
      data: {
        userId: req.user!.id,
        score,
        total,
      },
    });

    // Update high score if this is better
    const preferences = await prisma.userPreferences.findUnique({
      where: { userId: req.user!.id },
    });

    if (!preferences || score > preferences.quizHighScore) {
      await prisma.userPreferences.upsert({
        where: { userId: req.user!.id },
        update: {
          quizHighScore: score,
          totalQuizAttempts: {
            increment: 1,
          },
        },
        create: {
          userId: req.user!.id,
          quizHighScore: score,
          totalQuizAttempts: 1,
        },
      });
    } else {
      await prisma.userPreferences.upsert({
        where: { userId: req.user!.id },
        update: {
          totalQuizAttempts: {
            increment: 1,
          },
        },
        create: {
          userId: req.user!.id,
          totalQuizAttempts: 1,
        },
      });
    }

    res.status(201).json({ quizScore });
  } catch (error) {
    console.error('Save quiz score error:', error);
    res.status(500).json({ error: 'Failed to save quiz score' });
  }
});

// Get quiz statistics
router.get('/stats', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const preferences = await prisma.userPreferences.findUnique({
      where: { userId: req.user!.id },
    });

    const totalQuizzes = await prisma.quizScore.count({
      where: { userId: req.user!.id },
    });

    const averageScore = await prisma.quizScore.aggregate({
      where: { userId: req.user!.id },
      _avg: {
        score: true,
      },
    });

    res.json({
      highScore: preferences?.quizHighScore || 0,
      totalQuizzes,
      averageScore: averageScore._avg.score || 0,
      totalAttempts: preferences?.totalQuizAttempts || 0,
    });
  } catch (error) {
    console.error('Get quiz stats error:', error);
    res.status(500).json({ error: 'Failed to get quiz statistics' });
  }
});

export default router;