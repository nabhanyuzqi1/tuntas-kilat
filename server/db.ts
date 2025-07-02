import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Get DATABASE_URL from environment with fallback debugging
const databaseUrl = process.env.DATABASE_URL || process.env.REPLIT_DB_URL;

if (!databaseUrl) {
  console.error('Available environment variables:', Object.keys(process.env).filter(key => key.includes('DB') || key.includes('PG')));
  console.error('DATABASE_URL:', process.env.DATABASE_URL);
  console.error('NODE_ENV:', process.env.NODE_ENV);
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle({ client: pool, schema });