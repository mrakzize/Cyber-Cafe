import React, { useMemo, useState } from 'react';
import {
  Activity,
  BarChart3,
  Clock,
  Receipt,
  Wallet,
} from 'lucide-react';
import { StatCard } from '@/src/components/ui/Primitives';
import { WEEKLY_REVENUE_DATA } from '@/src/data/mockData';
import { useSessionsQuery, useStationsQuery } from '@/src/hooks/useCafeQueries';
import { cn, formatCurrencyMad } from '@/src/lib/utils';

type TimeRange = 'today' | 'week' | 'month' | 'custom';

export function ReportsPage() {
  const { data: sessions } = useSessionsQuery();
  const { data: stations } = useStationsQuery();

  const [range, setRange] = useState<TimeRange>('week');
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);
  const [customStart, setCustomStart] = useState('2026-11-10');
  const [customEnd, setCustomEnd] = useState('2026-11-17');

  const multiplier =
    range === 'today' ? 0.16 : range === 'week' ? 1 : range === 'month' ? 4.2 : 1.4;

  const dailyChartData = useMemo(() => {
    const scale = range === 'today' ? 0.25 : range === 'month' ? 3.8 : 1;
    return WEEKLY_REVENUE_DATA.map((d) => ({
      ...d,
      revenue: Math.round(d.revenue * scale),
      sessions: Math.round(d.sessions * scale),
    }));
  }, [range]);

  const maxDayRev = Math.max(...dailyChartData.map((d) => d.revenue), 1);

  const totalRevenue = Math.round(
    WEEKLY_REVENUE_DATA.reduce((acc, d) => acc + d.revenue, 0) * multiplier
  );
  const totalSessions = Math.round(
    WEEKLY_REVENUE_DATA.reduce((acc, d) => acc + d.sessions, 0) * multiplier
  );
  const totalHours = Math.round(totalSessions * 1.15);
  const avgPerSession = totalSessions > 0 ? totalRevenue / totalSessions : 0;
  const utilizationPct = range === 'today' ? 68 : range === 'week' ? 74 : 71;

  // Revenue by Gaming Setup
  const setupBreakdown = [
    { label: 'PlayStation', share: 48, amount: Math.round(totalRevenue * 0.48), color: '#8B5CF6' },
    { label: 'Xbox', share: 27, amount: Math.round(totalRevenue * 0.27), color: '#3B82F6' },
    {
      label: 'Racing Simulator',
      share: 25,
      amount: Math.round(totalRevenue * 0.25),
      color: '#06B6D4',
    },
  ];

  // Station Utilization
  const stationUtilization = stations.slice(0, 6).map((st, idx) => {
    const base = [86, 78, 72, 81, 64, 58][idx] ?? 65;
    return {
      name: st.name,
      setup: st.setupType,
      pct: st.status === 'maintenance' ? 18 : base,
    };
  });

  // Popular Session Durations
  const durationPopularity = [
    { label: '30 min', count: Math.round(78 * multiplier), pct: 24 },
    { label: '60 min', count: Math.round(142 * multiplier), pct: 44 },
    { label: '90 min', count: Math.round(62 * multiplier), pct: 19 },
    { label: '120 min', count: Math.round(42 * multiplier), pct: 13 },
  ];

  // SVG Donut Geometry
  const donutRadius = 52;
  const donutCircumference = 2 * Math.PI * donutRadius;
  let runningOffset = 0;

  return (
    <div className="space-y-5">
      {/* Timeframe Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center p-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)]">
          {(
            [
              { id: 'today', label: 'Today' },
              { id: 'week', label: 'This Week' },
              { id: 'month', label: 'This Month' },
              { id: 'custom', label: 'Custom Range' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setRange(item.id)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap',
                range === item.id
                  ? 'bg-[#8B5CF6] text-white'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        {range === 'custom' && (
          <div className="flex items-center gap-2 text-xs">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-primary)] font-mono-tabular"
            />
            <span className="text-[var(--text-muted)]">to</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-primary)] font-mono-tabular"
            />
          </div>
        )}
      </div>

      {/* 5 Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <StatCard
          label="Total Revenue"
          value={formatCurrencyMad(totalRevenue)}
          icon={Wallet}
          accentColor="text-[#8B5CF6]"
        />
        <StatCard
          label="Total Sessions"
          value={totalSessions}
          subtext={`${sessions.length} live/recent`}
          icon={BarChart3}
          accentColor="text-blue-400"
        />
        <StatCard
          label="Hours Played"
          value={`${totalHours} hrs`}
          icon={Clock}
          accentColor="text-amber-400"
        />
        <StatCard
          label="Avg / Session"
          value={formatCurrencyMad(avgPerSession)}
          icon={Receipt}
          accentColor="text-cyan-400"
        />
        <StatCard
          label="Station Utilization"
          value={`${utilizationPct}%`}
          icon={Activity}
          accentColor="text-emerald-400"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Overview Bar Chart (2 cols wide) */}
        <section className="lg:col-span-2 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-sm font-display font-bold text-[var(--text-primary)]">
                Revenue Overview
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Daily gaming floor revenue in MAD
              </p>
            </div>
            {hoveredDay && (
              <span className="text-xs font-mono-tabular font-semibold text-[#8B5CF6]">
                {hoveredDay}
              </span>
            )}
          </div>

          <div className="h-56 flex items-end justify-between gap-3 pt-4">
            {dailyChartData.map((d) => {
              const heightPct = Math.max(8, Math.round((d.revenue / maxDayRev) * 100));
              return (
                <div
                  key={d.day}
                  onMouseEnter={() =>
                    setHoveredDay(`${d.day}: ${d.revenue.toFixed(0)} MAD (${d.sessions} sessions)`)
                  }
                  onMouseLeave={() => setHoveredDay(null)}
                  className="flex-1 flex flex-col items-center gap-2 h-full justify-end group cursor-pointer"
                >
                  <span className="text-[11px] font-mono-tabular text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors">
                    {d.revenue}
                  </span>
                  <div className="w-full max-w-[44px] h-40 rounded-xl bg-[var(--bg-elevated)]/60 flex items-end overflow-hidden p-1">
                    <div
                      className="w-full rounded-lg bg-[#8B5CF6] group-hover:bg-[#7C3AED] transition-all duration-300"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-[var(--text-secondary)]">
                    {d.day}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Revenue by Gaming Setup Donut */}
        <section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-display font-bold text-[var(--text-primary)]">
              Revenue by Gaming Setup
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Share across hardware categories
            </p>
          </div>

          <div className="flex items-center justify-center my-4">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
                {setupBreakdown.map((seg) => {
                  const dashLen = (seg.share / 100) * donutCircumference;
                  const dashOffset = -runningOffset;
                  runningOffset += dashLen;
                  return (
                    <circle
                      key={seg.label}
                      cx="64"
                      cy="64"
                      r={donutRadius}
                      fill="none"
                      stroke={seg.color}
                      strokeWidth="14"
                      strokeDasharray={`${dashLen} ${donutCircumference}`}
                      strokeDashoffset={dashOffset}
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xs text-[var(--text-muted)]">Total</span>
                <span className="text-sm font-mono-tabular font-bold text-[var(--text-primary)]">
                  {totalRevenue} MAD
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {setupBreakdown.map((seg) => (
              <div
                key={seg.label}
                className="flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-sm shrink-0"
                    style={{ backgroundColor: seg.color }}
                  />
                  <span className="text-[var(--text-secondary)]">{seg.label}</span>
                </div>
                <span className="font-mono-tabular font-semibold text-[var(--text-primary)]">
                  {seg.share}% · {seg.amount} MAD
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Station Utilization */}
        <section className="lg:col-span-2 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5">
          <h2 className="text-sm font-display font-bold text-[var(--text-primary)]">
            Station Utilization
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mb-4">
            Percentage of operating hours occupied per station
          </p>

          <div className="space-y-3">
            {stationUtilization.map((item) => (
              <div key={item.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[var(--text-primary)]">
                    {item.name}{' '}
                    <span className="text-[var(--text-muted)]">· {item.setup}</span>
                  </span>
                  <span className="font-mono-tabular font-semibold text-[var(--text-primary)]">
                    {item.pct}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#3B82F6] transition-all duration-300"
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Popular Session Durations */}
        <section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5">
          <h2 className="text-sm font-display font-bold text-[var(--text-primary)]">
            Popular Durations
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mb-4">
            Packages purchased by players
          </p>

          <div className="space-y-3.5">
            {durationPopularity.map((d) => (
              <div key={d.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono-tabular font-semibold text-[var(--text-primary)]">
                    {d.label}
                  </span>
                  <span className="font-mono-tabular text-[var(--text-secondary)]">
                    {d.count} sessions ({d.pct}%)
                  </span>
                </div>
                <div className="h-2 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#06B6D4] transition-all duration-300"
                    style={{ width: `${d.pct * 2}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
