"use client";

import { useState } from "react";
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
import { CalendarIcon, ArrowLeft } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { createInvestmentAsset } from "@/actions/asset-actions";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

const cryptoSchema = z.object({
  name: z.string().min(1, "Crypto name is required"),
  symbol: z.string().min(1, "Symbol is required"),
  amount: z.coerce.number().min(0.00000001, "Amount must be greater than 0"),
  currentPrice: z.coerce
    .number()
    .min(0.01, "Current price must be greater than 0"),
  purchasePrice: z.coerce.number().min(0).optional().or(z.literal(0)),
  purchaseDate: z.date().optional(),
});

type CryptoFormData = z.infer<typeof cryptoSchema>;

interface CryptoAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBack?: () => void;
}

export function CryptoAssetDialog({
  open,
  onOpenChange,
  onBack,
}: CryptoAssetDialogProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<CryptoFormData>({
    resolver: zodResolver(cryptoSchema),
    defaultValues: {
      name: "",
      symbol: "",
      amount: 0,
      currentPrice: 0,
      purchasePrice: 0,
      purchaseDate: undefined,
    },
  });

  const onSubmit = async (data: CryptoFormData) => {
    setLoading(true);
    try {
      const assetData = {
        name: `${data.name} (${data.symbol})`,
        ticker: data.symbol,
        assetType: "CRYPTO" as const,
        quantity: data.amount,
        purchasePrice:
          data.purchasePrice && data.purchasePrice > 0
            ? data.purchasePrice
            : undefined,
        currentPrice: data.currentPrice,
        symbol: data.symbol,
        metadata: JSON.stringify({
          coinName: data.name,
          currentPrice: data.currentPrice,
          purchaseDate: data.purchaseDate?.toISOString(),
          lastPriceUpdate: new Date().toISOString(),
        }),
      };

      const result = await createInvestmentAsset(assetData);

      if (result.success) {
        toast.success("Crypto Added Successfully! 🪙", {
          description: `${data.amount} ${data.symbol} has been added to your portfolio`,
          duration: 4000,
        });

        form.reset();
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error("Failed to Add Crypto", {
          description:
            result.error || "Something went wrong. Please try again.",
          duration: 5000,
        });
      }
    } catch (err) {
      console.error("Failed to add crypto asset", err);

      toast.error("Unexpected Error", {
        description:
          "Unable to add crypto. Please check your connection and try again.",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
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
            🪙 Add Cryptocurrency
          </DialogTitle>
          <DialogDescription>
            Enter details about your cryptocurrency investment
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
            <div className="flex flex-col items-center gap-3">
              <Spinner variant="ring" size={32} />
              <p className="text-sm text-muted-foreground">
                Adding your crypto...
              </p>
            </div>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Crypto Details */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">
                Cryptocurrency Information
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Crypto Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Bitcoin, Ethereum, Solana"
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
                  name="symbol"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Symbol</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="BTC, ETH, SOL"
                          {...field}
                          disabled={loading}
                          onChange={(e) =>
                            field.onChange(e.target.value.toUpperCase())
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Investment Details */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">
                Investment Details
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount Owned</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.00000001"
                          placeholder="1.5"
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
                  name="currentPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Price (USD)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="45000.00"
                          {...field}
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
                      <FormLabel>Average Purchase Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="40000.00"
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
                      <FormLabel>First Purchase Date</FormLabel>
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
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("2009-01-01")
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
            {form.watch("amount") > 0 && form.watch("currentPrice") > 0 && (
              <div className="border rounded-lg p-4 bg-muted/10">
                <h4 className="font-medium mb-2">Investment Summary</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Current Value:</span>
                    <span className="font-medium">
                      $
                      {(
                        form.watch("amount") * form.watch("currentPrice")
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
                              form.watch("amount") *
                              form.watch("purchasePrice")!
                            ).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs pt-1 border-t">
                          <span>Unrealized P&L:</span>
                          <span
                            className={
                              form.watch("amount") *
                                (form.watch("currentPrice") -
                                  form.watch("purchasePrice")!) >=
                              0
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            $
                            {(
                              form.watch("amount") *
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
                  "Add Crypto"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
