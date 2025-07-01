# Plaid Integration Setup Guide

This guide explains how to set up and use the Plaid integration for importing bank transactions and connecting financial accounts.

## Prerequisites

1. **Plaid Account**: Sign up for a free developer account at [Plaid Dashboard](https://dashboard.plaid.com/)
2. **Database**: Ensure your PostgreSQL database is running and accessible

## Setup Steps

### 1. Get Plaid Credentials

1. Log into your [Plaid Dashboard](https://dashboard.plaid.com/)
2. Navigate to **Team Settings** > **Keys**
3. Copy your `client_id` and `sandbox` secret key

### 2. Configure Environment Variables

Add the following to your `.env` file:

```bash
# Plaid Configuration
PLAID_CLIENT_ID="your_plaid_client_id_here"
PLAID_SECRET="your_plaid_secret_key_here"
PLAID_ENV="sandbox"  # Use "sandbox" for development
```

### 3. Database Migration

Run the database migration to create the new Plaid tables:

```bash
npx prisma db push
```

This creates the following new tables:
- `plaid_items` - Stores Plaid connection information
- `plaid_accounts` - Maps Plaid accounts to local financial accounts

### 4. Start the Development Server

```bash
npm run dev
```

## Features

### 🏦 Connect Bank Accounts

1. Navigate to **Financial > Accounts**
2. Click **"Connect Bank Account"** button
3. Search for your bank or select from popular options
4. Follow the secure Plaid Link flow to authorize access
5. Your accounts will be automatically imported

### 📊 Import Transactions

1. After connecting accounts, use the **"Import Transactions"** button
2. Choose your import period:
   - Last 7 days
   - Last 30 days  
   - Last 90 days
3. Transactions are automatically categorized and ready for review

### 🔄 Sync Account Balances

Keep your account balances up-to-date:
1. Click **"Import Transactions"** dropdown
2. Select **"Sync Account Balances"**
3. All connected accounts will be updated with current balances

## Security & Privacy

- **Bank-level Security**: Uses Plaid's 256-bit encryption
- **Read-only Access**: Only transaction and balance data is accessed
- **No Credential Storage**: Banking credentials are never stored in our system
- **Token Management**: Secure access tokens are encrypted and stored safely

## Supported Institutions

The integration supports **thousands** of financial institutions including:

- **Major Banks**: Chase, Bank of America, Wells Fargo, Citi
- **Credit Cards**: Capital One, American Express, Discover
- **Credit Unions**: Navy Federal, PenFed, and local credit unions
- **Online Banks**: Ally, Marcus, and other digital-first banks
- **Investment Accounts**: Fidelity, Schwab, E*TRADE, and more

## Troubleshooting

### Connection Issues

- **"Failed to initialize bank connection"**: Check your Plaid credentials in `.env`
- **"No Plaid accounts connected"**: Ensure you've successfully connected at least one account
- **Database errors**: Verify your database is running and migrations are applied

### Environment Setup

- **Sandbox Mode**: Use `PLAID_ENV="sandbox"` for testing with fake data
- **Development Mode**: Use `PLAID_ENV="development"` for testing with real (limited) data
- **Production Mode**: Use `PLAID_ENV="production"` for live data (requires Plaid approval)

### Common Errors

1. **"Environment variable not found: PLAID_CLIENT_ID"**
   - Add Plaid credentials to your `.env` file

2. **"Failed to connect accounts"**
   - Check that your Plaid secret key matches your environment (sandbox/development/production)

3. **"Transaction import failed"**
   - Ensure accounts are properly connected
   - Check that Plaid items exist in the database

## Development Notes

### File Structure

```
src/
├── actions/
│   └── plaid-actions.ts          # Server actions for Plaid API calls
├── components/
│   └── financial/
│       ├── plaid-link-modal.tsx  # Bank connection modal
│       └── transaction-import-button.tsx  # Import controls
└── prisma/
    └── schema.prisma             # Database schema with Plaid models
```

### Key Components

- **PlaidLinkModal**: Handles bank account connection flow
- **TransactionImportButton**: Provides transaction import controls
- **Plaid Actions**: Server-side functions for API interactions

### Data Flow

1. **Connection**: User connects bank → Plaid Link → Access token stored
2. **Import**: Fetch transactions → Map to local format → Store in database  
3. **Sync**: Update account balances → Refresh financial overview

## Next Steps

After setup, you can:

1. **Connect Test Accounts**: Use Plaid's sandbox credentials to test
2. **Import Sample Data**: Try importing transactions from test accounts
3. **Customize Categories**: Set up transaction categorization rules
4. **Enable Webhooks**: Set up real-time transaction updates (advanced)

## Support

- **Plaid Documentation**: [https://plaid.com/docs/](https://plaid.com/docs/)
- **API Reference**: [https://plaid.com/docs/api/](https://plaid.com/docs/api/)
- **Dashboard**: [https://dashboard.plaid.com/](https://dashboard.plaid.com/)

---

**Note**: This integration uses Plaid's sandbox environment by default. For production use, you'll need to apply for production access through the Plaid Dashboard.