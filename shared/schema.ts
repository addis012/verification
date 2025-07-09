import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const scrapingJobs = pgTable("scraping_jobs", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  method: text("method").notNull(), // 'beautifulsoup', 'selenium', 'playwright', 'auto'
  status: text("status").notNull().default("pending"), // 'pending', 'processing', 'completed', 'failed'
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  errorMessage: text("error_message"),
  rawHtml: text("raw_html"),
  extractedData: jsonb("extracted_data"),
  processingTime: integer("processing_time"), // in milliseconds
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").references(() => scrapingJobs.id),
  transactionId: text("transaction_id"),
  amount: text("amount"),
  currency: text("currency"),
  date: text("date"),
  fromAccount: text("from_account"),
  toAccount: text("to_account"),
  status: text("status"),
  description: text("description"),
  extractedAt: timestamp("extracted_at").defaultNow(),
});

export const insertScrapingJobSchema = createInsertSchema(scrapingJobs).pick({
  url: true,
  method: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  extractedAt: true,
});

export type InsertScrapingJob = z.infer<typeof insertScrapingJobSchema>;
export type ScrapingJob = typeof scrapingJobs.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

// Validation schemas
export const urlValidationSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
});

export const scrapingMethodSchema = z.enum(["beautifulsoup", "selenium", "playwright", "auto"]);
