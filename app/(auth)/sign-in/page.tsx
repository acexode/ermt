import { Suspense } from 'react';

import { CONFIG } from 'src/config-global';

import { SignInView } from 'src/sections/auth';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Sign in - ${CONFIG.appName}`}</title>

      <Suspense fallback={<div>Loading...</div>}>
        <SignInView />
      </Suspense>
    </>
  );
}
