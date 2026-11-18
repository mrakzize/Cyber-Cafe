import { create } from 'zustand';
import {
  CAFE_LOCATIONS,
  INITIAL_ACTIVITY,
  INITIAL_NOTIFICATIONS,
  INITIAL_PRICING,
  INITIAL_SESSIONS,
  INITIAL_SETTINGS,
  INITIAL_STATIONS,
  INITIAL_STAFF,
} from '@/src/data/mockData';
import { addMinutesToTimeLabel, formatTimeNow } from '@/src/lib/utils';
import {
  ActivityEvent,
  CafeLocation,
  CafeSettings,
  GamingSetupType,
  NavPage,
  NotificationItem,
  PaymentMethod,
  PricingPackage,
  SessionExtension,
  SessionRecord,
  StaffMember,
  Station,
  StationStatus,
  ToastItem,
  UserRole,
} from '@/src/types/cafe';

export interface StartSessionPayload {
  stationId: string;
  gameTitle: string;
  gameId?: string;
  durationMinutes: number;
  priceMad: number;
  controllersUsed: number;
  playerCount: number;
  paymentMethod: PaymentMethod;
}

export interface ExtendSessionPayload {
  stationId: string;
  addedMinutes: number;
  additionalCharge: number;
  paymentMethod: PaymentMethod;
}

interface CafeState {
  // Navigation & Auth
  isAuthenticated: boolean;
  activePage: NavPage;
  sidebarCollapsed: boolean;
  activityPanelOpen: boolean;
  currentUser: StaffMember;
  activeLocation: CafeLocation;
  locations: CafeLocation[];

  // Core Entities
  stations: Station[];
  pricingPackages: PricingPackage[];
  sessions: SessionRecord[];
  activityFeed: ActivityEvent[];
  staffMembers: StaffMember[];
  notifications: NotificationItem[];
  settings: CafeSettings;
  todayBaseRevenue: number; // Morning shift revenue baseline before live counter sessions
  toasts: ToastItem[];

  // UI Modal/Drawer Selection State
  startDrawerStationId: string | null;
  activeSessionStationId: string | null;
  stationFormDrawer: { open: boolean; stationId: string | null };

  // Actions
  setActivePage: (page: NavPage) => void;
  toggleSidebar: () => void;
  toggleActivityPanel: () => void;
  setActiveLocation: (locationId: string) => void;

  // Auth / User Role Actions
  login: (email: string) => void;
  logout: () => void;
  switchUserById: (staffId: string) => void;

  // Drawer triggers
  openStartSessionDrawer: (stationId: string) => void;
  closeStartSessionDrawer: () => void;
  openActiveSessionDrawer: (stationId: string) => void;
  closeActiveSessionDrawer: () => void;
  openStationFormDrawer: (stationId?: string | null) => void;
  closeStationFormDrawer: () => void;

  // Live Timer Tick
  tickTimers: () => void;

  // Session Lifecycle
  startSession: (payload: StartSessionPayload) => void;
  extendSession: (payload: ExtendSessionPayload) => void;
  moveExpiredToFinishing: (stationId: string) => void;
  confirmStationReady: (stationId: string) => void;
  finishSessionEarly: (stationId: string, reason: string) => void;

  // Station CRUD
  addStation: (station: Omit<Station, 'id'>) => void;
  updateStation: (id: string, updates: Partial<Station>) => void;
  deleteStation: (id: string) => void;
  setStationStatus: (id: string, status: StationStatus) => void;

  // Pricing CRUD
  updatePricingPackage: (id: string, updates: Partial<PricingPackage>) => void;
  addPricingPackage: (setupType: GamingSetupType, durationMinutes: number, priceMad: number) => void;
  deletePricingPackage: (id: string) => void;

  // Staff CRUD
  addStaffMember: (member: { name: string; email: string; role: UserRole }) => void;
  toggleStaffStatus: (id: string) => void;
  updateStaffRole: (id: string, role: UserRole) => void;

