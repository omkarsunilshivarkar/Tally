/**
 * Message Handler
 *
 * The brain of the WhatsApp bot. Receives parsed messages from the
 * webhook, identifies the user, determines intent, and responds.
 *
 * Multi-step flows (log expense, set budget, etc.) are delegated
 * to flows.js via the in-memory state machine.
 */

import crypto from 'crypto';
import { eq, desc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { users, expenses, budgets, savingsGoals } from '../db/schema.js';
import { sendTextMessage, sendInteractiveList, markAsRead } from './client.js';
import {
  formatMonthlySummary,
  formatRecentExpenses,
  formatBudgetOverview,
  formatSavingsGoals,
  buildMainMenuList,
} from './formatters.js';
import {
  getActiveFlow,
  cancelFlow,
  processFlowMessage,
  startLogExpense,
  startSetBudget,
  startCreateGoal,
  startFundGoal,
  startDeleteExpense,
} from './flows.js';

// ── User Management ─────────────────────────────────────────────

async function findOrCreateUser(phone, profileName) {
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.phone, phone))
    .limit(1);

  if (existing.length > 0) return existing[0];

  const newUser = {
    id: crypto.randomUUID(),
    phone,
    name: profileName || 'WhatsApp User',
  };

  await db.insert(users).values(newUser);
  console.log(`👤 New user registered: ${phone} (${newUser.name})`);
  return newUser;
}

// ── Data Helpers ────────────────────────────────────────────────

function getCurrentMonth() {
  return new Date().toISOString().slice(0, 7);
}

async function getUserData(userId) {
  const [userExpenses, userBudgets, userGoals] = await Promise.all([
    db
      .select()
      .from(expenses)
      .where(eq(expenses.userId, userId))
      .orderBy(desc(expenses.date), desc(expenses.createdAt)),
    db.select().from(budgets).where(eq(budgets.userId, userId)),
    db
      .select()
      .from(savingsGoals)
      .where(eq(savingsGoals.userId, userId))
      .orderBy(desc(savingsGoals.createdAt)),
  ]);

  return { userExpenses, userBudgets, userGoals };
}

// ── Entry Point ─────────────────────────────────────────────────

export async function handleIncomingMessage(message, contact) {
  const phone = message.from;
  const profileName = contact?.profile?.name;

  try {
    await markAsRead(message.id);

    const user = await findOrCreateUser(phone, profileName);

    // ── Cancel command while in a flow ──
    if (message.type === 'text') {
      const lower = message.text.body.trim().toLowerCase();
      if (['cancel', 'stop', 'exit', 'quit'].includes(lower) && getActiveFlow(phone)) {
        cancelFlow(phone);
        await sendTextMessage(phone, '❌ Action cancelled.\n\nType *hi* for the main menu.');
        return;
      }
    }

    // ── Delegate to active flow if one exists ──
    if (getActiveFlow(phone)) {
      const handled = await processFlowMessage(phone, user, message);
      if (handled) return;
      // Flow couldn't handle it — fall through to normal routing
    }

    // ── Normal message routing ──
    switch (message.type) {
      case 'text':
        await handleTextMessage(phone, user, message.text.body.trim());
        break;

      case 'interactive':
        await handleInteractiveReply(phone, user, message.interactive);
        break;

      default:
        await sendTextMessage(
          phone,
          '🤔 I can only process text messages and menu selections right now.\n\nType *hi* to see the main menu.'
        );
    }
  } catch (error) {
    console.error(`Error handling message from ${phone}:`, error);
    cancelFlow(phone); // Clean up any broken flow state
    await sendTextMessage(
      phone,
      '❌ Sorry, something went wrong. Please try again.\n\nType *hi* to return to the main menu.'
    ).catch(() => {});
  }
}

// ── Text Message Router ─────────────────────────────────────────

