/**
 * Auth Wrapper Component
 *
 * Protects dashboard pages by requiring authentication
 */

import { auth } from '../src/lib/auth';
import { redirect } from 'next/navigation';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export async function AuthWrapper({ children }: AuthWrapperProps) {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth');
  }

  return <>{children}</>;
}
