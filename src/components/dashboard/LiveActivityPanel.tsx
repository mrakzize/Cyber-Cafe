import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  CreditCard,
  Play,
  PlusCircle,
  X,
} from 'lucide-react';
import { CountdownTimer, SessionProgressBar } from '@/src/components/ui/Primitives';
import { cn, SETUP_SHORT_LABEL } from '@/src/lib/utils';
import { ActivityEvent, Station } from '@/src/types/cafe';

export function LiveActivityPanel({
  stations,
  activityFeed,
  onSelectStation,
  onCloseMobile,
}: {
  stations: Station[];
  activityFeed: ActivityEvent[];
  onSelectStation: (stationId: string) => void;
  onCloseMobile?: () => void;
}) {
  const activeStations = stations.filter(
    (s) =>
      (s.status === 'playing' || s.status === 'expiring_soon') &&
      Boolean(s.activeSession)
  );

  const urgentStations = stations.filter(
    (s) =>
      (s.status === 'expiring_soon' || s.status === 'expired' || s.status === 'finishing') &&
      Boolean(s.activeSession)
  );

  return (
    <aside
      aria-label="Live activity panel"
      className="w-full lg:w-[280px] shrink-0 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] flex flex-col overflow-hidden h-fit lg:sticky lg:top-[76px]"
    >
      {/* Mobile Close Header */}
      {onCloseMobile && (
        <div className="px-4 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between lg:hidden">
          <span className="text-xs font-display font-bold text-[var(--text-primary)]">
            Live Floor Feed
          </span>
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Section 1: Active Sessions */}
      <div className="p-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-display font-bold text-[var(--text-primary)]">
            Active Sessions
          </h2>
          <span className="text-xs font-mono-tabular text-[var(--text-muted)]">
            {activeStations.length} running
          </span>
        </div>

        {activeStations.length === 0 ? (
          <p className="text-xs text-[var(--text-muted)] py-2">
            No sessions running right now.
          </p>
        ) : (
          <div className="space-y-2.5">
            {activeStations.map((st) => {
              const sess = st.activeSession!;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => onSelectStation(st.id)}
                  className="w-full text-left rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/50 hover:bg-[var(--bg-elevated)] p-2.5 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[var(--text-primary)] truncate">
                      {st.name} · {SETUP_SHORT_LABEL[st.setupType]}
                    </span>
                    <CountdownTimer
                      seconds={sess.remainingSeconds}
                      status={st.status}
                      size="sm"
                    />
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] truncate mt-0.5 mb-2">
                    {sess.gameTitle}
                  </p>
                  <SessionProgressBar
                    totalSeconds={sess.totalSeconds}
                    remainingSeconds={sess.remainingSeconds}
                    status={st.status}
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 2: Expiring Soon / Attention Required */}
      <div className="p-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-display font-bold text-[var(--text-primary)]">
            Expiring & Alerts
          </h2>
          <span
            className={cn(
              'text-xs font-mono-tabular',
              urgentStations.length > 0 ? 'text-red-400 font-semibold' : 'text-[var(--text-muted)]'
            )}
          >
            {urgentStations.length}
          </span>
        </div>

        {urgentStations.length === 0 ? (
          <p className="text-xs text-[var(--text-muted)] py-1">
            All active timers above 5 minutes.
          </p>
        ) : (
          <div className="space-y-2">
            {urgentStations.map((st) => {
              const sess = st.activeSession!;
              const isExpired = st.status === 'expired';
              const isFinishing = st.status === 'finishing';

              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => onSelectStation(st.id)}
                  className={cn(
                    'w-full text-left rounded-xl border p-2.5 flex items-center justify-between gap-2 transition-colors cursor-pointer',
                    isFinishing
                      ? 'border-blue-500/35 bg-blue-500/10 hover:bg-blue-500/15'
                      : 'border-red-500/35 bg-red-500/10 hover:bg-red-500/15'
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <AlertTriangle
                      className={cn(
                        'w-3.5 h-3.5 shrink-0',
                        isFinishing ? 'text-blue-400' : 'text-red-400'
                      )}
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[var(--text-primary)] truncate">
                        {st.name}
                      </p>
                      <p
                        className={cn(
                          'text-[11px] truncate',
                          isFinishing ? 'text-blue-400' : 'text-red-400'
                        )}
                      >
                        {isExpired
                          ? 'Time expired — action'
                          : isFinishing
                            ? 'Confirm station ready'
                            : 'Less than 5 min'}
                      </p>
                    </div>
                  </div>
                  <CountdownTimer
                    seconds={sess.remainingSeconds}
                    status={st.status}
                    size="sm"
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 3: Recent Activity Timeline */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-display font-bold text-[var(--text-primary)]">
            Recent Activity
          </h2>
          <Clock className="w-3.5 h-3.5 text-[var(--text-muted)]" aria-hidden="true" />
        </div>

        <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
          {activityFeed.slice(0, 8).map((ev) => {
            const Icon = {
              start: Play,
              extend: PlusCircle,
              complete: CheckCircle2,
              payment: CreditCard,
              alert: AlertTriangle,
              maintenance: Clock,
            }[ev.type];

            const iconColor = {
              start: 'text-amber-400',
              extend: 'text-[#8B5CF6]',
              complete: 'text-emerald-400',
              payment: 'text-cyan-400',
              alert: 'text-red-400',
              maintenance: 'text-slate-400',
            }[ev.type];

            return (
              <div key={ev.id} className="flex items-start gap-2.5 text-xs">
                <Icon className={cn('w-3.5 h-3.5 mt-0.5 shrink-0', iconColor)} />
                <div className="min-w-0 flex-1">
                  <p className="text-[var(--text-primary)] leading-snug">{ev.message}</p>
                  <p className="text-[11px] text-[var(--text-muted)] font-mono-tabular mt-0.5">
                    {ev.time}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
