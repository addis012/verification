import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Heart, Rocket, History, Layers, Book, Clock } from "lucide-react";

interface StatusSidebarProps {
  recentJobs: any[];
}

export function StatusSidebar({ recentJobs }: StatusSidebarProps) {
  const getSuccessRate = () => {
    if (!recentJobs.length) return 0;
    const completed = recentJobs.filter(job => job.status === "completed").length;
    return (completed / recentJobs.length) * 100;
  };

  const getLastScrapeTime = () => {
    if (!recentJobs.length) return "Never";
    const latest = recentJobs[0];
    if (!latest.completedAt) return "In progress";
    
    const date = new Date(latest.completedAt);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    return `${Math.floor(diff / 86400000)} days ago`;
  };

  const getQueueLength = () => {
    return recentJobs.filter(job => job.status === "pending" || job.status === "processing").length;
  };

  const successRate = getSuccessRate();

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Heart className="text-blue-600" />
            <h3 className="text-lg font-semibold text-slate-900">Status</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">System Status</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Online
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Queue</span>
              <span className="text-sm font-medium text-slate-900">
                {getQueueLength()} jobs
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Last Scrape</span>
              <span className="text-sm font-medium text-slate-900">
                {getLastScrapeTime()}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Success Rate</span>
                <span>{successRate.toFixed(1)}%</span>
              </div>
              <Progress value={successRate} className="mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Rocket className="text-blue-600" />
            <h3 className="text-lg font-semibold text-slate-900">Quick Actions</h3>
          </div>

          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start h-auto p-4"
            >
              <History className="h-4 w-4 mr-3 text-slate-500" />
              <div className="text-left">
                <div className="font-medium text-slate-900">View History</div>
                <div className="text-sm text-slate-500">Past scraping jobs</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start h-auto p-4"
            >
              <Layers className="h-4 w-4 mr-3 text-slate-500" />
              <div className="text-left">
                <div className="font-medium text-slate-900">Bulk Scrape</div>
                <div className="text-sm text-slate-500">Multiple URLs at once</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start h-auto p-4"
            >
              <Book className="h-4 w-4 mr-3 text-slate-500" />
              <div className="text-left">
                <div className="font-medium text-slate-900">API Docs</div>
                <div className="text-sm text-slate-500">Integration guide</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Clock className="text-blue-600" />
            <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
          </div>

          <div className="space-y-3">
            {recentJobs.slice(0, 5).map((job) => (
              <div
                key={job.id}
                className="flex items-start space-x-3 pb-3 border-b border-slate-100 last:border-b-0 last:pb-0"
              >
                <div
                  className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    job.status === "completed"
                      ? "bg-green-500"
                      : job.status === "failed"
                      ? "bg-red-500"
                      : "bg-blue-500"
                  }`}
                ></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {new URL(job.url).hostname} scrape
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {getLastScrapeTime()} • {job.status === "completed" ? "Success" : job.status}
                  </p>
                </div>
              </div>
            ))}
            
            {recentJobs.length === 0 && (
              <div className="text-center py-4 text-slate-500">
                <p className="text-sm">No recent activity</p>
              </div>
            )}
          </div>

          {recentJobs.length > 5 && (
            <Button variant="ghost" className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700">
              View all activity →
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
