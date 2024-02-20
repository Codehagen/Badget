import type { NextRequest } from "next/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { createTRPCContext } from "@projectx/api";
import { lambdaRouter } from "@projectx/api/lambda";

// Stripe is incompatible with Edge runtimes due to using Node.js events
// export const runtime = "edge";

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: "/api/trpc/lambda",
    router: lambdaRouter,
    req: req,
    createContext: () => createTRPCContext({ req }),
    onError: ({ error, path }) => {
      console.log("Error in tRPC handler (lambda) on path", path);
      console.error(error);
    },
  });

export { handler as GET, handler as POST };
