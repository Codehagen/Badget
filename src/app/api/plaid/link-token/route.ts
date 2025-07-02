import { NextRequest, NextResponse } from "next/server";
import { createLinkToken } from "@/actions/plaid-actions";

export async function POST(request: NextRequest) {
  try {
    const result = await createLinkToken();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error creating link token:", error);
    return NextResponse.json(
      { error: "Failed to create link token" },
      { status: 500 }
    );
  }
}
