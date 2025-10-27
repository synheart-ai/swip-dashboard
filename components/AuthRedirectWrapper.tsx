"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface AuthRedirectWrapperProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function AuthRedirectWrapper({ 
  children, 
  redirectTo = "/auth" 
}: AuthRedirectWrapperProps) {
  const router = useRouter();

  useEffect(() => {
    // Redirect to auth page
    router.push(redirectTo);
  }, [router, redirectTo]);

  return null;
}
