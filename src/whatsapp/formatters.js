/**
 * Message Formatters
 *
 * Builds rich WhatsApp text messages with emoji, progress bars,
 * and structured layouts for summaries, budgets, and goals.
 */

// ── Category Constants ──────────────────────────────────────────

export const CATEGORIES = [
  'Food & Dining',
  'Shopping & Clothing',
  'Utilities & Bills',
  'Transportation & Travel',
  'Entertainment & Leisure',
  'Healthcare & Fitness',
  'Education',
  'Others',
];

const CATEGORY_EMOJI = {
  'Food & Dining': '🍔',
  'Shopping & Clothing': '🛍️',
  'Utilities & Bills': '💡',
  'Transportation & Travel': '🚗',
  'Entertainment & Leisure': '🎬',
  'Healthcare & Fitness': '💊',
  'Education': '📚',
  'Others': '📦',
};

export function getCategoryEmoji(category) {
  return CATEGORY_EMOJI[category] || '📦';
}

// ── Helpers ─────────────────────────────────────────────────────

function formatMonthLabel(month) {
  const [year, m] = month.split('-');
  const names = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return `${names[parseInt(m, 10) - 1]} ${year}`;
}

function progressBar(ratio) {
  const filled = Math.round(Math.min(ratio, 1) * 10);
  return '█'.repeat(filled) + '░'.repeat(10 - filled);
}

// ── Monthly Summary ─────────────────────────────────────────────

export function formatMonthlySummary(userExpenses, userBudgets, month) {
  const monthExpenses = userExpenses.filter((e) => e.date.startsWith(month));

  if (monthExpenses.length === 0) {
    return (
      `📊 *${formatMonthLabel(month)} Summary*\n\n` +
      `No expenses recorded this month.\n\n` +
      `💡 Select *"Log Expense"* from the menu to start tracking!`
    );
  }

  const total = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Group by category, sort descending
  const byCategory = {};
  for (const e of monthExpenses) {
    byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
  }
  const sorted = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);

  let text = `📊 *${formatMonthLabel(month)} Spending Summary*\n\n`;
  text += `💰 *Total Spent:* ₹${total.toFixed(2)}\n\n`;
  text += `*By Category:*\n`;

  for (const [cat, amount] of sorted) {
    const emoji = getCategoryEmoji(cat);
    const pct = ((amount / total) * 100).toFixed(1);
    text += `  ${emoji} ${cat}: ₹${amount.toFixed(2)} (${pct}%)\n`;
  }

  text += `\n📝 *Transactions:* ${monthExpenses.length} this month`;

  // Budget comparison (if any budgets exist for this month)
  const monthBudgets = userBudgets.filter((b) => b.month === month);
  if (monthBudgets.length > 0) {
    text += `\n\n━━━ *Budget Status* ━━━`;
    for (const b of monthBudgets) {
      const spent = byCategory[b.category] || 0;
      const remaining = b.limitAmount - spent;
      const icon = remaining >= 0 ? '✅' : '🚨';
      text += `\n${icon} ${b.category}: ₹${spent.toFixed(2)} / ₹${b.limitAmount.toFixed(2)}`;
      if (remaining < 0) {
        text += ` *(Over by ₹${Math.abs(remaining).toFixed(2)})*`;
      }
    }
  }

  text += `\n\n💡 Type *recent* to see your last 10 expenses`;
  return text;
}

// ── Recent Expenses ─────────────────────────────────────────────

export function formatRecentExpenses(userExpenses, limit = 10) {
  if (userExpenses.length === 0) {
    return (
      `📋 *Recent Expenses*\n\n` +
      `No expenses logged yet.\n\n` +
      `💡 Select *"Log Expense"* from the menu to start tracking!`
    );
  }

  const recent = userExpenses.slice(0, limit);

  let text = `📋 *Last ${recent.length} Expenses*\n`;

  for (let i = 0; i < recent.length; i++) {
    const e = recent[i];
    const emoji = getCategoryEmoji(e.category);
    text += `\n${i + 1}. ${emoji} *₹${e.amount.toFixed(2)}* — ${e.category}`;
    text += `\n   📝 ${e.description}`;
    text += `\n   📅 ${e.date}\n`;
  }

  text += `\n💡 Type *summary* for your monthly breakdown`;
  return text;
}

// ── Budget Overview ─────────────────────────────────────────────

