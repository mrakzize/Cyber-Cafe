import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Cpu,
  Hourglass,
  Monitor,
  Play,
  Plus,
  Tv,
  Wrench,
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  Button,
  ControllerIndicators,
  CountdownTimer,
  SessionProgressBar,
  StationStatusBadge,
} from '@/src/components/ui/Primitives';
import { GAME_CATALOG } from '@/src/data/mockData';
import { cn, formatCurrencyMad, SETUP_SHORT_LABEL } from '@/src/lib/utils';
import { Station } from '@/src/types/cafe';

export function StationCard({
  station,
  compact = false,
  onStartSession,
  onViewSession,
  onQuickExtend,
  onFinishExpired,
  onConfirmReady,
  previewOnly = false,
}: {
  station: Station;
  compact?: boolean;
  onStartSession?: (stationId: string) => void;
  onViewSession?: (stationId: string) => void;
  onQuickExtend?: (stationId: string) => void;
  onFinishExpired?: (stationId: string) => void;
  onConfirmReady?: (stationId: string) => void;
  previewOnly?: boolean;
}) {
  const session = station.activeSession;
  const gameInfo = session
    ? GAME_CATALOG.find(
        (g) => g.id === session.gameId || g.title.toLowerCase() === session.gameTitle.toLowerCase()
      )
    : undefined;

  const isRacing = station.setupType === 'Racing Simulator';
  const isOccupied =
    station.status === 'playing' ||
    station.status === 'expiring_soon' ||
    station.status === 'expired' ||
    station.status === 'finishing';

  const cardBorderTone = {
    available: 'border-[var(--border-subtle)] hover:border-emerald-500/40',
    playing: 'border-amber-500/30 hover:border-amber-500/55',
    expiring_soon: 'border-red-500/50 hover:border-red-500/75',
    expired: 'border-red-500/65 hover:border-red-500/85',
    finishing: 'border-blue-500/45 hover:border-blue-500/65',
    maintenance: 'border-[var(--border-subtle)] opacity-80',
  }[station.status];

  const handleCardMainClick = () => {
    if (previewOnly) return;
    if (station.status === 'available' && onStartSession) {
      onStartSession(station.id);
    } else if (isOccupied && onViewSession) {
      onViewSession(station.id);
    }
  };

  return (
    <motion.article
      layout={!previewOnly}
      whileHover={previewOnly ? undefined : { y: -2 }}
      transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'rounded-2xl border bg-[var(--bg-card)] flex flex-col justify-between transition-colors duration-150',
        compact ? 'p-3.5 gap-3' : 'p-4 gap-3.5',
        cardBorderTone
      )}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <h3 className="text-sm font-display font-bold text-[var(--text-primary)] whitespace-nowrap">
            {station.name}
          </h3>
          <span aria-hidden="true" className="text-[var(--text-muted)] text-xs">
            ·
          </span>
          <span className="text-xs font-medium text-[var(--text-secondary)] truncate">
            {SETUP_SHORT_LABEL[station.setupType]}
          </span>
        </div>
        <StationStatusBadge status={station.status} compact={compact} />
      </div>

      {/* Excalidraw-inspired Center Hardware Block: TV/Monitor + Right Equipment Column */}
      <div
        onClick={handleCardMainClick}
        className={cn(
          'grid grid-cols-[1fr_92px] gap-2.5 items-stretch',
          !previewOnly && station.status !== 'maintenance' && 'cursor-pointer'
        )}
      >
        {/* TV / Monitor Bezel */}
        <div className="flex flex-col">
          <div
            className={cn(
              'relative rounded-xl border overflow-hidden flex flex-col justify-between bg-[#090D16]',
              compact ? 'min-h-[112px] p-3' : 'min-h-[128px] p-3.5',
              station.status === 'available'
                ? 'border-emerald-500/25'
                : station.status === 'playing'
                  ? 'border-amber-500/35'
                  : station.status === 'expiring_soon' || station.status === 'expired'
                    ? 'border-red-500/45'
                    : station.status === 'finishing'
                      ? 'border-blue-500/40'
                      : 'border-slate-700/60'
            )}
          >
            {/* Background Game Art for Active/Expiring */}
            {session &&
              (station.status === 'playing' || station.status === 'expiring_soon') &&
              gameInfo && (
                <>
                  <img
                    src={gameInfo.imageUrl}
                    alt={session.gameTitle}
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover opacity-30"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-[#090D16] via-[#090D16]/70 to-[#090D16]/50"
                    aria-hidden="true"
                  />
                </>
              )}

            {/* Monitor Inner States */}
            {station.status === 'available' && (
              <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center py-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400 mb-2">
                  <Tv className="w-4 h-4" aria-hidden="true" />
                </div>
                <p className="text-xs font-display font-semibold text-emerald-400">Available</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Ready for players</p>
              </div>
            )}

            {(station.status === 'playing' || station.status === 'expiring_soon') && session && (
              <>
                <div className="relative z-10 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[11px] text-slate-300/80 font-medium truncate">
                      Now Playing
                    </p>
                    <p className="text-xs font-display font-semibold text-white truncate mt-0.5">
                      {session.gameTitle}
                    </p>
                  </div>
                  {station.status === 'expiring_soon' && (
                    <AlertTriangle
                      className="w-4 h-4 text-red-400 shrink-0"
                      aria-label="Less than 5 minutes remaining"
                    />
                  )}
                </div>

                <div className="relative z-10 mt-3 space-y-2">
                  <div className="flex items-baseline justify-between gap-2">
                    <CountdownTimer
                      seconds={session.remainingSeconds}
                      status={station.status}
                      size={compact ? 'md' : 'lg'}
                    />
                    <span className="text-[11px] text-slate-400 font-mono-tabular">
                      / {session.purchasedMinutes}m
                    </span>
                  </div>
                  <SessionProgressBar
                    totalSeconds={session.totalSeconds}
                    remainingSeconds={session.remainingSeconds}
                    status={station.status}
                  />
                </div>
              </>
            )}

            {station.status === 'expired' && session && (
              <div className="relative z-10 flex-1 flex flex-col justify-between bg-red-950/20 -m-3.5 p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-display font-semibold text-red-400">
                    Time Expired
                  </span>
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" aria-hidden="true" />
                </div>
                <div className="my-1.5">
                  <CountdownTimer seconds={0} status="expired" size="lg" />
                </div>
                <p className="text-[11px] text-red-200/80 truncate">
                  {session.gameTitle} · Action required
                </p>
              </div>
            )}

            {station.status === 'finishing' && session && (
              <div className="relative z-10 flex-1 flex flex-col justify-between bg-blue-950/15 -m-3.5 p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-display font-semibold text-blue-400">
                    Finishing
                  </span>
                  <Hourglass className="w-4 h-4 text-blue-400 shrink-0" aria-hidden="true" />
                </div>
                <div className="my-1.5">
                  <CountdownTimer seconds={0} status="finishing" size="md" />
                </div>
                <p className="text-[11px] text-blue-200/80 truncate">
                  Verify gear & confirm ready
                </p>
              </div>
            )}

            {station.status === 'maintenance' && (
              <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center py-2">
                <div className="w-8 h-8 rounded-lg bg-slate-500/15 border border-slate-500/25 flex items-center justify-center text-slate-400 mb-2">
                  <Wrench className="w-4 h-4" aria-hidden="true" />
                </div>
                <p className="text-xs font-display font-semibold text-slate-300">Maintenance</p>
                <p className="text-[11px] text-slate-500 mt-0.5 truncate max-w-full">
                  Station unavailable
                </p>
              </div>
            )}
          </div>
          {/* Subtle TV Stand Foot */}
          <div className="mx-auto w-14 h-1 rounded-b-full bg-[var(--border-subtle)]" />
        </div>

        {/* Right Equipment Stack (Excalidraw green hardware boxes) */}
        <div className="flex flex-col justify-between gap-1.5">
          {station.equipmentTags.slice(0, 3).map((tag, idx) => (
            <div
              key={idx}
              className="flex-1 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.06] px-2 py-1.5 flex items-center gap-1.5 min-w-0"
              title={tag}
            >
              {idx === 0 ? (
                <Cpu className="w-3 h-3 text-emerald-500 dark:text-emerald-400 shrink-0" />
              ) : idx === 1 ? (
                <Monitor className="w-3 h-3 text-emerald-500 dark:text-emerald-400 shrink-0" />
              ) : (
                <CheckCircle2 className="w-3 h-3 text-emerald-500 dark:text-emerald-400 shrink-0" />
              )}
              <span className="text-[11px] font-medium text-[var(--text-secondary)] truncate">
                {tag}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Controller Indicators + Session Meta Row */}
      <div className="flex items-center justify-between gap-2 pt-0.5">
        <ControllerIndicators
          total={station.controllerCount}
          activeCount={session ? session.controllersUsed : 0}
          isRacingRig={isRacing}
        />

        {session ? (
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] font-mono-tabular whitespace-nowrap">
            <span>{session.startedAtLabel}</span>
            <span aria-hidden="true" className="text-[var(--text-muted)]">
              ·
            </span>
            <span className="font-semibold text-[var(--text-primary)]">
              {formatCurrencyMad(session.amountPaid)}
            </span>
          </div>
        ) : (
          <span className="text-xs text-[var(--text-muted)] truncate">
            {station.floorZone}
          </span>
        )}
      </div>

      {/* Card Footer Actions */}
      <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center gap-2">
        {station.status === 'available' && (
          <Button
            variant="primary"
            size="sm"
            className="w-full"
            disabled={previewOnly}
            onClick={() => onStartSession?.(station.id)}
          >
            <Play className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Start Session</span>
          </Button>
        )}

        {(station.status === 'playing' || station.status === 'expiring_soon') && (
          <>
            <Button
              variant="secondary"
              size="sm"
              className="flex-1"
              disabled={previewOnly}
              onClick={() => onViewSession?.(station.id)}
            >
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              <span>View Session</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={previewOnly}
              onClick={() => onQuickExtend?.(station.id)}
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Extend</span>
            </Button>
          </>
        )}

        {station.status === 'expired' && (
          <>
            <Button
              variant="danger"
              size="sm"
              className="flex-1"
              disabled={previewOnly}
              onClick={() => onFinishExpired?.(station.id)}
            >
              <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Finish Session</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={previewOnly}
              onClick={() => onQuickExtend?.(station.id)}
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Extend</span>
            </Button>
          </>
        )}

        {station.status === 'finishing' && (
          <Button
            variant="success"
            size="sm"
            className="w-full"
            disabled={previewOnly}
            onClick={() => onConfirmReady?.(station.id)}
          >
            <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Confirm Station Ready</span>
          </Button>
        )}

        {station.status === 'maintenance' && (
          <Button variant="secondary" size="sm" className="w-full" disabled>
            <Wrench className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Unavailable</span>
          </Button>
        )}
      </div>
    </motion.article>
  );
}
