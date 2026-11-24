/**
 * Conversation Flows
 *
 * Multi-step state machine for complex interactions.
 * State is kept in-memory (auto-expires after 10 min).
 *
 * Flows:
 *   LOG_EXPENSE   — amount → category → description → date → confirm
 *   SET_BUDGET    — category → amount → month → save
 *   CREATE_GOAL   — name → target → date → save
 *   FUND_GOAL     — select goal → amount → save
 *   DELETE_EXPENSE — select expense → confirm → delete
 */

import crypto from 'crypto';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { expenses, budgets, savingsGoals } from '../db/schema.js';
import { sendTextMessage, sendInteractiveList, sendReplyButtons } from './client.js';
import {
  CATEGORIES,
  getCategoryEmoji,
  buildCategoryList,
  formatExpenseConfirmation,
} from './formatters.js';

// ── In-Memory State Store ───────────────────────────────────────

const activeFlows = new Map();
const FLOW_TIMEOUT = 10 * 60 * 1000; // 10 minutes

/**
 * Get the active flow for a phone number, or null if none/expired.
 */
export function getActiveFlow(phone) {
  const state = activeFlows.get(phone);
  if (!state) return null;
  if (Date.now() > state.expiresAt) {
    activeFlows.delete(phone);
    return null;
  }
  return state;
}

function setFlow(phone, flow, step, data = {}) {
  activeFlows.set(phone, {
    flow,
    step,
    data,
    expiresAt: Date.now() + FLOW_TIMEOUT,
  });
}

export function cancelFlow(phone) {
  activeFlows.delete(phone);
}

// ── Flow Starters (called from handler.js) ──────────────────────

export async function startLogExpense(phone) {
  setFlow(phone, 'LOG_EXPENSE', 'amount');
  await sendTextMessage(
    phone,
    '➕ *Log New Expense*\n\nHow much did you spend?\n_(Just type the amount, e.g. 500 or 49.50)_\n\n_Type *cancel* to abort._'
  );
}

export async function startSetBudget(phone) {
  setFlow(phone, 'SET_BUDGET', 'category');
  const catList = buildCategoryList();
  await sendInteractiveList(phone, {
    header: '✏️ Set Budget',
    body: 'Which category do you want to set a budget for?\n\n_Type *cancel* to abort._',
    buttonText: catList.buttonText,
    sections: catList.sections,
  });
}

export async function startCreateGoal(phone) {
  setFlow(phone, 'CREATE_GOAL', 'name');
  await sendTextMessage(
    phone,
    '🎯 *Create Savings Goal*\n\nWhat are you saving for?\n_(Type a name, e.g. "Emergency Fund" or "New Laptop")_\n\n_Type *cancel* to abort._'
  );
}

export async function startFundGoal(phone, userId) {
  const goals = await db
    .select()
    .from(savingsGoals)
    .where(eq(savingsGoals.userId, userId))
    .orderBy(desc(savingsGoals.createdAt));

  if (goals.length === 0) {
    return sendTextMessage(
      phone,
      "🎯 You don't have any savings goals yet.\n\nSelect *\"Create Goal\"* from the menu first!"
    );
  }

  setFlow(phone, 'FUND_GOAL', 'select_goal', { goals });

  await sendInteractiveList(phone, {
    header: '💰 Fund a Goal',
    body: 'Which goal do you want to add money to?\n\n_Type *cancel* to abort._',
    buttonText: '🎯 Select Goal',
    sections: [
      {
        title: 'Your Goals',
        rows: goals.map((g) => ({
          id: `goal_${g.id}`,
          title: g.name,
          description: `₹${g.currentAmount.toFixed(0)} / ₹${g.targetAmount.toFixed(0)}`,
        })),
      },
    ],
  });
}

export async function startDeleteExpense(phone, userId) {
  const recent = await db
    .select()
    .from(expenses)
    .where(eq(expenses.userId, userId))
    .orderBy(desc(expenses.date), desc(expenses.createdAt))
    .limit(5);

  if (recent.length === 0) {
    return sendTextMessage(phone, '📋 No expenses to delete.\n\nType *hi* for the main menu.');
  }

  setFlow(phone, 'DELETE_EXPENSE', 'select', { expenses: recent });

  await sendInteractiveList(phone, {
    header: '🗑️ Delete Expense',
    body: 'Select the expense you want to delete:\n\n_Type *cancel* to abort._',
    buttonText: '📋 Select Expense',
    sections: [
      {
        title: 'Recent Expenses',
        rows: recent.map((e) => ({
          id: `del_${e.id}`,
          title: `₹${e.amount.toFixed(2)} — ${e.category}`,
          description: `${e.description} (${e.date})`,
        })),
      },
    ],
  });
}

