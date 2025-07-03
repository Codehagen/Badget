# Financial Integrations Guide: Plaid & GoCardless

## Overview

Badget integrates with two major financial data providers to offer comprehensive banking connectivity across different regions:

- **Plaid**: Covers US, UK, and Canadian financial institutions
- **GoCardless**: Covers European financial institutions (31 countries, 2,500+ banks)

Both integrations provide secure, read-only access to bank accounts, transactions, and balances using bank-level encryption and OAuth-style authentication flows.

## 🏦 Plaid Integration

### Coverage & Capabilities
- **Geographic Coverage**: United States, United Kingdom, Canada
- **Institution Support**: 12,000+ financial institutions
- **Data Access**: Account details, balances, transactions, investment data
- **Real-time Updates**: Webhook support for live data sync

### How Plaid Works

#### 1. **Connection Flow**
```
User → Select Bank → Plaid Link → Bank Login → Account Selection → Success
```

#### 2. **Technical Architecture**
- **Frontend**: React component using `react-plaid-link`
- **Backend**: Node.js SDK with secure token exchange
- **Database**: Stores access tokens and account mappings

#### 3. **API Implementation**
```typescript
// Step 1: Create Link Token
const linkToken = await plaidClient.linkTokenCreate({
  user: { client_user_id: userId },
  client_name: "Badget",
  products: ['transactions', 'accounts'],
  country_codes: ['US', 'GB', 'CA'],
  language: 'en',
});

// Step 2: Exchange Public Token
const response = await plaidClient.itemPublicTokenExchange({
  public_token: publicToken,
});

// Step 3: Fetch Account Data
const accountsResponse = await plaidClient.accountsGet({
  access_token: accessToken,
});

// Step 4: Import Transactions
const transactionsResponse = await plaidClient.transactionsGet({
  access_token: accessToken,
  start_date: startDate,
  end_date: endDate,
});
```

#### 4. **Data Structures**
```typescript
interface PlaidAccount {
  account_id: string;
  name: string;
  type: 'depository' | 'credit' | 'investment';
  subtype: 'checking' | 'savings' | 'credit card';
  balances: {
    available: number;
    current: number;
    limit?: number;
  };
}

interface PlaidTransaction {
  transaction_id: string;
  amount: number;
  date: string;
  name: string;
  merchant_name?: string;
  category: string[];
  account_id: string;
  pending: boolean;
}
```

#### 5. **Security Features**
- **Encrypted Tokens**: All access tokens encrypted at rest
- **No Credential Storage**: User credentials never stored locally
- **Bank-Level Security**: 256-bit encryption through Plaid
- **Read-Only Access**: Only transaction and balance data accessed

## 🇪🇺 GoCardless Integration

### Coverage & Capabilities
- **Geographic Coverage**: 31 European countries including Norway, UK, Germany, France
- **Institution Support**: 2,500+ banks with PSD2 compliance
- **Data Access**: Account details, balances, transactions (90 days historical)
- **Authentication**: Bank-specific methods (BankID, Mobile Banking, etc.)

### How GoCardless Works

#### 1. **Connection Flow (6-Step Process)**
```
User → Select Bank → Create Agreement → Bank Authorization → Callback → Account Import
```

#### 2. **Technical Architecture**
- **Frontend**: Custom modal with bank selection
- **Backend**: Direct HTTP API calls (no SDK)
- **Database**: Unified storage with Plaid data

