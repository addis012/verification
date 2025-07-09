import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Heart, 
  Rocket, 
  History, 
  Layers, 
  Book, 
  Clock,
  TrendingUp,
  Bell,
  DollarSign,
  ShoppingCart,
  Target
} from "lucide-react";

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
      <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Heart className="text-blue-600" />
            <h3 className="text-lg font-semibold text-slate-900">System Status</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Tracker Status</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                Active
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Queue</span>
              <span className="text-sm font-medium text-slate-900">
                {getQueueLength()} jobs
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Last Check</span>
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
      <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Rocket className="text-blue-600" />
            <h3 className="text-lg font-semibold text-slate-900">Quick Actions</h3>
          </div>

          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start h-auto p-4 border-slate-300 hover:bg-slate-50"
            >
              <TrendingUp className="h-4 w-4 mr-3 text-slate-500" />
              <div className="text-left">
                <div className="font-medium text-slate-900">Price Analytics</div>
                <div className="text-sm text-slate-500">View price trends</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start h-auto p-4 border-slate-300 hover:bg-slate-50"
            >
              <Bell className="h-4 w-4 mr-3 text-slate-500" />
              <div className="text-left">
                <div className="font-medium text-slate-900">Price Alerts</div>
                <div className="text-sm text-slate-500">Set up notifications</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start h-auto p-4 border-slate-300 hover:bg-slate-50"
            >
              <Target className="h-4 w-4 mr-3 text-slate-500" />
              <div className="text-left">
                <div className="font-medium text-slate-900">Watchlist</div>
                <div className="text-sm text-slate-500">Manage tracked products</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start h-auto p-4 border-slate-300 hover:bg-slate-50"
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
      <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
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
                  <p className="text-sm font-medium text-slate-900 truncate flex items-center">
                    <ShoppingCart className="h-3 w-3 mr-1" />
                    {new URL(job.url).hostname} product
                  </p>
                  <p className="text-xs text-slate-500 mt-1 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {getLastScrapeTime()} • {job.status === "completed" ? "Success" : job.status}
                  </p>
                </div>
              </div>
            ))}
            
            {recentJobs.length === 0 && (
              <div className="text-center py-4 text-slate-500">
                <ShoppingCart className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                <p className="text-sm">No recent activity</p>
                <p className="text-xs text-slate-400">Start tracking products to see activity</p>
              </div>
            )}
          </div>

          {recentJobs.length > 5 && (
            <Button variant="ghost" className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50">
              View all activity →
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Stats Card */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-purple-50">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <DollarSign className="text-blue-600" />
            <h3 className="text-lg font-semibold text-slate-900">Savings Tracker</h3>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Products Tracked</span>
              <span className="text-lg font-bold text-blue-600">{recentJobs.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Potential Savings</span>
              <span className="text-lg font-bold text-green-600">$0.00</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Best Deal Found</span>
              <span className="text-sm font-medium text-purple-600">None yet</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}