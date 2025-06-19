'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

import { useCustomAuth } from 'src/context/custom-auth-context';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useCustomAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/sign-in');
    }
  }, [user, loading, router]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  // Render children if authenticated
  return <>{children}</>;
} 
