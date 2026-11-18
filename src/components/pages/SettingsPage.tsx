import React, { useState } from 'react';
import {
  Building2,
  Check,
  Clock,
  LogOut,
  Moon,
  RotateCcw,
  Sliders,
  Sun,
  User,
} from 'lucide-react';
import { Button } from '@/src/components/ui/Primitives';
import { cn } from '@/src/lib/utils';
import { useCafeStore } from '@/src/store/useCafeStore';
import { PaymentMethod } from '@/src/types/cafe';

export function SettingsPage() {
  const { settings, currentUser, updateSettings, logout, resetDemoData, pushToast } =
    useCafeStore();

  const [cafeName, setCafeName] = useState(settings.cafeName);
  const [address, setAddress] = useState(settings.address);
  const [phone, setPhone] = useState(settings.phone);
  const [timezone, setTimezone] = useState(settings.timezone);

  const [newPassword, setNewPassword] = useState('');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      cafeName: cafeName.trim() || settings.cafeName,
      address: address.trim() || settings.address,
      phone: phone.trim() || settings.phone,
      timezone,
    });
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) return;
    setNewPassword('');
    pushToast({
      title: 'Password updated',
      description: 'Your operator credentials have been updated.',
      variant: 'success',
    });
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Section 1: Café Profile */}
      <form
        onSubmit={handleSaveProfile}
        className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 space-y-4"
      >
        <div className="flex items-center justify-between gap-4 pb-3 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-4 h-4 text-[#8B5CF6]" />
            <div>
              <h2 className="text-sm font-display font-bold text-[var(--text-primary)]">
                Café Profile
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Business identity, location details, and local currency
              </p>
            </div>
          </div>
          <Button type="submit" size="sm" variant="primary">
            <Check className="w-3.5 h-3.5" />
            <span>Save Profile</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              Café Name
            </label>
            <input
              type="text"
              value={cafeName}
              onChange={(e) => setCafeName(e.target.value)}
              className="w-full h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-input)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#8B5CF6]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              Phone Number
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-input)] text-sm font-mono-tabular text-[var(--text-primary)] focus:outline-none focus:border-[#8B5CF6]"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              Street Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-input)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#8B5CF6]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              Timezone
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-input)] text-sm text-[var(--text-primary)]"
            >
              <option value="Africa/Casablanca (GMT+1)">Africa/Casablanca (GMT+1)</option>
              <option value="Europe/Paris (CET)">Europe/Paris (CET)</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              Currency
            </label>
            <input
              type="text"
              disabled
              value="Moroccan Dirham (MAD)"
              className="w-full h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/50 text-sm text-[var(--text-secondary)] cursor-not-allowed"
            />
          </div>
        </div>
      </form>

      {/* Section 2: Application Preferences */}
      <section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[var(--border-subtle)]">
          <Sliders className="w-4 h-4 text-[#8B5CF6]" />
          <div>
            <h2 className="text-sm font-display font-bold text-[var(--text-primary)]">
              Application Preferences
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Appearance, card density, and expiration alerts
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Theme Preference */}
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/30 p-3.5 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-[var(--text-primary)]">Interface Theme</p>
              <p className="text-[11px] text-[var(--text-muted)]">Dark mode recommended for shifts</p>
            </div>
            <div className="inline-flex p-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)]">
              <button
                type="button"
                onClick={() => updateSettings({ theme: 'dark' })}
                className={cn(
                  'inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer',
                  settings.theme === 'dark'
                    ? 'bg-[#8B5CF6] text-white'
                    : 'text-[var(--text-secondary)]'
                )}
              >
                <Moon className="w-3 h-3" />
                <span>Dark</span>
              </button>
              <button
                type="button"
                onClick={() => updateSettings({ theme: 'light' })}
                className={cn(
                  'inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer',
                  settings.theme === 'light'
                    ? 'bg-[#8B5CF6] text-white'
                    : 'text-[var(--text-secondary)]'
                )}
              >
                <Sun className="w-3 h-3" />
                <span>Light</span>
              </button>
            </div>
          </div>

          {/* Card Density */}
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/30 p-3.5 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-[var(--text-primary)]">Station Card Density</p>
              <p className="text-[11px] text-[var(--text-muted)]">Grid spacing on dashboard</p>
            </div>
            <div className="inline-flex p-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)]">
              <button
                type="button"
                onClick={() => updateSettings({ cardDensity: 'comfortable' })}
                className={cn(
                  'px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer',
                  settings.cardDensity === 'comfortable'
                    ? 'bg-[#8B5CF6] text-white'
                    : 'text-[var(--text-secondary)]'
                )}
              >
                Comfortable
              </button>
              <button
                type="button"
                onClick={() => updateSettings({ cardDensity: 'compact' })}
                className={cn(
                  'px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer',
                  settings.cardDensity === 'compact'
                    ? 'bg-[#8B5CF6] text-white'
                    : 'text-[var(--text-secondary)]'
                )}
              >
                Compact
              </button>
            </div>
          </div>

          {/* Default Dashboard View */}
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              Default Dashboard View
            </label>
            <select
              value={settings.defaultDashboardView}
              onChange={(e) =>
                updateSettings({ defaultDashboardView: e.target.value as 'grid' | 'floor' })
              }
              className="w-full h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-input)] text-sm text-[var(--text-primary)]"
            >
              <option value="grid">Grid View</option>
              <option value="floor">Floor Zone View</option>
            </select>
          </div>

          {/* Sound Notification Toggle */}
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/30 p-3.5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-[var(--text-primary)]">Sound Notifications</p>
              <p className="text-[11px] text-[var(--text-muted)]">Alert chime when timer expires</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.soundNotifications}
              onClick={() =>
                updateSettings({ soundNotifications: !settings.soundNotifications })
              }
              className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer ${
                settings.soundNotifications ? 'bg-[#8B5CF6]' : 'bg-slate-600'
              }`}
            >
              <span
                className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.soundNotifications ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Section 3: Session Preferences */}
      <section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[var(--border-subtle)]">
          <Clock className="w-4 h-4 text-[#8B5CF6]" />
          <div>
            <h2 className="text-sm font-display font-bold text-[var(--text-primary)]">
              Session Preferences
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Counter defaults and station wrap-up confirmation rules
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              Default Session Duration
            </label>
            <select
              value={settings.defaultSessionDuration}
              onChange={(e) =>
                updateSettings({ defaultSessionDuration: Number(e.target.value) })
              }
              className="w-full h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-input)] text-sm font-mono-tabular text-[var(--text-primary)]"
            >
              <option value={30}>30 minutes</option>
              <option value={60}>60 minutes</option>
              <option value={90}>90 minutes</option>
              <option value={120}>120 minutes</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              Expiring Soon Threshold
            </label>
            <select
              value={settings.expiringThresholdMinutes}
              onChange={(e) =>
                updateSettings({ expiringThresholdMinutes: Number(e.target.value) })
              }
              className="w-full h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-input)] text-sm font-mono-tabular text-[var(--text-primary)]"
            >
              <option value={3}>3 minutes</option>
              <option value={5}>5 minutes</option>
              <option value={10}>10 minutes</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              Default Payment Method
            </label>
            <select
              value={settings.defaultPaymentMethod}
              onChange={(e) =>
                updateSettings({ defaultPaymentMethod: e.target.value as PaymentMethod })
              }
              className="w-full h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-input)] text-sm text-[var(--text-primary)]"
            >
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="Mobile Pay">Mobile Pay</option>
            </select>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/30 p-3.5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[var(--text-primary)]">
              Require Staff Wrap-Up Confirmation
            </p>
            <p className="text-[11px] text-[var(--text-muted)]">
              Moves expired stations to Finishing state until controllers are verified
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={settings.requireFinishConfirmation}
            onClick={() =>
              updateSettings({ requireFinishConfirmation: !settings.requireFinishConfirmation })
            }
            className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer ${
              settings.requireFinishConfirmation ? 'bg-[#8B5CF6]' : 'bg-slate-600'
            }`}
          >
            <span
              className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                settings.requireFinishConfirmation ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </section>

      {/* Section 4: Account & Demo Controls */}
      <section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[var(--border-subtle)]">
          <User className="w-4 h-4 text-[#8B5CF6]" />
          <div>
            <h2 className="text-sm font-display font-bold text-[var(--text-primary)]">
              Account Settings
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Signed in as {currentUser.name} ({currentUser.role})
            </p>
          </div>
        </div>

        <form onSubmit={handlePasswordChange} className="flex flex-col sm:flex-row gap-3">
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password..."
            className="flex-1 h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-input)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#8B5CF6]"
          />
          <Button type="submit" variant="outline" size="md">
            Update Password
          </Button>
        </form>

        <div className="pt-3 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3">
          <Button variant="ghost" size="sm" onClick={resetDemoData}>
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Floor Demo Data</span>
          </Button>
          <Button variant="danger" size="sm" onClick={logout}>
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </Button>
        </div>
      </section>
    </div>
  );
}
