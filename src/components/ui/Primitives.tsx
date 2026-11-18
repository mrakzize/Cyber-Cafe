import React, { useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Gamepad2,
  Hourglass,
  Info,
  Play,
  Wrench,
  X,
  XCircle,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { cn, formatCountdown, STATUS_META } from '@/src/lib/utils';
import { StationStatus, ToastItem } from '@/src/types/cafe';

/* -------------------------------------------------------------------------- */
/* Button                                                                     */
/* -------------------------------------------------------------------------- */

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', type = 'button', ...props }, ref) => {
    const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
      primary:
        'bg-[#8B5CF6] text-white hover:bg-[#7C3AED] active:bg-[#6D28D9] shadow-sm shadow-violet-950/20 border border-violet-400/20',
      secondary:
        'bg-[var(--bg-elevated)] text-[var(--text-primary)] hover:bg-[var(--border-subtle)] border border-[var(--border-subtle)]',
      outline:
        'bg-transparent text-[var(--text-primary)] border border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)]',
      ghost:
        'bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] border border-transparent',
      danger:
        'bg-red-500/15 text-red-500 dark:text-red-400 hover:bg-red-500/25 border border-red-500/30',
      success:
        'bg-emerald-600 text-white hover:bg-emerald-500 border border-emerald-400/20',
    };

    const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
      sm: 'h-8 px-3 text-xs rounded-lg gap-1.5',
      md: 'h-9 px-4 text-sm rounded-xl gap-2',
      lg: 'h-11 px-5 text-sm rounded-xl gap-2',
    };

    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          'inline-flex items-center justify-center font-medium whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-main)] disabled:opacity-45 disabled:pointer-events-none cursor-pointer',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

/* -------------------------------------------------------------------------- */
/* Station Status Indicator (Icon + Text, never hue-only, zero pulsing dots)  */
/* -------------------------------------------------------------------------- */

export function StationStatusBadge({
  status,
  compact = false,
}: {
  status: StationStatus;
  compact?: boolean;
}) {
  const meta = STATUS_META[status];

  const Icon = {
    available: CheckCircle2,
    playing: Play,
    expiring_soon: AlertTriangle,
    expired: XCircle,
    finishing: Hourglass,
    maintenance: Wrench,
  }[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs font-medium whitespace-nowrap shrink-0',
        meta.bgClass,
        meta.borderClass,
        meta.textClass
      )}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>{compact ? meta.shortLabel : meta.label}</span>
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Countdown Timer                                                            */
/* -------------------------------------------------------------------------- */

