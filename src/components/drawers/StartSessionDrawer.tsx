import React, { useEffect, useMemo, useState } from 'react';
import {
  Banknote,
  Check,
  CreditCard,
  Gamepad2,
  Minus,
  Monitor,
  Plus,
  Search,
  Smartphone,
  Users,
} from 'lucide-react';
import {
  Button,
  Drawer,
  StationStatusBadge,
} from '@/src/components/ui/Primitives';
import { GAME_CATALOG } from '@/src/data/mockData';
import { cn, formatCurrencyMad } from '@/src/lib/utils';
import { useCafeStore } from '@/src/store/useCafeStore';
import { PaymentMethod } from '@/src/types/cafe';

export function StartSessionDrawer() {
  const {
    startDrawerStationId,
    closeStartSessionDrawer,
    stations,
    pricingPackages,
    settings,
    startSession,
  } = useCafeStore();

  const station = useMemo(
    () => stations.find((s) => s.id === startDrawerStationId) || null,
    [stations, startDrawerStationId]
  );

  const availablePackages = useMemo(() => {
    if (!station) return [];
    return pricingPackages
      .filter((p) => p.setupType === station.pricingCategory && p.enabled)
      .sort((a, b) => a.durationMinutes - b.durationMinutes);
  }, [pricingPackages, station]);

  const [gameSearch, setGameSearch] = useState('');
  const [selectedGameId, setSelectedGameId] = useState<string>('');
  const [customGameTitle, setCustomGameTitle] = useState('');
  const [selectedPkgId, setSelectedPkgId] = useState<string>('');
  const [playerCount, setPlayerCount] = useState(2);
  const [controllersUsed, setControllersUsed] = useState(2);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(settings.defaultPaymentMethod);

  useEffect(() => {
    if (!station) return;
    setGameSearch('');
    const matchingGames = GAME_CATALOG.filter((g) =>
      g.supportedSetups.includes(station.setupType)
    );
    setSelectedGameId(matchingGames[0]?.id || 'other');
    setCustomGameTitle('');

    const defaultPkg =
      availablePackages.find((p) => p.durationMinutes === settings.defaultSessionDuration) ||
      availablePackages[0];
    setSelectedPkgId(defaultPkg?.id || '');

    const defaultPads = Math.min(station.controllerCount, station.setupType === 'Racing Simulator' ? 1 : 2);
    setPlayerCount(defaultPads);
    setControllersUsed(defaultPads);
    setPaymentMethod(settings.defaultPaymentMethod);
  }, [station?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredGames = useMemo(() => {
    if (!station) return [];
    return GAME_CATALOG.filter((g) => {
      const supports = g.supportedSetups.includes(station.setupType);
      const matches = g.title.toLowerCase().includes(gameSearch.toLowerCase());
      return supports && matches;
    });
  }, [station, gameSearch]);

  const selectedPackage = availablePackages.find((p) => p.id === selectedPkgId) || availablePackages[0];

  const resolvedGameTitle = useMemo(() => {
    if (selectedGameId === 'other') {
      return customGameTitle.trim() || 'Other Game';
    }
    const found = GAME_CATALOG.find((g) => g.id === selectedGameId);
    return found?.title || 'Free Play';
  }, [selectedGameId, customGameTitle]);

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!station || !selectedPackage) return;
    startSession({
      stationId: station.id,
      gameTitle: resolvedGameTitle,
      gameId: selectedGameId !== 'other' ? selectedGameId : undefined,
      durationMinutes: selectedPackage.durationMinutes,
      priceMad: selectedPackage.priceMad,
      controllersUsed,
      playerCount,
      paymentMethod,
    });
  };

  return (
    <Drawer
      open={Boolean(station)}
      onClose={closeStartSessionDrawer}
      title="New Gaming Session"
      subtitle={station ? `${station.name} — ${station.consoleModel}` : ''}
      widthClass="max-w-xl"
      footer={
        station && selectedPackage ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs text-[var(--text-secondary)]">Total prepaid charge</p>
              <p className="text-lg font-display font-bold font-mono-tabular text-[var(--text-primary)]">
                {formatCurrencyMad(selectedPackage.priceMad)}
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <Button variant="ghost" onClick={closeStartSessionDrawer}>
                Cancel
              </Button>
              <Button type="submit" form="start-session-form" variant="primary" size="lg">
                <Check className="w-4 h-4" />
                <span>Confirm Payment & Start Session</span>
              </Button>
            </div>
          </div>
        ) : null
      }
    >
      {station && (
        <form id="start-session-form" onSubmit={handleConfirm} className="space-y-6">
          {/* Section A: Station Overview */}
          <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/50 p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-xl border border-emerald-500/30 bg-[#090D16] flex items-center justify-center text-emerald-400 shrink-0">
                <Monitor className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-display font-bold text-[var(--text-primary)]">
                    {station.name}
                  </p>
                  <span className="text-xs text-[var(--text-secondary)]">
                    · {station.setupType}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">
                  {station.monitorDescription} · {station.controllerCount} controllers available
                </p>
              </div>
            </div>
            <StationStatusBadge status={station.status} />
          </section>

          {/* Section B: Optional Game Selector */}
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-display font-semibold text-[var(--text-primary)]">
                  Select Game
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Optional — informational only, does not change hourly rate.
                </p>
              </div>
              <div className="relative w-44">
                <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={gameSearch}
                  onChange={(e) => setGameSearch(e.target.value)}
                  placeholder="Search games..."
                  className="w-full h-8 pl-8 pr-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-input)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {filteredGames.map((game) => {
                const isSelected = selectedGameId === game.id;
                return (
                  <button
                    key={game.id}
                    type="button"
                    onClick={() => setSelectedGameId(game.id)}
                    className={cn(
                      'group relative rounded-xl border overflow-hidden text-left transition-all cursor-pointer h-20 flex flex-col justify-end p-2.5',
                      isSelected
                        ? 'border-[#8B5CF6] ring-2 ring-[#8B5CF6]/30'
                        : 'border-[var(--border-subtle)] hover:border-[var(--border-strong)]'
                    )}
                  >
                    <img
                      src={game.imageUrl}
                      alt={game.title}
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-65 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/20" />
                    <div className="relative z-10">
                      <p className="text-xs font-display font-semibold text-white truncate">
                        {game.title}
                      </p>
                      <p className="text-[11px] text-slate-300 truncate">{game.genre}</p>
                    </div>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setSelectedGameId('other')}
                className={cn(
                  'rounded-xl border text-left transition-all cursor-pointer h-20 flex flex-col justify-between p-2.5 bg-[var(--bg-elevated)]/60',
                  selectedGameId === 'other'
                    ? 'border-[#8B5CF6] ring-2 ring-[#8B5CF6]/30'
                    : 'border-[var(--border-subtle)] hover:border-[var(--border-strong)]'
                )}
              >
                <Gamepad2 className="w-4 h-4 text-[var(--text-secondary)]" />
                <div>
                  <p className="text-xs font-display font-semibold text-[var(--text-primary)]">
                    Other Game
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)]">Custom title</p>
                </div>
              </button>
            </div>

            {selectedGameId === 'other' && (
              <input
                type="text"
                value={customGameTitle}
                onChange={(e) => setCustomGameTitle(e.target.value)}
                placeholder="Enter game title (e.g. Tekken 8, Rocket League)..."
                className="w-full h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-input)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#8B5CF6]"
              />
            )}
          </section>

          {/* Section C: Session Duration */}
          <section className="space-y-3">
            <div>
              <h3 className="text-sm font-display font-semibold text-[var(--text-primary)]">
                Session Duration
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Configured rates for {station.pricingCategory}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {availablePackages.map((pkg) => {
                const isSelected = selectedPackage?.id === pkg.id;
                return (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => setSelectedPkgId(pkg.id)}
                    className={cn(
                      'rounded-xl border p-3 text-left transition-all cursor-pointer',
                      isSelected
                        ? 'border-[#8B5CF6] bg-[#8B5CF6]/12 ring-2 ring-[#8B5CF6]/25'
                        : 'border-[var(--border-subtle)] bg-[var(--bg-elevated)]/40 hover:bg-[var(--bg-elevated)]'
                    )}
                  >
                    <p className="text-sm font-display font-bold text-[var(--text-primary)] font-mono-tabular">
                      {pkg.durationMinutes} min
                    </p>
                    <p
                      className={cn(
                        'mt-1 text-xs font-mono-tabular font-semibold',
                        isSelected ? 'text-[#8B5CF6]' : 'text-[var(--text-secondary)]'
                      )}
                    >
                      {pkg.priceMad.toFixed(0)} MAD
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Section D: Players and Controllers */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/40 p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-[var(--text-secondary)]" />
                <div>
                  <p className="text-xs font-semibold text-[var(--text-primary)]">Players</p>
                  <p className="text-[11px] text-[var(--text-muted)]">Guest count</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPlayerCount((v) => Math.max(1, v - 1))}
                  className="w-7 h-7 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] flex items-center justify-center text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] cursor-pointer"
                  aria-label="Decrease players"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center text-sm font-mono-tabular font-semibold text-[var(--text-primary)]">
                  {playerCount}
                </span>
                <button
                  type="button"
                  onClick={() => setPlayerCount((v) => Math.min(4, v + 1))}
                  className="w-7 h-7 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] flex items-center justify-center text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] cursor-pointer"
                  aria-label="Increase players"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/40 p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Gamepad2 className="w-4 h-4 text-[var(--text-secondary)]" />
                <div>
                  <p className="text-xs font-semibold text-[var(--text-primary)]">Controllers</p>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Max {station.controllerCount}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setControllersUsed((v) => Math.max(1, v - 1))}
                  className="w-7 h-7 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] flex items-center justify-center text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] cursor-pointer"
                  aria-label="Decrease controllers"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center text-sm font-mono-tabular font-semibold text-[var(--text-primary)]">
                  {controllersUsed}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setControllersUsed((v) => Math.min(station.controllerCount, v + 1))
                  }
                  className="w-7 h-7 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] flex items-center justify-center text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] cursor-pointer"
                  aria-label="Increase controllers"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </section>

          {/* Section E: Payment */}
          <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/40 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-display font-semibold text-[var(--text-primary)]">
                Prepaid Payment
              </h3>
              <span className="text-xs font-medium text-emerald-500 dark:text-emerald-400">
                Status: Paid upfront
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'Cash', icon: Banknote },
                  { id: 'Card', icon: CreditCard },
                  { id: 'Mobile Pay', icon: Smartphone },
                ] as const
              ).map(({ id, icon: Icon }) => {
                const active = paymentMethod === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setPaymentMethod(id)}
                    className={cn(
                      'flex items-center justify-center gap-1.5 h-9 rounded-xl border text-xs font-medium transition-colors cursor-pointer',
                      active
                        ? 'border-[#8B5CF6] bg-[#8B5CF6]/15 text-[#8B5CF6]'
                        : 'border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{id}</span>
                  </button>
                );
              })}
            </div>

            {selectedPackage && (
              <div className="pt-3 border-t border-[var(--border-subtle)] space-y-1.5 text-xs">
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>
                    {station.setupType} · {selectedPackage.durationMinutes} min
                  </span>
                  <span className="font-mono-tabular">
                    {formatCurrencyMad(selectedPackage.priceMad)}
                  </span>
                </div>
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Game · {resolvedGameTitle}</span>
                  <span>Included</span>
                </div>
                <div className="flex justify-between pt-1.5 border-t border-[var(--border-subtle)] text-sm font-semibold text-[var(--text-primary)]">
                  <span>Total</span>
                  <span className="font-mono-tabular">
                    {formatCurrencyMad(selectedPackage.priceMad)}
                  </span>
                </div>
              </div>
            )}
          </section>
        </form>
      )}
    </Drawer>
  );
}
