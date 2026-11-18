import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Banknote,
  CheckCircle2,
  Clock,
  CreditCard,
  Gamepad2,
  Plus,
  Receipt,
  Smartphone,
  User,
} from 'lucide-react';
import {
  Button,
  CountdownTimer,
  Drawer,
  Modal,
  StationStatusBadge,
} from '@/src/components/ui/Primitives';
import {
  addMinutesToTimeLabel,
  cn,
  formatCountdown,
  formatCurrencyMad,
} from '@/src/lib/utils';
import { useCafeStore } from '@/src/store/useCafeStore';
import { PaymentMethod } from '@/src/types/cafe';

const FINISH_REASONS = [
  'Customer left early',
  'Switched to another station',
  'Technical issue / hardware swap',
  'Staff override',
];

export function ActiveSessionDrawer() {
  const {
    activeSessionStationId,
    closeActiveSessionDrawer,
    stations,
    pricingPackages,
    extendSession,
    finishSessionEarly,
    confirmStationReady,
    moveExpiredToFinishing,
  } = useCafeStore();

  const [extendModalOpen, setExtendModalOpen] = useState(false);
  const [finishEarlyModalOpen, setFinishEarlyModalOpen] = useState(false);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);

  const [selectedAddMinutes, setSelectedAddMinutes] = useState<15 | 30 | 60>(30);
  const [extendPaymentMethod, setExtendPaymentMethod] = useState<PaymentMethod>('Cash');
  const [finishReason, setFinishReason] = useState(FINISH_REASONS[0]);

  const station = useMemo(
    () => stations.find((s) => s.id === activeSessionStationId) || null,
    [stations, activeSessionStationId]
  );

  const session = station?.activeSession;

  // Calculate dynamic extension pricing based on station's hourly package
  const extensionOptions = useMemo(() => {
    if (!station) return [];
    const sixtyPkg = pricingPackages.find(
      (p) => p.setupType === station.pricingCategory && p.durationMinutes === 60
    );
    const hourlyRate = sixtyPkg?.priceMad || 15;

    return ([15, 30, 60] as const).map((mins) => {
      const exactPkg = pricingPackages.find(
        (p) => p.setupType === station.pricingCategory && p.durationMinutes === mins && p.enabled
      );
      const price = exactPkg
        ? exactPkg.priceMad
        : Math.max(5, Math.round((hourlyRate * (mins / 60)) / 1) * 1);
      return { minutes: mins, price };
    });
  }, [pricingPackages, station]);

  const selectedExtension =
    extensionOptions.find((o) => o.minutes === selectedAddMinutes) || extensionOptions[1];

  const elapsedMinutes = session
    ? Math.max(0, Math.round((session.totalSeconds - session.remainingSeconds) / 60))
    : 0;

  const progressFraction = session
    ? Math.min(1, Math.max(0, session.remainingSeconds / Math.max(1, session.totalSeconds)))
    : 0;

  const ringRadius = 56;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const strokeOffset = ringCircumference * (1 - progressFraction);

  const handleConfirmExtend = () => {
    if (!station || !selectedExtension) return;
    extendSession({
      stationId: station.id,
      addedMinutes: selectedExtension.minutes,
      additionalCharge: selectedExtension.price,
      paymentMethod: extendPaymentMethod,
    });
    setExtendModalOpen(false);
  };

  const handleConfirmFinishEarly = () => {
    if (!station) return;
    finishSessionEarly(station.id, finishReason);
    setFinishEarlyModalOpen(false);
  };

  return (
    <>
      <Drawer
        open={Boolean(station && session)}
        onClose={closeActiveSessionDrawer}
        title={station ? `${station.name} — ${station.setupType}` : 'Session Details'}
        subtitle={session ? `Session ${session.sessionId} · ${station?.consoleModel}` : ''}
        widthClass="max-w-lg"
        footer={
          station && session ? (
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              {station.status === 'finishing' ? (
                <Button
                  variant="success"
                  size="lg"
                  className="w-full"
                  onClick={() => confirmStationReady(station.id)}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Station Available</span>
                </Button>
              ) : station.status === 'expired' ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setExtendModalOpen(true)}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Extend Session</span>
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => {
                      moveExpiredToFinishing(station.id);
                    }}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Finish Session</span>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setFinishEarlyModalOpen(true)}
                  >
                    <span>Finish Early</span>
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => setExtendModalOpen(true)}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Extend Session</span>
                  </Button>
                </>
              )}
            </div>
          ) : null
        }
      >
        {station && session && (
          <div className="space-y-6">
            {/* Circular Countdown Hero */}
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[#090D16] p-6 flex flex-col items-center text-center relative">
              <div className="w-full flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-slate-400">
                  {session.gameTitle}
                </span>
                <StationStatusBadge status={station.status} />
              </div>

              <div className="relative w-36 h-36 flex items-center justify-center my-2">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
                  <circle
                    cx="64"
                    cy="64"
                    r={ringRadius}
                    fill="none"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="8"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r={ringRadius}
                    fill="none"
                    stroke={
                      station.status === 'expired' || station.status === 'expiring_soon'
                        ? '#EF4444'
                        : station.status === 'finishing'
                          ? '#3B82F6'
                          : '#F59E0B'
                    }
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={ringCircumference}
                    strokeDashoffset={strokeOffset}
                    className="transition-all duration-300"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <CountdownTimer
                    seconds={session.remainingSeconds}
                    status={station.status}
                    size="xl"
                  />
                  <span className="text-[11px] text-slate-400 mt-1.5">
                    {station.status === 'expired' ? 'Time up' : 'remaining'}
                  </span>
                </div>
              </div>
            </div>

            {/* Session Metadata Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/40 p-3">
                <p className="text-[11px] text-[var(--text-muted)]">Game</p>
                <p className="text-sm font-semibold text-[var(--text-primary)] truncate mt-0.5">
                  {session.gameTitle}
                </p>
              </div>
              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/40 p-3">
                <p className="text-[11px] text-[var(--text-muted)]">Amount Paid</p>
                <p className="text-sm font-mono-tabular font-semibold text-[var(--text-primary)] mt-0.5">
                  {formatCurrencyMad(session.amountPaid)}
                </p>
              </div>
              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/40 p-3">
                <p className="text-[11px] text-[var(--text-muted)]">Session Started</p>
                <p className="text-sm font-mono-tabular font-semibold text-[var(--text-primary)] mt-0.5">
                  {session.startedAtLabel}
                </p>
              </div>
              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/40 p-3">
                <p className="text-[11px] text-[var(--text-muted)]">Scheduled End</p>
                <p className="text-sm font-mono-tabular font-semibold text-[var(--text-primary)] mt-0.5">
                  {session.endAtLabel}
                </p>
              </div>
              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/40 p-3">
                <p className="text-[11px] text-[var(--text-muted)]">Purchased / Elapsed</p>
                <p className="text-sm font-mono-tabular font-semibold text-[var(--text-primary)] mt-0.5">
                  {session.purchasedMinutes} min · {elapsedMinutes} min used
                </p>
              </div>
              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/40 p-3">
                <p className="text-[11px] text-[var(--text-muted)]">Staff & Controllers</p>
                <p className="text-sm font-medium text-[var(--text-primary)] mt-0.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                  <span>{session.staffName}</span>
                  <span>·</span>
                  <Gamepad2 className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                  <span>{session.controllersUsed}</span>
                </p>
              </div>
            </div>

            {/* Toggle Payment Details */}
            <div>
              <button
                type="button"
                onClick={() => setShowPaymentDetails((v) => !v)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#8B5CF6] hover:underline cursor-pointer"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>{showPaymentDetails ? 'Hide Payment Details' : 'View Payment Details'}</span>
              </button>

              {showPaymentDetails && (
                <div className="mt-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/40 p-4 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Payment Method</span>
                    <span className="font-medium text-[var(--text-primary)]">
                      {session.paymentMethod}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Session Reference</span>
                    <span className="font-mono-tabular text-[var(--text-primary)]">
                      {session.sessionId}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Extensions Added</span>
                    <span className="font-mono-tabular text-[var(--text-primary)]">
                      {session.extensions.length}
                    </span>
                  </div>
                  {session.extensions.map((ext) => (
                    <div
                      key={ext.id}
                      className="flex justify-between text-[11px] text-[var(--text-muted)] pl-2 border-l border-[var(--border-subtle)]"
                    >
                      <span>
                        +{ext.addedMinutes} min at {ext.timestamp} ({ext.paymentMethod})
                      </span>
                      <span className="font-mono-tabular">
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

      {/* Extend Session Modal */}
      <Modal
        open={extendModalOpen && Boolean(station && session)}
        onClose={() => setExtendModalOpen(false)}
        title="Extend Gaming Session"
        subtitle={station ? `${station.name} · ${station.setupType}` : ''}
        footer={
          <>
            <Button variant="ghost" onClick={() => setExtendModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleConfirmExtend}>
              <CheckCircle2 className="w-4 h-4" />
              <span>
                Confirm {selectedExtension ? `+${selectedExtension.price} MAD` : ''} & Extend
              </span>
            </Button>
          </>
        }
      >
        {station && session && selectedExtension && (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-[var(--text-secondary)] mb-2">
                Select additional time
              </p>
              <div className="grid grid-cols-3 gap-2.5">
                {extensionOptions.map((opt) => {
                  const active = selectedAddMinutes === opt.minutes;
                  return (
                    <button
                      key={opt.minutes}
                      type="button"
                      onClick={() => setSelectedAddMinutes(opt.minutes)}
                      className={cn(
                        'rounded-xl border p-3 text-center transition-all cursor-pointer',
                        active
                          ? 'border-[#8B5CF6] bg-[#8B5CF6]/15 ring-2 ring-[#8B5CF6]/25'
                          : 'border-[var(--border-subtle)] bg-[var(--bg-elevated)]/40 hover:bg-[var(--bg-elevated)]'
                      )}
                    >
                      <p className="text-sm font-display font-bold text-[var(--text-primary)] font-mono-tabular">
                        +{opt.minutes} min
                      </p>
                      <p className="text-xs font-mono-tabular text-[#8B5CF6] font-semibold mt-1">
                        +{opt.price} MAD
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-[var(--text-secondary)] mb-2">
                Payment confirmation
              </p>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: 'Cash', icon: Banknote },
                    { id: 'Card', icon: CreditCard },
                    { id: 'Mobile Pay', icon: Smartphone },
                  ] as const
                ).map(({ id, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setExtendPaymentMethod(id)}
                    className={cn(
                      'flex items-center justify-center gap-1.5 h-9 rounded-xl border text-xs font-medium cursor-pointer',
                      extendPaymentMethod === id
                        ? 'border-[#8B5CF6] bg-[#8B5CF6]/15 text-[#8B5CF6]'
                        : 'border-[var(--border-subtle)] bg-[var(--bg-elevated)]/40 text-[var(--text-secondary)]'
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{id}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/40 p-3.5 space-y-1.5 text-xs">
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Updated end time</span>
                <span className="font-mono-tabular font-semibold text-[var(--text-primary)]">
                  {addMinutesToTimeLabel(
                    new Date(),
                    Math.ceil(session.remainingSeconds / 60) + selectedExtension.minutes
                  )}
                </span>
              </div>
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>New total paid</span>
                <span className="font-mono-tabular font-semibold text-[var(--text-primary)]">
                  {formatCurrencyMad(session.amountPaid + selectedExtension.price)}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Finish Early Confirmation Modal */}
      <Modal
        open={finishEarlyModalOpen && Boolean(station && session)}
        onClose={() => setFinishEarlyModalOpen(false)}
        title="Finish Session Early"
        subtitle={station ? `${station.name} · ${session?.sessionId}` : ''}
        footer={
          <>
            <Button variant="ghost" onClick={() => setFinishEarlyModalOpen(false)}>
              Keep Playing
            </Button>
            <Button variant="danger" onClick={handleConfirmFinishEarly}>
              <Clock className="w-4 h-4" />
              <span>Confirm Early Finish</span>
            </Button>
          </>
        }
      >
        {station && session && (
          <div className="space-y-4">
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 flex items-start gap-2.5 text-xs text-amber-300">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Unused prepaid time is not automatically refunded. Completing early marks{' '}
                <strong>{station.name}</strong> as Available immediately.
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/40 p-2.5">
                <p className="text-[11px] text-[var(--text-muted)]">Purchased</p>
                <p className="text-sm font-mono-tabular font-semibold text-[var(--text-primary)] mt-0.5">
                  {session.purchasedMinutes}m
                </p>
              </div>
              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/40 p-2.5">
                <p className="text-[11px] text-[var(--text-muted)]">Time Used</p>
                <p className="text-sm font-mono-tabular font-semibold text-[var(--text-primary)] mt-0.5">
                  {elapsedMinutes}m
                </p>
              </div>
              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/40 p-2.5">
                <p className="text-[11px] text-[var(--text-muted)]">Remaining</p>
                <p className="text-sm font-mono-tabular font-semibold text-amber-400 mt-0.5">
                  {formatCountdown(session.remainingSeconds)}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                Early finish reason
              </label>
              <select
                value={finishReason}
                onChange={(e) => setFinishReason(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-input)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#8B5CF6]"
              >
                {FINISH_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
