'use client';
import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from 'src/context/auth-context';
import Providers from 'src/context/providers';
import 'src/global.css';
import { ThemeProvider } from 'src/theme/theme-provider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <AuthProvider>
            <ThemeProvider>
              <Providers>
                {children}
              </Providers>
            </ThemeProvider>
          </AuthProvider>
        </SessionProvider>
      </body>
    </html>
  );
} 
