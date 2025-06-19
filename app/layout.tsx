'use client';
import { CustomAuthProvider } from 'src/context/custom-auth-context';
import Providers from 'src/context/providers';
import 'src/global.css';
import { ThemeProvider } from 'src/theme/theme-provider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CustomAuthProvider>
          <ThemeProvider>
            <Providers>
              {children}
            </Providers>
          </ThemeProvider>
        </CustomAuthProvider>
      </body>
    </html>
  );
} 
