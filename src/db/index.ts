// src/db/index.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Please define it in your .env file."
  );
}

// Create the Postgres client using the connection string
const queryClient = postgres(connectionString);

// Initialize Drizzle with that Postgres client
const db = drizzle(queryClient);

export default db;
