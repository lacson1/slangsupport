import { Router, Response } from 'express';
import Joi from 'joi';
import { getSlangDefinition } from '../services/geminiService';
import { prisma } from '../index';
import { AuthRequest, optionalAuth } from '../middleware/auth';

const router = Router();

// Validation schema
const searchSchema = Joi.object({
  term: Joi.string().min(1).max(100).required(),
});

// Search for slang definition
router.post('/', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { error, value } = searchSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { term } = value;

    // Get definition from Gemini AI
    const definition = await getSlangDefinition(term);

    // If user is authenticated, save to search history
    if (req.user) {
      try {
        await prisma.searchHistory.create({
          data: {
            userId: req.user.id,
            term: term.toLowerCase(),
            definition: definition,
          },
        });

        // Update search count in preferences
        await prisma.userPreferences.upsert({
          where: { userId: req.user.id },
          update: {
            searchCount: {
              increment: 1,
            },
          },
          create: {
            userId: req.user.id,
            searchCount: 1,
          },
        });
      } catch (dbError) {
        console.error('Error saving search history:', dbError);
        // Continue even if history save fails
      }
    }

    res.json({
      term,
      definition,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to get definition' });
  }
});

// Get search suggestions (popular terms)
router.get('/suggestions', async (req: AuthRequest, res: Response) => {
  try {
    // Get popular search terms from the database
    const popularTerms = await prisma.searchHistory.groupBy({
      by: ['term'],
      _count: {
        term: true,
      },
      orderBy: {
        _count: {
          term: 'desc',
        },
      },
      take: 10,
    });

    const suggestions = popularTerms.map(item => ({
      term: item.term,
      count: item._count.term,
    }));

    res.json({ suggestions });
  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({ error: 'Failed to get suggestions' });
  }
});

// Get trending terms
router.get('/trending', async (req: AuthRequest, res: Response) => {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const trendingTerms = await prisma.searchHistory.groupBy({
      by: ['term'],
      _count: {
        term: true,
      },
      where: {
        timestamp: {
          gte: oneWeekAgo,
        },
      },
      orderBy: {
        _count: {
          term: 'desc',
        },
      },
      take: 20,
    });

    const trending = trendingTerms.map(item => ({
      term: item.term,
      searches: item._count.term,
    }));

    res.json({ trending });
  } catch (error) {
    console.error('Trending error:', error);
    res.status(500).json({ error: 'Failed to get trending terms' });
  }
});

export default router;