// ── Flow Processor (entry point for active flows) ───────────────

/**
 * Process an incoming message within the user's active flow.
 * Returns true if handled, false if the flow couldn't process it.
 */
export async function processFlowMessage(phone, user, message) {
  const state = getActiveFlow(phone);
  if (!state) return false;

  // Extract input based on message type
  let textInput = null;
  let listReplyId = null;
  let buttonReplyId = null;

  if (message.type === 'text') {
    textInput = message.text.body.trim();
  } else if (message.type === 'interactive') {
    if (message.interactive.type === 'list_reply') {
      listReplyId = message.interactive.list_reply.id;
    } else if (message.interactive.type === 'button_reply') {
      buttonReplyId = message.interactive.button_reply.id;
    }
  }

  switch (state.flow) {
    case 'LOG_EXPENSE':
      return processLogExpense(phone, user, state, textInput, listReplyId, buttonReplyId);
    case 'SET_BUDGET':
      return processSetBudget(phone, user, state, textInput, listReplyId, buttonReplyId);
    case 'CREATE_GOAL':
      return processCreateGoal(phone, user, state, textInput, listReplyId, buttonReplyId);
    case 'FUND_GOAL':
      return processFundGoal(phone, user, state, textInput, listReplyId, buttonReplyId);
    case 'DELETE_EXPENSE':
      return processDeleteExpense(phone, user, state, textInput, listReplyId, buttonReplyId);
    default:
      cancelFlow(phone);
      return false;
  }
}

// ═════════════════════════════════════════════════════════════════
// LOG EXPENSE: amount → category → description → date → confirm
// ═════════════════════════════════════════════════════════════════

async function processLogExpense(phone, user, state, text, listId, buttonId) {
  switch (state.step) {
    // Step 1: Enter amount
    case 'amount': {
      const amount = parseFloat(text);
      if (!text || isNaN(amount) || amount <= 0) {
        await sendTextMessage(phone, '❌ Please enter a valid amount (e.g. *500* or *49.50*)');
        return true;
      }
      setFlow(phone, 'LOG_EXPENSE', 'category', { amount });
      const catList = buildCategoryList();
      await sendInteractiveList(phone, {
        header: '📂 Category',
        body: `Amount: *₹${amount.toFixed(2)}*\n\nNow pick a category:`,
        buttonText: catList.buttonText,
        sections: catList.sections,
      });
      return true;
    }

    // Step 2: Select category from list
    case 'category': {
      if (!listId || !listId.startsWith('cat_')) {
        await sendTextMessage(phone, '❌ Please select a category from the list above.');
        return true;
      }
      const category = listId.replace('cat_', '');
      if (!CATEGORIES.includes(category)) {
        await sendTextMessage(phone, '❌ Invalid category. Please select from the list.');
        return true;
      }
      setFlow(phone, 'LOG_EXPENSE', 'description', { ...state.data, category });
      await sendTextMessage(
        phone,
        `${getCategoryEmoji(category)} *${category}*\n\nWhat was this expense for?\n_(Brief description, e.g. "Dinner at restaurant")_`
      );
      return true;
    }

    // Step 3: Type description
    case 'description': {
      if (!text || text.length < 2) {
        await sendTextMessage(phone, '❌ Please type a brief description (at least 2 characters).');
        return true;
      }
      setFlow(phone, 'LOG_EXPENSE', 'date', { ...state.data, description: text });

      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      await sendReplyButtons(phone, {
        body: `📝 *${text}*\n\nWhen did you make this purchase?`,
        buttons: [
          { id: `date_${today}`, title: '📅 Today' },
          { id: `date_${yesterday}`, title: '📅 Yesterday' },
          { id: 'date_custom', title: '📅 Other Date' },
        ],
      });
      return true;
    }

    // Step 4: Select date
    case 'date': {
      let date;

      if (buttonId) {
        if (buttonId === 'date_custom') {
          setFlow(phone, 'LOG_EXPENSE', 'date_custom', state.data);
          await sendTextMessage(phone, 'Type the date in *YYYY-MM-DD* format\n_(e.g. 2026-11-20)_');
          return true;
        }
        date = buttonId.replace('date_', '');
      } else if (text && /^\d{4}-\d{2}-\d{2}$/.test(text)) {
        date = text;
      } else {
        await sendTextMessage(phone, '❌ Please tap a date button, or type in *YYYY-MM-DD* format.');
        return true;
      }

      return showExpenseConfirmation(phone, state.data, date);
    }

    // Step 4b: Custom date entry
    case 'date_custom': {
      if (!text || !/^\d{4}-\d{2}-\d{2}$/.test(text)) {
        await sendTextMessage(phone, '❌ Please type a valid date in *YYYY-MM-DD* format\n_(e.g. 2026-11-20)_');
        return true;
      }
      return showExpenseConfirmation(phone, state.data, text);
    }

    // Step 5: Confirm & save
    case 'confirm': {
      if (buttonId === 'confirm_yes') {
        const { amount, category, description, date } = state.data;
        const expense = { id: crypto.randomUUID(), userId: user.id, amount, category, description, date };
        await db.insert(expenses).values(expense);
        cancelFlow(phone);
        await sendTextMessage(phone, formatExpenseConfirmation(expense) + '\n\nType *hi* for the main menu.');
        return true;
      }
      if (buttonId === 'confirm_no') {
        cancelFlow(phone);
        await sendTextMessage(phone, '❌ Expense cancelled.\n\nType *hi* for the main menu.');
        return true;
      }
      await sendTextMessage(phone, '❌ Please tap *Save* or *Cancel*.');
      return true;
    }
  }
  return false;
}