  // Settings & Notifications
  updateSettings: (updates: Partial<CafeSettings>) => void;
  markAllNotificationsRead: () => void;
  pushToast: (toast: Omit<ToastItem, 'id'>) => void;
  dismissToast: (id: string) => void;
  resetDemoData: () => void;
}

const STORAGE_KEY = 'gaming_cafe_manager_state_v1';

function loadPersistedSettings(): Partial<CafeState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed || {};
  } catch {
    return {};
  }
}

const persisted = typeof window !== 'undefined' ? loadPersistedSettings() : {};

export const useCafeStore = create<CafeState>((set, get) => ({
  isAuthenticated: true,
  activePage: 'dashboard',
  sidebarCollapsed: false,
  activityPanelOpen: true,
  currentUser: (persisted.currentUser as StaffMember) || INITIAL_STAFF[0],
  activeLocation: (persisted.activeLocation as CafeLocation) || CAFE_LOCATIONS[0],
  locations: CAFE_LOCATIONS,

  stations: (persisted.stations as Station[]) || INITIAL_STATIONS,
  pricingPackages: (persisted.pricingPackages as PricingPackage[]) || INITIAL_PRICING,
  sessions: (persisted.sessions as SessionRecord[]) || INITIAL_SESSIONS,
  activityFeed: (persisted.activityFeed as ActivityEvent[]) || INITIAL_ACTIVITY,
  staffMembers: (persisted.staffMembers as StaffMember[]) || INITIAL_STAFF,
  notifications: INITIAL_NOTIFICATIONS,
  settings: { ...INITIAL_SETTINGS, ...(persisted.settings as Partial<CafeSettings>) },
  todayBaseRevenue: typeof persisted.todayBaseRevenue === 'number' ? persisted.todayBaseRevenue : 682,
  toasts: [],

  startDrawerStationId: null,
  activeSessionStationId: null,
  stationFormDrawer: { open: false, stationId: null },

  setActivePage: (page) => set({ activePage: page }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  toggleActivityPanel: () => set((s) => ({ activityPanelOpen: !s.activityPanelOpen })),

  setActiveLocation: (locationId) => {
    const loc = get().locations.find((l) => l.id === locationId);
    if (!loc) return;
    set((s) => ({
      activeLocation: loc,
      settings: {
        ...s.settings,
        cafeName: loc.name,
        address: loc.address,
        phone: loc.phone,
      },
    }));
    get().pushToast({
      title: `Switched location`,
      description: `Now viewing ${loc.name} (${loc.city})`,
      variant: 'info',
    });
  },

  login: (email) => {
    const match = get().staffMembers.find(
      (m) => m.email.toLowerCase() === email.trim().toLowerCase()
    );
    const user = match || get().staffMembers[0];
    set({ isAuthenticated: true, currentUser: user, activePage: 'dashboard' });
    get().pushToast({
      title: `Welcome back, ${user.name.split(' ')[0]}`,
      description: `Signed in as ${user.role}`,
      variant: 'success',
    });
  },

  logout: () => {
    set({
      isAuthenticated: false,
      startDrawerStationId: null,
      activeSessionStationId: null,
      stationFormDrawer: { open: false, stationId: null },
    });
  },

  switchUserById: (staffId) => {
    const member = get().staffMembers.find((m) => m.id === staffId);
    if (!member) return;
    const currentPage = get().activePage;
    const restrictedForStaff: NavPage[] = ['pricing', 'reports', 'staff'];
    set({
      currentUser: member,
      activePage:
        member.role === 'Staff' && restrictedForStaff.includes(currentPage)
          ? 'dashboard'
          : currentPage,
    });
    get().pushToast({
      title: `Switched account to ${member.name}`,
      description: `Active role: ${member.role}`,
      variant: 'info',
    });
  },

  openStartSessionDrawer: (stationId) => set({ startDrawerStationId: stationId }),
  closeStartSessionDrawer: () => set({ startDrawerStationId: null }),
  openActiveSessionDrawer: (stationId) => set({ activeSessionStationId: stationId }),
  closeActiveSessionDrawer: () => set({ activeSessionStationId: null }),
  openStationFormDrawer: (stationId = null) =>
    set({ stationFormDrawer: { open: true, stationId } }),
  closeStationFormDrawer: () =>
    set({ stationFormDrawer: { open: false, stationId: null } }),

  tickTimers: () => {
    const { stations, settings, activityFeed, notifications } = get();
    const thresholdSec = settings.expiringThresholdMinutes * 60;
    let changed = false;
    const newActivities: ActivityEvent[] = [];
    const newNotifications: NotificationItem[] = [];

    const nextStations = stations.map((station) => {
      if (
        (station.status !== 'playing' && station.status !== 'expiring_soon') ||
        !station.activeSession
      ) {
        return station;
      }

      changed = true;
      const nextRemaining = Math.max(0, station.activeSession.remainingSeconds - 1);
      let nextStatus: StationStatus = station.status;

      if (nextRemaining === 0) {
        nextStatus = 'expired';
        const nowStr = formatTimeNow();
        newActivities.push({
          id: `act-${Date.now()}-${station.id}`,
          time: nowStr,
          message: `${station.name} session time expired`,
          type: 'alert',
          stationName: station.name,
        });
        newNotifications.push({
          id: `notif-${Date.now()}-${station.id}`,
          title: `${station.name} time expired`,
          description: `${station.activeSession.gameTitle} reached 00:00. Ready to finish session.`,
          time: 'Just now',
          read: false,
          severity: 'danger',
        });
      } else if (nextRemaining > 0 && nextRemaining <= thresholdSec && station.status === 'playing') {
        nextStatus = 'expiring_soon';
        const nowStr = formatTimeNow();
        newActivities.push({
          id: `act-${Date.now()}-${station.id}`,
          time: nowStr,
          message: `${station.name} has < ${settings.expiringThresholdMinutes} min left`,
          type: 'alert',
          stationName: station.name,
        });
      }

      return {
        ...station,
        status: nextStatus,
        activeSession: {
          ...station.activeSession,
          remainingSeconds: nextRemaining,
        },
      };
    });

    if (!changed) return;

    set({
      stations: nextStations,
      activityFeed:
        newActivities.length > 0
          ? [...newActivities, ...activityFeed].slice(0, 25)
          : activityFeed,
      notifications:
        newNotifications.length > 0
          ? [...newNotifications, ...notifications].slice(0, 15)
          : notifications,
    });
  },

  startSession: (payload) => {
    const { stations, currentUser, sessions, activityFeed } = get();
    const station = stations.find((s) => s.id === payload.stationId);
    if (!station) return;

    const now = new Date();
    const startLabel = formatTimeNow(now);
    const endLabel = addMinutesToTimeLabel(now, payload.durationMinutes);
    const sessionNum = 1031 + sessions.length;
    const sessionId = `#SES-${sessionNum}`;
    const staffFirst = currentUser.name.split(' ')[0];
    const totalSeconds = payload.durationMinutes * 60;

    const newActiveSession = {
      sessionId,
      gameTitle: payload.gameTitle || 'Free Play',
      gameId: payload.gameId,
      startedAtLabel: startLabel,
      endAtLabel: endLabel,
      purchasedMinutes: payload.durationMinutes,
      totalSeconds,
      remainingSeconds: totalSeconds,
      amountPaid: payload.priceMad,
      controllersUsed: payload.controllersUsed,
      playerCount: payload.playerCount,
      staffName: staffFirst,
      paymentMethod: payload.paymentMethod,
      extensions: [],
    };

    const newSessionRecord: SessionRecord = {
      id: sessionId,
      dateISO: now.toISOString().slice(0, 10),
      dateLabel: 'Today',
      stationId: station.id,
      stationName: station.name,
      setupType: station.setupType,
      gameTitle: newActiveSession.gameTitle,
      durationMinutes: payload.durationMinutes,
      startTime: startLabel,
      endTime: endLabel,
      amountPaid: payload.priceMad,
      paymentMethod: payload.paymentMethod,
      paymentStatus: 'Paid',
      staffMember: staffFirst,
      sessionStatus: 'Active',
      controllersUsed: payload.controllersUsed,
      extensions: [],
    };

    const newEvent: ActivityEvent = {
      id: `act-${Date.now()}`,
      time: startLabel,
      message: `${station.name} started · ${payload.durationMinutes}m (${payload.priceMad.toFixed(0)} MAD ${payload.paymentMethod})`,
      type: 'start',
      stationName: station.name,
    };

    set({
      stations: stations.map((s) =>
        s.id === station.id ? { ...s, status: 'playing', activeSession: newActiveSession } : s
      ),
      sessions: [newSessionRecord, ...sessions],
      activityFeed: [newEvent, ...activityFeed].slice(0, 25),
      startDrawerStationId: null,
    });

    get().pushToast({
      title: `${station.name} session started`,
      description: `${payload.durationMinutes} min · ${payload.priceMad.toFixed(2)} MAD (${payload.paymentMethod})`,
      variant: 'success',
    });
  },

  extendSession: (payload) => {
    const { stations, currentUser, sessions, activityFeed, settings } = get();
    const station = stations.find((s) => s.id === payload.stationId);
    if (!station || !station.activeSession) return;

    const now = new Date();
    const nowStr = formatTimeNow(now);
    const staffFirst = currentUser.name.split(' ')[0];
    const addedSec = payload.addedMinutes * 60;
    const nextRemaining = station.activeSession.remainingSeconds + addedSec;
    const nextTotal = station.activeSession.totalSeconds + addedSec;
    const nextPurchased = station.activeSession.purchasedMinutes + payload.addedMinutes;
    const nextAmount = station.activeSession.amountPaid + payload.additionalCharge;
    const nextEnd = addMinutesToTimeLabel(now, Math.ceil(nextRemaining / 60));

    const ext: SessionExtension = {
      id: `ext-${Date.now()}`,
      addedMinutes: payload.addedMinutes,
      additionalCharge: payload.additionalCharge,
      timestamp: nowStr,
      staffName: staffFirst,
      paymentMethod: payload.paymentMethod,
    };

    const nextStatus: StationStatus =
      nextRemaining <= settings.expiringThresholdMinutes * 60 ? 'expiring_soon' : 'playing';

    const updatedActive = {
      ...station.activeSession,
      purchasedMinutes: nextPurchased,
      totalSeconds: nextTotal,
      remainingSeconds: nextRemaining,
      amountPaid: nextAmount,
      endAtLabel: nextEnd,
      extensions: [...station.activeSession.extensions, ext],
    };

    const newEvent: ActivityEvent = {
      id: `act-${Date.now()}`,
      time: nowStr,
      message: `${station.name} extended by ${payload.addedMinutes} minutes (+${payload.additionalCharge} MAD)`,
      type: 'extend',
      stationName: station.name,
    };

    set({
      stations: stations.map((s) =>
        s.id === station.id ? { ...s, status: nextStatus, activeSession: updatedActive } : s
      ),
      sessions: sessions.map((rec) =>
        rec.id === updatedActive.sessionId
          ? {
              ...rec,
              durationMinutes: nextPurchased,
              endTime: nextEnd,
              amountPaid: nextAmount,
              extensions: [...rec.extensions, ext],
            }
          : rec
      ),
      activityFeed: [newEvent, ...activityFeed].slice(0, 25),
    });

    get().pushToast({
      title: `${station.name} extended +${payload.addedMinutes} min`,
      description: `New end time ${nextEnd} · Total ${nextAmount.toFixed(2)} MAD`,
      variant: 'success',
    });
  },

  moveExpiredToFinishing: (stationId) => {
    const { stations, settings, activityFeed } = get();
    const station = stations.find((s) => s.id === stationId);
    if (!station) return;

    if (!settings.requireFinishConfirmation) {
      get().confirmStationReady(stationId);
      return;
    }

    const nowStr = formatTimeNow();
    set({
      stations: stations.map((s) => (s.id === stationId ? { ...s, status: 'finishing' } : s)),
      activityFeed: [
        {
          id: `act-${Date.now()}`,
          time: nowStr,
          message: `${station.name} moved to finishing check`,
          type: 'complete' as const,
          stationName: station.name,
        },
        ...activityFeed,
      ].slice(0, 25),
    });

    get().pushToast({
      title: `${station.name} ready for wrap-up`,
      description: 'Confirm controllers and equipment are cleared to set Available.',
      variant: 'info',
    });
  },

  confirmStationReady: (stationId) => {
    const { stations, sessions, activityFeed } = get();
    const station = stations.find((s) => s.id === stationId);
    if (!station) return;

    const nowStr = formatTimeNow();
    const sessionId = station.activeSession?.sessionId;

    set({
      stations: stations.map((s) =>
        s.id === stationId ? { ...s, status: 'available', activeSession: undefined } : s
      ),
      sessions: sessionId
        ? sessions.map((rec) =>
            rec.id === sessionId
              ? { ...rec, sessionStatus: 'Completed', endTime: nowStr }
              : rec
          )
        : sessions,
      activityFeed: [
        {
          id: `act-${Date.now()}`,
          time: nowStr,
          message: `${station.name} completed and marked Available`,
          type: 'complete' as const,
          stationName: station.name,
        },
        ...activityFeed,
      ].slice(0, 25),
      activeSessionStationId:
        get().activeSessionStationId === stationId ? null : get().activeSessionStationId,
    });

    get().pushToast({
      title: `${station.name} is now Available`,
      description: 'Session finalized and station is ready for next players.',
      variant: 'success',
    });
  },

  finishSessionEarly: (stationId, reason) => {
    const { stations, sessions, activityFeed } = get();
    const station = stations.find((s) => s.id === stationId);
    if (!station || !station.activeSession) return;

    const nowStr = formatTimeNow();
    const sessionId = station.activeSession.sessionId;

    set({
      stations: stations.map((s) =>
        s.id === stationId ? { ...s, status: 'available', activeSession: undefined } : s
      ),
      sessions: sessions.map((rec) =>
        rec.id === sessionId
          ? {
              ...rec,
              sessionStatus: 'Finished Early',
              earlyFinishReason: reason || 'Finished early by staff',
              endTime: nowStr,
            }
          : rec
      ),
      activityFeed: [
        {
          id: `act-${Date.now()}`,
          time: nowStr,
          message: `${station.name} finished early (${reason || 'Staff action'})`,
          type: 'complete' as const,
          stationName: station.name,
        },
        ...activityFeed,
      ].slice(0, 25),
      activeSessionStationId: null,
    });

    get().pushToast({
      title: `${station.name} session closed early`,
      description: 'Prepaid amount retained; station is now Available.',
      variant: 'info',
    });
  },

  addStation: (stationData) => {
    const newStation: Station = {
      ...stationData,
      id: `st-${Date.now()}`,
    };
    set((s) => ({
      stations: [...s.stations, newStation],
      stationFormDrawer: { open: false, stationId: null },
    }));
    get().pushToast({
      title: `${newStation.name} added`,
      description: `${newStation.setupType} · ${newStation.monitorDescription}`,
      variant: 'success',
    });
  },

  updateStation: (id, updates) => {
    set((s) => ({
      stations: s.stations.map((st) => (st.id === id ? { ...st, ...updates } : st)),
      stationFormDrawer: { open: false, stationId: null },
    }));
    get().pushToast({
      title: 'Station configuration saved',
      variant: 'success',
    });
  },

  deleteStation: (id) => {
    const target = get().stations.find((s) => s.id === id);
    set((s) => ({
      stations: s.stations.filter((st) => st.id !== id),
      stationFormDrawer: { open: false, stationId: null },
    }));
    if (target) {
      get().pushToast({
        title: `${target.name} removed`,
        variant: 'info',
      });
    }
  },

  setStationStatus: (id, status) => {
    const target = get().stations.find((s) => s.id === id);
    set((s) => ({
      stations: s.stations.map((st) =>
        st.id === id
          ? {
              ...st,
              status,
              activeSession: status === 'maintenance' || status === 'available' ? undefined : st.activeSession,
            }
          : st
      ),
    }));
    if (target) {
      get().pushToast({
        title: `${target.name} set to ${status === 'maintenance' ? 'Maintenance' : 'Available'}`,
        variant: 'info',
      });
    }
  },

  updatePricingPackage: (id, updates) => {
    set((s) => ({
      pricingPackages: s.pricingPackages.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));
    get().pushToast({
      title: 'Pricing rate updated',
      variant: 'success',
    });
  },

  addPricingPackage: (setupType, durationMinutes, priceMad) => {
    const newPkg: PricingPackage = {
      id: `pkg-${Date.now()}`,
      setupType,
      durationMinutes,
      priceMad,
      enabled: true,
    };
    set((s) => ({
      pricingPackages: [...s.pricingPackages, newPkg].sort(
        (a, b) => a.durationMinutes - b.durationMinutes
      ),
    }));
    get().pushToast({
      title: 'Duration package added',
      description: `${setupType} · ${durationMinutes} min — ${priceMad} MAD`,
      variant: 'success',
    });
  },

  deletePricingPackage: (id) => {
    set((s) => ({
      pricingPackages: s.pricingPackages.filter((p) => p.id !== id),
    }));
    get().pushToast({
      title: 'Duration package removed',
      variant: 'info',
    });
  },

  addStaffMember: ({ name, email, role }) => {
    const parts = name.trim().split(/\s+/);
    const initials =
      parts.length >= 2
        ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
        : name.slice(0, 2).toUpperCase();

    const newStaff: StaffMember = {
      id: `staff-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      role,
      status: 'Active',
      lastActive: 'Invited just now',
      initials,
    };

    set((s) => ({ staffMembers: [newStaff, ...s.staffMembers] }));
    get().pushToast({
      title: `Invitation sent to ${newStaff.name}`,
      description: `Assigned role: ${role}`,
      variant: 'success',
    });
  },

  toggleStaffStatus: (id) => {
    set((s) => ({
      staffMembers: s.staffMembers.map((m) =>
        m.id === id ? { ...m, status: m.status === 'Active' ? 'Inactive' : 'Active' } : m
      ),
    }));
  },

  updateStaffRole: (id, role) => {
    set((s) => ({
      staffMembers: s.staffMembers.map((m) => (m.id === id ? { ...m, role } : m)),
    }));
    get().pushToast({ title: `Updated member role to ${role}`, variant: 'info' });
  },

  updateSettings: (updates) => {
    set((s) => ({
      settings: { ...s.settings, ...updates },
    }));
    get().pushToast({
      title: 'Settings saved',
      variant: 'success',
    });
  },

  markAllNotificationsRead: () => {
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
    }));
  },

  pushToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    set((s) => ({
      toasts: [...s.toasts, { ...toast, id }],
    }));
    setTimeout(() => {
      get().dismissToast(id);
    }, 4200);
  },

  dismissToast: (id) => {
    set((s) => ({
      toasts: s.toasts.filter((t) => t.id !== id),
    }));
  },

  resetDemoData: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    set({
      stations: INITIAL_STATIONS,
      pricingPackages: INITIAL_PRICING,
      sessions: INITIAL_SESSIONS,
      activityFeed: INITIAL_ACTIVITY,
      staffMembers: INITIAL_STAFF,
      notifications: INITIAL_NOTIFICATIONS,
      settings: INITIAL_SETTINGS,
      todayBaseRevenue: 682,
      currentUser: INITIAL_STAFF[0],
      activeLocation: CAFE_LOCATIONS[0],
    });
    get().pushToast({
      title: 'Demo floor restored',
      description: 'All stations, sessions, and rates reset to defaults.',
      variant: 'info',
    });
  },
}));

// Persist core state changes safely
if (typeof window !== 'undefined') {
  useCafeStore.subscribe((state) => {
    try {
      const payload = {
        stations: state.stations,
        pricingPackages: state.pricingPackages,
        sessions: state.sessions,
        activityFeed: state.activityFeed,
        staffMembers: state.staffMembers,
        settings: state.settings,
        currentUser: state.currentUser,
        activeLocation: state.activeLocation,
        todayBaseRevenue: state.todayBaseRevenue,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage quota errors
    }
  });
}
