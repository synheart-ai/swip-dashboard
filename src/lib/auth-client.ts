import { createAuthClient } from "better-auth/react";

// Create the Better Auth client instance
export const authClient = createAuthClient({});

// Export recommended helpers for usage in your app
export const { signIn, signOut, useSession, getSession, signUp } = authClient;
