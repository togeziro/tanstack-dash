'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { createContext, useContext, useCallback } from 'react';
import { getSessionFn, signInUserFn, signOutUserFn, signUpUserFn } from './server';

type AuthUser = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
};

type AuthResult = { success: boolean; message?: string };

type SignUpInput = {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string, remember?: boolean) => Promise<AuthResult>;
  signUp: (data: SignUpInput) => Promise<AuthResult>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const result = await getSessionFn();
      return result.user;
    },
    staleTime: 5 * 60 * 1000,
    retry: false
  });

  const user = data ?? null;

  const signIn = useCallback(
    async (email: string, password: string, remember: boolean = false): Promise<AuthResult> => {
      const result: AuthResult = await signInUserFn({ data: { email, password, remember } });
      if (result.success) {
        await queryClient.invalidateQueries({ queryKey: ['session'] });
        router.navigate({ to: '/dashboard/overview' });
      }
      return result;
    },
    [queryClient, router]
  );

  const signUp = useCallback(
    async (input: SignUpInput): Promise<AuthResult> => {
      const result: AuthResult = await signUpUserFn({ data: input });
      if (result.success) {
        await queryClient.invalidateQueries({ queryKey: ['session'] });
        router.navigate({ to: '/dashboard/overview' });
      }
      return result;
    },
    [queryClient, router]
  );

  const signOut = useCallback(async () => {
    await signOutUserFn();
    await queryClient.invalidateQueries({ queryKey: ['session'] });
    router.navigate({ to: '/auth/sign-in' });
  }, [queryClient, router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        signIn,
        signUp,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
