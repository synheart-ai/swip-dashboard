import { signIn, signOut, getSession } from "next-auth/react";

export const authClient = {
  signIn: {
    social: async ({ provider, callbackURL }: { provider: string; callbackURL?: string }) => {
      await signIn(provider, { callbackUrl: callbackURL });
    },
  },
  signOut: async () => {
    await signOut({ callbackUrl: '/' });
  },
  getSession: async () => {
    return await getSession();
  },
};