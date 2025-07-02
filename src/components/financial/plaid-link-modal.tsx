"use client";

import { useState, useEffect } from "react";
import { usePlaidLink } from "react-plaid-link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Search,
  Plus,
  Building2,
  CreditCard,
  Banknote,
  AlertCircle,
} from "lucide-react";
import { createLinkToken, exchangePublicToken } from "@/actions/plaid-actions";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface PlaidLinkModalProps {
  onSuccess?: () => void;
}

// Common banks for the search/browse interface
const POPULAR_BANKS = [
  { name: "Chase", icon: Building2, type: "Major Bank", region: "US" },
  { name: "Bank of America", icon: Building2, type: "Major Bank", region: "US" },
  { name: "Wells Fargo", icon: Building2, type: "Major Bank", region: "US" },
  { name: "Citi", icon: Building2, type: "Major Bank", region: "US" },
  { name: "Capital One", icon: CreditCard, type: "Credit Card", region: "US" },
  { name: "American Express", icon: CreditCard, type: "Credit Card", region: "US" },
  { name: "Discover", icon: CreditCard, type: "Credit Card", region: "US" },
  { name: "US Bank", icon: Building2, type: "Major Bank", region: "US" },
  { name: "PNC Bank", icon: Building2, type: "Regional Bank", region: "US" },
  { name: "TD Bank", icon: Building2, type: "Regional Bank", region: "US/CA" },
  { name: "Navy Federal", icon: Building2, type: "Credit Union", region: "US" },
  { name: "Ally Bank", icon: Banknote, type: "Online Bank", region: "US" },
];

export function PlaidLinkModal({ onSuccess }: PlaidLinkModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter banks based on search query
  const filteredBanks = POPULAR_BANKS.filter(
    (bank) =>
      bank.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bank.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Create link token when modal opens
  useEffect(() => {
    if (isOpen && !linkToken) {
      const fetchLinkToken = async () => {
        try {
          setIsLoading(true);
          setError(null);
          const response = await createLinkToken();
          setLinkToken(response.link_token);
        } catch (err) {
          console.error("Error creating link token:", err);
          setError("Failed to initialize bank connection. Please try again.");
          toast.error("Failed to initialize bank connection");
        } finally {
          setIsLoading(false);
        }
      };

      fetchLinkToken();
    }
  }, [isOpen, linkToken]);

  // Handle successful Plaid Link connection
  const onPlaidSuccess = async (publicToken: string) => {
    try {
      setIsLoading(true);
      const response = await exchangePublicToken(publicToken);

      if (response.success) {
        toast.success(response.message);
        setLinkToken(null); // Reset for next time
        onSuccess?.();
      } else {
        throw new Error("Failed to connect accounts");
      }
    } catch (err) {
      console.error("Error exchanging public token:", err);
      toast.error("Failed to connect accounts. Please try again.");
      // Reopen modal on error so user can try again
      setIsOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Plaid Link configuration
  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: onPlaidSuccess,
    onExit: () => {
      console.log("User exited Plaid Link");
    },
  });

  const handleBankSelect = (bankName: string) => {
    setSelectedBank(bankName);
    setSearchQuery(bankName);
  };

  const handleConnectBank = () => {
    if (!selectedBank) {
      setError("Please select a bank first");
      return;
    }

    if (ready && linkToken) {
      // Close our modal first to prevent z-index issues
      setIsOpen(false);
      // Small delay to ensure modal is closed before opening Plaid
      setTimeout(() => {
        open();
      }, 100);
    }
  };

  const getBankIcon = (IconComponent: typeof Building2) => {
    return <IconComponent className="h-6 w-6 text-muted-foreground" />;
  };

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case "Major Bank":
        return "default";
      case "Credit Card":
        return "secondary";
      case "Credit Union":
        return "outline";
      case "Online Bank":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Connect Bank Account
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Connect Your Bank Account
          </DialogTitle>
          <DialogDescription>
            Securely connect your bank accounts to import transactions and track
            your finances. We use bank-level security to protect your
            information.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for your bank or financial institution..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/15 border border-destructive/20 rounded-lg">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm text-destructive">{error}</span>
            </div>
          )}

          {/* Selected Bank & Connect Button */}
          {selectedBank ? (
            <div className="flex flex-col items-center gap-4 p-6 bg-green-50 dark:bg-green-950/20 rounded-lg border-2 border-green-200 dark:border-green-800">
              <div className="text-center">
                <h3 className="font-semibold mb-2 text-green-900 dark:text-green-100">
                  Ready to Connect: {selectedBank}
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300 mb-4">
                  Click below to securely connect your {selectedBank} account
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setSelectedBank(null);
                    setSearchQuery("");
                  }}
                  variant="outline"
                  size="lg"
                >
                  Choose Different Bank
                </Button>
                <Button
                  onClick={handleConnectBank}
                  disabled={!ready || isLoading || !linkToken}
                  size="lg"
                  className="min-w-[200px]"
                >
                  {isLoading ? (
                    "Connecting..."
                  ) : (
                    <>
                      <Building2 className="mr-2 h-4 w-4" />
                      Connect {selectedBank}
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 p-6 bg-muted/50 rounded-lg border-2 border-dashed">
              <div className="text-center">
                <h3 className="font-semibold mb-2">Select Your Bank</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Search and select your bank from the list below to continue
                </p>
              </div>
              <Button
                disabled
                size="lg"
                className="min-w-[200px] opacity-50"
              >
                <Building2 className="mr-2 h-4 w-4" />
                Select a Bank First
              </Button>
            </div>
          )}

          {/* Popular Banks Grid */}
          <div>
            <h4 className="font-medium mb-3">Popular Banks & Credit Cards</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredBanks.map((bank) => (
                <button
                  key={bank.name}
                  onClick={() => handleBankSelect(bank.name)}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors text-left ${
                    selectedBank === bank.name
                      ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800"
                      : "hover:bg-muted/50"
                  }`}
                >
                  {getBankIcon(bank.icon)}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{bank.name}</div>
                    <Badge
                      variant={getBadgeVariant(bank.type) as any}
                      className="text-xs"
                    >
                      {bank.type}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>

            {filteredBanks.length === 0 && searchQuery && (
              <div className="text-center py-8 text-muted-foreground">
                <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No banks found matching "{searchQuery}"</p>
                <p className="text-sm">
                  Try the "Connect Bank Account" button above to search all
                  supported institutions.
                </p>
              </div>
            )}
          </div>

          {/* Regional Notice */}
          <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800 mb-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
              <div>
                <h5 className="font-medium text-orange-900 dark:text-orange-100 mb-1">
                  Regional Availability
                </h5>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  Plaid currently supports US, Canada, and UK banks. For Norwegian banks (BankID), 
                  consider alternatives like <strong>Tink</strong>, <strong>GoCardless</strong>, or <strong>Aiia</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <div className="text-blue-600 dark:text-blue-400 mt-0.5">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-7-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Your data is secure
                </h5>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  We use Plaid's bank-level security with 256-bit encryption. We
                  never store your banking credentials and can only access
                  read-only transaction data.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
