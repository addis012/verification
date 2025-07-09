import { useState, useEffect } from "react";
import { ScrapingForm } from "@/components/scraping-form";
import { ResultsTable } from "@/components/results-table";
import { StatusSidebar } from "@/components/status-sidebar";
import { useQuery } from "@tanstack/react-query";
import { Database } from "lucide-react";

export default function Home() {
  const [currentJobId, setCurrentJobId] = useState<number | null>(null);

  const { data: recentJobs } = useQuery({
    queryKey: ["/api/jobs"],
    refetchInterval: 5000, // Poll every 5 seconds for updates
  });

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Database className="text-white text-sm" />
              </div>
              <h1 className="text-xl font-semibold text-slate-900">Transaction Data Scraper</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#" className="text-slate-600 hover:text-slate-900 font-medium">Documentation</a>
              <a href="#" className="text-slate-600 hover:text-slate-900 font-medium">API</a>
              <a href="#" className="text-slate-600 hover:text-slate-900 font-medium">Support</a>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <ScrapingForm onJobStarted={setCurrentJobId} />
            <ResultsTable jobId={currentJobId} />
          </div>
          <div>
            <StatusSidebar recentJobs={recentJobs || []} />
          </div>
        </div>
      </main>
    </div>
  );
}
