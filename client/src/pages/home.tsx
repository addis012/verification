import { useState, useEffect } from "react";
import { ScrapingForm } from "@/components/scraping-form";
import { ResultsTable } from "@/components/results-table";
import { StatusSidebar } from "@/components/status-sidebar";
import { useQuery } from "@tanstack/react-query";
import { ShoppingCart, TrendingUp, Bell } from "lucide-react";

export default function Home() {
  const [currentJobId, setCurrentJobId] = useState<number | null>(null);

  const { data: recentJobs } = useQuery({
    queryKey: ["/api/jobs"],
    refetchInterval: 5000, // Poll every 5 seconds for updates
  });

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <ShoppingCart className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  PriceTracker Pro
                </h1>
                <p className="text-xs text-slate-500">Smart Price Monitoring</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#" className="text-slate-600 hover:text-blue-600 font-medium transition-colors flex items-center space-x-1">
                <TrendingUp className="w-4 h-4" />
                <span>Analytics</span>
              </a>
              <a href="#" className="text-slate-600 hover:text-blue-600 font-medium transition-colors flex items-center space-x-1">
                <Bell className="w-4 h-4" />
                <span>Alerts</span>
              </a>
              <a href="#" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">API</a>
              <a href="#" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">Support</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            Monitor Product Prices Across E-commerce Sites
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Track prices from Amazon, eBay, AliExpress and more. Get instant alerts when prices drop and never miss a deal again.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <ScrapingForm onJobStarted={setCurrentJobId} />
            <ResultsTable jobId={currentJobId} />
          </div>
          <div>
            <StatusSidebar recentJobs={recentJobs || []} />
          </div>
        </div>
      </div>
    </div>
  );
}