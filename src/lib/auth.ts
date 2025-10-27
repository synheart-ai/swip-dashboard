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
  callbacks: {
    async redirect({ url, baseUrl }) {
      console.log('NextAuth redirect callback:', { url, baseUrl });
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    async signIn({ user, account, profile }) {
      console.log('NextAuth signIn callback:', { user, account, profile });
      return true;
    },
    async session({ session, token }) {
      console.log('NextAuth session callback:', { session, token });
      return session;
    },
  },
  debug: process.env.NODE_ENV === 'development',
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