import React, { useMemo, useState } from 'react';
import {
  Edit3,
  Gamepad2,
  LayoutGrid,
  List,
  Monitor,
  Plus,
  Search,
  Wrench,
} from 'lucide-react';
import { StationCard } from '@/src/components/dashboard/StationCard';
import {
  Button,
  EmptyState,
  StationStatusBadge,
} from '@/src/components/ui/Primitives';
import { useStationsQuery } from '@/src/hooks/useCafeQueries';
import { cn } from '@/src/lib/utils';
import { useCafeStore } from '@/src/store/useCafeStore';
import { GamingSetupType } from '@/src/types/cafe';

export function StationsPage() {
  const { data: stations } = useStationsQuery();
  const {
    currentUser,
    openStationFormDrawer,
    setStationStatus,
    openStartSessionDrawer,
    openActiveSessionDrawer,
  } = useCafeStore();

  const [search, setSearch] = useState('');
  const [setupFilter, setSetupFilter] = useState<GamingSetupType | 'all'>('all');
  const [layout, setLayout] = useState<'table' | 'cards'>('table');

  const isOwner = currentUser.role === 'Owner';

  const filtered = useMemo(() => {
    return stations.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.consoleModel.toLowerCase().includes(search.toLowerCase()) ||
        s.monitorDescription.toLowerCase().includes(search.toLowerCase());
      const matchSetup = setupFilter === 'all' || s.setupType === setupFilter;
      return matchSearch && matchSetup;
    });
  }, [stations, search, setupFilter]);

  return (
    <div className="space-y-5">
      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search station or display..."
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#8B5CF6]"
            />
          </div>

          <select
            value={setupFilter}
            onChange={(e) => setSetupFilter(e.target.value as GamingSetupType | 'all')}
            className="h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] text-xs font-medium text-[var(--text-primary)] focus:outline-none focus:border-[#8B5CF6]"
          >
            <option value="all">All setups</option>
            <option value="PS5">PS5</option>
            <option value="Xbox Series X">Xbox Series X</option>
            <option value="Xbox Series S">Xbox Series S</option>
            <option value="Racing Simulator">Racing Simulator</option>
          </select>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="inline-flex items-center p-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)]">
            <button
              type="button"
              onClick={() => setLayout('table')}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer',
                layout === 'table'
                  ? 'bg-[#8B5CF6] text-white'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              )}
            >
              <List className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
            <button
              type="button"
              onClick={() => setLayout('cards')}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer',
                layout === 'cards'
                  ? 'bg-[#8B5CF6] text-white'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              )}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Monitor}
          title="No stations found"
          description="Add a new gaming station or adjust your filter."
          actionLabel={isOwner ? 'Add Station' : undefined}
          onAction={isOwner ? () => openStationFormDrawer(null) : undefined}
        />
      ) : layout === 'table' ? (
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]/40 text-xs font-medium text-[var(--text-secondary)]">
                  <th className="py-3 px-4">Station</th>
                  <th className="py-3 px-4">Gaming Setup</th>
                  <th className="py-3 px-4">TV / Monitor</th>
                  <th className="py-3 px-4">Controllers</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Pricing Category</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)] text-sm">
                {filtered.map((st) => (
                  <tr
                    key={st.id}
                    className="hover:bg-[var(--bg-elevated)]/30 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <p className="font-display font-semibold text-[var(--text-primary)]">
                        {st.name}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">{st.floorZone}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-[var(--text-primary)] font-medium">{st.setupType}</p>
                      <p className="text-xs text-[var(--text-muted)]">{st.consoleModel}</p>
                    </td>
                    <td className="py-3 px-4 text-[var(--text-secondary)]">
                      {st.monitorDescription}
                    </td>
                    <td className="py-3 px-4">
                      <div className="inline-flex items-center gap-1.5 text-xs font-mono-tabular text-[var(--text-secondary)]">
                        <Gamepad2 className="w-3.5 h-3.5 text-blue-400" />
                        <span>
                          {st.setupType === 'Racing Simulator'
                            ? 'Wheel + Pedals'
                            : `${st.controllerCount} pads`}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <StationStatusBadge status={st.status} />
                    </td>
                    <td className="py-3 px-4 text-xs text-[var(--text-secondary)]">
                      {st.pricingCategory} Rates
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        {st.status === 'available' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setStationStatus(st.id, 'maintenance')}
                            title="Set Maintenance"
                          >
                            <Wrench className="w-3.5 h-3.5" />
                            <span className="hidden xl:inline">Maintenance</span>
                          </Button>
                        )}
                        {st.status === 'maintenance' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setStationStatus(st.id, 'available')}
                          >
                            <span>Enable</span>
                          </Button>
                        )}
                        {isOwner && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openStationFormDrawer(st.id)}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((st) => (
            <div key={st.id} className="space-y-2">
              <StationCard
                station={st}
                onStartSession={openStartSessionDrawer}
                onViewSession={openActiveSessionDrawer}
              />
              {isOwner && (
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openStationFormDrawer(st.id)}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Configure {st.name}</span>
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {isOwner && (
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => openStationFormDrawer(null)}>
            <Plus className="w-4 h-4" />
            <span>Add Station</span>
          </Button>
        </div>
      )}
    </div>
  );
}