async function showExpenseConfirmation(phone, data, date) {
  setFlow(phone, 'LOG_EXPENSE', 'confirm', { ...data, date });
  const { amount, category, description } = data;
  const emoji = getCategoryEmoji(category);

  await sendReplyButtons(phone, {
    body:
      `📋 *Confirm Expense*\n\n` +
      `${emoji} *${category}*\n` +
      `💰 ₹${amount.toFixed(2)}\n` +
      `📝 ${description}\n` +
      `📅 ${date}\n\n` +
      `Save this expense?`,
    buttons: [
      { id: 'confirm_yes', title: '✅ Save' },
      { id: 'confirm_no', title: '❌ Cancel' },
    ],
  });
  return true;
}

// ═════════════════════════════════════════════════════════════════
// SET BUDGET: category → amount → month → save
// ═════════════════════════════════════════════════════════════════

async function processSetBudget(phone, user, state, text, listId, buttonId) {
  switch (state.step) {
    // Step 1: Select category
    case 'category': {
      if (!listId || !listId.startsWith('cat_')) {
        await sendTextMessage(phone, '❌ Please select a category from the list.');
        return true;
      }
      const category = listId.replace('cat_', '');
      setFlow(phone, 'SET_BUDGET', 'amount', { category });
      await sendTextMessage(
        phone,
        `${getCategoryEmoji(category)} *${category}*\n\nWhat should the monthly budget limit be?\n_(Type an amount, e.g. 5000)_`
      );
      return true;
    }

    // Step 2: Enter limit amount
    case 'amount': {
      const amount = parseFloat(text);
      if (!text || isNaN(amount) || amount <= 0) {
        await sendTextMessage(phone, '❌ Please enter a valid amount (e.g. *5000*).');
        return true;
      }
      setFlow(phone, 'SET_BUDGET', 'month', { ...state.data, limitAmount: amount });

      const thisMonth = new Date().toISOString().slice(0, 7);
      const nextDate = new Date();
      nextDate.setMonth(nextDate.getMonth() + 1);
      const nextMonth = nextDate.toISOString().slice(0, 7);

      await sendReplyButtons(phone, {
        body: `💰 *₹${amount.toFixed(2)}* limit for *${state.data.category}*\n\nFor which month?`,
        buttons: [
          { id: `month_${thisMonth}`, title: `📅 ${thisMonth}` },
          { id: `month_${nextMonth}`, title: `📅 ${nextMonth}` },
          { id: 'month_custom', title: '📅 Other' },
        ],
      });
      return true;
    }

    // Step 3: Select month
    case 'month': {
      let month;
      if (buttonId === 'month_custom') {
        setFlow(phone, 'SET_BUDGET', 'month_custom', state.data);
        await sendTextMessage(phone, 'Type the month in *YYYY-MM* format\n_(e.g. 2027-01)_');
        return true;
      }
      if (buttonId && buttonId.startsWith('month_')) {
        month = buttonId.replace('month_', '');
      } else if (text && /^\d{4}-\d{2}$/.test(text)) {
        month = text;
      } else {
        await sendTextMessage(phone, '❌ Please select a month or type in *YYYY-MM* format.');
        return true;
      }

      return saveBudget(phone, user, state.data, month);
    }

    // Step 3b: Custom month entry
    case 'month_custom': {
      if (!text || !/^\d{4}-\d{2}$/.test(text)) {
        await sendTextMessage(phone, '❌ Please type a valid month in *YYYY-MM* format\n_(e.g. 2027-01)_');
        return true;
      }
      return saveBudget(phone, user, state.data, text);
    }
  }
  return false;
}

