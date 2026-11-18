export type NavPage =
  | 'dashboard'
  | 'stations'
  | 'sessions'
  | 'pricing'
  | 'reports'
  | 'staff'
  | 'settings';

export type StationStatus =
  | 'available'
  | 'playing'
  | 'expiring_soon'
  | 'expired'
  | 'finishing'
  | 'maintenance';

export type GamingSetupType =
  | 'PS5'
  | 'Xbox Series X'
  | 'Xbox Series S'
  | 'Racing Simulator';

export type PaymentMethod = 'Cash' | 'Card' | 'Mobile Pay';

export type UserRole = 'Owner' | 'Staff';

export type FloorZone = 'Console Bay' | 'VIP Lounge' | 'Sim Racing';

export interface GameOption {
  id: string;
  title: string;
  genre: string;
  supportedSetups: GamingSetupType[];
  imageUrl: string;
  accentColor: string;
}

export interface SessionExtension {
  id: string;
  addedMinutes: number;
  additionalCharge: number;
  timestamp: string;
  staffName: string;
  paymentMethod: PaymentMethod;
}

export interface ActiveSession {
  sessionId: string;
  gameTitle: string;
  gameId?: string;
  startedAtLabel: string;
  endAtLabel: string;
  purchasedMinutes: number;
  totalSeconds: number;
  remainingSeconds: number;
  amountPaid: number;
  controllersUsed: number;
  playerCount: number;
  staffName: string;
  paymentMethod: PaymentMethod;
  extensions: SessionExtension[];
}

export interface Station {
  id: string;
  number: string;
  name: string;
  setupType: GamingSetupType;
  consoleModel: string;
  monitorDescription: string;
  controllerCount: number;
  equipmentTags: string[];
  description: string;
  pricingCategory: GamingSetupType;
  status: StationStatus;
  floorZone: FloorZone;
  activeSession?: ActiveSession;
}

export interface PricingPackage {
  id: string;
  setupType: GamingSetupType;
  durationMinutes: number;
  priceMad: number;
  enabled: boolean;
}

export interface SessionRecord {
  id: string;
  dateISO: string;
  dateLabel: string;
  stationId: string;
  stationName: string;
  setupType: GamingSetupType;
  gameTitle: string;
  durationMinutes: number;
  startTime: string;
  endTime: string;
  amountPaid: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'Paid' | 'Refunded';
  staffMember: string;
  sessionStatus: 'Active' | 'Completed' | 'Finished Early';
  earlyFinishReason?: string;
  controllersUsed: number;
  extensions: SessionExtension[];
}

export interface ActivityEvent {
  id: string;
  time: string;
  message: string;
  type: 'start' | 'extend' | 'complete' | 'payment' | 'alert' | 'maintenance';
  stationName?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'Active' | 'Inactive';
  lastActive: string;
  avatarUrl?: string;
  initials: string;
}

export interface CafeLocation {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
}

export interface CafeSettings {
  cafeName: string;
  address: string;
  phone: string;
  timezone: string;
  currency: 'MAD';
  defaultDashboardView: 'grid' | 'floor';
  expiringThresholdMinutes: number;
  soundNotifications: boolean;
  cardDensity: 'comfortable' | 'compact';
  theme: 'dark' | 'light';
  defaultSessionDuration: number;
  requireFinishConfirmation: boolean;
  defaultPaymentMethod: PaymentMethod;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  severity: 'warning' | 'danger' | 'info' | 'success';
}

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant: 'success' | 'info' | 'warning' | 'error';
}
