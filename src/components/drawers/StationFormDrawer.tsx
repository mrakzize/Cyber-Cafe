import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Trash2, Wrench } from 'lucide-react';
import { StationCard } from '@/src/components/dashboard/StationCard';
import { Button, Drawer, Modal } from '@/src/components/ui/Primitives';
import { useCafeStore } from '@/src/store/useCafeStore';
import { FloorZone, GamingSetupType, Station } from '@/src/types/cafe';

const SETUPS: GamingSetupType[] = ['PS5', 'Xbox Series X', 'Xbox Series S', 'Racing Simulator'];
const ZONES: FloorZone[] = ['Console Bay', 'VIP Lounge', 'Sim Racing'];

export function StationFormDrawer() {
  const {
    stationFormDrawer,
    closeStationFormDrawer,
    stations,
    currentUser,
    addStation,
    updateStation,
    deleteStation,
  } = useCafeStore();

  const editingStation = useMemo(
    () => stations.find((s) => s.id === stationFormDrawer.stationId) || null,
    [stations, stationFormDrawer.stationId]
  );

  const isOwner = currentUser.role === 'Owner';

  const [number, setNumber] = useState('10');
  const [name, setName] = useState('Station 10');
  const [setupType, setSetupType] = useState<GamingSetupType>('PS5');
  const [consoleModel, setConsoleModel] = useState('PlayStation 5 Slim');
  const [monitorDescription, setMonitorDescription] = useState('Samsung 43" 4K');
  const [controllerCount, setControllerCount] = useState(2);
  const [floorZone, setFloorZone] = useState<FloorZone>('Console Bay');
  const [description, setDescription] = useState('');
  const [pricingCategory, setPricingCategory] = useState<GamingSetupType>('PS5');
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    if (!stationFormDrawer.open) return;
    if (editingStation) {
      setNumber(editingStation.number);
      setName(editingStation.name);
      setSetupType(editingStation.setupType);
      setConsoleModel(editingStation.consoleModel);
      setMonitorDescription(editingStation.monitorDescription);
      setControllerCount(editingStation.controllerCount);
      setFloorZone(editingStation.floorZone);
      setDescription(editingStation.description);
      setPricingCategory(editingStation.pricingCategory);
      setIsMaintenance(editingStation.status === 'maintenance');
    } else {
      const nextNum = String(stations.length + 1).padStart(2, '0');
      setNumber(nextNum);
      setName(`Station ${nextNum}`);
      setSetupType('PS5');
      setConsoleModel('PlayStation 5 Slim');
      setMonitorDescription('Samsung 43" 4K');
      setControllerCount(2);
      setFloorZone('Console Bay');
      setDescription('Standard console pod with dual wireless controllers.');
      setPricingCategory('PS5');
      setIsMaintenance(false);
    }
  }, [stationFormDrawer.open, editingStation, stations.length]);

  const previewStation: Station = {
    id: editingStation?.id || 'preview',
    number,
    name: name.trim() || `Station ${number}`,
    setupType,
    consoleModel,
    monitorDescription,
    controllerCount,
    equipmentTags:
      setupType === 'Racing Simulator'
        ? ['Sim Rig', monitorDescription || 'Ultrawide', 'Wheel + Pedals']
        : [setupType, monitorDescription || '4K TV', `${controllerCount} Pads`],
    description,
    pricingCategory,
    floorZone,
    status: isMaintenance
      ? 'maintenance'
      : editingStation && editingStation.status !== 'maintenance'
        ? editingStation.status
        : 'available',
    activeSession: isMaintenance ? undefined : editingStation?.activeSession,
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const { id: _ignored, ...stationPayload } = previewStation;
    if (editingStation) {
      updateStation(editingStation.id, stationPayload);
    } else {
      addStation(stationPayload);
    }
  };

  return (
    <>
      <Drawer
        open={stationFormDrawer.open}
        onClose={closeStationFormDrawer}
        title={editingStation ? `Edit ${editingStation.name}` : 'Add New Station'}
        subtitle="Configure hardware specs, controllers, and dashboard card layout"
        widthClass="max-w-xl"
        footer={
          <div className="flex items-center justify-between gap-3">
            <div>
              {editingStation && isOwner && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setConfirmDeleteOpen(true)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2.5">
              <Button variant="ghost" onClick={closeStationFormDrawer}>
                Cancel
              </Button>
              <Button type="submit" form="station-form" variant="primary">
                <span>Save Station</span>
              </Button>
            </div>
          </div>
        }
      >
        <form id="station-form" onSubmit={handleSave} className="space-y-5">
          {/* Live Card Preview */}
          <div>
            <p className="text-xs font-medium text-[var(--text-secondary)] mb-2">
              Dashboard Card Preview
            </p>
            <div className="max-w-sm">
              <StationCard station={previewStation} previewOnly compact />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                Station Number
              </label>
              <input
                type="text"
                required
                value={number}
                onChange={(e) => {
                  setNumber(e.target.value);
                  if (!editingStation) setName(`Station ${e.target.value}`);
                }}
                className="w-full h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-input)] text-sm font-mono-tabular text-[var(--text-primary)] focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                Station Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-input)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                Gaming Setup
              </label>
              <select
                value={setupType}
                onChange={(e) => {
                  const val = e.target.value as GamingSetupType;
                  setSetupType(val);
                  setPricingCategory(val);
                }}
                className="w-full h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-input)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#8B5CF6]"
              >
                {SETUPS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                Pricing Category
              </label>
              <select
                value={pricingCategory}
                onChange={(e) => setPricingCategory(e.target.value as GamingSetupType)}
                className="w-full h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-input)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#8B5CF6]"
              >
                {SETUPS.map((s) => (
                  <option key={s} value={s}>
                    {s} Rates
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                Console / Rig Model
              </label>
              <input
                type="text"
                value={consoleModel}
                onChange={(e) => setConsoleModel(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-input)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                TV / Monitor
              </label>
              <input
                type="text"
                value={monitorDescription}
                onChange={(e) => setMonitorDescription(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-input)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                Number of Controllers
              </label>
              <select
                value={controllerCount}
                onChange={(e) => setControllerCount(Number(e.target.value))}
                className="w-full h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-input)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#8B5CF6]"
              >
                {[1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? 'Controller' : 'Controllers'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                Floor Zone
              </label>
              <select
                value={floorZone}
                onChange={(e) => setFloorZone(e.target.value as FloorZone)}
                className="w-full h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-input)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#8B5CF6]"
              >
                {ZONES.map((z) => (
                  <option key={z} value={z}>
                    {z}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              Station Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-input)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#8B5CF6]"
            />
          </div>

          {/* Availability / Maintenance Toggle */}
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/40 p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Wrench className="w-4 h-4 text-[var(--text-secondary)]" />
              <div>
                <p className="text-xs font-semibold text-[var(--text-primary)]">
                  Disable Station (Maintenance)
                </p>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Prevents staff from starting new sessions here
                </p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isMaintenance}
              onClick={() => setIsMaintenance((v) => !v)}
              className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer ${
                isMaintenance ? 'bg-slate-500' : 'bg-emerald-500'
              }`}
            >
              <span
                className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                  isMaintenance ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </form>
      </Drawer>

      <Modal
        open={confirmDeleteOpen && Boolean(editingStation)}
        onClose={() => setConfirmDeleteOpen(false)}
        title="Delete Station"
        subtitle={editingStation?.name}
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (editingStation) {
                  deleteStation(editingStation.id);
                  setConfirmDeleteOpen(false);
                }
              }}
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Station</span>
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-3 text-xs text-[var(--text-secondary)]">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <p>
            Are you sure you want to permanently remove{' '}
            <strong className="text-[var(--text-primary)]">{editingStation?.name}</strong>?
            Historical session logs will remain in Reports and Sessions.
          </p>
        </div>
      </Modal>
    </>
  );
}