async function saveBudget(phone, user, data, month) {
  const { category, limitAmount } = data;

  // Upsert: update if exists, insert if not
  const existing = await db
    .select()
    .from(budgets)
    .where(and(eq(budgets.userId, user.id), eq(budgets.category, category), eq(budgets.month, month)))
    .limit(1);

  if (existing.length > 0) {
    await db.update(budgets).set({ limitAmount }).where(eq(budgets.id, existing[0].id));
  } else {
    await db.insert(budgets).values({
      id: crypto.randomUUID(),
      userId: user.id,
      category,
      limitAmount,
      month,
    });
  }

  cancelFlow(phone);
  const emoji = getCategoryEmoji(category);
  const action = existing.length > 0 ? 'Updated' : 'Set';

  await sendTextMessage(
    phone,
    `✅ *Budget ${action}!*\n\n${emoji} *${category}*\n💰 ₹${limitAmount.toFixed(2)} / month\n📅 ${month}\n\nType *budget* to see all budgets.`
  );
  return true;
}

// ═════════════════════════════════════════════════════════════════
// CREATE GOAL: name → target amount → target date → save
// ═════════════════════════════════════════════════════════════════

async function processCreateGoal(phone, user, state, text, listId, buttonId) {
  switch (state.step) {
    // Step 1: Goal name
    case 'name': {
      if (!text || text.length < 2) {
        await sendTextMessage(phone, '❌ Please type a name for your goal (at least 2 characters).');
        return true;
      }
      setFlow(phone, 'CREATE_GOAL', 'target', { name: text });
      await sendTextMessage(
        phone,
        `📌 *${text}*\n\nHow much do you want to save?\n_(Type the target amount, e.g. 50000)_`
      );
      return true;
    }

    // Step 2: Target amount
    case 'target': {
      const amount = parseFloat(text);
      if (!text || isNaN(amount) || amount <= 0) {
        await sendTextMessage(phone, '❌ Please enter a valid target amount (e.g. *50000*).');
        return true;
      }
      setFlow(phone, 'CREATE_GOAL', 'date', { ...state.data, targetAmount: amount });
      await sendTextMessage(
        phone,
        `💰 *₹${amount.toFixed(2)}* target\n\nBy when do you want to reach this goal?\n_(Type a date in YYYY-MM-DD format, e.g. 2027-06-30)_`
      );
      return true;
    }

    // Step 3: Target date → save
    case 'date': {
      if (!text || !/^\d{4}-\d{2}-\d{2}$/.test(text)) {
        await sendTextMessage(phone, '❌ Please type a valid date in *YYYY-MM-DD* format\n_(e.g. 2027-06-30)_');
        return true;
      }

      const { name, targetAmount } = state.data;
      await db.insert(savingsGoals).values({
        id: crypto.randomUUID(),
        userId: user.id,
        name,
        targetAmount,
        currentAmount: 0,
        targetDate: text,
      });

      cancelFlow(phone);
      await sendTextMessage(
        phone,
        `✅ *Savings Goal Created!*\n\n` +
          `📌 *${name}*\n` +
          `🎯 ₹${targetAmount.toFixed(2)}\n` +
          `📅 Target: ${text}\n` +
          `💰 ₹0.00 saved so far\n\n` +
          `Type *goals* to see all your goals.`
      );
      return true;
    }
  }
  return false;
}

// ═════════════════════════════════════════════════════════════════
// FUND GOAL: select goal → enter amount → save
// ═════════════════════════════════════════════════════════════════

