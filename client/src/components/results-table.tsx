import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TableIcon, FileCode, FileText, CheckCircle, Database, AlertCircle, Clock } from "lucide-react";
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
        a.download = `transactions-${jobId}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: "Export Successful",
          description: `Transactions exported as ${format.toUpperCase()}`,
        });
      }
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export transactions",
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
      case "String":
        return "bg-blue-100 text-blue-800";
      case "Currency":
        return "bg-green-100 text-green-800";
      case "DateTime":
        return "bg-purple-100 text-purple-800";
      case "Status":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const renderTransactionData = (transactions: any[]) => {
    if (!transactions || transactions.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={3} className="text-center py-8 text-slate-500">
            No transaction data found
          </TableCell>
        </TableRow>
      );
    }

    const flattenedData: Array<{ field: string; value: string; type: string }> = [];
    
    transactions.forEach((transaction, index) => {
      Object.entries(transaction).forEach(([key, value]) => {
        if (key === 'id' || key === 'jobId' || key === 'extractedAt') return;
        
        let type = "String";
        if (key === 'amount') type = "Currency";
        else if (key === 'date') type = "DateTime";
        else if (key === 'status') type = "Status";

        flattenedData.push({
          field: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
          value: String(value || ''),
          type
        });
      });
    });

    return flattenedData.map((item, index) => (
      <TableRow key={index}>
        <TableCell className="font-medium text-slate-900">{item.field}</TableCell>
        <TableCell className="text-slate-700 font-mono">
          {item.type === "Status" ? (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              {item.value}
            </Badge>
          ) : (
            item.value
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
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <TableIcon className="text-blue-600" />
            <h2 className="text-lg font-semibold text-slate-900">Scraped Data</h2>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("json")}
              disabled={!jobData?.transactions?.length}
            >
              <FileCode className="h-4 w-4 mr-1" />
              JSON
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("csv")}
              disabled={!jobData?.transactions?.length}
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
                  {jobData.status === "completed" && "Scraping completed successfully"}
                  {jobData.status === "failed" && "Scraping failed"}
                  {jobData.status === "processing" && "Scraping in progress"}
                  {jobData.status === "pending" && "Scraping queued"}
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
                  {renderTransactionData(jobData.transactions)}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500">
            <Database className="mx-auto h-12 w-12 text-slate-300 mb-4" />
            <p className="text-lg font-medium text-slate-400 mb-2">No data scraped yet</p>
            <p className="text-sm">Enter a transaction URL above and start scraping to see results here</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