#### 3. **API Implementation**
```typescript
// Step 1: Generate Access Token
const tokenResponse = await fetch(`${GOCARDLESS_API_BASE}/token/new/`, {
  method: "POST",
  headers: {
    "accept": "application/json",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    secret_id: process.env.GOCARDLESS_SECRET_ID,
    secret_key: process.env.GOCARDLESS_SECRET_KEY,
  }),
});

// Step 2: Find Institution
const institutionsResponse = await fetch(
  `${GOCARDLESS_API_BASE}/institutions/?country=NO`,
  {
    headers: {
      "Authorization": `Bearer ${accessToken}`,
    },
  }
);

// Step 3: Create End User Agreement
const agreementResponse = await fetch(
  `${GOCARDLESS_API_BASE}/agreements/enduser/`,
  {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      institution_id: institutionId,
      max_historical_days: 90,
      access_valid_for_days: 90,
      access_scope: ["balances", "details", "transactions"],
    }),
  }
);

// Step 4: Create Requisition (Build Link)
const requisitionResponse = await fetch(
  `${GOCARDLESS_API_BASE}/requisitions/`,
  {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      redirect: "http://localhost:3000/dashboard/financial/callback",
      institution_id: institutionId,
      agreement: agreementId,
      reference: `family-${familyId}-${Date.now()}`,
      user_language: "EN",
    }),
  }
);

// Step 5: List Accounts (after callback)
const accountsResponse = await fetch(
  `${GOCARDLESS_API_BASE}/requisitions/${requisitionId}/`,
  {
    headers: {
      "Authorization": `Bearer ${accessToken}`,
    },
  }
);

// Step 6: Access Account Data
const detailsResponse = await fetch(
  `${GOCARDLESS_API_BASE}/accounts/${accountId}/details/`,
  {
    headers: {
      "Authorization": `Bearer ${accessToken}`,
    },
  }
);
```

#### 4. **Data Structures**
```typescript
interface GoCardlessAccount {
  resourceId: string;
  iban?: string;
  bban?: string;
  currency: string;
  name?: string;
  displayName?: string;
  product?: string;
  cashAccountType?: string;
  usage?: string;
  ownerName?: string;
}

interface GoCardlessTransaction {
  transactionId: string;
  debtorName?: string;
  creditorName?: string;
  transactionAmount: {
    amount: string;
    currency: string;
  };
  bookingDate?: string;
  valueDate?: string;
  remittanceInformationUnstructured?: string;
  bankTransactionCode?: string;
}
```

#### 5. **European Banking Standards**
- **PSD2 Compliance**: Follows European payment services directive
- **IBAN Support**: International Bank Account Number handling
- **Multi-Currency**: Supports EUR, NOK, GBP, SEK, DKK, etc.
- **Bank-Specific Auth**: BankID (Norway), Mobile Banking, etc.

## 🔄 Unified User Experience

### Connection Modal
Both integrations use a unified modal interface:
```typescript
// src/components/financial/plaid-link-modal.tsx
- Bank search functionality
- Popular banks grid
- Provider-specific flows
- Error handling
- Success feedback
```

### Transaction Import
Single button handles both providers:
```typescript
// src/components/financial/transaction-import-button.tsx
- Import periods: 7, 30, 90 days
- Multi-provider support
- Balance synchronization
- Unified success messages
```

### Account Display
Connected accounts show provider information:
```typescript
// Account grid shows:
- Provider badges (Plaid/GoCardless)
- Connection status
- Auto-sync indicators
- Account types and balances
```

## 🗄️ Database Schema

### Unified Data Model
Both integrations store data in the same database structure:

```sql
-- Financial Accounts (unified)
CREATE TABLE FinancialAccount (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- CHECKING, SAVINGS, CREDIT_CARD, etc.
  balance REAL NOT NULL,
  currency TEXT NOT NULL,
  familyId TEXT NOT NULL,
  -- ... other fields
);

-- Bank Connections (provider-specific)
CREATE TABLE BankConnection (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL, -- 'plaid' or 'gocardless'
  providerItemId TEXT NOT NULL,
  accessToken TEXT NOT NULL,
  familyId TEXT NOT NULL,
  -- ... other fields
);

-- Connected Accounts (mapping)
CREATE TABLE ConnectedAccount (
  id TEXT PRIMARY KEY,
  bankConnectionId TEXT NOT NULL,
  financialAccountId TEXT NOT NULL,
  providerAccountId TEXT NOT NULL,
  -- ... other fields
);

-- Transactions (unified)
CREATE TABLE Transaction (
  id TEXT PRIMARY KEY,
  amount REAL NOT NULL,
  description TEXT NOT NULL,
  date TEXT NOT NULL,
  pending BOOLEAN NOT NULL,
  financialAccountId TEXT NOT NULL,
  -- ... other fields
);
```

