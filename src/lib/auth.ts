import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/auth',
  },
})

export type SessionUser = { id: string; email: string; name?: string };

export async function requireUser(req?: Request): Promise<SessionUser> {
  const session = await auth();
  
  if (session?.user?.id) {
    return {
      id: session.user.id,
      email: session.user.email!,
      name: session.user.name || undefined,
    };
  }

  throw new Error("Authentication required");
}