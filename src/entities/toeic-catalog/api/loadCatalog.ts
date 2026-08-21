import { invoke } from "@tauri-apps/api/core";
import type { Catalog } from "../model/types";

export async function loadCatalog(): Promise<Catalog> {
  const raw = await invoke<string>("read_catalog");
  return JSON.parse(raw) as Catalog;
}
