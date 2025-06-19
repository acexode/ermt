import { Suspense } from 'react';

import { CONFIG } from 'src/config-global';

import { SignUpView } from 'src/sections/auth';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Sign up - ${CONFIG.appName}`}</title>

      <Suspense fallback={<div>Loading...</div>}>
        <SignUpView />
      </Suspense>
    </>
  );
} 
