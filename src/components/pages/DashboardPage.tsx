import React, { useMemo, useState } from 'react';
import {
  Activity,
  CheckCircle2,
  LayoutGrid,
  Map,
  Monitor,
  Play,
  Search,
  Wallet,
} from 'lucide-react';
import { FloorPlanView } from '@/src/components/dashboard/FloorPlanView';
import { LiveActivityPanel } from '@/src/components/dashboard/LiveActivityPanel';
import { StationCard } from '@/src/components/dashboard/StationCard';
import {
  Button,
  EmptyState,
  Modal,
  StatCard,
} from '@/src/components/ui/Primitives';
import { useDashboardMetrics, useStationsQuery } from '@/src/hooks/useCafeQueries';
import {
  addMinutesToTimeLabel,
  cn,
  formatCurrencyMad,
} from '@/src/lib/utils';
import { useCafeStore } from '@/src/store/useCafeStore';
import { GamingSetupType, PaymentMethod, StationStatus } from '@/src/types/cafe';

export function DashboardPage() {
  const { data: stations } = useStationsQuery();
  const metrics = useDashboardMetrics();

  const {
    activityFeed,
    activityPanelOpen,
    settings,
    pricingPackages,
    openStartSessionDrawer,
    openActiveSessionDrawer,
    moveExpiredToFinishing,
    confirmStationReady,
    extendSession,
  } = useCafeStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StationStatus | 'all'>('all');
  const [setupFilter, setSetupFilter] = useState<GamingSetupType | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'floor'>(settings.defaultDashboardView);
  const [mobileFeedOpen, setMobileFeedOpen] = useState(false);

  // Quick-extend modal directly from Station Card "Extend" button
  const [quickExtendStationId, setQuickExtendStationId] = useState<string | null>(null);
  const [quickAddMinutes, setQuickAddMinutes] = useState<15 | 30 | 60>(30);
  const [quickPayMethod, setQuickPayMethod] = useState<PaymentMethod>(
    settings.defaultPaymentMethod
  );

  const quickExtendStation = useMemo(
    () => stations.find((s) => s.id === quickExtendStationId) || null,
    [stations, quickExtendStationId]
  );

  const quickExtensionOptions = useMemo(() => {
    if (!quickExtendStation) return [];
    const sixtyPkg = pricingPackages.find(
      (p) => p.setupType === quickExtendStation.pricingCategory && p.durationMinutes === 60
    );
    const hourly = sixtyPkg?.priceMad || 15;
    return ([15, 30, 60] as const).map((mins) => {
      const exact = pricingPackages.find(
        (p) =>
          p.setupType === quickExtendStation.pricingCategory &&
          p.durationMinutes === mins &&
          p.enabled
      );
      return {
        minutes: mins,
        price: exact ? exact.priceMad : Math.max(5, Math.round(hourly * (mins / 60))),
      };
    });
  }, [quickExtendStation, pricingPackages]);

  const selectedQuickOpt =
    quickExtensionOptions.find((o) => o.minutes === quickAddMinutes) || quickExtensionOptions[1];

  const filteredStations = useMemo(() => {
    return stations.filter((st) => {
      const matchesSearch =
        st.name.toLowerCase().includes(search.toLowerCase()) ||
        st.setupType.toLowerCase().includes(search.toLowerCase()) ||
        (st.activeSession?.gameTitle.toLowerCase().includes(search.toLowerCase()) ?? false);
      const matchesStatus = statusFilter === 'all' || st.status === statusFilter;
      const matchesSetup = setupFilter === 'all' || st.setupType === setupFilter;
      return matchesSearch && matchesStatus && matchesSetup;
    });
  }, [stations, search, statusFilter, setupFilter]);

  const handleQuickExtendConfirm = () => {
    if (!quickExtendStation || !selectedQuickOpt) return;
    extendSession({
      stationId: quickExtendStation.id,
      addedMinutes: selectedQuickOpt.minutes,
      additionalCharge: selectedQuickOpt.price,
      paymentMethod: quickPayMethod,
    });
    setQuickExtendStationId(null);
  };

  return (
    <div className="space-y-5">
      {/* Top 4 Statistics Cards */}
      <section aria-label="Floor summary metrics" className="grid grid-cols-2 xl:grid-cols-4 gap-3.5">
        <StatCard
          label="Total Stations"
          value={metrics.totalStations}
          subtext="Floor capacity"
          icon={Monitor}
          accentColor="text-slate-400"
        />
        <StatCard
          label="Currently Playing"
          value={metrics.playingCount}
          subtext={
            metrics.attentionCount > 0
              ? `${metrics.attentionCount} need attention`
              : 'All timers nominal'
          }
          icon={Play}
          accentColor="text-amber-400"
        />
        <StatCard
          label="Available Stations"
          value={metrics.availableCount}
          subtext="Ready for check-in"
          icon={CheckCircle2}
          accentColor="text-emerald-400"
        />
        <StatCard
          label="Today's Revenue"
          value={formatCurrencyMad(metrics.todaysRevenue)}
          subtext="Prepaid counter total"
          icon={Wallet}
          accentColor="text-[#8B5CF6]"
        />
      </section>

      {/* Filter & View Controls Toolbar */}
      <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search
              className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search stations or games..."
              aria-label="Search stations"
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#8B5CF6]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StationStatus | 'all')}
            aria-label="Filter by status"
            className="h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] text-xs font-medium text-[var(--text-primary)] focus:outline-none focus:border-[#8B5CF6] cursor-pointer"
          >
            <option value="all">All statuses</option>
            <option value="available">Available</option>
            <option value="playing">Playing</option>
            <option value="expiring_soon">Expiring soon</option>
            <option value="expired">Time expired</option>
            <option value="finishing">Finishing</option>
            <option value="maintenance">Maintenance</option>
          </select>

          <select
            value={setupFilter}
            onChange={(e) => setSetupFilter(e.target.value as GamingSetupType | 'all')}
            aria-label="Filter by gaming setup"
            className="h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] text-xs font-medium text-[var(--text-primary)] focus:outline-none focus:border-[#8B5CF6] cursor-pointer"
          >
            <option value="all">All setups</option>
            <option value="PS5">PS5</option>
            <option value="Xbox Series X">Xbox Series X</option>
            <option value="Xbox Series S">Xbox Series S</option>
            <option value="Racing Simulator">Racing Simulator</option>
          </select>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2">
          {/* Mobile Live Feed button */}
          <button
            type="button"
            onClick={() => setMobileFeedOpen(true)}
            className="lg:hidden inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] text-xs font-medium text-[var(--text-primary)] cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5 text-[#8B5CF6]" />
            <span>Live Feed</span>
          </button>

          {/* Grid / Floor View Segmented Toggle */}
          <div className="inline-flex items-center p-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)]">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap',
                viewMode === 'grid'
                  ? 'bg-[#8B5CF6] text-white'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              )}
            >
              <LayoutGrid className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Grid View</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('floor')}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap',
                viewMode === 'floor'
                  ? 'bg-[#8B5CF6] text-white'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              )}
            >
              <Map className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Floor View</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Split: Station Grid + Right-Side Live Activity Panel */}
      <div className="flex items-start gap-5">
        <div className="flex-1 min-w-0">
          {filteredStations.length === 0 ? (
            <EmptyState
              icon={Monitor}
              title="No matching stations"
              description="Try clearing your search or status filter to view all stations on the gaming floor."
              actionLabel="Reset filters"
              onAction={() => {
                setSearch('');
                setStatusFilter('all');
                setSetupFilter('all');
              }}
            />
          ) : viewMode === 'grid' ? (
            <div
              className={cn(
                'grid gap-4',
                activityPanelOpen
                  ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
                  : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4'
              )}
            >
              {filteredStations.map((station) => (
                <StationCard
                  key={station.id}
                  station={station}
                  compact={settings.cardDensity === 'compact'}
                  onStartSession={openStartSessionDrawer}
                  onViewSession={openActiveSessionDrawer}
                  onQuickExtend={(id) => {
                    setQuickExtendStationId(id);
                    setQuickAddMinutes(30);
                  }}
                  onFinishExpired={moveExpiredToFinishing}
                  onConfirmReady={confirmStationReady}
                />
              ))}
            </div>
          ) : (
            <FloorPlanView
              stations={filteredStations}
              onSelectStation={(st) => {
                if (st.status === 'available') {
                  openStartSessionDrawer(st.id);
                } else if (st.status === 'finishing') {
                  confirmStationReady(st.id);
                } else if (st.activeSession) {
                  openActiveSessionDrawer(st.id);
                }
              }}
            />
          )}
        </div>

        {/* Desktop Collapsible Right-Side Live Activity Panel */}
        {activityPanelOpen && (
          <div className="hidden lg:block">
            <LiveActivityPanel
              stations={stations}
              activityFeed={activityFeed}
              onSelectStation={openActiveSessionDrawer}
            />
          </div>
        )}
      </div>

      {/* Mobile Live Feed Sheet */}
      {mobileFeedOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          <div
            className="fixed inset-0 bg-black/60"
            onClick={() => setMobileFeedOpen(false)}
          />
          <div className="relative z-10 w-80 max-w-full h-full bg-[var(--bg-main)] p-3 overflow-y-auto">
            <LiveActivityPanel
              stations={stations}
              activityFeed={activityFeed}
              onSelectStation={(id) => {
                setMobileFeedOpen(false);
                openActiveSessionDrawer(id);
              }}
              onCloseMobile={() => setMobileFeedOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Quick Extend Modal from Station Card */}
      <Modal
        open={Boolean(quickExtendStation && quickExtendStation.activeSession)}
        onClose={() => setQuickExtendStationId(null)}
        title="Extend Session"
        subtitle={
          quickExtendStation
            ? `${quickExtendStation.name} · ${quickExtendStation.activeSession?.gameTitle}`
            : ''
        }
        footer={
          <>
            <Button variant="ghost" onClick={() => setQuickExtendStationId(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleQuickExtendConfirm}>
              Confirm +{selectedQuickOpt?.price ?? 0} MAD & Extend
            </Button>
          </>
        }
      >
        {quickExtendStation && quickExtendStation.activeSession && selectedQuickOpt && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2.5">
              {quickExtensionOptions.map((opt) => (
                <button
                  key={opt.minutes}
                  type="button"
                  onClick={() => setQuickAddMinutes(opt.minutes)}
                  className={cn(
                    'rounded-xl border p-3 text-center cursor-pointer transition-all',
                    quickAddMinutes === opt.minutes
                      ? 'border-[#8B5CF6] bg-[#8B5CF6]/15 ring-2 ring-[#8B5CF6]/25'
                      : 'border-[var(--border-subtle)] bg-[var(--bg-elevated)]/40'
                  )}
                >
                  <p className="text-sm font-display font-bold font-mono-tabular text-[var(--text-primary)]">
                    +{opt.minutes} min
                  </p>
                  <p className="text-xs font-mono-tabular font-semibold text-[#8B5CF6] mt-1">
                    +{opt.price} MAD
                  </p>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {(['Cash', 'Card', 'Mobile Pay'] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setQuickPayMethod(method)}
                  className={cn(
                    'h-9 rounded-xl border text-xs font-medium cursor-pointer',
                    quickPayMethod === method
                      ? 'border-[#8B5CF6] bg-[#8B5CF6]/15 text-[#8B5CF6]'
                      : 'border-[var(--border-subtle)] bg-[var(--bg-elevated)]/40 text-[var(--text-secondary)]'
                  )}
                >
                  {method}
                </button>
              ))}
            </div>

            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/40 p-3 space-y-1 text-xs">
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>New scheduled end</span>
                <span className="font-mono-tabular font-semibold text-[var(--text-primary)]">
                  {addMinutesToTimeLabel(
                    new Date(),
                    Math.ceil(quickExtendStation.activeSession.remainingSeconds / 60) +
                      selectedQuickOpt.minutes
                  )}
                </span>
              </div>
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Updated session total</span>
                <span className="font-mono-tabular font-semibold text-[var(--text-primary)]">
                  {formatCurrencyMad(
                    quickExtendStation.activeSession.amountPaid + selectedQuickOpt.price
                  )}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
