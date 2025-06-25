"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export type AssetType =
  | "REAL_ESTATE"
  | "STOCK"
  | "CRYPTO"
  | "BOND"
  | "VEHICLE"
  | "OTHER";

interface AssetTypeOption {
  id: AssetType;
  name: string;
  icon: string;
  description: string;
  color: string;
}

const assetTypes: AssetTypeOption[] = [
  {
    id: "REAL_ESTATE",
    name: "Real Estate",
    icon: "🏠",
    description: "Houses, condos, property",
    color:
      "bg-green-50 hover:bg-green-100 dark:bg-green-950/50 dark:hover:bg-green-900/50",
  },
  {
    id: "STOCK",
    name: "Stocks",
    icon: "📈",
    description: "Company shares, ETFs",
    color:
      "bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/50",
  },
  {
    id: "CRYPTO",
    name: "Crypto",
    icon: "🪙",
    description: "Bitcoin, Ethereum, etc.",
    color:
      "bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/50 dark:hover:bg-orange-900/50",
  },
  {
    id: "BOND",
    name: "Bonds",
    icon: "💰",
    description: "Treasury, corporate bonds",
    color:
      "bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 dark:hover:bg-purple-900/50",
  },
  {
    id: "VEHICLE",
    name: "Vehicle",
    icon: "🚗",
    description: "Cars, boats, motorcycles",
    color:
      "bg-red-50 hover:bg-red-100 dark:bg-red-950/50 dark:hover:bg-red-900/50",
  },
  {
    id: "OTHER",
    name: "Other",
    icon: "💎",
    description: "Collectibles, art, etc.",
    color:
      "bg-gray-50 hover:bg-gray-100 dark:bg-gray-950/50 dark:hover:bg-gray-900/50",
  },
];

interface AssetTypeSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssetTypeSelect: (assetType: AssetType) => void;
}

export function AssetTypeSelector({
  open,
  onOpenChange,
  onAssetTypeSelect,
}: AssetTypeSelectorProps) {
  const handleAssetTypeClick = (assetType: AssetType) => {
    onAssetTypeSelect(assetType);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Investment Asset</DialogTitle>
          <DialogDescription>
            Choose the type of asset you want to track
          </DialogDescription>
        </DialogHeader>

        {/* 2x3 Grid Layout */}
        <div className="grid grid-cols-2 gap-4 py-4">
          {assetTypes.map((assetType) => (
            <Button
              key={assetType.id}
              variant="outline"
              className={`
                h-auto p-6 flex flex-col items-center gap-3 
                border-2 hover:border-primary/20 transition-all
                ${assetType.color}
              `}
              onClick={() => handleAssetTypeClick(assetType.id)}
            >
              {/* Icon */}
              <div className="text-3xl">{assetType.icon}</div>

              {/* Name */}
              <div className="font-semibold text-base">{assetType.name}</div>

              {/* Description */}
              <div className="text-xs text-muted-foreground text-center leading-relaxed">
                {assetType.description}
              </div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
