import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema.js';
import dotenv from 'dotenv';

dotenv.config();

// Determine database connection URL
const isProduction = process.env.NODE_ENV === 'production';
let dbUrl = process.env.DATABASE_URL || '';

if (!dbUrl) {
  // Use a local sqlite file in development if no URL is provided
  dbUrl = 'file:local.db';
}

const clientConfig = {
  url: dbUrl,
};

if (process.env.DATABASE_AUTH_TOKEN) {
  clientConfig.authToken = process.env.DATABASE_AUTH_TOKEN;
}

export const client = createClient(clientConfig);
export const db = drizzle(client, { schema });
