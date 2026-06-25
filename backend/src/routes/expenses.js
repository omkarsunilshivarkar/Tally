import { Router } from 'express';
import multer from 'multer';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '../db/db.js';
import { expenses } from '../db/schema.js';
import { authenticateToken } from '../middleware/auth.js';
import { scanReceipt, parseQuickLog } from '../services/groq.js';

const router = Router();

// Setup Multer for handling file uploads (in-memory)
const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

function generateUUID() {
  return crypto.randomUUID();
}

/**
 * GET /api/expenses - Get all expenses for logged-in user
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const userExpenses = await db
      .select()
      .from(expenses)
      .where(eq(expenses.userId, userId))
      .orderBy(desc(expenses.date), desc(expenses.createdAt));

    return res.json(userExpenses);
  } catch (error) {
    console.error('Fetch expenses error:', error);
    return res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

/**
 * POST /api/expenses - Add an expense manually
 */
router.post('/', authenticateToken, async (req, res) => {
  const { amount, category, description, date } = req.body;
  const userId = req.userId;

  if (amount === undefined || !category || !description || !date) {
    return res.status(400).json({ error: 'Amount, category, description, and date are required' });
  }

  try {
    const expenseId = generateUUID();
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount)) {
      return res.status(400).json({ error: 'Amount must be a number' });
    }

    const newExpense = {
      id: expenseId,
      userId,
      amount: parsedAmount,
      category,
      description,
      date,
    };

    await db.insert(expenses).values(newExpense);

    return res.status(201).json(newExpense);
  } catch (error) {
    console.error('Create expense error:', error);
    return res.status(500).json({ error: 'Failed to create expense' });
  }
});

/**
 * POST /api/expenses/quick-log - Parse natural language input
 */
router.post('/quick-log', authenticateToken, async (req, res) => {
  const { text } = req.body;

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Text query is required' });
  }

  try {
    const parsed = await parseQuickLog(text);
    return res.json(parsed);
  } catch (error) {
    console.error('Quick log error:', error);
    return res.status(500).json({ error: 'Failed to parse natural language log' });
  }
});

/**
 * POST /api/expenses/scan - Scan receipt image and return parsed details
 */
router.post(
  '/scan',
  authenticateToken,
  upload.single('receipt'),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'Receipt image file is required' });
    }

    try {
      const parsed = await scanReceipt(req.file.buffer, req.file.mimetype);
      return res.json(parsed);
    } catch (error) {
      console.error('Scan receipt route error:', error);
      return res.status(500).json({ error: 'Failed to scan receipt image' });
    }
  }
);

/**
 * DELETE /api/expenses/:id - Delete an expense
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    const existing = await db
      .select()
      .from(expenses)
      .where(and(eq(expenses.id, id), eq(expenses.userId, userId)))
      .limit(1);

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Expense not found or unauthorized' });
    }

    await db.delete(expenses).where(eq(expenses.id, id));

    return res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Delete expense error:', error);
    return res.status(500).json({ error: 'Failed to delete expense' });
  }
});

export default router;
