'use client';

import { useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import { useRouter } from 'src/routes/hooks';

import { useCustomAuth } from 'src/context/custom-auth-context';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function SignInView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/home';
  const { login } = useCustomAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    console.log('Attempting sign in with:', { email, callbackUrl });

    try {
      const result = await login(email, password);

      if (result.success) {
        console.log('Sign in successful, redirecting to:', callbackUrl);
        router.push(callbackUrl);
      } else {
        setError(result.error || 'Sign in failed');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Sign in error:', err);
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  }, [login, router, callbackUrl]);

  const renderForm = (
    <Box component="form" onSubmit={handleSignIn}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        name="email"
        label="Email address"
        required
        type="email"
        sx={{ mb: 3 }}
        slotProps={{
          inputLabel: { shrink: true },
        }}
      />

      <Link variant="body2" color="inherit" sx={{ mb: 1.5 }}>
        Forgot password?
      </Link>

      <TextField
        fullWidth
        name="password"
        label="Password"
        required
        type={showPassword ? 'text' : 'password'}
        slotProps={{
          inputLabel: { shrink: true },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
        sx={{ mb: 3 }}
      />

      <Button
        fullWidth
        size="large"
        type="submit"
        color="inherit"
        variant="contained"
        disabled={isLoading}
      >
        {isLoading ? 'Signing in...' : 'Sign in'}
      </Button>
    </Box>
  );

  return (
    <>
      <Box
        sx={{
          gap: 1.5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: 5,
        }}
      >
        <Typography variant="h5">Sign in</Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
          }}
        >
          Don&apos;t have an account?
          <Link href="/sign-up" variant="subtitle2" sx={{ ml: 0.5 }}>
            Get started
          </Link>
        </Typography>
      </Box>
      {renderForm}

    </>
  );
}
