import { Router, Response } from 'express';
import { prisma } from '../index';
import { getSlangDefinition } from '../services/geminiService';

const router = Router();

// Get today's word of the day
router.get('/', async (req, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if we already have a word for today
    let wordOfTheDay = await prisma.wordOfTheDay.findFirst({
      where: {
        date: {
          gte: today,
        },
        isActive: true,
      },
    });

    // If no word for today, generate a new one
    if (!wordOfTheDay) {
      const words = ['rizz', 'based', 'slay', 'no cap', 'bet', 'drip', 'finna', 'stan', 'mid', 'yeet'];
      const randomWord = words[Math.floor(Math.random() * words.length)];

      const definition = await getSlangDefinition(randomWord);

      wordOfTheDay = await prisma.wordOfTheDay.create({
        data: {
          word: randomWord,
          definition,
          date: today,
        },
      });
    }

    res.json({
      word: wordOfTheDay.word,
      definition: wordOfTheDay.definition,
      date: wordOfTheDay.date,
    });
  } catch (error) {
    console.error('Word of the day error:', error);
    res.status(500).json({ error: 'Failed to get word of the day' });
  }
});

// Get word of the day history
router.get('/history', async (req, res: Response) => {
  try {
    const { limit = 30 } = req.query;

    const history = await prisma.wordOfTheDay.findMany({
      where: { isActive: true },
      orderBy: { date: 'desc' },
      take: Number(limit),
    });

    res.json({ history });
  } catch (error) {
    console.error('Word of the day history error:', error);
    res.status(500).json({ error: 'Failed to get word of the day history' });
  }
});

export default router;
