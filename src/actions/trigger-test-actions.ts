"use server";

import { getCurrentAppUser } from "./user-actions";

// Import the trigger.dev tasks
import { 
  importPlaidTransactions,
  syncPlaidBalances,
  exchangePlaidPublicToken
} from "@/trigger/plaid-tasks";

import {
  importGoCardlessTransactions,
  syncGoCardlessBalances,
  completeGoCardlessConnection
} from "@/trigger/gocardless-tasks";

async function getActiveFamilyId(): Promise<string | null> {
  const appUser = await getCurrentAppUser();
  return appUser?.familyMemberships[0]?.familyId || null;
}

/**
 * Test trigger.dev Plaid transaction import
 */
export async function testTriggerPlaidTransactionImport(days: number = 30) {
  try {
    const familyId = await getActiveFamilyId();
    if (!familyId) {
      throw new Error("User not authenticated or no family found");
    }

    const endDate = new Date();
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const taskRun = await importPlaidTransactions.trigger({
      familyId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });

    return {
      success: true,
      taskId: taskRun.id,
      message: `✅ Plaid transaction import started (Task: ${taskRun.id})`,
      url: `https://trigger.dev/dashboard/runs/${taskRun.id}`, // Assuming standard trigger.dev dashboard URL
    };
  } catch (error) {
    console.error("Error triggering Plaid transaction import:", error);
    throw new Error(`Failed to trigger Plaid transaction import: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Test trigger.dev GoCardless transaction import
 */
export async function testTriggerGoCardlessTransactionImport(days: number = 30) {
  try {
    const familyId = await getActiveFamilyId();
    if (!familyId) {
      throw new Error("User not authenticated or no family found");
    }

    const endDate = new Date();
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const taskRun = await importGoCardlessTransactions.trigger({
      familyId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });

    return {
      success: true,
      taskId: taskRun.id,
      message: `✅ GoCardless transaction import started (Task: ${taskRun.id})`,
      url: `https://trigger.dev/dashboard/runs/${taskRun.id}`,
    };
  } catch (error) {
    console.error("Error triggering GoCardless transaction import:", error);
    throw new Error(`Failed to trigger GoCardless transaction import: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Test trigger.dev Plaid balance sync
 */
export async function testTriggerPlaidBalanceSync() {
  try {
    const familyId = await getActiveFamilyId();
    if (!familyId) {
      throw new Error("User not authenticated or no family found");
    }

    const taskRun = await syncPlaidBalances.trigger({
      familyId,
    });

    return {
      success: true,
      taskId: taskRun.id,
      message: `✅ Plaid balance sync started (Task: ${taskRun.id})`,
      url: `https://trigger.dev/dashboard/runs/${taskRun.id}`,
    };
  } catch (error) {
    console.error("Error triggering Plaid balance sync:", error);
    throw new Error(`Failed to trigger Plaid balance sync: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Test trigger.dev GoCardless balance sync
 */
export async function testTriggerGoCardlessBalanceSync() {
  try {
    const familyId = await getActiveFamilyId();
    if (!familyId) {
      throw new Error("User not authenticated or no family found");
    }

    const taskRun = await syncGoCardlessBalances.trigger({
      familyId,
    });

    return {
      success: true,
      taskId: taskRun.id,
      message: `✅ GoCardless balance sync started (Task: ${taskRun.id})`,
      url: `https://trigger.dev/dashboard/runs/${taskRun.id}`,
    };
  } catch (error) {
    console.error("Error triggering GoCardless balance sync:", error);
    throw new Error(`Failed to trigger GoCardless balance sync: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Test triggering both providers in parallel
 */
export async function testTriggerBothProvidersTransactionImport(days: number = 30) {
  try {
    const familyId = await getActiveFamilyId();
    if (!familyId) {
      throw new Error("User not authenticated or no family found");
    }

    const endDate = new Date();
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Trigger both providers in parallel
    const [plaidTaskRun, goCardlessTaskRun] = await Promise.allSettled([
      importPlaidTransactions.trigger({
        familyId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      }),
      importGoCardlessTransactions.trigger({
        familyId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      }),
    ]);

    const results = [];
    
    if (plaidTaskRun.status === "fulfilled") {
      results.push(`Plaid: ${plaidTaskRun.value.id}`);
    } else {
      results.push(`Plaid: Failed - ${plaidTaskRun.reason}`);
    }
    
    if (goCardlessTaskRun.status === "fulfilled") {
      results.push(`GoCardless: ${goCardlessTaskRun.value.id}`);
    } else {
      results.push(`GoCardless: Failed - ${goCardlessTaskRun.reason}`);
    }

    return {
      success: true,
      message: `✅ Both providers triggered: ${results.join(", ")}`,
      results: {
        plaid: plaidTaskRun.status === "fulfilled" ? plaidTaskRun.value.id : null,
        gocardless: goCardlessTaskRun.status === "fulfilled" ? goCardlessTaskRun.value.id : null,
      },
    };
  } catch (error) {
    console.error("Error triggering both providers:", error);
    throw new Error(`Failed to trigger both providers: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Test triggering both providers balance sync in parallel
 */
export async function testTriggerBothProvidersBalanceSync() {
  try {
    const familyId = await getActiveFamilyId();
    if (!familyId) {
      throw new Error("User not authenticated or no family found");
    }

    // Trigger both providers in parallel
    const [plaidTaskRun, goCardlessTaskRun] = await Promise.allSettled([
      syncPlaidBalances.trigger({ familyId }),
      syncGoCardlessBalances.trigger({ familyId }),
    ]);

    const results = [];
    
    if (plaidTaskRun.status === "fulfilled") {
      results.push(`Plaid: ${plaidTaskRun.value.id}`);
    } else {
      results.push(`Plaid: Failed - ${plaidTaskRun.reason}`);
    }
    
    if (goCardlessTaskRun.status === "fulfilled") {
      results.push(`GoCardless: ${goCardlessTaskRun.value.id}`);
    } else {
      results.push(`GoCardless: Failed - ${goCardlessTaskRun.reason}`);
    }

    return {
      success: true,
      message: `✅ Both providers balance sync triggered: ${results.join(", ")}`,
      results: {
        plaid: plaidTaskRun.status === "fulfilled" ? plaidTaskRun.value.id : null,
        gocardless: goCardlessTaskRun.status === "fulfilled" ? goCardlessTaskRun.value.id : null,
      },
    };
  } catch (error) {
    console.error("Error triggering both providers balance sync:", error);
    throw new Error(`Failed to trigger both providers balance sync: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}