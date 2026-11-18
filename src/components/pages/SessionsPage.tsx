import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  CreditCard,
  History,
  Play,
  Receipt,
  Timer,
  Wallet,
} from 'lucide-react';
import {
  Button,
  Drawer,
  EmptyState,
  StatCard,
} from '@/src/components/ui/Primitives';
import { useSessionsQuery, useStationsQuery } from '@/src/hooks/useCafeQueries';
import { cn, formatCurrencyMad, SETUP_SHORT_LABEL } from '@/src/lib/utils';
import { GamingSetupType, PaymentMethod, SessionRecord } from '@/src/types/cafe';

export function SessionsPage() {
  const { data: sessions } = useSessionsQuery();
  const { data: stations } = useStationsQuery();

  const [dateFilter, setDateFilter] = useState<'all' | 'Today' | 'Yesterday' | 'empty_test'>('all');
  const [stationFilter, setStationFilter] = useState<string>('all');
  const [setupFilter, setSetupFilter] = useState<GamingSetupType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | SessionRecord['sessionStatus']>('all');
  const [staffFilter, setStaffFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | PaymentMethod>('all');

  const [selectedSession, setSelectedSession] = useState<SessionRecord | null>(null);

  const uniqueStaff = useMemo(
    () => Array.from(new Set(sessions.map((s) => s.staffMember))),
    [sessions]
  );

  const filtered = useMemo(() => {
    if (dateFilter === 'empty_test') return [];
    return sessions.filter((rec) => {
      if (dateFilter !== 'all' && rec.dateLabel !== dateFilter) return false;
      if (stationFilter !== 'all' && rec.stationId !== stationFilter) return false;
      if (setupFilter !== 'all' && rec.setupType !== setupFilter) return false;
      if (statusFilter !== 'all' && rec.sessionStatus !== statusFilter) return false;
      if (staffFilter !== 'all' && rec.staffMember !== staffFilter) return false;
      if (paymentFilter !== 'all' && rec.paymentMethod !== paymentFilter) return false;
      return true;
    });
  }, [
    sessions,
    dateFilter,
    stationFilter,
    setupFilter,
    statusFilter,
    staffFilter,
    paymentFilter,
  ]);

  const todaySessions = sessions.filter((s) => s.dateLabel === 'Today');
  const todayRevenue = todaySessions.reduce((acc, s) => acc + s.amountPaid, 0);
  const totalMinutes = todaySessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const avgDuration =
    todaySessions.length > 0 ? Math.round(totalMinutes / todaySessions.length) : 0;

  const resetFilters = () => {
    setDateFilter('all');
    setStationFilter('all');
    setSetupFilter('all');
    setStatusFilter('all');
    setStaffFilter('all');
    setPaymentFilter('all');
  };

  return (
    <div className="space-y-5">
      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3.5">
        <StatCard
          label="Today's Sessions"
          value={todaySessions.length}
          subtext="Active & completed"
          icon={History}
          accentColor="text-[#8B5CF6]"
        />
        <StatCard
          label="Today's Sessions Total"
          value={formatCurrencyMad(todayRevenue)}
          subtext="Tracked in ledger"
          icon={Wallet}
          accentColor="text-emerald-400"
        />
        <StatCard
          label="Total Playtime"
          value={`${(totalMinutes / 60).toFixed(1)} hrs`}
          subtext={`${totalMinutes} minutes logged`}
          icon={Clock}
          accentColor="text-amber-400"
        />
        <StatCard
          label="Avg Session Duration"
          value={`${avgDuration} min`}
          subtext="Per booking today"
          icon={Timer}
          accentColor="text-cyan-400"
        />
      </div>

      {/* Filters Toolbar */}
      <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-3.5 flex flex-wrap items-center gap-2.5">
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value as typeof dateFilter)}
          aria-label="Filter by date range"
          className="h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-input)] text-xs font-medium text-[var(--text-primary)] focus:outline-none focus:border-[#8B5CF6]"
        >
          <option value="all">All dates</option>
          <option value="Today">Today</option>
          <option value="Yesterday">Yesterday</option>
          <option value="empty_test">Last Tuesday (No data)</option>
        </select>

        <select
          value={stationFilter}
          onChange={(e) => setStationFilter(e.target.value)}
          aria-label="Filter by station"
          className="h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-input)] text-xs font-medium text-[var(--text-primary)] focus:outline-none focus:border-[#8B5CF6]"
        >
          <option value="all">All stations</option>
          {stations.map((st) => (
            <option key={st.id} value={st.id}>
              {st.name}
            </option>
          ))}
        </select>

        <select
          value={setupFilter}
          onChange={(e) => setSetupFilter(e.target.value as GamingSetupType | 'all')}
          aria-label="Filter by gaming setup"
          className="h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-input)] text-xs font-medium text-[var(--text-primary)] focus:outline-none focus:border-[#8B5CF6]"
        >
          <option value="all">All setups</option>
          <option value="PS5">PS5</option>
          <option value="Xbox Series X">Xbox Series X</option>
          <option value="Xbox Series S">Xbox Series S</option>
          <option value="Racing Simulator">Racing Simulator</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as 'all' | SessionRecord['sessionStatus'])
          }
          aria-label="Filter by session status"
          className="h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-input)] text-xs font-medium text-[var(--text-primary)] focus:outline-none focus:border-[#8B5CF6]"
        >
          <option value="all">All statuses</option>
          <option value="Active">Active</option>
          <option value="Completed">Completed</option>
          <option value="Finished Early">Finished Early</option>
        </select>

        <select
          value={staffFilter}
          onChange={(e) => setStaffFilter(e.target.value)}
          aria-label="Filter by staff member"
          className="h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-input)] text-xs font-medium text-[var(--text-primary)] focus:outline-none focus:border-[#8B5CF6]"
        >
          <option value="all">All staff</option>
          {uniqueStaff.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>

        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value as 'all' | PaymentMethod)}
          aria-label="Filter by payment method"
          className="h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-input)] text-xs font-medium text-[var(--text-primary)] focus:outline-none focus:border-[#8B5CF6]"
        >
          <option value="all">All payments</option>
          <option value="Cash">Cash</option>
          <option value="Card">Card</option>
          <option value="Mobile Pay">Mobile Pay</option>
        </select>

        {(dateFilter !== 'all' ||
          stationFilter !== 'all' ||
          setupFilter !== 'all' ||
          statusFilter !== 'all' ||
          staffFilter !== 'all' ||
          paymentFilter !== 'all') && (
          <Button size="sm" variant="ghost" onClick={resetFilters}>
            Reset
          </Button>
        )}
      </div>

      {/* History Table or Empty State */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={History}
          title="No sessions recorded for this selection"
          description="No prepaid gaming sessions match the active date or station filters."
          actionLabel="Show all sessions"
          onAction={resetFilters}
        />
      ) : (
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]/40 text-xs font-medium text-[var(--text-secondary)] whitespace-nowrap">
                  <th className="py-3 px-4">Session ID</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Station</th>
                  <th className="py-3 px-4">Setup</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Start</th>
                  <th className="py-3 px-4">End</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Staff</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)] text-xs">
                {filtered.map((rec) => {
                  const statusTone =
                    rec.sessionStatus === 'Active'
                      ? 'text-amber-500 dark:text-amber-400 border-amber-500/30 bg-amber-500/10'
                      : rec.sessionStatus === 'Completed'
                        ? 'text-emerald-500 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                        : 'text-blue-500 dark:text-blue-400 border-blue-500/30 bg-blue-500/10';

                  return (
                    <tr
                      key={rec.id}
                      onClick={() => setSelectedSession(rec)}
                      className="hover:bg-[var(--bg-elevated)]/45 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <td className="py-3 px-4 font-mono-tabular font-semibold text-[var(--text-primary)]">
                        {rec.id}
                      </td>
                      <td className="py-3 px-4 text-[var(--text-secondary)]">
                        {rec.dateLabel}
                      </td>
                      <td className="py-3 px-4 font-medium text-[var(--text-primary)]">
                        {rec.stationName}
                      </td>
                      <td className="py-3 px-4 text-[var(--text-secondary)]">
                        {SETUP_SHORT_LABEL[rec.setupType]}
                      </td>
                      <td className="py-3 px-4 font-mono-tabular text-[var(--text-primary)]">
                        {rec.durationMinutes} min
                      </td>
                      <td className="py-3 px-4 font-mono-tabular text-[var(--text-secondary)]">
                        {rec.startTime}
                      </td>
                      <td className="py-3 px-4 font-mono-tabular text-[var(--text-secondary)]">
                        {rec.endTime}
                      </td>
                      <td className="py-3 px-4 text-right font-mono-tabular font-semibold text-[var(--text-primary)]">
                        {rec.amountPaid.toFixed(0)} MAD
                      </td>
                      <td className="py-3 px-4 text-[var(--text-secondary)]">
                        {rec.paymentStatus} · {rec.paymentMethod}
                      </td>
                      <td className="py-3 px-4 text-[var(--text-secondary)]">
                        {rec.staffMember}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[11px] font-medium',
                            statusTone
                          )}
                        >
                          {rec.sessionStatus === 'Active' ? (
                            <Play className="w-3 h-3" />
                          ) : (
                            <CheckCircle2 className="w-3 h-3" />
                          )}
                          <span>{rec.sessionStatus}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Session Detail Drawer */}
      <Drawer
        open={Boolean(selectedSession)}
        onClose={() => setSelectedSession(null)}
        title={selectedSession ? `Session ${selectedSession.id}` : ''}
        subtitle={
          selectedSession
            ? `${selectedSession.stationName} · ${selectedSession.setupType}`
            : ''
        }
      >
        {selectedSession && (
          <div className="space-y-5">
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/40 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--text-secondary)]">Game Played</span>
                <span className="text-sm font-display font-semibold text-[var(--text-primary)]">
                  {selectedSession.gameTitle}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--text-secondary)]">Schedule</span>
                <span className="text-xs font-mono-tabular text-[var(--text-primary)]">
                  {selectedSession.dateLabel} · {selectedSession.startTime} –{' '}
                  {selectedSession.endTime} ({selectedSession.durationMinutes} min)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--text-secondary)]">Controllers Used</span>
                <span className="text-xs font-mono-tabular text-[var(--text-primary)]">
                  {selectedSession.controllersUsed}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--text-secondary)]">Handled By</span>
                <span className="text-xs font-medium text-[var(--text-primary)]">
                  {selectedSession.staffMember}
                </span>
              </div>
              {selectedSession.earlyFinishReason && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--text-secondary)]">Finish Note</span>
                  <span className="text-xs text-blue-400">
                    {selectedSession.earlyFinishReason}
                  </span>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/40 p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-display font-semibold text-[var(--text-primary)]">
                <CreditCard className="w-4 h-4 text-[#8B5CF6]" />
                <span>Payment Breakdown</span>
              </div>
              <div className="flex justify-between text-xs text-[var(--text-secondary)]">
                <span>Method</span>
                <span className="text-[var(--text-primary)]">{selectedSession.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-xs text-[var(--text-secondary)]">
                <span>Payment Status</span>
                <span className="text-emerald-400 font-medium">
                  {selectedSession.paymentStatus}
                </span>
              </div>
              <div className="flex justify-between text-sm font-semibold text-[var(--text-primary)] pt-2 border-t border-[var(--border-subtle)]">
                <span>Total Collected</span>
                <span className="font-mono-tabular">
                  {formatCurrencyMad(selectedSession.amountPaid)}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/40 p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-display font-semibold text-[var(--text-primary)]">
                <Receipt className="w-4 h-4 text-cyan-400" />
                <span>Extension History</span>
              </div>
              {selectedSession.extensions.length === 0 ? (
                <p className="text-xs text-[var(--text-muted)]">
                  No time extensions added during this session.
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedSession.extensions.map((ext) => (
                    <div
                      key={ext.id}
                      className="flex items-center justify-between text-xs text-[var(--text-secondary)]"
                    >
                      <span>
                        +{ext.addedMinutes} min at {ext.timestamp} ({ext.staffName})
                      </span>
                      <span className="font-mono-tabular font-semibold text-[var(--text-primary)]">
                        +{formatCurrencyMad(ext.additionalCharge)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
