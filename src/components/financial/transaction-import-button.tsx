"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Calendar, AlertCircle, CheckCircle } from "lucide-react";
import { importTransactions, syncAccountBalances } from "@/actions/plaid-actions";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TransactionImportButtonProps {
  onSuccess?: () => void;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

export function TransactionImportButton({ 
  onSuccess, 
  variant = "outline", 
  size = "default" 
}: TransactionImportButtonProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleImportTransactions = async (days: number) => {
    try {
      setIsImporting(true);
      
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const response = await importTransactions(startDate, endDate);
      
      if (response.success) {
        toast.success(response.message, {
          icon: <CheckCircle className="h-4 w-4" />,
        });
        onSuccess?.();
      } else {
        throw new Error("Import failed");
      }
    } catch (error) {
      console.error("Error importing transactions:", error);
      toast.error("Failed to import transactions. Please try again.", {
        icon: <AlertCircle className="h-4 w-4" />,
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleSyncBalances = async () => {
    try {
      setIsSyncing(true);
      
      const response = await syncAccountBalances();
      
      if (response.success) {
        toast.success(response.message, {
          icon: <CheckCircle className="h-4 w-4" />,
        });
        onSuccess?.();
      } else {
        throw new Error("Sync failed");
      }
    } catch (error) {
      console.error("Error syncing balances:", error);
      toast.error("Failed to sync account balances. Please try again.", {
        icon: <AlertCircle className="h-4 w-4" />,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const isLoading = isImporting || isSyncing;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size} 
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          {isLoading ? "Processing..." : "Import Transactions"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
          Import Period
        </div>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={() => handleImportTransactions(7)}
          disabled={isLoading}
        >
          <Calendar className="mr-2 h-4 w-4" />
          Last 7 days
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => handleImportTransactions(30)}
          disabled={isLoading}
        >
          <Calendar className="mr-2 h-4 w-4" />
          Last 30 days
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => handleImportTransactions(90)}
          disabled={isLoading}
        >
          <Calendar className="mr-2 h-4 w-4" />
          Last 90 days
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleSyncBalances}
          disabled={isLoading}
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          Sync Account Balances
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}