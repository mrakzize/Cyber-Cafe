import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Bell,
  Check,
  Clock,
  Menu,
  PanelRightClose,
  PanelRightOpen,
  Plus,
} from 'lucide-react';
import { Button } from '@/src/components/ui/Primitives';
import { cn } from '@/src/lib/utils';
import { useCafeStore } from '@/src/store/useCafeStore';
import { NavPage } from '@/src/types/cafe';

const PAGE_HEADER_META: Record<NavPage, { title: string; description: string }> = {
  dashboard: {
    title: 'Gaming Floor',
    description: 'Manage your stations and monitor live gaming sessions.',
  },
  stations: {
    title: 'Stations',
    description: 'Configure and organize your gaming floor.',
  },
  sessions: {
    title: 'Sessions',
    description: 'Review gaming sessions and recorded payments.',
  },
  pricing: {
    title: 'Pricing',
    description: 'Manage gaming rates and duration packages.',
  },
  reports: {
    title: 'Reports',
    description: 'Understand your gaming café performance.',
  },
  staff: {
    title: 'Staff',
    description: 'Manage employees and access permissions.',
  },
  settings: {
    title: 'Settings',
    description: 'Configure café profile, floor rules, and preferences.',
  },
};

export function TopHeader({ onOpenMobileNav }: { onOpenMobileNav: () => void }) {
  const {
    activePage,
    activeLocation,
    currentUser,
    notifications,
    markAllNotificationsRead,
    openStationFormDrawer,
    activityPanelOpen,
    toggleActivityPanel,
  } = useCafeStore();

  const [now, setNow] = useState(() => new Date());
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const meta = PAGE_HEADER_META[activePage];
  const unreadCount = notifications.filter((n) => !n.read).length;
  const isOwner = currentUser.role === 'Owner';

  const formattedDate = now.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const formattedTime = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  return (
    <header className="sticky top-0 z-10 border-b border-[var(--border-subtle)] bg-[var(--bg-main)]/90 backdrop-blur-md px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Trigger + Title & Context */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onOpenMobileNav}
            aria-label="Open navigation menu"
            className="lg:hidden p-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-primary)] cursor-pointer shrink-0"
          >
            <Menu className="w-4 h-4" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <span className="truncate">{activeLocation.name}</span>
              <span aria-hidden="true">/</span>
              <span className="text-[var(--text-secondary)] font-medium truncate">
                {meta.title}
              </span>
            </div>
            <div className="flex items-baseline gap-3 mt-0.5">
              <h1 className="text-lg sm:text-xl font-display font-bold tracking-tight text-[var(--text-primary)] whitespace-nowrap">
                {meta.title}
              </h1>
              <p className="hidden md:block text-xs text-[var(--text-secondary)] truncate">
                {meta.description}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Clock, Notifications, Activity Toggle, Primary CTA */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Live Date & Time */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] text-xs text-[var(--text-secondary)]">
            <Clock className="w-3.5 h-3.5 text-[var(--text-muted)]" aria-hidden="true" />
            <span>{formattedDate}</span>
            <span aria-hidden="true" className="text-[var(--text-muted)]">
              ·
            </span>
            <span className="font-mono-tabular font-medium text-[var(--text-primary)]">
              {formattedTime}
            </span>
          </div>

          {/* Notification Bell Popover */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setNotifOpen((v) => !v)}
              aria-label={`Notifications (${unreadCount} unread)`}
              className="relative p-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-mono-tabular font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setNotifOpen(false)}
                  aria-hidden="true"
                />
                <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-2xl z-30 overflow-hidden">
                  <div className="px-4 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between">
                    <span className="text-xs font-display font-semibold text-[var(--text-primary)]">
                      Floor Alerts ({unreadCount} unread)
                    </span>
                    <button
                      type="button"
                      onClick={() => markAllNotificationsRead()}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-[#8B5CF6] hover:underline cursor-pointer"
                    >
                      <Check className="w-3 h-3" />
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-[var(--border-subtle)]">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={cn(
                          'px-4 py-3 flex items-start gap-2.5',
                          !n.read && 'bg-[#8B5CF6]/5'
                        )}
                      >
                        <AlertTriangle
                          className={cn(
                            'w-4 h-4 mt-0.5 shrink-0',
                            n.severity === 'danger'
                              ? 'text-red-400'
                              : n.severity === 'warning'
                                ? 'text-amber-400'
                                : 'text-blue-400'
                          )}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-medium text-[var(--text-primary)] truncate">
                              {n.title}
                            </p>
                            <span className="text-[11px] text-[var(--text-muted)] shrink-0">
                              {n.time}
                            </span>
                          </div>
                          <p className="mt-0.5 text-xs text-[var(--text-secondary)] leading-relaxed">
                            {n.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Toggle Right Activity Panel on Dashboard */}
          {activePage === 'dashboard' && (
            <button
              type="button"
              onClick={toggleActivityPanel}
              title={activityPanelOpen ? 'Hide live activity panel' : 'Show live activity panel'}
              aria-label="Toggle live activity panel"
              className="hidden md:inline-flex items-center gap-1.5 px-3 h-9 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
            >
              {activityPanelOpen ? (
                <PanelRightClose className="w-4 h-4" />
              ) : (
                <PanelRightOpen className="w-4 h-4" />
              )}
              <span className="hidden xl:inline">Live Feed</span>
            </button>
          )}

          {/* Primary Action: Add Station (Owner on Dashboard or Stations) */}
          {isOwner && (activePage === 'dashboard' || activePage === 'stations') && (
            <Button
              size="md"
              onClick={() => openStationFormDrawer(null)}
              className="whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Add Station</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
