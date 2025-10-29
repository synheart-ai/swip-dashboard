/**
 * Auth Wrapper Component
 *
 * Protects dashboard pages by requiring authentication
 */

import { auth } from "../src/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

interface AuthWrapperProps {
  children: React.ReactNode;
}

export async function AuthWrapper({ children }: AuthWrapperProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth");
  }

  return <>{children}</>;
}
