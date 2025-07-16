# Trigger.dev Integration for Plaid and GoCardless

## Overview

Yes, **you can absolutely use trigger.dev functions for both Plaid and GoCardless operations!** This integration provides several key benefits:

### Benefits

1. **Async Processing**: Long-running operations like transaction imports won't block your UI
2. **Reliability**: Built-in retries and error handling for external API calls
3. **Scheduling**: Easy setup for periodic data syncing (daily, weekly, etc.)
4. **Monitoring**: Better observability for financial data operations
5. **Rate Limiting**: Handle API rate limits more gracefully
6. **Scalability**: Background processing scales independently

## Implementation Status

I've created trigger.dev task implementations for both Plaid and GoCardless:

- ✅ `src/trigger/plaid-tasks.ts` - Plaid operations
- ✅ `src/trigger/gocardless-tasks.ts` - GoCardless operations
- ✅ **Schema Fixed**: Corrected GoCardless to use proper `BankConnection` → `ConnectedAccount` hierarchy

## Available Tasks

### Plaid Tasks (`src/trigger/plaid-tasks.ts`)

1. **`exchangePlaidPublicToken`** - Exchange public token for access token and create accounts
2. **`importPlaidTransactions`** - Import transactions from all connected Plaid accounts  
3. **`syncPlaidBalances`** - Sync account balances from Plaid
4. **`scheduledPlaidBalanceSync`** - Daily scheduled balance sync (6 AM)
5. **`scheduledPlaidTransactionImport`** - Daily scheduled transaction import (7 AM)

### GoCardless Tasks (`src/trigger/gocardless-tasks.ts`)

1. **`completeGoCardlessConnection`** - Complete connection after user authorization
2. **`importGoCardlessTransactions`** - Import transactions from GoCardless accounts
3. **`syncGoCardlessBalances`** - Sync account balances from GoCardless  
4. **`scheduledGoCardlessBalanceSync`** - Daily scheduled balance sync (6 AM)
5. **`scheduledGoCardlessTransactionImport`** - Daily scheduled transaction import (7 AM)

## Usage Examples

### Triggering Tasks from Your Actions

Instead of calling the synchronous functions directly, trigger the async tasks:

```typescript
// Before (synchronous)
import { exchangePublicToken } from "@/actions/plaid-actions";
const result = await exchangePublicToken(publicToken);

// After (asynchronous with trigger.dev)
import { exchangePlaidPublicToken } from "@/trigger/plaid-tasks";

const taskRun = await exchangePlaidPublicToken.trigger({
  publicToken,
  familyId: user.familyId
});

// Optional: Wait for completion if needed
const result = await taskRun.waitForCompletion();
```

### Manual Transaction Import

```typescript
import { importPlaidTransactions } from "@/trigger/plaid-tasks";
import { importGoCardlessTransactions } from "@/trigger/gocardless-tasks";

// Import last 30 days of transactions
const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
const endDate = new Date();

// Trigger both Plaid and GoCardless imports in parallel
await Promise.all([
  importPlaidTransactions.trigger({
    familyId: user.familyId,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString()
  }),
  importGoCardlessTransactions.trigger({
    familyId: user.familyId,
    startDate: startDate.toISOString(), 
    endDate: endDate.toISOString()
  })
]);
```

### One-off Balance Sync

```typescript
import { syncPlaidBalances } from "@/trigger/plaid-tasks";
import { syncGoCardlessBalances } from "@/trigger/gocardless-tasks";

// Trigger balance sync for all provider types
await Promise.all([
  syncPlaidBalances.trigger({ familyId: user.familyId }),
  syncGoCardlessBalances.trigger({ familyId: user.familyId })
]);
```

## Update Frequency Configuration

The scheduled tasks are configured with cron expressions that you can easily modify:

### Current Schedule
- **Balance Sync**: `"0 6 * * *"` (Daily at 6 AM)
- **Transaction Import**: `"0 7 * * *"` (Daily at 7 AM)

### Custom Schedules

You can modify the cron expressions for different update frequencies:

```typescript
// Every 4 hours
cron: "0 */4 * * *"

// Twice daily (6 AM and 6 PM)  
cron: "0 6,18 * * *"

// Every weekday at 8 AM
cron: "0 8 * * 1-5"

// Weekly on Sundays at 2 AM
cron: "0 2 * * 0"
```

## Integration Steps

### 1. Schema Structure (FIXED ✅)

**Issue**: The original implementation incorrectly used `ConnectedAccount` for both the bank connection and individual accounts.

