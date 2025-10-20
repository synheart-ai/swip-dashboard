import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { createClient } from "redis";
import { prisma } from "./db";

// Create Redis client
const redis = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379"
});

redis.on('error', (err) => console.error('Redis Client Error', err));
redis.on('connect', () => console.log('Redis Client Connected'));
redis.on('ready', () => console.log('Redis Client Ready'));

// Connect to Redis
redis.connect().catch(console.error);

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET || "dev-secret-key",
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  plugins: [nextCookies()],
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  trustedOrigins: ["http://localhost:3000"],
  // Disable email/password authentication
  emailAndPassword: {
    enabled: false,
  },
  // Only enable social providers
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    },
  },
  user: {
    additionalFields: {
      name: {
        type: "string",
        required: false,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
});

export const handlers = auth.handler;

export type SessionUser = { id: string; email: string; name?: string };

export async function requireUser(req?: Request): Promise<SessionUser> {
  // Use Better Auth's session checking
  const result = await auth.api.getSession({
    headers: req?.headers || new Headers(),
  });

  if (result.user) {
    return {
      id: result.user.id,
      email: result.user.email,
      name: result.user.name || undefined,
    };
  }

  throw new Error("Authentication required");
}