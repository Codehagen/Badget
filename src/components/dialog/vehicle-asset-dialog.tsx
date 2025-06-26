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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const vehicleTypes = [
  { value: "car", label: "Car" },
  { value: "truck", label: "Truck" },
  { value: "motorcycle", label: "Motorcycle" },
  { value: "boat", label: "Boat" },
  { value: "rv", label: "RV/Motorhome" },
  { value: "trailer", label: "Trailer" },
  { value: "atv", label: "ATV/UTV" },
  { value: "other", label: "Other" },
];

const vehicleSchema = z.object({
  name: z.string().min(1, "Vehicle name is required"),
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.coerce
    .number()
    .min(1900, "Valid year is required")
    .max(new Date().getFullYear() + 1),
  vehicleType: z.string().min(1, "Vehicle type is required"),
  vin: z.string().optional(),
  estimatedValue: z.coerce
    .number()
    .min(1, "Estimated value must be greater than 0"),
  purchasePrice: z.coerce.number().min(0).optional().or(z.literal(0)),
  purchaseDate: z.date().optional(),
  mileage: z.coerce.number().min(0).optional().or(z.literal(0)),
});

type VehicleFormData = z.infer<typeof vehicleSchema>;

interface VehicleAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBack?: () => void;
}

export function VehicleAssetDialog({
  open,
  onOpenChange,
  onBack,
}: VehicleAssetDialogProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      name: "",
      make: "",
      model: "",
      year: new Date().getFullYear(),
      vehicleType: "",
      vin: "",
      estimatedValue: 0,
      purchasePrice: 0,
      purchaseDate: undefined,
      mileage: 0,
    },
  });

  const onSubmit = async (data: VehicleFormData) => {
    setLoading(true);
    try {
      const assetData = {
        name: data.name,
        ticker: undefined,
        assetType: "VEHICLE" as const,
        quantity: 1,
        purchasePrice:
          data.purchasePrice && data.purchasePrice > 0
            ? data.purchasePrice
            : undefined,
        currentPrice: data.estimatedValue,
        vin: data.vin || undefined,
        metadata: JSON.stringify({
          make: data.make,
          model: data.model,
          year: data.year,
          vehicleType: data.vehicleType,
          mileage: data.mileage && data.mileage > 0 ? data.mileage : undefined,
          purchaseDate: data.purchaseDate?.toISOString(),
        }),
      };

      const result = await createInvestmentAsset(assetData);

      if (result.success) {
        toast.success("Vehicle Added Successfully! 🚗", {
          description: `${data.year} ${data.make} ${data.model} has been added to your portfolio`,
          duration: 4000,
        });

        form.reset();
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error("Failed to Add Vehicle", {
          description:
            result.error || "Something went wrong. Please try again.",
          duration: 5000,
        });
      }
    } catch (err) {
      console.error("Failed to add vehicle asset", err);

      toast.error("Unexpected Error", {
        description:
          "Unable to add vehicle. Please check your connection and try again.",
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
            🚗 Add Vehicle Asset
          </DialogTitle>
          <DialogDescription>
            Enter details about your vehicle investment
          </DialogDescription>
        </DialogHeader>

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
            <div className="flex flex-col items-center gap-3">
              <Spinner variant="ring" size={32} />
              <p className="text-sm text-muted-foreground">
                Adding your vehicle...
              </p>
            </div>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Vehicle Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., My Tesla, Work Truck, Family Car"
                      {...field}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Vehicle Details */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">
                Vehicle Information
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="make"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Make</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Toyota, Tesla, Ford"
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
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Camry, Model 3, F-150"
                          {...field}
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="2023"
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
                  name="vehicleType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={loading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {vehicleTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="vin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>VIN (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="1HGBH41JXMN109186"
                        {...field}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Value Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">
                Value Information
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="estimatedValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Estimated Value</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1000"
                          placeholder="25000"
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
                  name="mileage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mileage (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="50000"
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
                      <FormLabel>Purchase Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1000"
                          placeholder="30000"
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
                  "Add Vehicle"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
