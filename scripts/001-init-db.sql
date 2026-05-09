-- ContractIQ Database Schema
-- This creates the Analysis table for storing contract analysis reports

-- Create the Analysis table
CREATE TABLE IF NOT EXISTS "Analysis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "inputText" TEXT NOT NULL,
    "reportJson" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS "Analysis_createdAt_idx" ON "Analysis"("createdAt");
