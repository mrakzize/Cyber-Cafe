import React, { useState } from 'react';
import { Check, Edit2, Info, Plus, Trash2 } from 'lucide-react';
import { Button, Modal } from '@/src/components/ui/Primitives';
import { usePricingQuery } from '@/src/hooks/useCafeQueries';
import { cn } from '@/src/lib/utils';
import { useCafeStore } from '@/src/store/useCafeStore';
import { GamingSetupType, PricingPackage } from '@/src/types/cafe';

const SETUP_GROUPS: { type: GamingSetupType; label: string; hardwareNote: string }[] = [
  {
    type: 'PS5',
    label: 'PlayStation 5',
    hardwareNote: 'Standard & VIP couch console stations',
  },
  {
    type: 'Xbox Series X',
    label: 'Xbox Series X',
    hardwareNote: '4K 120Hz high-refresh lounge stations',
  },
  {
    type: 'Xbox Series S',
    label: 'Xbox Series S',
    hardwareNote: 'Competitive solo and duo desk stations',
  },
  {
    type: 'Racing Simulator',
    label: 'Racing Simulator',
    hardwareNote: 'Direct-drive wheel + load-cell pedal rigs',
  },
];

export function PricingPage() {
  const { data: packages } = usePricingQuery();
  const { updatePricingPackage, addPricingPackage, deletePricingPackage } = useCafeStore();

  const [editingPkgId, setEditingPkgId] = useState<string | null>(null);
  const [draftPrice, setDraftPrice] = useState<string>('');

  const [addModalSetup, setAddModalSetup] = useState<GamingSetupType | null>(null);
  const [newMinutes, setNewMinutes] = useState('45');
  const [newPrice, setNewPrice] = useState('12');

  const startEdit = (pkg: PricingPackage) => {
    setEditingPkgId(pkg.id);
    setDraftPrice(String(pkg.priceMad));
  };

  const commitEdit = (pkg: PricingPackage) => {
    const parsed = Number(draftPrice);
    if (!Number.isNaN(parsed) && parsed > 0) {
      updatePricingPackage(pkg.id, { priceMad: parsed });
    }
    setEditingPkgId(null);
  };

  const handleAddDuration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addModalSetup) return;
    const mins = Number(newMinutes);
    const price = Number(newPrice);
    if (mins > 0 && price > 0) {
      addPricingPackage(addModalSetup, mins, price);
      setAddModalSetup(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Contextual Clarity Notice */}
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 py-3 flex items-center gap-3 text-xs text-[var(--text-secondary)]">
        <Info className="w-4 h-4 text-[#8B5CF6] shrink-0" aria-hidden="true" />
        <span>
          These are your café&apos;s <strong className="text-[var(--text-primary)]">configurable player session rates</strong> in Moroccan Dirhams (MAD). Changes apply immediately to the Start Session drawer.
        </span>
      </div>

      {/* Pricing Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SETUP_GROUPS.map((group) => {
          const groupPackages = packages
            .filter((p) => p.setupType === group.type)
            .sort((a, b) => a.durationMinutes - b.durationMinutes);

          return (
            <section
              key={group.type}
              className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] flex flex-col overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-display font-bold text-[var(--text-primary)]">
                    {group.label}
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    {group.hardwareNote}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setAddModalSetup(group.type);
                    setNewMinutes('45');
                    setNewPrice('15');
                  }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Duration</span>
                </Button>
              </div>

              <div className="divide-y divide-[var(--border-subtle)]">
                {groupPackages.map((pkg) => {
                  const isEditing = editingPkgId === pkg.id;
                  return (
                    <div
                      key={pkg.id}
                      className={cn(
                        'px-5 py-3 flex items-center justify-between gap-3',
                        !pkg.enabled && 'opacity-50'
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-sm font-display font-semibold font-mono-tabular text-[var(--text-primary)] w-16">
                          {pkg.durationMinutes} min
                        </span>
                        <span className="text-[var(--text-muted)]" aria-hidden="true">
                          —
                        </span>
                        {isEditing ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min={1}
                              value={draftPrice}
                              onChange={(e) => setDraftPrice(e.target.value)}
                              className="w-20 h-8 px-2.5 rounded-lg border border-[#8B5CF6] bg-[var(--bg-input)] text-sm font-mono-tabular text-[var(--text-primary)] focus:outline-none"
                              autoFocus
                            />
                            <span className="text-xs text-[var(--text-muted)]">MAD</span>
                            <button
                              type="button"
                              onClick={() => commitEdit(pkg)}
                              aria-label="Save price"
                              className="p-1.5 rounded-lg bg-[#8B5CF6] text-white hover:bg-[#7C3AED] cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-sm font-mono-tabular font-semibold text-[#8B5CF6]">
                            {pkg.priceMad.toFixed(0)} MAD
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {!isEditing && (
                          <button
                            type="button"
                            onClick={() => startEdit(pkg)}
                            aria-label={`Edit ${pkg.durationMinutes} minute rate`}
                            className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            updatePricingPackage(pkg.id, { enabled: !pkg.enabled })
                          }
                          className={cn(
                            'px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors cursor-pointer',
                            pkg.enabled
                              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500 dark:text-emerald-400'
                              : 'border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-muted)]'
                          )}
                        >
                          {pkg.enabled ? 'Active' : 'Disabled'}
                        </button>
                        <button
                          type="button"
                          onClick={() => deletePricingPackage(pkg.id)}
                          aria-label={`Delete ${pkg.durationMinutes} minute package`}
                          className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {/* Add Duration Modal */}
      <Modal
        open={Boolean(addModalSetup)}
        onClose={() => setAddModalSetup(null)}
        title="Add Duration Package"
        subtitle={addModalSetup ? `Rate group: ${addModalSetup}` : ''}
        footer={
          <>
            <Button variant="ghost" onClick={() => setAddModalSetup(null)}>
              Cancel
            </Button>
            <Button type="submit" form="add-duration-form" variant="primary">
              Add Rate Package
            </Button>
          </>
        }
      >
        <form id="add-duration-form" onSubmit={handleAddDuration} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              Duration (minutes)
            </label>
            <input
              type="number"
              min={5}
              step={5}
              required
              value={newMinutes}
              onChange={(e) => setNewMinutes(e.target.value)}
              className="w-full h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-input)] text-sm font-mono-tabular text-[var(--text-primary)] focus:outline-none focus:border-[#8B5CF6]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              Rate (MAD)
            </label>
            <input
              type="number"
              min={1}
              required
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              className="w-full h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-input)] text-sm font-mono-tabular text-[var(--text-primary)] focus:outline-none focus:border-[#8B5CF6]"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
