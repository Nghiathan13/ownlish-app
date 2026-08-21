import { QueryClient } from "@tanstack/query-core";

// single app-wide query client (shared/api = infrastructure, per FSD guide)
// short-lived cache by default: fresh 5 min, garbage-collected 5 min after last use
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 5 * 60 * 1000,
      retry: false, // local deterministic reads — no point retrying
    },
  },
});
