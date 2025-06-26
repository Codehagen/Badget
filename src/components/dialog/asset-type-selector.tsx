"use client";

import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  IconHome,
  IconTrendingUp,
  IconCurrencyBitcoin,
  IconBuildingBank,
  IconCar,
  IconDiamond,
} from "@tabler/icons-react";

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
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const assetTypes: AssetTypeOption[] = [
  {
    id: "REAL_ESTATE",
    name: "Real Estate",
    icon: IconHome,
    description: "Houses, condos, property",
  },
  {
    id: "STOCK",
    name: "Stocks",
    icon: IconTrendingUp,
    description: "Company shares, ETFs",
  },
  {
    id: "CRYPTO",
    name: "Crypto",
    icon: IconCurrencyBitcoin,
    description: "Bitcoin, Ethereum, etc.",
  },
  {
    id: "BOND",
    name: "Bonds",
    icon: IconBuildingBank,
    description: "Treasury, corporate bonds",
  },
  {
    id: "VEHICLE",
    name: "Vehicle",
    icon: IconCar,
    description: "Cars, boats, motorcycles",
  },
  {
    id: "OTHER",
    name: "Other",
    icon: IconDiamond,
    description: "Collectibles, art, etc.",
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
  const [focusedIndex, setFocusedIndex] = useState(0);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Layout mapping: [left column indices, right column indices]
  const leftColumnIndices = [0, 2, 4]; // Real Estate, Crypto, Vehicle
  const rightColumnIndices = [1, 3, 5]; // Stocks, Bonds, Other

  useEffect(() => {
    if (open) {
      // Reset focus to first item when dialog opens
      setFocusedIndex(0);
      // Focus the first item after a short delay to ensure dialog is rendered
      setTimeout(() => {
        itemRefs.current[0]?.focus();
      }, 100);
    }
  }, [open]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case "ArrowDown": {
        event.preventDefault();
        const currentColumn = leftColumnIndices.includes(focusedIndex)
          ? "left"
          : "right";
        const columnIndices =
          currentColumn === "left" ? leftColumnIndices : rightColumnIndices;
        const currentPositionInColumn = columnIndices.indexOf(focusedIndex);
        const nextIndex =
          columnIndices[(currentPositionInColumn + 1) % columnIndices.length];
        setFocusedIndex(nextIndex);
        itemRefs.current[nextIndex]?.focus();
        break;
      }
      case "ArrowUp": {
        event.preventDefault();
        const currentColumn = leftColumnIndices.includes(focusedIndex)
          ? "left"
          : "right";
        const columnIndices =
          currentColumn === "left" ? leftColumnIndices : rightColumnIndices;
        const currentPositionInColumn = columnIndices.indexOf(focusedIndex);
        const prevIndex =
          columnIndices[
            currentPositionInColumn === 0
              ? columnIndices.length - 1
              : currentPositionInColumn - 1
          ];
        setFocusedIndex(prevIndex);
        itemRefs.current[prevIndex]?.focus();
        break;
      }
      case "ArrowRight": {
        event.preventDefault();
        // Move from left column to corresponding position in right column
        if (leftColumnIndices.includes(focusedIndex)) {
          const positionInColumn = leftColumnIndices.indexOf(focusedIndex);
          const nextIndex = rightColumnIndices[positionInColumn];
          setFocusedIndex(nextIndex);
          itemRefs.current[nextIndex]?.focus();
        }
        break;
      }
      case "ArrowLeft": {
        event.preventDefault();
        // Move from right column to corresponding position in left column
        if (rightColumnIndices.includes(focusedIndex)) {
          const positionInColumn = rightColumnIndices.indexOf(focusedIndex);
          const nextIndex = leftColumnIndices[positionInColumn];
          setFocusedIndex(nextIndex);
          itemRefs.current[nextIndex]?.focus();
        }
        break;
      }
      case "Enter":
      case " ": {
        event.preventDefault();
        handleAssetTypeClick(assetTypes[focusedIndex].id);
        break;
      }
      case "Escape": {
        event.preventDefault();
        onOpenChange(false);
        break;
      }
    }
  };

  const handleAssetTypeClick = (assetType: AssetType) => {
    onAssetTypeSelect(assetType);
    onOpenChange(false);
  };

  const renderAssetType = (assetType: AssetTypeOption, index: number) => {
    const IconComponent = assetType.icon;
    const isFocused = index === focusedIndex;

    return (
      <div
        key={assetType.id}
        ref={(el) => {
          itemRefs.current[index] = el;
        }}
        className={`flex-1 flex flex-col items-center justify-center p-6 cursor-pointer transition-colors outline-none ${
          isFocused
            ? "bg-accent text-accent-foreground ring-2 ring-ring"
            : "hover:bg-accent hover:text-accent-foreground"
        }`}
        onClick={() => handleAssetTypeClick(assetType.id)}
        onKeyDown={handleKeyDown}
        tabIndex={isFocused ? 0 : -1}
        role="button"
        aria-label={`Select ${assetType.name} - ${assetType.description}`}
      >
        <IconComponent className="h-8 w-8 text-muted-foreground mb-3" />
        <div className="text-center space-y-1">
          <div className="font-semibold text-base">{assetType.name}</div>
          <div className="text-xs text-muted-foreground leading-relaxed">
            {assetType.description}
          </div>
        </div>
      </div>
    );
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

        <div className="py-4">
          <div className="flex" role="grid" aria-label="Asset types">
            {/* Left Column */}
            <div className="flex-1 flex flex-col" role="gridcell">
              {renderAssetType(assetTypes[0], 0)}
              <Separator className="my-0" />
              {renderAssetType(assetTypes[2], 2)}
              <Separator className="my-0" />
              {renderAssetType(assetTypes[4], 4)}
            </div>

            {/* Continuous Vertical Separator */}
            <Separator orientation="vertical" className="h-auto" />

            {/* Right Column */}
            <div className="flex-1 flex flex-col" role="gridcell">
              {renderAssetType(assetTypes[1], 1)}
              <Separator className="my-0" />
              {renderAssetType(assetTypes[3], 3)}
              <Separator className="my-0" />
              {renderAssetType(assetTypes[5], 5)}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
