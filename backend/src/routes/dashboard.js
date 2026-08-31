import { Router } from 'express';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '../db/db.js';
import { users, expenses, budgets, savingsGoals } from '../db/schema.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/dashboard/bootstrap
 * Unified bootstrap endpoint returning user profile, expenses, savings goals, and budgets
 * in a single parallel query execution.
 */
router.get('/bootstrap', authenticateToken, async (req, res) => {
  const userId = req.userId;
  const month = req.query.month || new Date().toISOString().slice(0, 7);

  try {
    const [foundUsers, userExpenses, goals, userBudgets] = await Promise.all([
      db.select().from(users).where(eq(users.id, userId)).limit(1),
      db
        .select()
        .from(expenses)
        .where(eq(expenses.userId, userId))
        .orderBy(desc(expenses.date), desc(expenses.createdAt)),
      db
        .select()
        .from(savingsGoals)
        .where(eq(savingsGoals.userId, userId))
        .orderBy(desc(savingsGoals.createdAt)),
      db
        .select()
        .from(budgets)
        .where(and(eq(budgets.userId, userId), eq(budgets.month, month))),
    ]);

    if (foundUsers.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = {
      id: foundUsers[0].id,
      email: foundUsers[0].email,
      name: foundUsers[0].name,
    };

    return res.json({
      user,
      expenses: userExpenses,
      savingsGoals: goals,
      budgets: userBudgets,
    });
  } catch (error) {
    console.error('Bootstrap dashboard error:', error);
    return res.status(500).json({ error: 'Failed to bootstrap dashboard data' });
  }
});

export default router;
