/**
 * Prisma Configuration File
 * Description: Configuration file for Prisma ORM that defines database connection
 * and migrations settings. Uses dotenv to load environment variables.
 * 
 * Purpose:
 * - Specifies Prisma schema file location
 * - Configures migration directory
 * - Sets database connection URL from environment variables
 */

// Load environment variables from .env file (required for DATABASE_URL)
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  // Path to the Prisma schema file that defines data models
  schema: "prisma/schema.prisma",
  
  // Configuration for database migrations
  migrations: {
    path: "prisma/migrations",  // Directory where migration files are stored
  },
  
  // Database connection URL (must be set in .env file)
  // Format: postgresql://user:password@localhost:5432/mydb
  datasource: {
    url: process.env.DATABASE_URL,  // Read from environment variables
  },
});