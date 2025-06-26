"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Search, TrendingUp, ArrowLeft } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { createInvestmentAsset } from "@/actions/asset-actions";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

// Stock search result interface
interface StockSearchResult {
  symbol: string;
  name: string;
  price: number;
  change: string;
}

// Mock stock search results - In real app, this would come from Alpha Vantage API
const mockStockSearch = async (query: string): Promise<StockSearchResult[]> => {
  const mockStocks: StockSearchResult[] = [
    { symbol: "AAPL", name: "Apple Inc.", price: 175.5, change: "+2.3%" },
    { symbol: "GOOGL", name: "Alphabet Inc.", price: 142.8, change: "+1.2%" },
    {
      symbol: "MSFT",
      name: "Microsoft Corporation",
      price: 420.15,
      change: "+0.8%",
    },
    { symbol: "TSLA", name: "Tesla, Inc.", price: 248.42, change: "-1.5%" },
    {
      symbol: "NVDA",
      name: "NVIDIA Corporation",
      price: 875.3,
      change: "+3.2%",
    },
  ];

  return mockStocks
    .filter(
      (stock) =>
        stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
        stock.name.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 5);
};

const stockSchema = z.object({
  symbol: z.string().min(1, "Stock symbol is required"),
  companyName: z.string().min(1, "Company name is required"),
  shares: z.coerce
    .number()
    .min(0.001, "Number of shares must be greater than 0"),
  currentPrice: z.coerce
    .number()
    .min(0.01, "Current price must be greater than 0"),
  purchasePrice: z.coerce.number().min(0).optional().or(z.literal(0)),
  purchaseDate: z.date().optional(),
});

type StockFormData = z.infer<typeof stockSchema>;

interface StockAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBack?: () => void;
}

