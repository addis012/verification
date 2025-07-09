import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Link, ExternalLink, Play, CheckCircle, ServerCog, Zap, Clock, Rocket, Shield, Brain, ThumbsUp } from "lucide-react";

const formSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
  method: z.enum(["beautifulsoup", "selenium", "playwright", "auto"]).default("beautifulsoup"),
});

type FormData = z.infer<typeof formSchema>;

interface ScrapingFormProps {
  onJobStarted: (jobId: number) => void;
}

export function ScrapingForm({ onJobStarted }: ScrapingFormProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>("beautifulsoup");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
      method: "beautifulsoup",
    },
  });

  const validateUrlMutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await apiRequest("POST", "/api/validate-url", { url });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.valid && data.accessible) {
        toast({
          title: "URL Valid",
          description: "The URL is accessible and ready for scraping.",
        });
      } else if (data.valid && !data.accessible) {
        toast({
          title: "URL Accessible Warning",
          description: "The URL is valid but may not be accessible. Consider using Selenium.",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "URL Invalid",
        description: "Please enter a valid URL.",
        variant: "destructive",
      });
    },
  });

  const scrapeMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/scrape", data);
      return response.json();
    },
    onSuccess: (data) => {
      onJobStarted(data.jobId);
      toast({
        title: "Scraping Started",
        description: `Job ${data.jobId} has been queued for processing.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start scraping job.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    const finalData = { ...data, method: selectedMethod as any };
    scrapeMutation.mutate(finalData);
  };

  const handleValidateUrl = () => {
    const url = form.getValues("url");
    if (url) {
      validateUrlMutation.mutate(url);
    }
  };

  const methods = [
    {
      id: "beautifulsoup",
      name: "BeautifulSoup",
      description: "Fast parsing for static content",
      badges: [
        { icon: Zap, label: "Fast", color: "bg-green-100 text-green-800" },
        { icon: ExternalLink, label: "Static", color: "bg-blue-100 text-blue-800" },
      ],
    },
    {
      id: "selenium",
      name: "Selenium",
      description: "Full browser render for dynamic content",
      badges: [
        { icon: Clock, label: "Slower", color: "bg-orange-100 text-orange-800" },
        { icon: Rocket, label: "Dynamic", color: "bg-purple-100 text-purple-800" },
      ],
    },
    {
      id: "playwright",
      name: "Playwright",
      description: "Modern browser automation",
      badges: [
        { icon: Rocket, label: "Modern", color: "bg-blue-100 text-blue-800" },
        { icon: Shield, label: "Reliable", color: "bg-green-100 text-green-800" },
      ],
    },
    {
      id: "auto",
      name: "Auto-Detect",
      description: "Automatically choose best method",
      badges: [
        { icon: Brain, label: "Smart", color: "bg-indigo-100 text-indigo-800" },
        { icon: ThumbsUp, label: "Recommended", color: "bg-emerald-100 text-emerald-800" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* URL Input Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Link className="text-blue-600" />
            <h2 className="text-lg font-semibold text-slate-900">Transaction URL Input</h2>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="url" className="block text-sm font-medium text-slate-700 mb-2">
                Transaction URL
              </Label>
              <div className="relative">
                <Input
                  id="url"
                  type="url"
                  placeholder="https://cs.bankofabyssinia.com/slip/?trx=FT25188M7L8Q57576"
                  className="pr-12"
                  {...form.register("url")}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <ExternalLink className="text-slate-400 h-4 w-4" />
                </div>
              </div>
              {form.formState.errors.url && (
                <p className="mt-2 text-sm text-red-600">{form.formState.errors.url.message}</p>
              )}
              <p className="mt-2 text-sm text-slate-500">
                Enter the full URL of the transaction page you want to scrape
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="submit"
                className="flex-1"
                disabled={scrapeMutation.isPending}
              >
                <Play className="h-4 w-4 mr-2" />
                {scrapeMutation.isPending ? "Starting..." : "Start Scraping"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleValidateUrl}
                disabled={validateUrlMutation.isPending}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {validateUrlMutation.isPending ? "Validating..." : "Validate URL"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Scraping Methods Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <ServerCog className="text-blue-600" />
            <h2 className="text-lg font-semibold text-slate-900">Scraping Method</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {methods.map((method) => (
              <div
                key={method.id}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedMethod === method.id
                    ? "border-blue-200 bg-blue-50"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
                onClick={() => setSelectedMethod(method.id)}
              >
                <div className="flex items-start space-x-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 mt-0.5 flex-shrink-0 ${
                      selectedMethod === method.id
                        ? "border-blue-600 bg-blue-600"
                        : "border-slate-300"
                    }`}
                  >
                    {selectedMethod === method.id && (
                      <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">{method.name}</h3>
                    <p className="text-sm text-slate-600 mt-1">{method.description}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      {method.badges.map((badge, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${badge.color}`}
                        >
                          <badge.icon className="h-3 w-3 mr-1" />
                          {badge.label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
