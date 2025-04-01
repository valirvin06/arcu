import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Ensure DATABASE_URL is available
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing. Ensure the database is provisioned and DATABASE_URL is set.");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL, // Now it uses the DATABASE_URL directly from .env
  },
});
