'use client';

import { ErrorBoundary } from 'src/routes/components/error-boundary';

export default function Error({ error }: { error: Error }) {
  return <ErrorBoundary error={error} />;
} 
