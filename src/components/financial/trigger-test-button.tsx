"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Zap, 
  Play, 
  Calendar, 
  Sync, 
  AlertCircle, 
  CheckCircle, 
  ExternalLink,
  Clock,
  Coins
} from "lucide-react";
import { 
  testTriggerPlaidTransactionImport,
  testTriggerGoCardlessTransactionImport,
  testTriggerPlaidBalanceSync,
  testTriggerGoCardlessBalanceSync,
  testTriggerBothProvidersTransactionImport,
  testTriggerBothProvidersBalanceSync
} from "@/actions/trigger-test-actions";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

interface TriggerTestButtonProps {
  onSuccess?: () => void;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

export function TriggerTestButton({ 
  onSuccess, 
  variant = "outline", 
  size = "default" 
}: TriggerTestButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [activeOperation, setActiveOperation] = useState<string | null>(null);

  const handleOperation = async (
    operation: () => Promise<any>,
    operationName: string
  ) => {
    try {
      setIsLoading(true);
      setActiveOperation(operationName);
      
      const result = await operation();
      
      if (result.success) {
        toast.success(result.message, {
          icon: <CheckCircle className="h-4 w-4" />,
          description: result.url ? (
            <div className="flex items-center gap-1 mt-1">
              <ExternalLink className="h-3 w-3" />
              <a 
                href={result.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs underline hover:no-underline"
              >
                View in Trigger.dev Dashboard
              </a>
            </div>
          ) : undefined,
          duration: 8000,
        });
        onSuccess?.();
      } else {
        throw new Error("Operation failed");
      }
    } catch (error) {
      console.error(`Error in ${operationName}:`, error);
      toast.error(`Failed to trigger ${operationName}`, {
        icon: <AlertCircle className="h-4 w-4" />,
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsLoading(false);
      setActiveOperation(null);
    }
  };

  const getLoadingText = () => {
    if (!isLoading) return "Test Trigger.dev";
    return activeOperation ? `${activeOperation}...` : "Starting...";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size} 
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <Zap className="h-4 w-4" />
          {getLoadingText()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Zap className="h-4 w-4" />
          Trigger.dev Tests
        </DropdownMenuLabel>
        <div className="px-2 py-1.5 text-xs text-muted-foreground">
          Test async background tasks
        </div>
        <DropdownMenuSeparator />
        
        {/* Transaction Import Tests */}
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
          Transaction Import
        </DropdownMenuLabel>
        
        <DropdownMenuItem 
          onClick={() => handleOperation(
            () => testTriggerPlaidTransactionImport(7),
            "Plaid Import (7d)"
          )}
          disabled={isLoading}
          className="flex items-center justify-between"
        >
          <div className="flex items-center">
            <Play className="mr-2 h-4 w-4" />
            Plaid - Last 7 days
          </div>
          {isLoading && activeOperation === "Plaid Import (7d)" && (
            <Clock className="h-3 w-3 animate-spin" />
          )}
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => handleOperation(
            () => testTriggerGoCardlessTransactionImport(7),
            "GoCardless Import (7d)"
          )}
          disabled={isLoading}
          className="flex items-center justify-between"
        >
          <div className="flex items-center">
            <Play className="mr-2 h-4 w-4" />
            GoCardless - Last 7 days
          </div>
          {isLoading && activeOperation === "GoCardless Import (7d)" && (
            <Clock className="h-3 w-3 animate-spin" />
          )}
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => handleOperation(
            () => testTriggerBothProvidersTransactionImport(30),
            "Both Providers Import (30d)"
          )}
          disabled={isLoading}
          className="flex items-center justify-between font-medium"
        >
          <div className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            Both - Last 30 days
          </div>
          {isLoading && activeOperation === "Both Providers Import (30d)" && (
            <Clock className="h-3 w-3 animate-spin" />
          )}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* Balance Sync Tests */}
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
          Balance Sync
        </DropdownMenuLabel>
        
        <DropdownMenuItem 
          onClick={() => handleOperation(
            () => testTriggerPlaidBalanceSync(),
            "Plaid Balance Sync"
          )}
          disabled={isLoading}
          className="flex items-center justify-between"
        >
          <div className="flex items-center">
            <Sync className="mr-2 h-4 w-4" />
            Plaid Balances
          </div>
          {isLoading && activeOperation === "Plaid Balance Sync" && (
            <Clock className="h-3 w-3 animate-spin" />
          )}
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => handleOperation(
            () => testTriggerGoCardlessBalanceSync(),
            "GoCardless Balance Sync"
          )}
          disabled={isLoading}
          className="flex items-center justify-between"
        >
          <div className="flex items-center">
            <Sync className="mr-2 h-4 w-4" />
            GoCardless Balances
          </div>
          {isLoading && activeOperation === "GoCardless Balance Sync" && (
            <Clock className="h-3 w-3 animate-spin" />
          )}
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => handleOperation(
            () => testTriggerBothProvidersBalanceSync(),
            "Both Providers Balance Sync"
          )}
          disabled={isLoading}
          className="flex items-center justify-between font-medium"
        >
          <div className="flex items-center">
            <Coins className="mr-2 h-4 w-4" />
            Both Providers
          </div>
          {isLoading && activeOperation === "Both Providers Balance Sync" && (
            <Clock className="h-3 w-3 animate-spin" />
          )}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <div className="px-2 py-1.5 text-xs text-muted-foreground">
          ⚡ Tasks run async in background
          <br />
          📊 Monitor in Trigger.dev Dashboard
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}