async function processFundGoal(phone, user, state, text, listId, buttonId) {
  switch (state.step) {
    // Step 1: Select which goal
    case 'select_goal': {
      if (!listId || !listId.startsWith('goal_')) {
        await sendTextMessage(phone, '❌ Please select a goal from the list.');
        return true;
      }
      const goalId = listId.replace('goal_', '');
      const goal = state.data.goals?.find((g) => g.id === goalId);
      if (!goal) {
        cancelFlow(phone);
        await sendTextMessage(phone, '❌ Goal not found. Type *hi* for the main menu.');
        return true;
      }

      setFlow(phone, 'FUND_GOAL', 'amount', {
        goalId,
        goalName: goal.name,
        currentAmount: goal.currentAmount,
        targetAmount: goal.targetAmount,
      });

      const remaining = goal.targetAmount - goal.currentAmount;
      await sendTextMessage(
        phone,
        `📌 *${goal.name}*\n` +
          `💰 ₹${goal.currentAmount.toFixed(2)} / ₹${goal.targetAmount.toFixed(2)}\n\n` +
          `How much do you want to add?\n_(₹${remaining.toFixed(2)} remaining to reach goal)_`
      );
      return true;
    }

    // Step 2: Enter amount → save
    case 'amount': {
      const amount = parseFloat(text);
      if (!text || isNaN(amount) || amount <= 0) {
        await sendTextMessage(phone, '❌ Please enter a valid amount (e.g. *1000*).');
        return true;
      }

      const { goalId, goalName, currentAmount, targetAmount } = state.data;
      const newAmount = currentAmount + amount;

      await db.update(savingsGoals).set({ currentAmount: newAmount }).where(eq(savingsGoals.id, goalId));
      cancelFlow(phone);

      const pct = Math.min((newAmount / targetAmount) * 100, 100).toFixed(0);
      const filled = Math.round(Math.min(newAmount / targetAmount, 1) * 10);
      const bar = '█'.repeat(filled) + '░'.repeat(10 - filled);

      let msg = `✅ *₹${amount.toFixed(2)} added to ${goalName}!*\n\n`;
      msg += `${bar} ${pct}%\n`;
      msg += `💰 ₹${newAmount.toFixed(2)} / ₹${targetAmount.toFixed(2)}`;

      if (newAmount >= targetAmount) {
        msg += '\n\n🎉 *Congratulations! Goal reached!*';
      } else {
        msg += `\n📅 ₹${(targetAmount - newAmount).toFixed(2)} to go`;
      }

      msg += '\n\nType *goals* to see all your goals.';
      await sendTextMessage(phone, msg);
      return true;
    }
  }
  return false;
}

// ═════════════════════════════════════════════════════════════════
// DELETE EXPENSE: select expense → confirm → delete
// ═════════════════════════════════════════════════════════════════

async function processDeleteExpense(phone, user, state, text, listId, buttonId) {
  switch (state.step) {
    // Step 1: Select which expense
    case 'select': {
      if (!listId || !listId.startsWith('del_')) {
        await sendTextMessage(phone, '❌ Please select an expense from the list.');
        return true;
      }
      const expenseId = listId.replace('del_', '');
      const expense = state.data.expenses?.find((e) => e.id === expenseId);
      if (!expense) {
        cancelFlow(phone);
        await sendTextMessage(phone, '❌ Expense not found. Type *hi* for the main menu.');
        return true;
      }

      setFlow(phone, 'DELETE_EXPENSE', 'confirm', { expenseId, expense });

      const emoji = getCategoryEmoji(expense.category);
      await sendReplyButtons(phone, {
        body:
          `🗑️ *Delete this expense?*\n\n` +
          `${emoji} *${expense.category}*\n` +
          `💰 ₹${expense.amount.toFixed(2)}\n` +
          `📝 ${expense.description}\n` +
          `📅 ${expense.date}`,
        buttons: [
          { id: 'confirm_yes', title: '🗑️ Delete' },
          { id: 'confirm_no', title: '❌ Keep' },
        ],
      });
      return true;
    }

    // Step 2: Confirm deletion
    case 'confirm': {
      if (buttonId === 'confirm_yes') {
        await db.delete(expenses).where(eq(expenses.id, state.data.expenseId));
        cancelFlow(phone);
        await sendTextMessage(phone, '✅ Expense deleted.\n\nType *recent* to see your remaining expenses.');
        return true;
      }
      if (buttonId === 'confirm_no') {
        cancelFlow(phone);
        await sendTextMessage(phone, '👍 Expense kept.\n\nType *hi* for the main menu.');
        return true;
      }
      await sendTextMessage(phone, '❌ Please tap *Delete* or *Keep*.');
      return true;
    }
  }
  return false;
}
