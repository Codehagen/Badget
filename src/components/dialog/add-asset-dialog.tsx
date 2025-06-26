"use client";

import { useState } from "react";
import { AssetTypeSelector, type AssetType } from "./asset-type-selector";
import { RealEstateAssetDialog } from "./real-estate-asset-dialog";
import { StockAssetDialog } from "./stock-asset-dialog";
import { CryptoAssetDialog } from "./crypto-asset-dialog";
import { BondAssetDialog } from "./bond-asset-dialog";
import { VehicleAssetDialog } from "./vehicle-asset-dialog";
import { OtherAssetDialog } from "./other-asset-dialog";

interface AddAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddAssetDialog({ open, onOpenChange }: AddAssetDialogProps) {
  // Dialog states for different asset types
  const [showRealEstate, setShowRealEstate] = useState(false);
  const [showStock, setShowStock] = useState(false);
  const [showCrypto, setShowCrypto] = useState(false);
  const [showBond, setShowBond] = useState(false);
  const [showVehicle, setShowVehicle] = useState(false);
  const [showOther, setShowOther] = useState(false);

  const handleAssetTypeSelect = (assetType: AssetType) => {
    // Open the appropriate specialized dialog
    switch (assetType) {
      case "REAL_ESTATE":
        setShowRealEstate(true);
        break;
      case "STOCK":
        setShowStock(true);
        break;
      case "CRYPTO":
        setShowCrypto(true);
        break;
      case "BOND":
        setShowBond(true);
        break;
      case "VEHICLE":
        setShowVehicle(true);
        break;
      case "OTHER":
        setShowOther(true);
        break;
    }
  };

  const closeAllDialogs = () => {
    setShowRealEstate(false);
    setShowStock(false);
    setShowCrypto(false);
    setShowBond(false);
    setShowVehicle(false);
    setShowOther(false);
  };

  const handleBackToSelector = () => {
    closeAllDialogs();
    onOpenChange(true); // Reopen the main asset type selector
  };

  return (
    <>
      {/* Asset Type Selector - Main entry point */}
      <AssetTypeSelector
        open={open}
        onOpenChange={onOpenChange}
        onAssetTypeSelect={handleAssetTypeSelect}
      />

      {/* Specialized Asset Dialogs */}
      <RealEstateAssetDialog
        open={showRealEstate}
        onOpenChange={(open) => {
          setShowRealEstate(open);
          if (!open) closeAllDialogs();
        }}
        onBack={handleBackToSelector}
      />

      {/* Stock Dialog */}
      <StockAssetDialog
        open={showStock}
        onOpenChange={(open) => {
          setShowStock(open);
          if (!open) closeAllDialogs();
        }}
        onBack={handleBackToSelector}
      />

      {/* Crypto Dialog */}
      <CryptoAssetDialog
        open={showCrypto}
        onOpenChange={(open) => {
          setShowCrypto(open);
          if (!open) closeAllDialogs();
        }}
        onBack={handleBackToSelector}
      />

      {/* Bond Dialog */}
      <BondAssetDialog
        open={showBond}
        onOpenChange={(open) => {
          setShowBond(open);
          if (!open) closeAllDialogs();
        }}
        onBack={handleBackToSelector}
      />

      {/* Vehicle Dialog */}
      <VehicleAssetDialog
        open={showVehicle}
        onOpenChange={(open) => {
          setShowVehicle(open);
          if (!open) closeAllDialogs();
        }}
        onBack={handleBackToSelector}
      />

      {/* Other Assets Dialog */}
      <OtherAssetDialog
        open={showOther}
        onOpenChange={(open) => {
          setShowOther(open);
          if (!open) closeAllDialogs();
        }}
        onBack={handleBackToSelector}
      />
    </>
  );
}
