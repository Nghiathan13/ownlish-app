import { invoke } from "@tauri-apps/api/core";
import type { CatalogTest } from "../model/types";

export interface TestPartFile {
  path: string;
  content: string;
}

export async function loadTestParts(test: CatalogTest): Promise<TestPartFile[]> {
  const paths = test.parts.map((part) => part.path);
  return invoke<TestPartFile[]>("read_content_files", { paths });
}
