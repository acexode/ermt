import { CONFIG } from 'src/config-global';

import { OverviewAnalyticsView as DashboardView } from 'src/sections/overview/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Dashboard - ${CONFIG.appName}`}</title>
      <meta
        name="description"
        content="ERMT"
      />
      <meta name="keywords" content="ERMT,ERMT-Dashboard" />

      <DashboardView />
    </>
  );
}
