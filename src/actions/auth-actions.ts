"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function getSession() {
  return await auth.api.getSession({
    headers: await headers(),
  });
}

export async function signInWithEmail(email: string, password: string) {
  try {
    const result = await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    });

    if (result.user) {
      redirect("/dashboard");
    }

    return { success: true, user: result.user };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Sign in failed",
    };
  }
}

export async function signUpWithEmailAndName(
  email: string,
  password: string,
  name: string
) {
  try {
    const result = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
    });

    if (result.user) {
      redirect("/dashboard");
    }

    return { success: true, user: result.user };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Sign up failed",
    };
  }
}

export async function signInOrCreateUser(
  email: string,
  password: string,
  name?: string
) {
  console.log("🔍 signInOrCreateUser called with:", { email, password: "***" });

  try {
    console.log("🔄 Attempting to sign in existing user...");
    // First try to sign in
    const signInResult = await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    });

    console.log("✅ Sign in successful:", { userId: signInResult.user?.id });

    if (signInResult.user) {
      return { success: true, user: signInResult.user };
    }

    return { success: false, error: "Sign in succeeded but no user returned" };
  } catch (signInError) {
    const errorMessage =
      signInError instanceof Error ? signInError.message : String(signInError);
    console.log("❌ Sign in failed:", { error: errorMessage });

    // Try to create user if the error suggests the user doesn't exist
    // Better Auth might return "User not found", "Invalid password", or similar messages
    if (
      errorMessage.includes("User not found") ||
      errorMessage.includes("Invalid password") ||
      errorMessage.includes("Invalid email")
    ) {
      console.log(
        "🔄 User likely doesn't exist, attempting to create new user..."
      );

      try {
        const signUpResult = await auth.api.signUpEmail({
          body: {
            email,
            password,
            name: name || email.split("@")[0], // Use email prefix as default name
          },
        });

        console.log("✅ User created successfully:", {
          userId: signUpResult.user?.id,
        });

        if (signUpResult.user) {
          // Return success before redirect to avoid redirect exception being caught
          // The redirect will happen after this return
          return { success: true, user: signUpResult.user, wasCreated: true };
        }

        return {
          success: false,
          error: "User creation succeeded but no user returned",
        };
      } catch (signUpError) {
        const signUpErrorMessage =
          signUpError instanceof Error
            ? signUpError.message
            : String(signUpError);
        console.log("❌ User creation failed:", {
          error: signUpErrorMessage,
        });

        // If user creation also fails, it might be because the user actually exists but has wrong password
        // In that case, return a more helpful error message
        if (
          signUpErrorMessage.includes("already exists") ||
          signUpErrorMessage.includes("already registered")
        ) {
          return {
            success: false,
            error:
              "Account exists but password is incorrect. Please check your password.",
          };
        }

        return {
          success: false,
          error: signUpErrorMessage,
        };
      }
    } else {
      // For other errors, just return the sign-in error
      console.log(
        "🚫 Sign in failed for unhandled reason, returning original error"
      );
      return {
        success: false,
        error: "Invalid email or password",
      };
    }
  }
}

export async function signOut() {
  try {
    await auth.api.signOut({
      headers: await headers(),
    });
    redirect("/");
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Sign out failed",
    };
  }
}

export async function getUser() {
  const session = await getSession();
  return session?.user || null;
}

/**
 * Convenience function to check if user is authenticated
 * Use this for simple auth checks
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getUser();
  return !!user;
}

/**
 * Get authenticated user or redirect to sign-in
 * Use this when you need to ensure user is authenticated
 */
export async function requireAuth() {
  const user = await getUser();
  if (!user) {
    redirect("/sign-in");
  }
  return user;
}
