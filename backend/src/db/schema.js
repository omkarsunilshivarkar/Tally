import { sqliteTable, text, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const expenses = sqliteTable('expenses', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  amount: real('amount').notNull(),
  category: text('category').notNull(),
  description: text('description').notNull(),
  date: text('date').notNull(), // 'YYYY-MM-DD'
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const budgets = sqliteTable('budgets', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  category: text('category').notNull(),
  limitAmount: real('limit_amount').notNull(),
  month: text('month').notNull(), // 'YYYY-MM'
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});
