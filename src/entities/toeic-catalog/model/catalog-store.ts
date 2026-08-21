import { createStore } from "zustand/vanilla";
import { loadCatalog as loadFromFile } from "../api/loadCatalog";
import type { Catalog } from "./types";

export type CatalogStatus = "idle" | "loading" | "ready" | "error";

export interface CatalogState {
  catalog: Catalog | null;
  status: CatalogStatus;
  error: string | null;
  load: () => Promise<void>;
}

export const catalogStore = createStore<CatalogState>()((set) => ({
  catalog: null,
  status: "idle",
  error: null,
  load: async () => {
    set({ status: "loading", error: null });
    try {
      set({ catalog: await loadFromFile(), status: "ready" });
    } catch (error) {
      console.error("[catalog] load failed:", error);
      set({
        status: "error",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },
}));
