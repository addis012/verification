import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertScrapingJobSchema, urlValidationSchema } from "@shared/schema";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function registerRoutes(app: Express): Promise<Server> {
  // Validate URL endpoint
  app.post("/api/validate-url", async (req, res) => {
    try {
      const { url } = urlValidationSchema.parse(req.body);
      
      // Basic URL validation and accessibility check
      try {
        const response = await fetch(url, { method: 'HEAD' });
        res.json({ 
          valid: true, 
          accessible: response.ok,
          statusCode: response.status 
        });
      } catch (error) {
        res.json({ 
          valid: true, 
          accessible: false, 
          error: "URL not accessible" 
        });
      }
    } catch (error) {
      res.status(400).json({ 
        valid: false, 
        error: "Invalid URL format" 
      });
    }
  });

  // Start scraping endpoint
  app.post("/api/scrape", async (req, res) => {
    try {
      const jobData = insertScrapingJobSchema.parse(req.body);
      
      // Create job record
      const job = await storage.createScrapingJob(jobData);
      
      // Start scraping process asynchronously
      runScrapingJob(job.id, jobData.url, jobData.method);
      
      res.json({ jobId: job.id, status: "started" });
    } catch (error) {
      res.status(400).json({ error: "Invalid request data" });
    }
  });

  // Get job status endpoint
  app.get("/api/jobs/:id", async (req, res) => {
    const jobId = parseInt(req.params.id);
    const job = await storage.getScrapingJob(jobId);
    
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }
    
    const transactions = await storage.getTransactionsByJobId(jobId);
    res.json({ ...job, transactions });
  });

  // Get recent jobs
  app.get("/api/jobs", async (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const jobs = await storage.getRecentJobs(limit);
    res.json(jobs);
  });

  // Get all transactions
  app.get("/api/transactions", async (req, res) => {
    const transactions = await storage.getAllTransactions();
    res.json(transactions);
  });

  // Export transactions as CSV
  app.get("/api/export/csv/:jobId", async (req, res) => {
    const jobId = parseInt(req.params.jobId);
    const transactions = await storage.getTransactionsByJobId(jobId);
    
    const csvHeaders = "Transaction ID,Amount,Currency,Date,From Account,To Account,Status,Description\n";
    const csvRows = transactions.map(t => 
      `"${t.transactionId || ''}","${t.amount || ''}","${t.currency || ''}","${t.date || ''}","${t.fromAccount || ''}","${t.toAccount || ''}","${t.status || ''}","${t.description || ''}"`
    ).join("\n");
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="transactions-${jobId}.csv"`);
    res.send(csvHeaders + csvRows);
  });

  // Export transactions as JSON
  app.get("/api/export/json/:jobId", async (req, res) => {
    const jobId = parseInt(req.params.jobId);
    const transactions = await storage.getTransactionsByJobId(jobId);
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="transactions-${jobId}.json"`);
    res.json(transactions);
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Background scraping function
async function runScrapingJob(jobId: number, url: string, method: string) {
  const startTime = Date.now();
  
  try {
    // Update job status to processing
    await storage.updateScrapingJob(jobId, {
      status: "processing",
      startedAt: new Date()
    });

    // Run Python scraper
    const scraperPath = path.join(__dirname, "services", "scraper.py");
    const pythonProcess = spawn("python3", [scraperPath, url, method], {
      stdio: ["pipe", "pipe", "pipe"]
    });

    let output = "";
    let errorOutput = "";

    pythonProcess.stdout.on("data", (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on("close", async (code) => {
      const processingTime = Date.now() - startTime;

      if (code === 0) {
        try {
          const result = JSON.parse(output);
          
          // Update job with success
          await storage.updateScrapingJob(jobId, {
            status: "completed",
            completedAt: new Date(),
            rawHtml: result.rawHtml,
            extractedData: result.extractedData,
            processingTime
          });

          // Create transaction records
          if (result.extractedData && result.extractedData.transactions) {
            for (const txData of result.extractedData.transactions) {
              await storage.createTransaction({
                jobId,
                ...txData
              });
            }
          }
        } catch (parseError) {
          await storage.updateScrapingJob(jobId, {
            status: "failed",
            completedAt: new Date(),
            errorMessage: "Failed to parse scraper output",
            processingTime
          });
        }
      } else {
        await storage.updateScrapingJob(jobId, {
          status: "failed",
          completedAt: new Date(),
          errorMessage: errorOutput || "Scraping process failed",
          processingTime
        });
      }
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    await storage.updateScrapingJob(jobId, {
      status: "failed",
      completedAt: new Date(),
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      processingTime
    });
  }
}
