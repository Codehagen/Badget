import { Building2, CreditCard, Banknote } from "lucide-react";

export type BankProvider = "PLAID" | "GOCARDLESS";

export interface BankInfo {
  id: string;
  name: string;
  displayName: string;
  icon: typeof Building2;
  type: "Major Bank" | "Credit Card" | "Credit Union" | "Online Bank" | "Regional Bank";
  country: string;
  providers: BankProvider[];
  logo?: string;
  institutionId?: {
    plaid?: string;
    gocardless?: string;
  };
}

// Comprehensive bank database with provider support
export const BANKS: BankInfo[] = [
  // US Banks (Plaid)
  {
    id: "chase",
    name: "Chase",
    displayName: "Chase Bank",
    icon: Building2,
    type: "Major Bank",
    country: "US",
    providers: ["PLAID"],
    institutionId: { plaid: "ins_56" }
  },
  {
    id: "bank_of_america",
    name: "Bank of America",
    displayName: "Bank of America",
    icon: Building2,
    type: "Major Bank",
    country: "US",
    providers: ["PLAID"],
    institutionId: { plaid: "ins_3" }
  },
  {
    id: "wells_fargo",
    name: "Wells Fargo",
    displayName: "Wells Fargo",
    icon: Building2,
    type: "Major Bank",
    country: "US",
    providers: ["PLAID"],
    institutionId: { plaid: "ins_4" }
  },
  {
    id: "citi",
    name: "Citi",
    displayName: "Citibank",
    icon: Building2,
    type: "Major Bank",
    country: "US",
    providers: ["PLAID"],
    institutionId: { plaid: "ins_6" }
  },
  {
    id: "capital_one",
    name: "Capital One",
    displayName: "Capital One",
    icon: CreditCard,
    type: "Credit Card",
    country: "US",
    providers: ["PLAID"],
    institutionId: { plaid: "ins_128026" }
  },
  {
    id: "amex",
    name: "American Express",
    displayName: "American Express",
    icon: CreditCard,
    type: "Credit Card",
    country: "US",
    providers: ["PLAID"],
    institutionId: { plaid: "ins_2" }
  },

  // Norwegian Banks (GoCardless)
  {
    id: "dnb",
    name: "DNB",
    displayName: "DNB Bank",
    icon: Building2,
    type: "Major Bank",
    country: "NO",
    providers: ["GOCARDLESS"],
    institutionId: { gocardless: "DNB_DNBANOKKXXX" }
  },
  {
    id: "nordea_no",
    name: "Nordea",
    displayName: "Nordea Bank Norge",
    icon: Building2,
    type: "Major Bank",
    country: "NO",
    providers: ["GOCARDLESS"],
    institutionId: { gocardless: "NORDEA_NDEANOKK" }
  },
  {
    id: "sparebank1",
    name: "SpareBank 1",
    displayName: "SpareBank 1",
    icon: Building2,
    type: "Regional Bank",
    country: "NO",
    providers: ["GOCARDLESS"],
    institutionId: { gocardless: "SPAREBANK1_SHEDNO22" }
  },
  {
    id: "handelsbanken_no",
    name: "Handelsbanken",
    displayName: "Handelsbanken Norge",
    icon: Building2,
    type: "Major Bank",
    country: "NO",
    providers: ["GOCARDLESS"],
    institutionId: { gocardless: "HANDELSBANKEN_HANDSESS" }
  },

  // Swedish Banks (GoCardless)
  {
    id: "nordea_se",
    name: "Nordea",
    displayName: "Nordea Bank Sverige",
    icon: Building2,
    type: "Major Bank",
    country: "SE",
    providers: ["GOCARDLESS"],
    institutionId: { gocardless: "NORDEA_NDEASESS" }
  },
  {
    id: "swedbank",
    name: "Swedbank",
    displayName: "Swedbank",
    icon: Building2,
    type: "Major Bank",
    country: "SE",
    providers: ["GOCARDLESS"],
    institutionId: { gocardless: "SWEDBANK_SWEDSESS" }
  },
  {
    id: "seb",
    name: "SEB",
    displayName: "Skandinaviska Enskilda Banken",
    icon: Building2,
    type: "Major Bank",
    country: "SE",
    providers: ["GOCARDLESS"],
    institutionId: { gocardless: "SEB_ESSESESS" }
  },

  // Danish Banks (GoCardless)
  {
    id: "danske_bank",
    name: "Danske Bank",
    displayName: "Danske Bank",
    icon: Building2,
    type: "Major Bank",
    country: "DK",
    providers: ["GOCARDLESS"],
    institutionId: { gocardless: "DANSKE_BANK_DABADKKK" }
  },
  {
    id: "nordea_dk",
    name: "Nordea",
    displayName: "Nordea Bank Danmark",
    icon: Building2,
    type: "Major Bank",
    country: "DK",
    providers: ["GOCARDLESS"],
    institutionId: { gocardless: "NORDEA_NDEADKKK" }
  },

  // UK Banks (Both providers)
  {
    id: "lloyds",
    name: "Lloyds Bank",
    displayName: "Lloyds Bank",
    icon: Building2,
    type: "Major Bank",
    country: "UK",
    providers: ["PLAID", "GOCARDLESS"],
    institutionId: { 
      plaid: "ins_109508",
      gocardless: "LLOYDS_BANK_LOYDGB21"
    }
  },
  {
    id: "barclays",
    name: "Barclays",
    displayName: "Barclays",
    icon: Building2,
    type: "Major Bank",
    country: "UK",
    providers: ["PLAID", "GOCARDLESS"],
    institutionId: { 
      plaid: "ins_109509",
      gocardless: "BARCLAYS_BARCGB22"
    }
  },
  {
    id: "hsbc",
    name: "HSBC",
    displayName: "HSBC UK",
    icon: Building2,
    type: "Major Bank",
    country: "UK",
    providers: ["PLAID", "GOCARDLESS"],
    institutionId: { 
      plaid: "ins_109511",
      gocardless: "HSBC_HBUKGB4B"
    }
  },

  // German Banks (GoCardless)
  {
    id: "deutsche_bank",
    name: "Deutsche Bank",
    displayName: "Deutsche Bank",
    icon: Building2,
    type: "Major Bank",
    country: "DE",
    providers: ["GOCARDLESS"],
    institutionId: { gocardless: "DEUTSCHE_BANK_DEUTDEFF" }
  },
  {
    id: "commerzbank",
    name: "Commerzbank",
    displayName: "Commerzbank",
    icon: Building2,
    type: "Major Bank",
    country: "DE",
    providers: ["GOCARDLESS"],
    institutionId: { gocardless: "COMMERZBANK_COBADEFF" }
  },

  // French Banks (GoCardless)
  {
    id: "bnp_paribas",
    name: "BNP Paribas",
    displayName: "BNP Paribas",
    icon: Building2,
    type: "Major Bank",
    country: "FR",
    providers: ["GOCARDLESS"],
    institutionId: { gocardless: "BNP_PARIBAS_BNPAFRPP" }
  },
  {
    id: "credit_agricole",
    name: "Crédit Agricole",
    displayName: "Crédit Agricole",
    icon: Building2,
    type: "Major Bank",
    country: "FR",
    providers: ["GOCARDLESS"],
    institutionId: { gocardless: "CREDIT_AGRICOLE_AGRIFRPP" }
  },
];

// Helper functions
export function getBanksByCountry(country: string): BankInfo[] {
  return BANKS.filter(bank => bank.country === country);
}

export function getBanksByProvider(provider: BankProvider): BankInfo[] {
  return BANKS.filter(bank => bank.providers.includes(provider));
}

export function searchBanks(query: string): BankInfo[] {
  const lowercaseQuery = query.toLowerCase();
  return BANKS.filter(bank => 
    bank.name.toLowerCase().includes(lowercaseQuery) ||
    bank.displayName.toLowerCase().includes(lowercaseQuery) ||
    bank.type.toLowerCase().includes(lowercaseQuery) ||
    bank.country.toLowerCase().includes(lowercaseQuery)
  );
}

export function getBankById(id: string): BankInfo | undefined {
  return BANKS.find(bank => bank.id === id);
}

// Country mappings
export const COUNTRY_NAMES: Record<string, string> = {
  "US": "United States",
  "NO": "Norway",
  "SE": "Sweden", 
  "DK": "Denmark",
  "UK": "United Kingdom",
  "DE": "Germany",
  "FR": "France",
};

export const PROVIDER_NAMES: Record<BankProvider, string> = {
  "PLAID": "Plaid",
  "GOCARDLESS": "GoCardless",
};