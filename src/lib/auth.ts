import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { redirect } from "next/navigation";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "./db";

import { headers } from "next/headers";

export const auth = betterAuth({
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  plugins: [nextCookies()],
  pages: {
    signIn: "/auth",
  },
  debug: process.env.NODE_ENV === "development",
});

export type SessionUser = { id: string; email: string; name?: string };

export async function requireUser(req?: Request): Promise<SessionUser> {
  // Log headers for debugging session cookie presence
  if (req?.headers) {
    console.log("requireUser: request headers", req.headers);
  } else {
    console.log("requireUser: no request headers provided");
  }

  const session = await auth.api.getSession({
    headers: headers(),
  });

  if (session?.user?.id) {
    return {
      id: session.user.id,
      email: session.user.email!,
      name: session.user.name || undefined,
    };
  }

  redirect("/auth");
}