## 🔧 Configuration

### Environment Variables
```bash
# Plaid Configuration
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_secret
PLAID_ENV=sandbox # sandbox/development/production

# GoCardless Configuration
GOCARDLESS_SECRET_ID=your_gocardless_secret_id
GOCARDLESS_SECRET_KEY=your_gocardless_secret_key
```

### Provider Setup
1. **Plaid**: Get credentials from [Plaid Dashboard](https://dashboard.plaid.com/)
2. **GoCardless**: Get credentials from [GoCardless Portal](https://bankaccountdata.gocardless.com/)

## 🌍 Regional Coverage

### Plaid Coverage
- **United States**: 12,000+ institutions
- **United Kingdom**: Major banks and building societies
- **Canada**: Major banks and credit unions

### GoCardless Coverage
- **Nordic Countries**: Norway (BankID), Sweden, Denmark, Finland
- **Western Europe**: Germany, France, Netherlands, Belgium, Austria
- **Southern Europe**: Italy, Spain, Portugal
- **Eastern Europe**: Poland, Czech Republic, Hungary
- **Other**: Ireland, Switzerland, Luxembourg, Estonia, Latvia, Lithuania

## 🔀 Data Flow Comparison

### Plaid Data Flow
```
User → Plaid Link → Bank Login → Token Exchange → API Calls → Data Storage
```

### GoCardless Data Flow
```
User → Bank Selection → Agreement → Bank Auth → Callback → API Calls → Data Storage
```

## 🚦 Error Handling

### Plaid Error Scenarios
- **Invalid credentials**: User re-authentication required
- **Account changes**: MFA or account updates needed
- **API limits**: Rate limiting and retry logic
- **Connection issues**: Network timeout handling

### GoCardless Error Scenarios
- **Rate limiting**: Bank-specific limits (4+ calls/day)
- **Agreement expiry**: 90-day access token renewal
- **Bank maintenance**: Institution-specific downtimes
- **Callback failures**: Redirect and localStorage issues

## 🔄 Maintenance & Updates

### Plaid Maintenance
- **SDK Updates**: Regular updates via npm
- **Webhook Integration**: Real-time account updates
- **Product Evolution**: New features through SDK

### GoCardless Maintenance
- **API Updates**: Direct HTTP calls stay current
- **Bank Changes**: Institution list updates
- **Compliance**: PSD2 regulation adherence

## 📊 Performance Characteristics

### Plaid Performance
- **Initial Connection**: ~30 seconds
- **Transaction Import**: ~5-10 seconds for 1,000 transactions
- **Balance Sync**: ~2-3 seconds per account

### GoCardless Performance
- **Initial Connection**: ~45-60 seconds (includes bank auth)
- **Transaction Import**: ~8-12 seconds for 1,000 transactions
- **Balance Sync**: ~3-5 seconds per account

## 🎯 Best Practices

### Development Guidelines
1. **Error Handling**: Always handle API failures gracefully
2. **Rate Limiting**: Implement exponential backoff for retries
3. **Data Validation**: Validate all incoming financial data
4. **Security**: Never log sensitive financial information
5. **Testing**: Use sandbox environments for development

### User Experience
1. **Loading States**: Show progress during connections
2. **Error Messages**: Provide clear, actionable error messages
3. **Success Feedback**: Confirm successful operations
4. **Data Freshness**: Indicate when data was last updated

---

## 📚 Additional Resources

- **Plaid Documentation**: [https://plaid.com/docs/](https://plaid.com/docs/)
- **GoCardless Documentation**: [https://developer.gocardless.com/bank-account-data/](https://developer.gocardless.com/bank-account-data/)
- **PSD2 Compliance**: [https://ec.europa.eu/info/law/payment-services-psd-2/](https://ec.europa.eu/info/law/payment-services-psd-2/)

This unified integration provides users with comprehensive banking connectivity regardless of their geographic location, ensuring a seamless financial management experience across both US/UK and European banking systems. 