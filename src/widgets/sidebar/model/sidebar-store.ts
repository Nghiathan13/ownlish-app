import { createStore } from "zustand/vanilla";

interface SidebarState {
  expanded: boolean;
  toggle: () => void;
}

export const sidebarStore = createStore<SidebarState>()((set) => ({
  expanded: false,
  toggle: () => set((state) => ({ expanded: !state.expanded })),
}));
