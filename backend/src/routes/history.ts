import { Router, Response } from 'express';
import { prisma } from '../index';
import { AuthRequest, authenticateToken } from '../middleware/auth';

const router = Router();

// Get user's search history
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const history = await prisma.searchHistory.findMany({
      where: { userId: req.user!.id },
      orderBy: { timestamp: 'desc' },
      skip,
      take: Number(limit),
    });

    const total = await prisma.searchHistory.count({
      where: { userId: req.user!.id },
    });

    res.json({
      history,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Failed to get search history' });
  }
});

// Remove specific search from history
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.searchHistory.deleteMany({
      where: {
        id,
        userId: req.user!.id,
      },
    });

    res.json({ message: 'Search removed from history' });
  } catch (error) {
    console.error('Remove history error:', error);
    res.status(500).json({ error: 'Failed to remove from history' });
  }
});

// Clear all search history
router.delete('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.searchHistory.deleteMany({
      where: { userId: req.user!.id },
    });

    res.json({ message: 'Search history cleared successfully' });
  } catch (error) {
    console.error('Clear history error:', error);
    res.status(500).json({ error: 'Failed to clear search history' });
  }
});

export default router;