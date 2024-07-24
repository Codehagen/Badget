import axios from "axios";

const apiClient = axios.create({
  baseURL: "https://bankaccountdata.gocardless.com/api/v2",
  headers: {
    accept: "application/json",
    "Content-Type": "application/json",
  },
});

let accessToken: string | null = null;
let refreshToken: string | null = null;
let accessTokenExpiry: number | null = null;
let initializationPromise: Promise<void> | null = null;

async function getAccessToken(): Promise<string> {
  console.log("getAccessToken called");
  if (initializationPromise) {
    console.log("Waiting for initializationPromise");
    await initializationPromise;
  }

  if (accessToken && accessTokenExpiry && Date.now() < accessTokenExpiry) {
    console.log("Access token is valid:", accessToken);
    return accessToken;
  }

  if (refreshToken) {
    console.log("Access token expired, refreshing...");
    await refreshAccessToken();
    console.log("Access token refreshed:", accessToken);
    return accessToken!;
  }

  console.error("No valid access token available");
  throw new Error("No valid access token available");
}

async function refreshAccessToken() {
  try {
    console.log("Refreshing access token...");
    const response = await apiClient.post("/token/refresh/", {
      refresh: refreshToken,
    });

    if (!response.data) {
      throw new Error("Failed to refresh access token");
    }

    accessToken = response.data.access;
    accessTokenExpiry = Date.now() + response.data.access_expires * 1000;
    refreshToken = response.data.refresh;
    console.log("Access token refreshed:", accessToken);
  } catch (error) {
    console.error("Error refreshing access token:", error);
    throw new Error("Failed to refresh access token");
  }
}

async function initializeTokens() {
  if (!initializationPromise) {
    initializationPromise = (async () => {
      try {
        console.log("Initializing tokens...");
        const response = await apiClient.post("/token/new/", {
          secret_id: process.env.GOCARDLESS_SECRET_ID,
          secret_key: process.env.GOCARDLESS_SECRET_KEY,
        });

        if (!response.data) {
          throw new Error("Failed to fetch initial tokens");
        }

        accessToken = response.data.access;
        accessTokenExpiry = Date.now() + response.data.access_expires * 1000;
        refreshToken = response.data.refresh;
        console.log("Tokens initialized:", { accessToken, refreshToken });
      } catch (error) {
        console.error("Error initializing tokens:", error);
        throw new Error("Failed to initialize tokens");
      }
    })();
  }

  return initializationPromise;
}

async function createEndUserAgreement(
  institutionId: string,
  maxHistoricalDays = 90,
  accessValidForDays = 90,
  accessScope: string[] = ["balances", "details", "transactions"],
) {
  const token = await getAccessToken();
  console.log("createEndUserAgreement called with token:", token);
  const response = await apiClient.post(
    "/agreements/enduser/",
    {
      institution_id: institutionId,
      max_historical_days: maxHistoricalDays,
      access_valid_for_days: accessValidForDays,
      access_scope: accessScope,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.data) {
    throw new Error("Failed to create end user agreement");
  }

  return response.data;
}

async function createRequisition(
  institutionId: string,
  redirectUrl: string,
  connectorConfigId: string,
  agreement?: string,
  userLanguage?: string,
) {
  const token = await getAccessToken();
  const response = await apiClient.post(
    "/requisitions/",
    {
      institution_id: institutionId,
      redirect: redirectUrl,
      reference: generateRandomString(10),
      agreement,
      user_language: userLanguage,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.data) {
    throw new Error("Failed to create requisition");
  }

  return response.data;
}

async function listAccounts(requisitionId: string) {
  const token = await getAccessToken();
  const response = await apiClient.get(`/requisitions/${requisitionId}/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.data) {
    throw new Error("Failed to list accounts");
  }

  return response.data;
}

async function getTransactions(accountId: string) {
  const token = await getAccessToken();
  const response = await apiClient.get(`/accounts/${accountId}/transactions/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.data) {
    throw new Error("Failed to get transactions");
  }

  return response.data;
}

function generateRandomString(length: number) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export {
  initializeTokens,
  createEndUserAgreement,
  createRequisition,
  listAccounts,
  getTransactions,
};
