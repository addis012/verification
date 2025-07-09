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
import { 
  Link, 
  ExternalLink, 
  Play, 
  CheckCircle, 
  ServerCog, 
  Zap, 
  Clock, 
  Rocket, 
  Shield, 
  Brain, 
  ThumbsUp,
  ShoppingBag,
  DollarSign,
  Globe
} from "lucide-react";

const formSchema = z.object({
  url: z.string().url("Please enter a valid product URL"),
  method: z.enum(["beautifulsoup", "selenium", "playwright", "auto"]).default("auto"),
});

type FormData = z.infer<typeof formSchema>;

interface ScrapingFormProps {
  onJobStarted: (jobId: number) => void;
}

export function ScrapingForm({ onJobStarted }: ScrapingFormProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>("auto");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
      method: "auto",
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
          title: "Product URL Valid",
          description: "The product page is accessible and ready for price tracking.",
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
        description: "Please enter a valid product URL.",
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
        title: "Price Tracking Started",
        description: `Job ${data.jobId} has been queued for processing.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start price tracking job.",
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
      description: "Fast parsing for static product pages",
      badges: [
        { icon: Zap, label: "Fast", color: "bg-green-100 text-green-800" },
        { icon: ExternalLink, label: "Static", color: "bg-blue-100 text-blue-800" },
      ],
    },
    {
      id: "selenium",
      name: "Selenium",
      description: "Full browser render for dynamic pricing",
      badges: [
        { icon: Clock, label: "Slower", color: "bg-orange-100 text-orange-800" },
        { icon: Rocket, label: "Dynamic", color: "bg-purple-100 text-purple-800" },
      ],
    },
    {
      id: "playwright",
      name: "Playwright",
      description: "Modern browser automation for SPAs",
      badges: [
        { icon: Rocket, label: "Modern", color: "bg-blue-100 text-blue-800" },
        { icon: Shield, label: "Reliable", color: "bg-green-100 text-green-800" },
      ],
    },
    {
      id: "auto",
      name: "Smart Detection",
      description: "Automatically choose best method for site",
      badges: [
        { icon: Brain, label: "AI-Powered", color: "bg-indigo-100 text-indigo-800" },
        { icon: ThumbsUp, label: "Recommended", color: "bg-emerald-100 text-emerald-800" },
      ],
    },
  ];

  const supportedSites = [
    { name: "Amazon", icon: ShoppingBag, color: "text-orange-600" },
    { name: "eBay", icon: DollarSign, color: "text-blue-600" },
    { name: "AliExpress", icon: Globe, color: "text-red-600" },
    { name: "Walmart", icon: ShoppingBag, color: "text-blue-800" },
  ];

  return (
    <div className="space-y-6">
      {/* URL Input Card */}
      <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Link className="text-blue-600" />
            <h2 className="text-lg font-semibold text-slate-900">Product URL Input</h2>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="url" className="block text-sm font-medium text-slate-700 mb-2">
                Product Page URL
              </Label>
              <div className="relative">
                <Input
                  id="url"
                  type="url"
                  placeholder="https://www.amazon.com/product/dp/B08N5WRWNW"
                  className="pr-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
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
                Enter the full URL of the product page you want to track
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={scrapeMutation.isPending}
              >
                <Play className="h-4 w-4 mr-2" />
                {scrapeMutation.isPending ? "Starting..." : "Start Price Tracking"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleValidateUrl}
                disabled={validateUrlMutation.isPending}
                className="border-slate-300 hover:bg-slate-50"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {validateUrlMutation.isPending ? "Validating..." : "Validate URL"}
              </Button>
            </div>
          </form>

          {/* Supported Sites */}
          <div className="mt-6 pt-4 border-t border-slate-200">
            <p className="text-sm font-medium text-slate-700 mb-3">Supported E-commerce Sites:</p>
            <div className="flex flex-wrap gap-3">
              {supportedSites.map((site) => (
                <Badge
                  key={site.name}
                  variant="secondary"
                  className="bg-slate-100 text-slate-700 hover:bg-slate-200"
                >
                  <site.icon className={`h-3 w-3 mr-1 ${site.color}`} />
                  {site.name}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scraping Methods Card */}
      <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <ServerCog className="text-blue-600" />
            <h2 className="text-lg font-semibold text-slate-900">Scraping Method</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {methods.map((method) => (
              <div
                key={method.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                  selectedMethod === method.id
                    ? "border-blue-300 bg-blue-50 shadow-md"
                    : "border-slate-200 hover:bg-slate-50 hover:shadow-sm"
                }`}
                onClick={() => setSelectedMethod(method.id)}
              >
                <div className="flex items-start space-x-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 mt-0.5 flex-shrink-0 transition-colors ${
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