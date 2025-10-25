import { Router, Response } from 'express';
import Joi from 'joi';
import { prisma } from '../index';
import { AuthRequest, authenticateToken } from '../middleware/auth';

const router = Router();

// Get user's favorites
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user!.id },
      orderBy: { savedAt: 'desc' },
    });

    res.json({ favorites });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ error: 'Failed to get favorites' });
  }
});

// Add to favorites
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const schema = Joi.object({
      term: Joi.string().required(),
      definition: Joi.object().required(),
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { term, definition } = value;

    const favorite = await prisma.favorite.create({
      data: {
        userId: req.user!.id,
        term: term.toLowerCase(),
        definition,
      },
    });

    // Update favorite count
    await prisma.userPreferences.upsert({
      where: { userId: req.user!.id },
      update: {
        favoriteCount: {
          increment: 1,
        },
      },
      create: {
        userId: req.user!.id,
        favoriteCount: 1,
      },
    });

    res.status(201).json({ favorite });
  } catch (error) {
    console.error('Add favorite error:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Term already in favorites' });
    }
    res.status(500).json({ error: 'Failed to add favorite' });
  }
});

// Remove from favorites
router.delete('/:term', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { term } = req.params;

    await prisma.favorite.deleteMany({
      where: {
        userId: req.user!.id,
        term: term.toLowerCase(),
      },
    });

    // Update favorite count
    await prisma.userPreferences.update({
      where: { userId: req.user!.id },
      data: {
        favoriteCount: {
          decrement: 1,
        },
      },
    });

    res.json({ message: 'Favorite removed successfully' });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
});

// Clear all favorites
router.delete('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.favorite.deleteMany({
      where: { userId: req.user!.id },
    });

    // Reset favorite count
    await prisma.userPreferences.update({
      where: { userId: req.user!.id },
      data: { favoriteCount: 0 },
    });

    res.json({ message: 'All favorites cleared successfully' });
  } catch (error) {
    console.error('Clear favorites error:', error);
    res.status(500).json({ error: 'Failed to clear favorites' });
  }
});

export default router;