export function formatBudgetOverview(userBudgets, userExpenses, month) {
  const monthBudgets = userBudgets.filter((b) => b.month === month);
  const monthExpenses = userExpenses.filter((e) => e.date.startsWith(month));

  if (monthBudgets.length === 0) {
    return (
      `💳 *Budget Overview — ${formatMonthLabel(month)}*\n\n` +
      `No budgets configured for this month.\n\n` +
      `💡 Select *"Set Budget"* from the menu to get started!`
    );
  }

  // Expenses grouped by category
  const spentByCategory = {};
  for (const e of monthExpenses) {
    spentByCategory[e.category] = (spentByCategory[e.category] || 0) + e.amount;
  }

  let text = `💳 *Budget Overview — ${formatMonthLabel(month)}*\n`;

  for (const b of monthBudgets) {
    const spent = spentByCategory[b.category] || 0;
    const remaining = b.limitAmount - spent;
    const pct = Math.min((spent / b.limitAmount) * 100, 100).toFixed(0);
    const emoji = getCategoryEmoji(b.category);
    const bar = progressBar(spent / b.limitAmount);
    const icon = remaining >= 0 ? '✅' : '🚨';

    text += `\n${emoji} *${b.category}*`;
    text += `\n   ${bar} ${pct}%`;
    text += `\n   Spent: ₹${spent.toFixed(2)} / ₹${b.limitAmount.toFixed(2)}`;
    if (remaining >= 0) {
      text += `\n   ${icon} ₹${remaining.toFixed(2)} remaining\n`;
    } else {
      text += `\n   ${icon} *Over budget by ₹${Math.abs(remaining).toFixed(2)}*\n`;
    }
  }

  return text;
}

// ── Savings Goals ───────────────────────────────────────────────

export function formatSavingsGoals(goals) {
  if (goals.length === 0) {
    return (
      `🎯 *Savings Goals*\n\n` +
      `No savings goals set up yet.\n\n` +
      `💡 Select *"Create Goal"* from the menu to set a savings target!`
    );
  }

  let text = `🎯 *Your Savings Goals*\n`;

  for (const g of goals) {
    const pct = Math.min((g.currentAmount / g.targetAmount) * 100, 100).toFixed(0);
    const bar = progressBar(g.currentAmount / g.targetAmount);
    const remaining = g.targetAmount - g.currentAmount;

    text += `\n📌 *${g.name}*`;
    text += `\n   ${bar} ${pct}%`;
    text += `\n   💰 ₹${g.currentAmount.toFixed(2)} / ₹${g.targetAmount.toFixed(2)}`;
    if (remaining > 0) {
      text += `\n   📅 Target: ${g.targetDate} (₹${remaining.toFixed(2)} to go)`;
    } else {
      text += `\n   🎉 *Goal reached!*`;
    }
    text += '\n';
  }

  return text;
}

// ── Expense Confirmation ────────────────────────────────────────

export function formatExpenseConfirmation(expense) {
  const emoji = getCategoryEmoji(expense.category);
  return (
    `✅ *Expense Logged!*\n\n` +
    `${emoji} *${expense.category}*\n` +
    `💰 ₹${expense.amount.toFixed(2)}\n` +
    `📝 ${expense.description}\n` +
    `📅 ${expense.date}`
  );
}

// ── Main Menu Builder ───────────────────────────────────────────

export function buildMainMenuList() {
  return {
    header: '📊 Tally',
    body: 'Your WhatsApp Expense Tracker — What would you like to do?',
    footer: 'Tip: Type commands like "summary" or "recent" directly',
    buttonText: '📋 Open Menu',
    sections: [
      {
        title: '💰 Expenses',
        rows: [
          { id: 'menu_log_expense', title: '➕ Log Expense', description: 'Record a new expense' },
          { id: 'menu_recent', title: '📋 Recent Expenses', description: 'View last 10 transactions' },
          { id: 'menu_delete_expense', title: '🗑️ Delete Expense', description: 'Remove a recent expense' },
        ],
      },
      {
        title: '📊 Reports',
        rows: [
          { id: 'menu_summary', title: '📈 Monthly Summary', description: "This month's spending breakdown" },
        ],
      },
      {
        title: '💳 Budgets',
        rows: [
          { id: 'menu_view_budgets', title: '👀 View Budgets', description: 'See category budget limits' },
          { id: 'menu_set_budget', title: '✏️ Set Budget', description: 'Set or update a budget limit' },
        ],
      },
      {
        title: '🎯 Savings Goals',
        rows: [
          { id: 'menu_view_goals', title: '🎯 View Goals', description: 'See all savings goals' },
          { id: 'menu_create_goal', title: '➕ Create Goal', description: 'Set a new savings target' },
          { id: 'menu_fund_goal', title: '💰 Fund Goal', description: 'Add money to a goal' },
        ],
      },
    ],
  };
}

// ── Category Selection List Builder ─────────────────────────────

export function buildCategoryList() {
  return {
    header: '📂 Categories',
    body: 'Select a category for this expense:',
    buttonText: '📂 Pick Category',
    sections: [
      {
        title: 'Categories',
        rows: CATEGORIES.map((cat) => ({
          id: `cat_${cat}`,
          title: `${getCategoryEmoji(cat)} ${cat}`,
        })),
      },
    ],
  };
}
