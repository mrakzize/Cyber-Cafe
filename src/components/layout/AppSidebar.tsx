import React, { useState } from 'react';
import {
  BarChart3,
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Gamepad2,
  History,
  LayoutGrid,
  Lock,
  LogOut,
  Monitor,
  Settings,
  Tag,
  Users,
  X,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useCafeStore } from '@/src/store/useCafeStore';
import { NavPage } from '@/src/types/cafe';

interface NavItem {
  id: NavPage;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  ownerOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
  { id: 'stations', label: 'Stations', icon: Monitor },
  { id: 'sessions', label: 'Sessions', icon: History },
  { id: 'pricing', label: 'Pricing', icon: Tag, ownerOnly: true },
  { id: 'reports', label: 'Reports', icon: BarChart3, ownerOnly: true },
  { id: 'staff', label: 'Staff', icon: Users, ownerOnly: true },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function AppSidebar({
  mobileOpen,
  onCloseMobile,
}: {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  const {
    activePage,
    setActivePage,
    sidebarCollapsed,
    toggleSidebar,
    currentUser,
    activeLocation,
    locations,
    setActiveLocation,
    staffMembers,
    switchUserById,
    logout,
  } = useCafeStore();

  const [locationMenuOpen, setLocationMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const isOwner = currentUser.role === 'Owner';

  const handleSelectNav = (item: NavItem) => {
    if (item.ownerOnly && !isOwner) {
      useCafeStore.getState().pushToast({
        title: 'Owner permission required',
        description: `${item.label} is restricted to café owners. Switch to Youssef (Owner) in Account Menu to preview.`,
        variant: 'warning',
      });
      return;
    }
    setActivePage(item.id);
    onCloseMobile();
  };

  const sidebarContent = (isMobile: boolean) => {
    const collapsed = !isMobile && sidebarCollapsed;

    return (
      <div
        className={cn(
          'flex flex-col h-full bg-[var(--bg-sidebar)] border-r border-[var(--border-subtle)] transition-[width] duration-200 select-none',
          collapsed ? 'w-[72px]' : 'w-[240px]'
        )}
      >
        {/* Brand & Location Switcher */}
        <div className="p-3.5 border-b border-[var(--border-subtle)]">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setActivePage('dashboard')}
              className={cn(
                'flex items-center gap-2.5 min-w-0 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6] rounded-lg',
                collapsed && 'justify-center w-full'
              )}
            >
              <div className="w-9 h-9 rounded-xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/35 flex items-center justify-center text-[#8B5CF6] shrink-0">
                <Gamepad2 className="w-5 h-5" aria-hidden="true" />
              </div>
              {!collapsed && (
                <div className="min-w-0">
                  <p className="text-sm font-display font-bold tracking-tight text-[var(--text-primary)] truncate">
                    Gaming Café
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)] truncate">
                    Floor Manager
                  </p>
                </div>
              )}
            </button>

            {isMobile ? (
              <button
                type="button"
                onClick={onCloseMobile}
                aria-label="Close navigation"
                className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              !collapsed && (
                <button
                  type="button"
                  onClick={toggleSidebar}
                  aria-label="Collapse sidebar"
                  className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )
            )}
          </div>

          {collapsed && !isMobile && (
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label="Expand sidebar"
              className="mt-2.5 w-full flex items-center justify-center p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {/* Café Location Switcher */}
          {!collapsed && (
            <div className="relative mt-3">
              <button
                type="button"
                onClick={() => setLocationMenuOpen((v) => !v)}
                className="w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/60 hover:bg-[var(--bg-elevated)] text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Building2
                    className="w-3.5 h-3.5 text-[var(--text-secondary)] shrink-0"
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-[var(--text-primary)] truncate">
                      {activeLocation.name}
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)] truncate">
                      {activeLocation.city}
                    </p>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
              </button>

              {locationMenuOpen && (
                <div className="absolute left-0 right-0 mt-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] shadow-xl p-1 z-30">
                  {locations.map((loc) => (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => {
                        setActiveLocation(loc.id);
                        setLocationMenuOpen(false);
                      }}
                      className={cn(
                        'w-full text-left px-2.5 py-2 rounded-lg text-xs transition-colors cursor-pointer',
                        loc.id === activeLocation.id
                          ? 'bg-[#8B5CF6]/15 text-[#8B5CF6] font-medium'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]'
                      )}
                    >
                      <div className="font-medium truncate">{loc.name}</div>
                      <div className="text-[11px] opacity-75 truncate">{loc.city}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            const isLocked = Boolean(item.ownerOnly && !isOwner);

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectNav(item)}
                title={collapsed ? item.label : undefined}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6]',
                  collapsed && 'justify-center px-0',
                  isActive
                    ? 'bg-[#8B5CF6]/15 text-[#8B5CF6] border border-[#8B5CF6]/30'
                    : isLocked
                      ? 'text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]/50 border border-transparent'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] border border-transparent'
                )}
              >
                <Icon className="w-[18px] h-[18px] shrink-0" aria-hidden="true" />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left truncate whitespace-nowrap">
                      {item.label}
                    </span>
                    {isLocked && (
                      <Lock className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom User Profile & Account Switcher */}
        <div className="p-3 border-t border-[var(--border-subtle)] relative">
          {accountMenuOpen && !collapsed && (
            <div className="mb-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] shadow-xl p-1.5 space-y-1">
              <p className="px-2 py-1 text-[11px] font-medium text-[var(--text-muted)]">
                Switch active operator
              </p>
              {staffMembers
                .filter((m) => m.status === 'Active')
                .map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => {
                      switchUserById(member.id);
                      setAccountMenuOpen(false);
                    }}
                    className={cn(
                      'w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg text-xs cursor-pointer transition-colors',
                      member.id === currentUser.id
                        ? 'bg-[#8B5CF6]/15 text-[#8B5CF6] font-medium'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]'
                    )}
                  >
                    <span className="truncate">{member.name}</span>
                    <span className="text-[11px] opacity-80 shrink-0">{member.role}</span>
                  </button>
                ))}
              <div className="border-t border-[var(--border-subtle)] pt-1 mt-1">
                <button
                  type="button"
                  onClick={() => {
                    setAccountMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-red-400 hover:bg-red-500/10 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          )}

          <div
            className={cn(
              'flex items-center gap-2.5',
              collapsed ? 'flex-col' : 'justify-between'
            )}
          >
            <button
              type="button"
              onClick={() => (collapsed ? toggleSidebar() : setAccountMenuOpen((v) => !v))}
              className={cn(
                'flex items-center gap-2.5 min-w-0 text-left rounded-xl p-1.5 hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer flex-1',
                collapsed && 'justify-center flex-none'
              )}
              title="Account menu"
            >
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-lg object-cover border border-[var(--border-subtle)] shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/20 border border-[#8B5CF6]/30 flex items-center justify-center text-xs font-semibold text-[#8B5CF6] shrink-0">
                  {currentUser.initials}
                </div>
              )}

              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-[var(--text-primary)] truncate">
                    {currentUser.name}
                  </p>
                  <p className="text-[11px] text-[var(--text-secondary)] truncate">
                    {currentUser.role} · Account
                  </p>
                </div>
              )}
            </button>

            {!collapsed && (
              <button
                type="button"
                onClick={logout}
                title="Sign out"
                aria-label="Sign out"
                className="p-2 rounded-lg text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:block shrink-0 h-screen sticky top-0 z-20">
        {sidebarContent(false)}
      </aside>

      {/* Mobile Drawer Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative z-10 h-full">{sidebarContent(true)}</div>
        </div>
      )}
    </>
  );
}
