"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { IconSeeding, IconRefresh } from "@tabler/icons-react";
import { seedUserData, resetUserData } from "@/actions/dashboard-actions";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function SeedDataButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);

  const handleSeedData = async (resetFirst: boolean = false) => {
    setIsLoading(true);
    try {
      await seedUserData(resetFirst);
      toast.success("Sample data created successfully!", {
        description:
          "Your dashboard now has realistic financial data to explore.",
      });
      // Refresh the page to show new data
      window.location.reload();
    } catch (error) {
      console.error("Error seeding data:", error);

      if (
        error instanceof Error &&
        error.message.includes("already has financial data")
      ) {
        setShowResetDialog(true);
      } else {
        toast.error("Failed to create sample data", {
          description:
            error instanceof Error ? error.message : "Please try again later.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetAndSeed = async () => {
    setShowResetDialog(false);
    await handleSeedData(true);
  };

  const handleResetOnly = async () => {
    setIsLoading(true);
    try {
      await resetUserData();
      toast.success("Financial data reset successfully!", {
        description: "All your financial data has been cleared.",
      });
      // Refresh the page to show empty state
      window.location.reload();
    } catch (error) {
      console.error("Error resetting data:", error);
      toast.error("Failed to reset data", {
        description:
          error instanceof Error ? error.message : "Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          onClick={() => handleSeedData(false)}
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          {isLoading ? (
            <>
              <IconRefresh className="h-3 w-3 mr-1 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <IconSeeding className="h-3 w-3 mr-1" />
              Try Sample Data
            </>
          )}
        </Button>

        <Button
          onClick={handleResetOnly}
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          <IconRefresh className="h-3 w-3 mr-1" />
          Reset Data
        </Button>
      </div>

      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Financial Data Already Exists</AlertDialogTitle>
            <AlertDialogDescription>
              You already have financial data in your account. Would you like
              to:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
            <AlertDialogCancel>Keep Current Data</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetAndSeed}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Replace with Sample Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
