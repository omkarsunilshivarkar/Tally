import { Router } from 'express';
import { eq, and } from 'drizzle-orm';
import { db } from '../db/db.js';
import { budgets } from '../db/schema.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

function generateUUID() {
  return crypto.randomUUID();
}

/**
 * GET /api/budgets - Get user budgets for a specific month (query param ?month=YYYY-MM)
 */
router.get('/', authenticateToken, async (req, res) => {
  const userId = req.userId;
  const month = req.query.month || new Date().toISOString().slice(0, 7); // Default to current YYYY-MM

  try {
    const userBudgets = await db
      .select()
      .from(budgets)
      .where(and(eq(budgets.userId, userId), eq(budgets.month, month)));

    return res.json(userBudgets);
  } catch (error) {
    console.error('Fetch budgets error:', error);
    return res.status(500).json({ error: 'Failed to fetch budgets' });
  }
});

/**
 * POST /api/budgets - Create or update a budget limit
 */
router.post('/', authenticateToken, async (req, res) => {
  const userId = req.userId;
  const { category, limitAmount, month } = req.body;

  if (!category || limitAmount === undefined || !month) {
    return res.status(400).json({ error: 'Category, limitAmount, and month are required' });
  }

  const parsedLimit = parseFloat(limitAmount);
  if (isNaN(parsedLimit) || parsedLimit < 0) {
    return res.status(400).json({ error: 'limitAmount must be a non-negative number' });
  }

  try {
    // Check if budget exists for this category/month
    const existing = await db
      .select()
      .from(budgets)
      .where(
        and(
          eq(budgets.userId, userId),
          eq(budgets.category, category),
          eq(budgets.month, month)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Update
      const budgetId = existing[0].id;
      await db
        .update(budgets)
        .set({ limitAmount: parsedLimit })
        .where(eq(budgets.id, budgetId));
      
      return res.json({
        ...existing[0],
        limitAmount: parsedLimit,
      });
    } else {
      // Insert
      const newBudget = {
        id: generateUUID(),
        userId,
        category,
        limitAmount: parsedLimit,
        month,
      };

      await db.insert(budgets).values(newBudget);
      return res.status(201).json(newBudget);
    }
  } catch (error) {
    console.error('Save budget error:', error);
    return res.status(500).json({ error: 'Failed to save budget' });
  }
});

export default router;
