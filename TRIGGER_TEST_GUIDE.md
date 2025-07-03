# Testing Trigger.dev Functions - Quick Guide

## 🎯 What You've Got

A **comprehensive test button** on your Financial Accounts page that lets you test all trigger.dev functions without any coding.

## 📍 Where to Find It

1. Navigate to: **`/dashboard/financial`**
2. Look for the **"⚡ Test Trigger.dev"** button in the top-right area
3. It should be right next to your existing "Import Transactions" and "Connect Bank Account" buttons

## 🧪 What You Can Test

### **Transaction Import Tests**
- **Plaid - Last 7 days**: Tests Plaid transaction import for the last week
- **GoCardless - Last 7 days**: Tests GoCardless transaction import for the last week  
- **Both - Last 30 days**: Tests both providers in parallel for the last month

### **Balance Sync Tests**
- **Plaid Balances**: Tests Plaid account balance sync
- **GoCardless Balances**: Tests GoCardless account balance sync
- **Both Providers**: Tests both balance syncs in parallel

### **Bank Connection Tests (Mock Data)**
- **Plaid Connection**: Tests async Plaid account connection flow
- **GoCardless Connection**: Tests async GoCardless account connection flow
- **Both Connections**: Tests both connection flows in parallel

## ✅ How to Test

1. **Click** the "⚡ Test Trigger.dev" button
2. **Choose** any test from the dropdown menu
3. **Watch** for the success toast notification with:
   - ✅ Task started confirmation
   - 🆔 Unique task ID  
   - 🔗 Direct link to Trigger.dev dashboard
4. **Click** the dashboard link to monitor progress in real-time
5. **Check** your Trigger.dev dashboard to see the task running

## 🔍 What Success Looks Like

### **Immediate Feedback (in UI)**
```
✅ Plaid transaction import started (Task: run_01234567890)
🔗 View in Trigger.dev Dashboard
```

### **In Trigger.dev Dashboard**
- Task appears as "RUNNING" ⏳
- Detailed logs show each step
- Final status: "COMPLETED" ✅ or "FAILED" ❌
- Execution time and any error details

## 🚨 Troubleshooting

### **If the button doesn't appear:**
- Make sure you're on `/dashboard/financial`
- Check that the component imported correctly
- Verify trigger.dev integration is set up

### **If tasks fail:**
- Check environment variables are set
- Verify database connections
- Ensure Plaid/GoCardless credentials are valid
- Check trigger.dev service is running

### **If imports succeed but no data:**
- Verify you have connected accounts
- Check date ranges (may be no transactions in selected period)
- Confirm account mappings are correct

### **For connection tests:**
- These use **mock data** and won't create real bank connections
- They test the async trigger.dev task execution flow
- Use them to verify the connection tasks work without real bank auth
- Real connections still need to go through Plaid Link/GoCardless auth flows

## 🔧 Behind the Scenes

When you click a test, it:

1. **Authenticates** your current user and family
2. **Triggers** the background task in trigger.dev
3. **Returns** immediately with task ID (async!)
4. **Task runs** in background with full logging
5. **Completes** with success/failure status

This is exactly how the async architecture will work in production! 🚀

## 📊 Monitoring Tips

- **Watch the logs** for detailed step-by-step progress
- **Check task duration** to understand performance
- **Monitor failures** to identify any issues
- **Test with different date ranges** to verify flexibility

Happy testing! 🎉