async function handleTextMessage(phone, user, rawText) {
  const text = rawText.toLowerCase();

  // Greetings / menu
  if (['hi', 'hello', 'hey', 'menu', 'help', 'start'].includes(text)) {
    return sendMainMenu(phone, user.name);
  }

  // Monthly summary
  if (['summary', 'bal', 'balance', 'spending', 'report'].includes(text)) {
    return sendMonthlySummary(phone, user.id);
  }

  // Recent expenses
  if (['recent', 'history', 'last', 'transactions'].includes(text)) {
    return sendRecentExpenses(phone, user.id);
  }

  // Budgets
  if (['budget', 'budgets'].includes(text)) {
    return sendBudgetOverview(phone, user.id);
  }

  // Savings goals
  if (['goals', 'savings', 'goal', 'saving'].includes(text)) {
    return sendSavingsGoals(phone, user.id);
  }

  // Quick flow triggers via text
  if (['log', 'add', 'expense', 'new'].includes(text)) {
    return startLogExpense(phone);
  }

  // Unrecognized
  await sendTextMessage(
    phone,
    `🤔 I didn't understand that.\n\n` +
      `*Quick commands:*\n` +
      `• *hi* — Main menu\n` +
      `• *log* — Log an expense\n` +
      `• *summary* — Monthly spending\n` +
      `• *recent* — Last 10 expenses\n` +
      `• *budget* — Budget overview\n` +
      `• *goals* — Savings goals\n\n` +
      `Or type *hi* for the full interactive menu.`
  );
}

// ── Interactive Reply Router ────────────────────────────────────

async function handleInteractiveReply(phone, user, interactive) {
  if (interactive.type === 'list_reply') {
    return handleListReply(phone, user, interactive.list_reply.id);
  }

  if (interactive.type === 'button_reply') {
    return handleButtonReply(phone, user, interactive.button_reply.id);
  }

  await sendTextMessage(phone, '🤔 Unknown interaction. Type *hi* for the main menu.');
}

async function handleListReply(phone, user, rowId) {
  switch (rowId) {
    // ── Expenses ──
    case 'menu_log_expense':
      return startLogExpense(phone);
    case 'menu_recent':
      return sendRecentExpenses(phone, user.id);
    case 'menu_delete_expense':
      return startDeleteExpense(phone, user.id);

    // ── Reports ──
    case 'menu_summary':
      return sendMonthlySummary(phone, user.id);

    // ── Budgets ──
    case 'menu_view_budgets':
      return sendBudgetOverview(phone, user.id);
    case 'menu_set_budget':
      return startSetBudget(phone);

    // ── Savings Goals ──
    case 'menu_view_goals':
      return sendSavingsGoals(phone, user.id);
    case 'menu_create_goal':
      return startCreateGoal(phone);
    case 'menu_fund_goal':
      return startFundGoal(phone, user.id);

    default:
      return sendTextMessage(phone, '🤔 Unknown option. Type *hi* for the main menu.');
  }
}

async function handleButtonReply(phone, user, buttonId) {
  // Button replies outside of flows shouldn't happen, but handle gracefully
  await sendTextMessage(phone, '🤔 Unknown action. Type *hi* for the main menu.');
}

// ── Response Senders ────────────────────────────────────────────

async function sendMainMenu(phone, userName) {
  const menu = buildMainMenuList();
  await sendInteractiveList(phone, {
    header: menu.header,
    body: `Welcome back, *${userName}*! 👋\n\n${menu.body}`,
    footer: menu.footer,
    buttonText: menu.buttonText,
    sections: menu.sections,
  });
}

async function sendMonthlySummary(phone, userId) {
  const month = getCurrentMonth();
  const { userExpenses, userBudgets } = await getUserData(userId);
  await sendTextMessage(phone, formatMonthlySummary(userExpenses, userBudgets, month));
}

async function sendRecentExpenses(phone, userId) {
  const { userExpenses } = await getUserData(userId);
  await sendTextMessage(phone, formatRecentExpenses(userExpenses));
}

async function sendBudgetOverview(phone, userId) {
  const month = getCurrentMonth();
  const { userExpenses, userBudgets } = await getUserData(userId);
  await sendTextMessage(phone, formatBudgetOverview(userBudgets, userExpenses, month));
}

async function sendSavingsGoals(phone, userId) {
  const { userGoals } = await getUserData(userId);
  await sendTextMessage(phone, formatSavingsGoals(userGoals));
}
