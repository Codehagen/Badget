# GoCardless Bank Account Data Implementation

## Overview

This document outlines the implementation of GoCardless Bank Account Data API integration, following the official [GoCardless API documentation](https://developer.gocardless.com/bank-account-data/quick-start-guide) and [API reference](https://bankaccountdata.gocardless.com/api/docs).

## Updated Implementation Features

### 1. Official API Flow Compliance

The implementation now follows the exact 6-step process outlined in the GoCardless documentation:

1. **Get Access Token** - Generate JWT tokens for API authentication
2. **Choose a Bank** - Select from 2,500+ European banks
3. **Create End User Agreement** - Define access scope and duration
4. **Build a Link** - Create requisition for bank connection
5. **List Accounts** - Retrieve connected account IDs
6. **Access Account Data** - Fetch details, balances, and transactions

### 2. Enhanced Token Management

```typescript
async function generateAccessToken() {
  const tokenData = await nordigenClient.generateToken();
  return tokenData.access;
}
```

- Proper JWT token generation before each API call
- Fresh tokens for reliable API access
- Error handling for token generation failures

### 3. End User Agreements

```typescript
const agreement = await nordigenClient.agreement.createEuaAgreement({
  institutionId: bank.institutionId.gocardless,
  maxHistoricalDays: 90, // 90 days of transaction history
  accessValidForDays: 90, // 90 days of account access
  accessScope: ["balances", "details", "transactions"]
});
```

- Configurable access periods and scope
- Compliant with PSD2 regulations
- Better user consent management

### 4. Improved Account Type Mapping

```typescript
const getAccountType = (details: any): AccountType => {
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
  } else if (product?.includes("loan")) {
    return AccountType.LOAN;
  } else if (product?.includes("investment")) {
    return AccountType.INVESTMENT;
  }
  return AccountType.OTHER;
};
```

- Maps European account types (CACC, SVGS, etc.)
- Handles business vs personal accounts
- Supports IBAN and BBAN account formats

### 5. Advanced Balance Handling

```typescript
// Prefer interimAvailable balance, then closingBooked
const availableBalance = balances.find((b: any) => b.balanceType === "interimAvailable");
const currentBalance = availableBalance || balances.find((b: any) => b.balanceType === "closingBooked") || balances[0];
```

- Prioritizes real-time available balance
- Falls back to closing balance if needed
- Handles multiple balance types per account

### 6. Enhanced Transaction Processing

```typescript
// Process both booked and pending transactions
const bookedTransactions = transactionData.transactions?.booked || [];
const pendingTransactions = transactionData.transactions?.pending || [];

// Process booked transactions
for (const transaction of bookedTransactions) {
  await processGoCardlessTransaction(transaction, connectedAccount, familyId, false, prisma);
}

// Process pending transactions
for (const transaction of pendingTransactions) {
  await processGoCardlessTransaction(transaction, connectedAccount, familyId, true, prisma);
}
```

- Separates booked vs pending transactions
- Rich transaction metadata extraction
- IBAN and counterparty information storage

### 7. Comprehensive Error Handling

```typescript
throw new Error(`Failed to create bank connection: ${error instanceof Error ? error.message : 'Unknown error'}`);
```

- Detailed error messages for debugging
- Graceful handling of individual account failures
- Continuation of processing when some accounts fail

## API Endpoints Used

### Authentication
- `POST /api/v2/token/new/` - Generate access tokens

### Institution Management
- `GET /api/v2/institutions/?country={country}` - List banks by country

### Agreement Management
- `POST /api/v2/agreements/enduser/` - Create end user agreements

### Requisition Management
- `POST /api/v2/requisitions/` - Create bank connection requisitions
- `GET /api/v2/requisitions/{id}/` - Get requisition status and accounts

### Account Data Access
- `GET /api/v2/accounts/{id}/details/` - Get account details
- `GET /api/v2/accounts/{id}/balances/` - Get account balances
- `GET /api/v2/accounts/{id}/transactions/` - Get transaction history

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
- DNB Bank
- Nordea Norge
- SpareBank 1
- Handelsbanken Norge

### Other European Banks
- Revolut (multi-country)
- ING (Netherlands, Germany)
- Santander (Spain, UK)
- Deutsche Bank (Germany)
- BNP Paribas (France)

## Data Structure

### Transaction Data
GoCardless provides rich European transaction data:

```typescript
{
  transactionId: "2020103000624289-1",
  debtorName: "John Doe",
  creditorName: "Merchant Name",
  debtorAccount: { iban: "NO9386011117947" },
  creditorAccount: { iban: "NO1234567890123" },
  transactionAmount: { currency: "NOK", amount: "123.45" },
  bookingDate: "2023-12-01",
  valueDate: "2023-12-01",
  remittanceInformationUnstructured: "Payment description",
  bankTransactionCode: "PMNT"
}
```

### Account Data
European-standard account information:

```typescript
{
  iban: "NO9386011117947",
  bban: "86011117947",
  name: "Main Account",
  product: "Current Account",
  cashAccountType: "CACC", // Current Account
  usage: "PRIV", // Private use
  ownerName: "John Doe"
}
```

### Balance Data
Multiple balance types:

```typescript
{
  balances: [
    {
      balanceAmount: { currency: "NOK", amount: "1234.56" },
      balanceType: "interimAvailable", // Real-time available
      referenceDate: "2023-12-01"
    },
    {
      balanceAmount: { currency: "NOK", amount: "1200.00" },
      balanceType: "closingBooked", // End of day balance
      referenceDate: "2023-11-30"
    }
  ]
}
```

## Rate Limiting

GoCardless implements bank-specific rate limits:
- Minimum 4 API calls per day per account
- Separate limits for details, balances, and transactions
- Rate limit headers provided in responses

## Testing

Use the sandbox institution for testing:
- Institution ID: `SANDBOXFINANCE_SFIN0000`
- Provides mock data for development
- No real bank connection required

## Migration Notes

### From Previous Implementation
- Token management now follows official patterns
- End user agreements are properly created
- Balance handling improved for European standards
- Transaction processing enhanced for booked/pending separation
- Error handling provides more detailed feedback

### Database Compatibility
- Existing database schema remains compatible
- GoCardless data stored in unified BankConnection/ConnectedAccount models
- Transaction data enriched with European-specific fields

## Next Steps

1. **Enhanced Error Recovery**: Implement retry logic for rate-limited requests
2. **Webhook Integration**: Add support for GoCardless webhooks for real-time updates
3. **Premium Features**: Integrate GoCardless premium transaction categorization
4. **Multi-Language Support**: Add support for additional European languages
5. **Compliance Features**: Add PSD2 compliance reporting and audit trails

## Resources

- [GoCardless Bank Account Data Documentation](https://developer.gocardless.com/bank-account-data/overview)
- [API Quick Start Guide](https://developer.gocardless.com/bank-account-data/quick-start-guide)
- [API Reference](https://bankaccountdata.gocardless.com/api/docs)
- [Bank Coverage](https://gocardless.com/bank-account-data/coverage/)
- [Nordigen Node.js SDK](https://github.com/nordigen/nordigen-node)