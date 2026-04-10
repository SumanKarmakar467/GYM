export const LIVE_REFETCH_INTERVAL_MS = 2500;

export const liveQueryOptions = {
  refetchInterval: LIVE_REFETCH_INTERVAL_MS,
  refetchIntervalInBackground: true,
  refetchOnWindowFocus: true
};
