import { scrapingJobs, transactions, type ScrapingJob, type InsertScrapingJob, type Transaction, type InsertTransaction } from "@shared/schema";

export interface IStorage {
  // Scraping Jobs
  createScrapingJob(job: InsertScrapingJob): Promise<ScrapingJob>;
  getScrapingJob(id: number): Promise<ScrapingJob | undefined>;
  updateScrapingJob(id: number, updates: Partial<ScrapingJob>): Promise<ScrapingJob | undefined>;
  getRecentJobs(limit?: number): Promise<ScrapingJob[]>;
  
  // Transactions
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransactionsByJobId(jobId: number): Promise<Transaction[]>;
  getAllTransactions(): Promise<Transaction[]>;
}

export class MemStorage implements IStorage {
  private scrapingJobs: Map<number, ScrapingJob>;
  private transactions: Map<number, Transaction>;
  private currentJobId: number;
  private currentTransactionId: number;

  constructor() {
    this.scrapingJobs = new Map();
    this.transactions = new Map();
    this.currentJobId = 1;
    this.currentTransactionId = 1;
  }

  async createScrapingJob(insertJob: InsertScrapingJob): Promise<ScrapingJob> {
    const id = this.currentJobId++;
    const job: ScrapingJob = {
      ...insertJob,
      id,
      status: "pending",
      startedAt: new Date(),
      completedAt: null,
      errorMessage: null,
      rawHtml: null,
      extractedData: null,
      processingTime: null,
    };
    this.scrapingJobs.set(id, job);
    return job;
  }

  async getScrapingJob(id: number): Promise<ScrapingJob | undefined> {
    return this.scrapingJobs.get(id);
  }

  async updateScrapingJob(id: number, updates: Partial<ScrapingJob>): Promise<ScrapingJob | undefined> {
    const job = this.scrapingJobs.get(id);
    if (!job) return undefined;
    
    const updatedJob = { ...job, ...updates };
    this.scrapingJobs.set(id, updatedJob);
    return updatedJob;
  }

  async getRecentJobs(limit: number = 10): Promise<ScrapingJob[]> {
    return Array.from(this.scrapingJobs.values())
      .sort((a, b) => new Date(b.startedAt!).getTime() - new Date(a.startedAt!).getTime())
      .slice(0, limit);
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentTransactionId++;
    const transaction: Transaction = {
      id,
      jobId: insertTransaction.jobId ?? null,
      transactionId: insertTransaction.transactionId ?? null,
      amount: insertTransaction.amount ?? null,
      currency: insertTransaction.currency ?? null,
      date: insertTransaction.date ?? null,
      fromAccount: insertTransaction.fromAccount ?? null,
      toAccount: insertTransaction.toAccount ?? null,
      status: insertTransaction.status ?? null,
      description: insertTransaction.description ?? null,
      extractedAt: new Date(),
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async getTransactionsByJobId(jobId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(t => t.jobId === jobId);
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .sort((a, b) => new Date(b.extractedAt!).getTime() - new Date(a.extractedAt!).getTime());
  }
}

export const storage = new MemStorage();