export function StockAssetDialog({
  open,
  onOpenChange,
  onBack,
}: StockAssetDialogProps) {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<StockSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedStock, setSelectedStock] = useState<StockSearchResult | null>(
    null
  );
  const router = useRouter();

  const form = useForm<StockFormData>({
    resolver: zodResolver(stockSchema),
    defaultValues: {
      symbol: "",
      companyName: "",
      shares: 0,
      currentPrice: 0,
      purchasePrice: 0,
      purchaseDate: undefined,
    },
  });

  const handleStockSearch = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const results = await mockStockSearch(query);
      setSearchResults(results);
    } catch (error) {
      console.error("Stock search error:", error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const handleStockSelect = (stock: StockSearchResult) => {
    setSelectedStock(stock);
    form.setValue("symbol", stock.symbol);
    form.setValue("companyName", stock.name);
    form.setValue("currentPrice", stock.price);
    setSearchQuery("");
    setSearchResults([]);
  };

  const onSubmit = async (data: StockFormData) => {
    setLoading(true);
    try {
      const assetData = {
        name: `${data.companyName} (${data.symbol})`,
        ticker: data.symbol,
        assetType: "STOCK" as const,
        quantity: data.shares,
        purchasePrice:
          data.purchasePrice && data.purchasePrice > 0
            ? data.purchasePrice
            : undefined,
        currentPrice: data.currentPrice,
        symbol: data.symbol,
        metadata: JSON.stringify({
          companyName: data.companyName,
          currentPrice: data.currentPrice,
          purchaseDate: data.purchaseDate?.toISOString(),
          lastPriceUpdate: new Date().toISOString(),
        }),
      };

      const result = await createInvestmentAsset(assetData);

      if (result.success) {
        toast.success("Stock Added Successfully! 📈", {
          description: `${data.shares} shares of ${data.symbol} have been added to your portfolio`,
          duration: 4000,
        });

        form.reset();
        setSelectedStock(null);
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error("Failed to Add Stock", {
          description:
            result.error || "Something went wrong. Please try again.",
          duration: 5000,
        });
      }
    } catch (err) {
      console.error("Failed to add stock asset", err);

      toast.error("Unexpected Error", {
        description:
          "Unable to add stock. Please check your connection and try again.",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {onBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="p-1 h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            📈 Add Stock Investment
          </DialogTitle>
          <DialogDescription>
            Search for a stock and enter your investment details
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
            <div className="flex flex-col items-center gap-3">
              <Spinner variant="ring" size={32} />
              <p className="text-sm text-muted-foreground">
                Adding your stock...
              </p>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Stock Search */}
          {!selectedStock && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search stocks by symbol or company name..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    handleStockSearch(e.target.value);
                  }}
                  disabled={loading}
                />
                {searchLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Spinner variant="circle" size={16} />
                  </div>
                )}
              </div>

              {searchResults.length > 0 && (
                <div className="border rounded-lg p-2 space-y-1 max-h-48 overflow-y-auto">
                  {searchResults.map((stock) => (
                    <div
                      key={stock.symbol}
                      className="flex items-center justify-between p-3 hover:bg-muted/50 cursor-pointer rounded-md transition-colors"
                      onClick={() => handleStockSelect(stock)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{stock.symbol}</span>
                          <Badge
                            variant={
                              stock.change.startsWith("+")
                                ? "default"
                                : "destructive"
                            }
                            className="text-xs"
                          >
                            {stock.change}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {stock.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${stock.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Selected Stock Preview */}
          {selectedStock && (
            <div className="border rounded-lg p-4 bg-muted/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <span className="font-semibold text-lg">
                      {selectedStock.symbol}
                    </span>
                    <Badge
                      variant={
                        selectedStock.change.startsWith("+")
                          ? "default"
                          : "destructive"
                      }
                    >
                      {selectedStock.change}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">${selectedStock.price}</p>
                  <p className="text-sm text-muted-foreground">Current Price</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {selectedStock.name}
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() => {
                  setSelectedStock(null);
                  form.reset();
                }}
              >
                Choose Different Stock
              </Button>
            </div>
          )}

          {/* Investment Form */}
          {selectedStock && (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Hidden fields for validation */}
                <div className="hidden">
                  <FormField
                    control={form.control}
                    name="symbol"
                    render={({ field }) => <Input {...field} />}
                  />
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => <Input {...field} />}
                  />
                  <FormField
                    control={form.control}
                    name="currentPrice"
                    render={({ field }) => <Input {...field} />}
                  />
                </div>

                {/* Investment Details */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Investment Details
                  </h4>

                  <FormField
                    control={form.control}
                    name="shares"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Shares</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.001"
                            placeholder="10"
                            {...field}
                            disabled={loading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Purchase Information */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Purchase Information (Optional)
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="purchasePrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Purchase Price per Share</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="150.00"
                              {...field}
                              disabled={loading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="purchaseDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Purchase Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                  disabled={loading}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date > new Date() ||
                                  date < new Date("1900-01-01")
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Investment Summary */}
                {form.watch("shares") > 0 && (
                  <div className="border rounded-lg p-4 bg-muted/10">
                    <h4 className="font-medium mb-2">Investment Summary</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Current Value:</span>
                        <span className="font-medium">
                          $
                          {(
                            form.watch("shares") * form.watch("currentPrice")
                          ).toFixed(2)}
                        </span>
                      </div>
                      {form.watch("purchasePrice") &&
                        form.watch("purchasePrice")! > 0 && (
                          <>
                            <div className="flex justify-between">
                              <span>Purchase Value:</span>
                              <span>
                                $
                                {(
                                  form.watch("shares") *
                                  form.watch("purchasePrice")!
                                ).toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs pt-1 border-t">
                              <span>Unrealized P&L:</span>
                              <span
                                className={
                                  form.watch("shares") *
                                    (form.watch("currentPrice") -
                                      form.watch("purchasePrice")!) >=
                                  0
                                    ? "text-green-600"
                                    : "text-red-600"
                                }
                              >
                                $
                                {(
                                  form.watch("shares") *
                                  (form.watch("currentPrice") -
                                    form.watch("purchasePrice")!)
                                ).toFixed(2)}
                              </span>
                            </div>
                          </>
                        )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="min-w-[120px]"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <Spinner variant="circle" size={16} />
                        <span>Adding...</span>
                      </div>
                    ) : (
                      "Add Stock"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
