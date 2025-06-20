"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconSeeding, IconCheck } from "@tabler/icons-react";
import { seedUserData } from "@/actions/dashboard-actions";
import { toast } from "sonner";

export function SeedDataButton() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isSeeded, setIsSeeded] = useState(false);

  const handleSeedData = async () => {
    setIsSeeding(true);

    try {
      await seedUserData();
      setIsSeeded(true);
      toast.success(
        "Sample data created successfully! Refresh the page to see your dashboard."
      );
    } catch (error) {
      console.error("Seeding failed:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create sample data. Please try again."
      );
    } finally {
      setIsSeeding(false);
    }
  };

  if (isSeeded) {
    return (
      <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
        <IconCheck className="h-3 w-3 mr-1" />
        Data Created
      </Badge>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSeedData}
      disabled={isSeeding}
      className="text-xs"
    >
      {isSeeding ? (
        <>
          <IconSeeding className="h-3 w-3 mr-1 animate-spin" />
          Creating...
        </>
      ) : (
        <>
          <IconSeeding className="h-3 w-3 mr-1" />
          Try Sample Data
        </>
      )}
    </Button>
  );
}
