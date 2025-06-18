import { DashboardLayout } from 'src/layouts/dashboard/layout';
import { ProtectedRoute } from 'src/components/protected-route';

export default function DashboardLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <DashboardLayout sx={{}} cssVars={{}} children={children} />
    </ProtectedRoute>
  );
} 
