import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../db/db.js';
import { expenses, budgets } from '../db/schema.js';
import { authenticateToken } from '../middleware/auth.js';
import { getFinancialAdvice } from '../services/groq.js';

const router = Router();

/**
 * POST /api/chatbot - Chat with Gemini advisor, with full spending context
 */
router.post('/', authenticateToken, async (req, res) => {
  const userId = req.userId;
  const { message, history } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    // 1. Gather all expenses for context
    const userExpenses = await db
      .select()
      .from(expenses)
      .where(eq(expenses.userId, userId));

    // 2. Gather all budgets for context
    const userBudgets = await db
      .select()
      .from(budgets)
      .where(eq(budgets.userId, userId));

    // 3. Format expenses context string
    const expensesContext = userExpenses
      .map(
        (e) =>
          `- ${e.date}: spent $${e.amount.toFixed(2)} at "${e.merchant}" in category "${e.category}" (${e.description})`
      )
      .join('\n') || 'No expenses logged yet.';

    // 4. Format budgets context string
    const budgetsContext = userBudgets
      .map(
        (b) =>
          `- Category "${b.category}": limit of $${b.limitAmount.toFixed(2)} for month ${b.month}`
      )
      .join('\n') || 'No budgets configured yet.';

    // 5. Structure history properly for the Gemini SDK chat
    // Format required: array of { role: 'user'|'model', parts: [{ text: string }] }
    const formattedHistory = [];
    
    if (Array.isArray(history)) {
      history.forEach((msg) => {
        if (msg.role && msg.content) {
          formattedHistory.push({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }],
          });
        }
      });
    }

    // Add the current user query to the history for the model to parse
    formattedHistory.push({
      role: 'user',
      parts: [{ text: message }],
    });

    // 6. Request financial advice from service
    const advice = await getFinancialAdvice(formattedHistory, expensesContext, budgetsContext);

    return res.json({ response: advice });
  } catch (error) {
    console.error('Chatbot route error:', error);
    return res.status(500).json({ error: 'Advisor chatbot encountered an error.' });
  }
});

export default router;
