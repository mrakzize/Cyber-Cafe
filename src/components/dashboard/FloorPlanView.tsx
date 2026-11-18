import React from 'react';
import { Gamepad2, Monitor, Wrench } from 'lucide-react';
import { CountdownTimer, StationStatusBadge } from '@/src/components/ui/Primitives';
import { cn, SETUP_SHORT_LABEL } from '@/src/lib/utils';
import { FloorZone, Station } from '@/src/types/cafe';

const ZONES: { zone: FloorZone; subtitle: string }[] = [
  { zone: 'Console Bay', subtitle: 'Main floor counter-facing pods' },
  { zone: 'VIP Lounge', subtitle: '4-player couch booths & OLED screens' },
  { zone: 'Sim Racing', subtitle: 'Cockpit rigs with direct-drive wheels' },
];

export function FloorPlanView({
  stations,
  onSelectStation,
}: {
  stations: Station[];
  onSelectStation: (station: Station) => void;
}) {
  return (
    <div className="space-y-5">
      {ZONES.map(({ zone, subtitle }) => {
        const zoneStations = stations.filter((s) => s.floorZone === zone);
        if (zoneStations.length === 0) return null;

        return (
          <section
            key={zone}
            className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 sm:p-5"
          >
            <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-[var(--border-subtle)]">
              <div>
                <h3 className="text-sm font-display font-bold text-[var(--text-primary)]">
                  {zone}
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">{subtitle}</p>
              </div>
              <span className="text-xs font-mono-tabular text-[var(--text-muted)]">
                {zoneStations.length} stations
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {zoneStations.map((st) => {
                const isMaintenance = st.status === 'maintenance';
                const borderTone =
                  st.status === 'available'
                    ? 'border-emerald-500/35 hover:border-emerald-500/60'
                    : st.status === 'playing'
                      ? 'border-amber-500/35 hover:border-amber-500/60'
                      : st.status === 'expiring_soon' || st.status === 'expired'
                        ? 'border-red-500/55 hover:border-red-500/80'
                        : st.status === 'finishing'
                          ? 'border-blue-500/45 hover:border-blue-500/70'
                          : 'border-[var(--border-subtle)] opacity-70';

                return (
                  <button
                    key={st.id}
                    type="button"
                    disabled={isMaintenance}
                    onClick={() => onSelectStation(st)}
                    className={cn(
                      'text-left rounded-xl border bg-[var(--bg-elevated)]/60 p-3.5 transition-all cursor-pointer disabled:cursor-not-allowed',
                      borderTone
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Monitor className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />
                        <span className="text-sm font-display font-bold text-[var(--text-primary)] truncate">
                          {st.name}
                        </span>
                      </div>
                      <StationStatusBadge status={st.status} compact />
                    </div>

                    <div className="mt-3 flex items-end justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-[var(--text-secondary)] truncate">
                          {SETUP_SHORT_LABEL[st.setupType]} · {st.monitorDescription}
                        </p>
                        <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">
                          {st.activeSession
                            ? st.activeSession.gameTitle
                            : isMaintenance
                              ? 'Hardware service'
                              : `${st.controllerCount} controllers ready`}
                        </p>
                      </div>

                      {st.activeSession ? (
                        <CountdownTimer
                          seconds={st.activeSession.remainingSeconds}
                          status={st.status}
                          size="md"
                        />
                      ) : isMaintenance ? (
                        <Wrench className="w-4 h-4 text-slate-400 shrink-0" />
                      ) : (
                        <Gamepad2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
