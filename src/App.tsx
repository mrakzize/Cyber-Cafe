import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ActiveSessionDrawer } from '@/src/components/drawers/ActiveSessionDrawer';
import { StartSessionDrawer } from '@/src/components/drawers/StartSessionDrawer';
import { StationFormDrawer } from '@/src/components/drawers/StationFormDrawer';
import { AppSidebar } from '@/src/components/layout/AppSidebar';
import { TopHeader } from '@/src/components/layout/TopHeader';
import { AuthScreen } from '@/src/components/pages/AuthScreen';
import { DashboardPage } from '@/src/components/pages/DashboardPage';
import { PricingPage } from '@/src/components/pages/PricingPage';
import { ReportsPage } from '@/src/components/pages/ReportsPage';
import { SessionsPage } from '@/src/components/pages/SessionsPage';
import { SettingsPage } from '@/src/components/pages/SettingsPage';
import { StaffPage } from '@/src/components/pages/StaffPage';
import { StationsPage } from '@/src/components/pages/StationsPage';
import { ToastContainer } from '@/src/components/ui/Primitives';
import { useCafeStore } from '@/src/store/useCafeStore';

const queryClient = new QueryClient();

function CafeShell() {
  const {
    isAuthenticated,
    activePage,
    settings,
    tickTimers,
    toasts,
    dismissToast,
  } = useCafeStore();

  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Live 1-second countdown tick across all active stations
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => {
      tickTimers();
    }, 1000);
    return () => clearInterval(interval);
  }, [isAuthenticated, tickTimers]);

  // Sync light / dark theme class on documentElement
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  if (!isAuthenticated) {
    return (
      <>
        <AuthScreen />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  return (
    <div className="min-h-screen flex bg-[var(--bg-main)] text-[var(--text-primary)]">
      <AppSidebar
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <TopHeader onOpenMobileNav={() => setMobileNavOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 max-w-[1600px] w-full mx-auto">
          {activePage === 'dashboard' && <DashboardPage />}
          {activePage === 'stations' && <StationsPage />}
          {activePage === 'sessions' && <SessionsPage />}
          {activePage === 'pricing' && <PricingPage />}
          {activePage === 'reports' && <ReportsPage />}
          {activePage === 'staff' && <StaffPage />}
          {activePage === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Global Operational Drawers */}
      <StartSessionDrawer />
      <ActiveSessionDrawer />
      <StationFormDrawer />

      {/* Toast Feedback */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CafeShell />
    </QueryClientProvider>
  );
}
