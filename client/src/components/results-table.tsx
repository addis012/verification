import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  TableIcon, 
  FileCode, 
  FileText, 
  CheckCircle, 
  Database, 
  AlertCircle, 
  Clock,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Star,
  Package
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ResultsTableProps {
  jobId: number | null;
}

export function ResultsTable({ jobId }: ResultsTableProps) {
  const { toast } = useToast();

  const { data: jobData, isLoading } = useQuery({
    queryKey: [`/api/jobs/${jobId}`],
    enabled: !!jobId,
    refetchInterval: (data) => {
      // Stop polling if job is completed or failed
      return data?.status === "processing" || data?.status === "pending" ? 2000 : false;
    },
  });

  const handleExport = async (format: "json" | "csv") => {
    if (!jobId) return;
    
    try {
      const response = await fetch(`/api/export/${format}/${jobId}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `price-data-${jobId}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: "Export Successful",
          description: `Price data exported as ${format.toUpperCase()}`,
        });
      }
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export price data",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-emerald-600" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "processing":
        return <Clock className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-50 border-emerald-200 text-emerald-800";
      case "failed":
        return "bg-red-50 border-red-200 text-red-800";
      case "processing":
        return "bg-blue-50 border-blue-200 text-blue-800";
      default:
        return "bg-slate-50 border-slate-200 text-slate-800";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Price":
        return "bg-green-100 text-green-800";
      case "Product":
        return "bg-blue-100 text-blue-800";
      case "Rating":
        return "bg-yellow-100 text-yellow-800";
      case "Availability":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const renderProductData = (transactions: any[]) => {
    if (!transactions || transactions.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={3} className="text-center py-8 text-slate-500">
            No product data found
          </TableCell>
        </TableRow>
      );
    }

    const flattenedData: Array<{ field: string; value: string; type: string }> = [];
    
    transactions.forEach((product, index) => {
      Object.entries(product).forEach(([key, value]) => {
        if (key === 'id' || key === 'jobId' || key === 'extractedAt') return;
        
        let type = "Product";
        let displayValue = String(value || '');
        
        if (key === 'price' || key === 'amount') {
          type = "Price";
          displayValue = `$${displayValue}`;
        } else if (key === 'rating') {
          type = "Rating";
          displayValue = `${displayValue}/5 ⭐`;
        } else if (key === 'availability' || key === 'stock') {
          type = "Availability";
        }

        flattenedData.push({
          field: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
          value: displayValue,
          type
        });
      });
    });

    return flattenedData.map((item, index) => (
      <TableRow key={index} className="hover:bg-slate-50">
        <TableCell className="font-medium text-slate-900">
          <div className="flex items-center space-x-2">
            {item.type === "Price" && <DollarSign className="h-4 w-4 text-green-600" />}
            {item.type === "Rating" && <Star className="h-4 w-4 text-yellow-600" />}
            {item.type === "Availability" && <Package className="h-4 w-4 text-purple-600" />}
            {item.type === "Product" && <Package className="h-4 w-4 text-blue-600" />}
            <span>{item.field}</span>
          </div>
        </TableCell>
        <TableCell className="text-slate-700 font-mono">
          {item.type === "Availability" ? (
            <Badge variant="secondary" className={
              item.value.toLowerCase().includes('stock') || item.value.toLowerCase().includes('available')
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }>
              <CheckCircle className="h-3 w-3 mr-1" />
              {item.value}
            </Badge>
          ) : (
            <span className={item.type === "Price" ? "text-green-700 font-semibold" : ""}>
              {item.value}
            </span>
          )}
        </TableCell>
        <TableCell>
          <Badge variant="secondary" className={getTypeColor(item.type)}>
            {item.type}
          </Badge>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <TableIcon className="text-blue-600" />
            <h2 className="text-lg font-semibold text-slate-900">Product Data</h2>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("json")}
              disabled={!jobData?.transactions?.length}
              className="border-slate-300 hover:bg-slate-50"
            >
              <FileCode className="h-4 w-4 mr-1" />
              JSON
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("csv")}
              disabled={!jobData?.transactions?.length}
              className="border-slate-300 hover:bg-slate-50"
            >
              <FileText className="h-4 w-4 mr-1" />
              CSV
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : jobData ? (
          <div className="space-y-4">
            {/* Status Alert */}
            <Alert className={getStatusColor(jobData.status)}>
              <div className="flex items-center space-x-2">
                {getStatusIcon(jobData.status)}
                <span className="font-medium">
                  {jobData.status === "completed" && "Price tracking completed successfully"}
                  {jobData.status === "failed" && "Price tracking failed"}
                  {jobData.status === "processing" && "Price tracking in progress"}
                  {jobData.status === "pending" && "Price tracking queued"}
                </span>
                {jobData.processingTime && (
                  <span className="text-sm">• {(jobData.processingTime / 1000).toFixed(1)}s</span>
                )}
              </div>
              {jobData.errorMessage && (
                <AlertDescription className="mt-2">
                  {jobData.errorMessage}
                </AlertDescription>
              )}
            </Alert>

            {/* Results Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-slate-200">
                    <TableHead className="text-left py-3 px-4 font-medium text-slate-700">Field</TableHead>
                    <TableHead className="text-left py-3 px-4 font-medium text-slate-700">Value</TableHead>
                    <TableHead className="text-left py-3 px-4 font-medium text-slate-700">Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {renderProductData(jobData.transactions)}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500">
            <Database className="mx-auto h-12 w-12 text-slate-300 mb-4" />
            <p className="text-lg font-medium text-slate-400 mb-2">No product data tracked yet</p>
            <p className="text-sm">Enter a product URL above and start tracking to see price data here</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}