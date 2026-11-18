import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { GamingSetupType, StationStatus } from '@/src/types/cafe';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCountdown(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function formatCurrencyMad(amount: number): string {
  return `${amount.toFixed(2)} MAD`;
}

export function formatTimeNow(date: Date = new Date()): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function addMinutesToTimeLabel(date: Date, minutes: number): string {
  const future = new Date(date.getTime() + minutes * 60_000);
  return formatTimeNow(future);
}

export const STATUS_META: Record<
  StationStatus,
  {
    label: string;
    shortLabel: string;
    colorHex: string;
    textClass: string;
    bgClass: string;
    borderClass: string;
  }
> = {
  available: {
    label: 'Available',
    shortLabel: 'Ready',
    colorHex: '#22C55E',
    textClass: 'text-emerald-600 dark:text-emerald-400',
    bgClass: 'bg-emerald-500/10',
    borderClass: 'border-emerald-500/30',
  },
  playing: {
    label: 'Playing',
    shortLabel: 'Active',
    colorHex: '#F59E0B',
    textClass: 'text-amber-600 dark:text-amber-400',
    bgClass: 'bg-amber-500/10',
    borderClass: 'border-amber-500/30',
  },
  expiring_soon: {
    label: 'Expiring Soon',
    shortLabel: '< 5 min',
    colorHex: '#EF4444',
    textClass: 'text-red-600 dark:text-red-400',
    bgClass: 'bg-red-500/12',
    borderClass: 'border-red-500/40',
  },
  expired: {
    label: 'Time Expired',
    shortLabel: 'Expired',
    colorHex: '#EF4444',
    textClass: 'text-red-600 dark:text-red-400',
    bgClass: 'bg-red-500/15',
    borderClass: 'border-red-500/50',
  },
  finishing: {
    label: 'Finishing',
    shortLabel: 'Confirm',
    colorHex: '#3B82F6',
    textClass: 'text-blue-600 dark:text-blue-400',
    bgClass: 'bg-blue-500/10',
    borderClass: 'border-blue-500/35',
  },
  maintenance: {
    label: 'Maintenance',
    shortLabel: 'Offline',
    colorHex: '#64748B',
    textClass: 'text-slate-500 dark:text-slate-400',
    bgClass: 'bg-slate-500/10',
    borderClass: 'border-slate-500/30',
  },
};

export const SETUP_SHORT_LABEL: Record<GamingSetupType, string> = {
  PS5: 'PS5',
  'Xbox Series X': 'Xbox X',
  'Xbox Series S': 'Xbox S',
  'Racing Simulator': 'Sim Rig',
};