export function CountdownTimer({
  seconds,
  status,
  size = 'md',
  className,
}: {
  seconds: number;
  status: StationStatus;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
  }[size];

  const colorClass =
    status === 'expired' || status === 'expiring_soon'
      ? 'text-red-400'
      : status === 'finishing'
        ? 'text-blue-400'
        : status === 'playing'
          ? 'text-amber-300'
          : 'text-slate-400';

  return (
    <span
      className={cn(
        'font-mono-tabular font-semibold tracking-tight leading-none',
        sizeClasses,
        colorClass,
        className
      )}
    >
      {formatCountdown(seconds)}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Session Progress Bar                                                       */
/* -------------------------------------------------------------------------- */

export function SessionProgressBar({
  totalSeconds,
  remainingSeconds,
  status,
  className,
}: {
  totalSeconds: number;
  remainingSeconds: number;
  status: StationStatus;
  className?: string;
}) {
  const safeTotal = Math.max(1, totalSeconds);
  const elapsedPct = Math.min(
    100,
    Math.max(0, ((safeTotal - remainingSeconds) / safeTotal) * 100)
  );

  const fillColor =
    status === 'expired' || status === 'expiring_soon'
      ? 'bg-red-500'
      : status === 'finishing'
        ? 'bg-blue-500'
        : 'bg-amber-500';

  return (
    <div
      className={cn(
        'w-full h-1.5 rounded-full bg-white/10 overflow-hidden',
        className
      )}
      role="progressbar"
      aria-valuenow={Math.round(elapsedPct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn('h-full rounded-full transition-all duration-300', fillColor)}
        style={{ width: `${elapsedPct}%` }}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Controller Indicators (Excalidraw blue controller blocks)                  */
/* -------------------------------------------------------------------------- */

export function ControllerIndicators({
  total,
  activeCount = 0,
  isRacingRig = false,
}: {
  total: number;
  activeCount?: number;
  isRacingRig?: boolean;
}) {
  if (isRacingRig) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
        <span className="inline-flex items-center gap-1.5 rounded-md border border-blue-500/25 bg-blue-500/10 px-2 py-0.5 text-blue-500 dark:text-blue-400 font-medium">
          <Gamepad2 className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Wheel + Pedals</span>
        </span>
      </div>
    );
  }

  const slots = Array.from({ length: Math.min(4, Math.max(1, total)) });
  return (
    <div className="flex items-center gap-1.5" aria-label={`${total} controllers`}>
      {slots.map((_, idx) => {
        const isInUse = idx < activeCount;
        return (
          <span
            key={idx}
            title={isInUse ? `Controller ${idx + 1} in use` : `Controller ${idx + 1} docked`}
            className={cn(
              'inline-flex items-center justify-center w-7 h-6 rounded-md border transition-colors',
              isInUse
                ? 'border-blue-500/45 bg-blue-500/15 text-blue-500 dark:text-blue-400'
                : 'border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-muted)]'
            )}
          >
            <Gamepad2 className="w-3.5 h-3.5" aria-hidden="true" />
          </span>
        );
      })}
      <span className="text-xs text-[var(--text-muted)] ml-1 font-mono-tabular">
        {activeCount > 0 ? `${activeCount}/${total}` : `${total} pads`}
      </span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Statistics Card                                                            */
/* -------------------------------------------------------------------------- */

export function StatCard({
  label,
  value,
  subtext,
  icon: Icon,
  accentColor = 'text-[var(--text-secondary)]',
}: {
  label: string;
  value: string | number;
  subtext?: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor?: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 py-3.5 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-medium text-[var(--text-secondary)] truncate">{label}</p>
        <p className="mt-1 text-2xl font-display font-bold tracking-tight font-mono-tabular text-[var(--text-primary)]">
          {value}
        </p>
        {subtext && (
          <p className="mt-0.5 text-xs text-[var(--text-muted)] truncate">{subtext}</p>
        )}
      </div>
      <div
        className={cn(
          'w-10 h-10 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] flex items-center justify-center shrink-0',
          accentColor
        )}
      >
        <Icon className="w-5 h-5" aria-hidden="true" />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Slide-Over Drawer                                                          */
/* -------------------------------------------------------------------------- */

export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  widthClass = 'max-w-lg',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  widthClass?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-[2px]"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'relative z-10 w-full h-full bg-[var(--bg-card)] border-l border-[var(--border-subtle)] shadow-2xl flex flex-col',
              widthClass
            )}
          >
            <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-start justify-between gap-4 shrink-0">
              <div className="min-w-0">
                <h2 className="text-lg font-display font-semibold text-[var(--text-primary)] truncate">
                  {title}
                </h2>
                {subtitle && (
                  <p className="mt-0.5 text-sm text-[var(--text-secondary)] truncate">
                    {subtitle}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close panel"
                className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">{children}</div>
            {footer && (
              <div className="px-6 py-4 border-t border-[var(--border-subtle)] bg-[var(--bg-sidebar)] shrink-0">
                {footer}
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

/* -------------------------------------------------------------------------- */
/* Confirmation / Action Modal                                                */
/* -------------------------------------------------------------------------- */

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 'max-w-md',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/65 backdrop-blur-[2px]"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'relative z-10 w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-2xl overflow-hidden',
              maxWidth
            )}
          >
            <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-display font-semibold text-[var(--text-primary)]">
                  {title}
                </h3>
                {subtitle && (
                  <p className="mt-0.5 text-xs text-[var(--text-secondary)]">{subtitle}</p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5">{children}</div>
            {footer && (
              <div className="px-5 py-3.5 border-t border-[var(--border-subtle)] bg-[var(--bg-sidebar)] flex items-center justify-end gap-2.5">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* -------------------------------------------------------------------------- */
/* Empty State & Skeleton                                                     */
/* -------------------------------------------------------------------------- */

export function EmptyState({
  icon: Icon = Clock,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-card)] px-6 py-12 text-center flex flex-col items-center">
      <div className="w-11 h-11 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] flex items-center justify-center text-[var(--text-secondary)] mb-3">
        <Icon className="w-5 h-5" aria-hidden="true" />
      </div>
      <h3 className="text-sm font-display font-semibold text-[var(--text-primary)]">{title}</h3>
      <p className="mt-1 text-xs text-[var(--text-secondary)] max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <Button size="sm" onClick={onAction} className="mt-4">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="h-11 w-full rounded-lg bg-[var(--bg-elevated)] animate-pulse" />
  );
}

/* -------------------------------------------------------------------------- */
/* Toast Notifications                                                        */
/* -------------------------------------------------------------------------- */

export function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div
      className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 w-full max-w-sm pointer-events-none px-4 sm:px-0"
      aria-live="polite"
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = {
            success: CheckCircle2,
            warning: AlertTriangle,
            error: XCircle,
            info: Info,
          }[toast.variant];

          const accent = {
            success: 'text-emerald-400',
            warning: 'text-amber-400',
            error: 'text-red-400',
            info: 'text-blue-400',
          }[toast.variant];

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.18 }}
              className="pointer-events-auto rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] shadow-xl px-4 py-3 flex items-start gap-3"
            >
              <Icon className={cn('w-4 h-4 mt-0.5 shrink-0', accent)} aria-hidden="true" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[var(--text-primary)]">{toast.title}</p>
                {toast.description && (
                  <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                    {toast.description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                aria-label="Dismiss notification"
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
