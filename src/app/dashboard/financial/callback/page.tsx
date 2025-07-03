"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { completeGoCardlessConnection } from "@/actions/gocardless-actions";
import { toast } from "sonner";
import { Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

function GoCardlessCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        setMessage("Completing bank connection...");

        // Get the current URL to extract requisition ID

        // The requisition ID should be stored in localStorage from when we initiated the flow
        // We'll look for any stored requisition data
        const storedRequisitions = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith("gocardless_bank_")) {
            const requisitionId = key.replace("gocardless_bank_", "");
            storedRequisitions.push({
              id: requisitionId,
              bankInfo: JSON.parse(localStorage.getItem(key) || "{}"),
            });
          }
        }

        if (storedRequisitions.length === 0) {
          throw new Error(
            "No pending bank connection found. Please try connecting again."
          );
        }

        // For now, take the most recent one (you might want to be more specific)
        const { id: requisitionId, bankInfo } =
          storedRequisitions[storedRequisitions.length - 1];

        if (!requisitionId) {
          throw new Error(
            "Missing requisition ID. Please try connecting again."
          );
        }

        // Complete the connection
        const result = await completeGoCardlessConnection(
          requisitionId,
          bankInfo
        );

        if (result.success) {
          setStatus("success");
          setMessage(
            `Successfully connected ${result.accounts.length} accounts from ${bankInfo.displayName}`
          );
          toast.success(result.message);

          // Clean up localStorage
          localStorage.removeItem(`gocardless_bank_${requisitionId}`);

          // Redirect to financial page after a short delay
          setTimeout(() => {
            router.push("/dashboard/financial");
          }, 2000);
        } else {
          throw new Error("Failed to complete bank connection");
        }
      } catch (error) {
        console.error("GoCardless callback error:", error);
        setStatus("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "An unexpected error occurred"
        );
        toast.error("Failed to connect bank account");
      }
    };

    handleCallback();
  }, [searchParams, router]);

  const handleRetry = () => {
    router.push("/dashboard/financial");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="text-center space-y-6">
          {/* Status Icon */}
          <div className="flex justify-center">
            {status === "loading" && (
              <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
            )}
            {status === "success" && (
              <CheckCircle className="h-16 w-16 text-green-500" />
            )}
            {status === "error" && (
              <XCircle className="h-16 w-16 text-red-500" />
            )}
          </div>

          {/* Status Title */}
          <div>
            <h1 className="text-2xl font-bold mb-2">
              {status === "loading" && "Connecting Your Bank Account"}
              {status === "success" && "Bank Account Connected!"}
              {status === "error" && "Connection Failed"}
            </h1>

            <p className="text-muted-foreground">{message}</p>
          </div>

          {/* Action Button */}
          {status === "error" && (
            <div className="space-y-3">
              <Button onClick={handleRetry} className="w-full">
                Try Again
              </Button>
              <p className="text-sm text-muted-foreground">
                If the problem persists, please contact support.
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-3">
              <p className="text-sm text-green-600">
                Redirecting you back to your financial dashboard...
              </p>
              <Button
                onClick={() => router.push("/dashboard/financial")}
                variant="outline"
              >
                Go to Dashboard Now
              </Button>
            </div>
          )}

          {status === "loading" && (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                Please don&apos;t close this page
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function GoCardlessCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="max-w-md w-full mx-auto p-6">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-2">
                  Connecting Your Bank Account
                </h1>
                <p className="text-muted-foreground">
                  Please wait while we process your connection...
                </p>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <GoCardlessCallbackContent />
    </Suspense>
  );
}
