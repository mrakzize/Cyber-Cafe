import { useQuery } from '@tanstack/react-query';
import { useCafeStore } from '@/src/store/useCafeStore';
import { WEEKLY_REVENUE_DATA } from '@/src/data/mockData';

export function useStationsQuery() {
  const stations = useCafeStore((s) => s.stations);
  return useQuery({
    queryKey: ['stations', stations],
    queryFn: async () => stations,
    initialData: stations,
    staleTime: Infinity,
  });
}

export function usePricingQuery() {
  const pricingPackages = useCafeStore((s) => s.pricingPackages);
  return useQuery({
    queryKey: ['pricing', pricingPackages],
    queryFn: async () => pricingPackages,
    initialData: pricingPackages,
    staleTime: Infinity,
  });
}

export function useSessionsQuery() {
  const sessions = useCafeStore((s) => s.sessions);
  return useQuery({
    queryKey: ['sessions', sessions],
    queryFn: async () => sessions,
    initialData: sessions,
    staleTime: Infinity,
  });
}

export function useStaffQuery() {
  const staffMembers = useCafeStore((s) => s.staffMembers);
  return useQuery({
    queryKey: ['staff', staffMembers],
    queryFn: async () => staffMembers,
    initialData: staffMembers,
    staleTime: Infinity,
  });
}

export function useDashboardMetrics() {
  const stations = useCafeStore((s) => s.stations);
  const sessions = useCafeStore((s) => s.sessions);
  const todayBaseRevenue = useCafeStore((s) => s.todayBaseRevenue);

  const totalStations = stations.length;
  const playingCount = stations.filter(
    (s) => s.status === 'playing' || s.status === 'expiring_soon'
  ).length;
  const availableCount = stations.filter((s) => s.status === 'available').length;
  const attentionCount = stations.filter(
    (s) => s.status === 'expiring_soon' || s.status === 'expired' || s.status === 'finishing'
  ).length;

  const todaySessionsRevenue = sessions
    .filter((rec) => rec.dateLabel === 'Today' && rec.paymentStatus === 'Paid')
    .reduce((acc, rec) => acc + rec.amountPaid, 0);

  const todaysRevenue = todayBaseRevenue + todaySessionsRevenue;

  return {
    totalStations,
    playingCount,
    availableCount,
    attentionCount,
    todaysRevenue,
    weeklyRevenue: WEEKLY_REVENUE_DATA,
  };
}
