# GoCardless Bank Account Data Implementation

## Overview

This document outlines the implementation of GoCardless Bank Account Data API integration using **direct HTTP API calls** following the official [GoCardless API documentation](https://developer.gocardless.com/bank-account-data/quick-start-guide) and [API reference](https://bankaccountdata.gocardless.com/api/docs).

## ✅ Direct HTTP API Implementation

### Why Direct HTTP Instead of SDK?

We've moved from the `nordigen-node` SDK to direct HTTP API calls for several key reasons:

1. **Official Documentation Alignment**: Direct API calls match exactly what's shown in GoCardless documentation
2. **Better Control**: Full control over request/response handling and error management
3. **TypeScript Safety**: Custom TypeScript interfaces for all API responses
4. **Reduced Dependencies**: No third-party SDK dependencies to maintain
5. **Latest Features**: Always access to the newest API features without waiting for SDK updates

### Implementation Features

#### 1. Official 6-Step API Flow

The implementation follows the exact process from GoCardless documentation:

```typescript
// Step 1: Get Access Token
const accessToken = await generateAccessToken();

// Step 2: Choose a Bank (handled by bank selection UI)

// Step 3: Create End User Agreement
const agreement = await createEndUserAgreement(institutionId, accessToken);

// Step 4: Build a Link (Create Requisition)
const requisition = await createRequisition(params);

// Step 5: List Accounts (after user authorization)
const accounts = await getRequisitionAccounts(requisitionId);

// Step 6: Access Account Data
const details = await getAccountDetails(accountId, accessToken);
const balances = await getAccountBalances(accountId, accessToken);
const transactions = await getAccountTransactions(accountId, accessToken);
```

#### 2. Direct API Endpoints

All API calls use the official GoCardless endpoints:

```typescript
const GOCARDLESS_API_BASE = "https://bankaccountdata.gocardless.com/api/v2";

// Authentication
POST /token/new/

// Institution Management  
GET /institutions/?country={country}

// Agreement Management
POST /agreements/enduser/

// Requisition Management
POST /requisitions/
GET /requisitions/{id}/

// Account Data Access
GET /accounts/{id}/details/
GET /accounts/{id}/balances/
GET /accounts/{id}/transactions/
```

#### 3. TypeScript Type Safety

Complete TypeScript interfaces for all API responses:

```typescript
interface TokenResponse {
  access: string;
  access_expires: number;
  refresh: string;
  refresh_expires: number;
}

interface Institution {
  id: string;
  name: string;
  bic: string;
  transaction_total_days: string;
  countries: string[];
  logo: string;
  max_access_valid_for_days: string;
}

interface AccountDetails {
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

interface Transaction {
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
  // ... and many more fields
}
```

#### 4. Enhanced Error Handling

Comprehensive error handling with detailed feedback:

```typescript
if (!response.ok) {
  const errorText = await response.text();
  throw new Error(`Token generation failed: ${response.status} ${errorText}`);
}
```

- HTTP status code checking
- Detailed error messages from API
- Proper error propagation
- Account-level error isolation

#### 5. Advanced Account Type Mapping

European banking standard account type mapping:

```typescript
const getAccountType = (details: AccountDetails): AccountType => {
  const usage = details.usage?.toLowerCase();
  const product = details.product?.toLowerCase();
  const cashAccountType = details.cashAccountType?.toLowerCase();
  
  if (usage === "priv" || cashAccountType === "cacc") {
    return AccountType.CHECKING;
  } else if (usage === "orga" || product?.includes("business")) {
    return AccountType.CHECKING; // Business checking
  } else if (product?.includes("savings") || cashAccountType === "svgs") {
    return AccountType.SAVINGS;
  } else if (product?.includes("credit") || cashAccountType === "card") {
    return AccountType.CREDIT_CARD;
  }
  // ... more mappings
};
```

#### 6. Intelligent Balance Processing

Prioritizes the most accurate balance type:

```typescript
// Prefer interimAvailable balance, then closingBooked
const availableBalance = balances.find((b: Balance) => b.balanceType === "interimAvailable");
const currentBalance = availableBalance || balances.find((b: Balance) => b.balanceType === "closingBooked") || balances[0];
```

#### 7. Rich Transaction Processing

Handles both booked and pending transactions with full metadata:

```typescript
// Process booked transactions
for (const transaction of bookedTransactions) {
  await processGoCardlessTransaction(transaction, connectedAccount, familyId, false, prisma);
}

// Process pending transactions  
for (const transaction of pendingTransactions) {
  await processGoCardlessTransaction(transaction, connectedAccount, familyId, true, prisma);
}
```

## API Request Examples

### 1. Generate Access Token

```typescript
const response = await fetch(`${GOCARDLESS_API_BASE}/token/new/`, {
  method: "POST",
  headers: {
    "accept": "application/json",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    secret_id: process.env.GOCARDLESS_SECRET_ID!,
    secret_key: process.env.GOCARDLESS_SECRET_KEY!,
  }),
});
```

### 2. Get Institutions by Country

```typescript
const response = await fetch(`${GOCARDLESS_API_BASE}/institutions/?country=NO`, {
  method: "GET",
  headers: {
    "accept": "application/json",
    "Authorization": `Bearer ${accessToken}`,
  },
});
```

### 3. Create End User Agreement

```typescript
const response = await fetch(`${GOCARDLESS_API_BASE}/agreements/enduser/`, {
  method: "POST",
  headers: {
    "accept": "application/json",
    "Content-Type": "application/json",
    "Authorization": `Bearer ${accessToken}`,
  },
  body: JSON.stringify({
    institution_id: institutionId,
    max_historical_days: 90,
    access_valid_for_days: 90,
    access_scope: ["balances", "details", "transactions"],
  }),
});
```

### 4. Create Requisition

```typescript
const response = await fetch(`${GOCARDLESS_API_BASE}/requisitions/`, {
  method: "POST",
  headers: {
    "accept": "application/json",
    "Content-Type": "application/json",
    "Authorization": `Bearer ${accessToken}`,
  },
  body: JSON.stringify({
    redirect: redirectUrl,
    institution_id: institutionId,
    agreement: agreementId,
    reference: `family-${familyId}-${Date.now()}`,
    user_language: "EN",
  }),
});
```

## Environment Configuration

Required environment variables:

```bash
GOCARDLESS_SECRET_ID=your_secret_id_here
GOCARDLESS_SECRET_KEY=your_secret_key_here
```

Get these from the [GoCardless Bank Account Data portal](https://bankaccountdata.gocardless.com/).

## Bank Coverage

The implementation supports 2,500+ banks across 31 European countries including:

### Norwegian Banks (with BankID support)
- DNB Bank (`DNB_DNBANO22`)
- Nordea Norge (`NORDEA_NDEANO22`)
- SpareBank 1 (`SPAREBANK1_SPBANO22`)
- Handelsbanken Norge (`HANDELSBANKEN_HANONO22`)

### Other European Banks
- Revolut (`REVOLUT_REVOGB21`) - Multi-country
- ING Netherlands (`ING_INGBNL2A`)
- Deutsche Bank (`DEUTSCHE_BANK_DEUTDEFF`)
- BNP Paribas (`BNP_PARIBAS_BNPAFRPP`)

## Data Structures

### Transaction Data Response

```json
{
  "transactions": {
    "booked": [
      {
        "transactionId": "2020103000624289-1",
        "debtorName": "John Doe",
        "creditorName": "Merchant Name",
        "debtorAccount": { "iban": "NO9386011117947" },
        "creditorAccount": { "iban": "NO1234567890123" },
        "transactionAmount": { "currency": "NOK", "amount": "123.45" },
        "bookingDate": "2023-12-01",
        "valueDate": "2023-12-01",
        "remittanceInformationUnstructured": "Payment description",
        "bankTransactionCode": "PMNT"
      }
    ],
    "pending": [
      {
        "transactionAmount": { "currency": "NOK", "amount": "-10.00" },
        "valueDate": "2023-12-03",
        "remittanceInformationUnstructured": "Pending payment"
      }
    ]
  }
}
```

### Account Details Response

```json
{
  "account": {
    "resourceId": "account-id-123",
    "iban": "NO9386011117947",
    "bban": "86011117947",
    "currency": "NOK",
    "name": "Main Account",
    "displayName": "John Doe - Main Account",
    "product": "Current Account",
    "cashAccountType": "CACC",
    "usage": "PRIV",
    "ownerName": "John Doe"
  }
}
```

### Balance Data Response

```json
{
  "balances": [
    {
      "balanceAmount": { "currency": "NOK", "amount": "1234.56" },
      "balanceType": "interimAvailable",
      "referenceDate": "2023-12-01"
    },
    {
      "balanceAmount": { "currency": "NOK", "amount": "1200.00" },
      "balanceType": "closingBooked",
      "referenceDate": "2023-11-30"
    }
  ]
}
```

## Error Handling

### API Error Response Format

```json
{
  "summary": "Rate limit exceeded",
  "detail": "The rate limit for this resource is 4/day. Please try again in 3600 seconds",
  "status_code": 429
}
```

### Rate Limiting

GoCardless implements bank-specific rate limits:
- Minimum 4 API calls per day per account
- Separate limits for details, balances, and transactions
- Rate limit headers provided in responses:
  - `HTTP_X_RATELIMIT_LIMIT`
  - `HTTP_X_RATELIMIT_REMAINING`
  - `HTTP_X_RATELIMIT_RESET`

## Testing

Use the sandbox institution for testing:
- Institution ID: `SANDBOXFINANCE_SFIN0000`
- Provides mock data for development
- No real bank connection required

## Migration Notes

### From nordigen-node SDK to Direct HTTP

**Benefits of Migration:**
- ✅ Exact alignment with official API documentation
- ✅ Better TypeScript type safety
- ✅ Reduced dependency footprint
- ✅ More granular error handling
- ✅ Direct access to latest API features

**Breaking Changes:**
- Removed `nordigen-node` dependency
- All API calls now use native `fetch()`
- Custom TypeScript interfaces replace SDK types
- Error handling now uses HTTP response codes directly

### Database Compatibility
- ✅ Existing database schema remains compatible
- ✅ GoCardless data stored in unified BankConnection/ConnectedAccount models
- ✅ Transaction data enriched with European-specific fields

## Next Steps

1. **Webhook Integration**: Add support for GoCardless webhooks for real-time updates
2. **Premium Features**: Integrate GoCardless premium transaction categorization
3. **Enhanced Retry Logic**: Implement intelligent retry for rate-limited requests
4. **Multi-Language Support**: Add support for additional European languages
5. **Compliance Dashboard**: Add PSD2 compliance reporting and audit trails

## Resources

- [GoCardless Bank Account Data Documentation](https://developer.gocardless.com/bank-account-data/overview)
- [API Quick Start Guide](https://developer.gocardless.com/bank-account-data/quick-start-guide)
- [API Reference](https://bankaccountdata.gocardless.com/api/docs)
- [Swagger JSON Specification](https://bankaccountdata.gocardless.com/api/v2/swagger.json)
- [Bank Coverage](https://gocardless.com/bank-account-data/coverage/)
- [GoCardless Bank Account Data Portal](https://bankaccountdata.gocardless.com/)