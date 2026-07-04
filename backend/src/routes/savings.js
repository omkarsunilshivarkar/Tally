import { Router } from 'express';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '../db/db.js';
import { savingsGoals } from '../db/schema.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

function generateUUID() {
  return crypto.randomUUID();
}

/**
 * GET /api/savings - Fetch all savings goals for logged-in user
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const goals = await db
      .select()
      .from(savingsGoals)
      .where(eq(savingsGoals.userId, userId))
      .orderBy(desc(savingsGoals.createdAt));

    return res.json(goals);
  } catch (error) {
    console.error('Fetch savings goals error:', error);
    return res.status(500).json({ error: 'Failed to fetch savings goals' });
  }
});

/**
 * POST /api/savings - Create a new savings goal
 */
router.post('/', authenticateToken, async (req, res) => {
  const { name, targetAmount, currentAmount, targetDate } = req.body;
  const userId = req.userId;

  if (!name || targetAmount === undefined || targetDate === undefined) {
    return res.status(400).json({ error: 'Name, targetAmount, and targetDate are required' });
  }

  try {
    const goalId = generateUUID();
    const parsedTarget = parseFloat(targetAmount);
    const parsedCurrent = parseFloat(currentAmount || 0);

    if (isNaN(parsedTarget) || isNaN(parsedCurrent)) {
      return res.status(400).json({ error: 'Target amount and current amount must be numbers' });
    }

    const newGoal = {
      id: goalId,
      userId,
      name,
      targetAmount: parsedTarget,
      currentAmount: parsedCurrent,
      targetDate,
    };

    await db.insert(savingsGoals).values(newGoal);

    return res.status(201).json(newGoal);
  } catch (error) {
    console.error('Create savings goal error:', error);
    return res.status(500).json({ error: 'Failed to create savings goal' });
  }
});

/**
 * PUT /api/savings/:id - Update savings goal funding or details
 */
router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;
  const { name, targetAmount, currentAmount, targetDate } = req.body;

  try {
    const existing = await db
      .select()
      .from(savingsGoals)
      .where(and(eq(savingsGoals.id, id), eq(savingsGoals.userId, userId)))
      .limit(1);

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Savings goal not found or unauthorized' });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (targetAmount !== undefined) {
      const val = parseFloat(targetAmount);
      if (!isNaN(val)) updateData.targetAmount = val;
    }
    if (currentAmount !== undefined) {
      const val = parseFloat(currentAmount);
      if (!isNaN(val)) updateData.currentAmount = val;
    }
    if (targetDate !== undefined) updateData.targetDate = targetDate;

    await db
      .update(savingsGoals)
      .set(updateData)
      .where(eq(savingsGoals.id, id));

    return res.json({ id, ...existing[0], ...updateData });
  } catch (error) {
    console.error('Update savings goal error:', error);
    return res.status(500).json({ error: 'Failed to update savings goal' });
  }
});

/**
 * DELETE /api/savings/:id - Delete a savings goal
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    const existing = await db
      .select()
      .from(savingsGoals)
      .where(and(eq(savingsGoals.id, id), eq(savingsGoals.userId, userId)))
      .limit(1);

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Savings goal not found or unauthorized' });
    }

    await db.delete(savingsGoals).where(eq(savingsGoals.id, id));

    return res.json({ message: 'Savings goal deleted successfully' });
  } catch (error) {
    console.error('Delete savings goal error:', error);
    return res.status(500).json({ error: 'Failed to delete savings goal' });
  }
});

export default router;
