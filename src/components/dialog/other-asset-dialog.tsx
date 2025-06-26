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
import { Textarea } from "@/components/ui/textarea";
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

const otherAssetSchema = z.object({
  name: z.string().min(1, "Asset name is required"),
  description: z.string().optional(),
  currentValue: z.coerce
    .number()
    .min(1, "Current value must be greater than 0"),
  purchasePrice: z.coerce.number().min(0).optional().or(z.literal(0)),
  purchaseDate: z.date().optional(),
  category: z.string().optional(),
});

type OtherAssetFormData = z.infer<typeof otherAssetSchema>;

interface OtherAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBack?: () => void;
}

export function OtherAssetDialog({
  open,
  onOpenChange,
  onBack,
}: OtherAssetDialogProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<OtherAssetFormData>({
    resolver: zodResolver(otherAssetSchema),
    defaultValues: {
      name: "",
      description: "",
      currentValue: 0,
      purchasePrice: 0,
      purchaseDate: undefined,
      category: "",
    },
  });

  const onSubmit = async (data: OtherAssetFormData) => {
    setLoading(true);
    try {
      const assetData = {
        name: data.name,
        ticker: undefined,
        assetType: "OTHER" as const,
        quantity: 1,
        purchasePrice:
          data.purchasePrice && data.purchasePrice > 0
            ? data.purchasePrice
            : undefined,
        currentPrice: data.currentValue,
        metadata: JSON.stringify({
          description: data.description,
          category: data.category,
          purchaseDate: data.purchaseDate?.toISOString(),
        }),
      };

      const result = await createInvestmentAsset(assetData);

      if (result.success) {
        toast.success("Asset Added Successfully! 💎", {
          description: `${data.name} has been added to your portfolio`,
          duration: 4000,
        });

        form.reset();
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error("Failed to Add Asset", {
          description:
            result.error || "Something went wrong. Please try again.",
          duration: 5000,
        });
      }
    } catch (err) {
      console.error("Failed to add other asset", err);

      toast.error("Unexpected Error", {
        description:
          "Unable to add asset. Please check your connection and try again.",
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
            💎 Add Other Asset
          </DialogTitle>
          <DialogDescription>
            Enter details about your investment asset
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
            <div className="flex flex-col items-center gap-3">
              <Spinner variant="ring" size={32} />
              <p className="text-sm text-muted-foreground">
                Adding your asset...
              </p>
            </div>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Asset Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Collectible Art, Gold Jewelry, Patent"
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
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Art, Jewelry, Collectibles, Intellectual Property"
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional details about this asset..."
                      className="min-h-[80px]"
                      {...field}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">
                Value Information
              </h4>

              <FormField
                control={form.control}
                name="currentValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Estimated Value</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="5000.00"
                        {...field}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                      <FormLabel>Purchase Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="4000.00"
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
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
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
                  "Add Asset"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