**Solution**: Now properly uses the hierarchical schema:
- `BankConnection` - Overall connection to GoCardless (equivalent to Plaid's `PlaidItem`)
- `ConnectedAccount` - Individual accounts within that connection (equivalent to Plaid's `PlaidAccount`)

### 2. Fix Import Issues

The trigger files have some import path issues that need to be resolved:

```bash
# Generate Prisma client if not already done
npm run db:generate

# Check if @/generated/prisma path exists, if not, update imports to use:
# import { PrismaClient, AccountType } from "@prisma/client";
```

### 3. Update Your Existing Actions

Replace direct function calls with trigger.dev task triggers:

**Before:**
```typescript
// src/actions/plaid-actions.ts
export async function exchangePublicToken(publicToken: string) {
  // Long-running synchronous operation
}
```

**After:**
```typescript
// src/actions/plaid-actions.ts  
import { exchangePlaidPublicToken } from "@/trigger/plaid-tasks";

export async function exchangePublicToken(publicToken: string) {
  const familyId = await getActiveFamilyId();
  if (!familyId) throw new Error("No family found");
  
  // Trigger async task
  const taskRun = await exchangePlaidPublicToken.trigger({
    publicToken,
    familyId
  });
  
  return {
    success: true,
    taskId: taskRun.id,
    message: "Account connection started. You'll be notified when complete."
  };
}
```

### 4. Update UI Components

Handle the async nature in your UI:

```typescript
// Show loading state immediately
const [isConnecting, setIsConnecting] = useState(false);

const handleConnect = async (publicToken: string) => {
  setIsConnecting(true);
  
  try {
    const result = await exchangePublicToken(publicToken);
    toast.success("Connection started! Processing in background...");
    
    // Optionally poll for completion or use webhooks
    
  } catch (error) {
    toast.error("Failed to start connection");
  } finally {
    setIsConnecting(false);
  }
};
```

### 5. Environment Variables

Ensure all required environment variables are set:

```env
# Plaid
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_secret

# GoCardless  
GOCARDLESS_SECRET_ID=your_gocardless_secret_id
GOCARDLESS_SECRET_KEY=your_gocardless_secret_key

# Trigger.dev
TRIGGER_SECRET_KEY=your_trigger_secret_key
```

### 6. Deploy Trigger Functions

Deploy your trigger functions:

```bash
# Deploy to trigger.dev
npx trigger.dev@latest deploy
```

## Monitoring and Observability

With trigger.dev, you get:

1. **Dashboard**: View all task runs, success/failure rates
2. **Logs**: Detailed logging for each operation  
3. **Retries**: Automatic retries with exponential backoff
4. **Alerts**: Get notified of failed operations
5. **Metrics**: Track performance and success rates

## Error Handling

The trigger functions include comprehensive error handling:

- **Retry Logic**: Failed operations are automatically retried
- **Detailed Logging**: All operations are logged with context
- **Graceful Degradation**: Individual account failures don't stop the entire process
- **User Notifications**: Users can be notified of completion/failures

## Testing

Test your trigger functions locally:

```bash
# Start trigger.dev dev server
npx trigger.dev@latest dev

# Trigger a test run
curl -X POST http://localhost:3040/api/trigger \
  -H "Content-Type: application/json" \
  -d '{"taskId": "import-plaid-transactions", "payload": {"familyId": "test-family"}}'
```

## Test Button Added ✅

I've added a **"Test Trigger.dev"** button to your Financial Accounts page that allows you to test all the trigger.dev functions:

### **Location**: `/dashboard/financial` 
### **Features**:
- ⚡ **Transaction Import Tests**: Test Plaid, GoCardless, or both providers (7-30 days)
- 🔄 **Balance Sync Tests**: Test balance syncing for individual or both providers
- 🔗 **Bank Connection Tests**: Test async connection flows with mock data (NEW!)
- 📊 **Real-time Feedback**: Shows task IDs and links to Trigger.dev dashboard
- 🎯 **Loading States**: Visual feedback for each operation
- 🔗 **Dashboard Links**: Direct links to monitor tasks in Trigger.dev

### **How to Test**:
1. Navigate to `/dashboard/financial`
2. Click the **"⚡ Test Trigger.dev"** button (next to Import Transactions)
3. Choose any test operation from the dropdown
4. Watch the toast notifications for task IDs and dashboard links
5. Monitor progress in the Trigger.dev dashboard

## Next Steps

1. ✅ **Schema Structure**: Fixed GoCardless to use proper BankConnection → ConnectedAccount hierarchy
2. ✅ **Test Button**: Added comprehensive test interface on financial page
3. **Fix Import Paths**: Resolve the Prisma and trigger.dev import issues
4. **Update Actions**: Replace synchronous calls with trigger.dev tasks
5. **Update UI**: Handle async operations in your frontend
6. **Deploy**: Deploy trigger functions to production
7. **Monitor**: Set up alerts and monitoring

This architecture will make your financial data operations much more robust, scalable, and user-friendly!