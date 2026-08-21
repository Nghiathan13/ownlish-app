import { describe, expect, it } from "vitest";
import { mockIPC } from "@tauri-apps/api/mocks";
import type { CatalogTest } from "../model/types";
import { loadTestParts, type TestPartFile } from "./loadTestParts";

const test: CatalogTest = {
  id: "ets19-t01",
  year: 2019,
  testNumber: 1,
  parts: [
    { number: 1, path: "content/toeic/ets19-t01/part_1.json", questionCount: 6 },
    { number: 2, path: "content/toeic/ets19-t01/part_2.json", questionCount: 25 },
  ],
};

describe("loadTestParts", () => {
  it("sends the part paths and returns the files", async () => {
    const files: TestPartFile[] = [
      { path: "content/toeic/ets19-t01/part_1.json", content: "{}" },
      { path: "content/toeic/ets19-t01/part_2.json", content: "{}" },
    ];
    mockIPC((cmd, args) => {
      expect(cmd).toBe("read_content_files");
      expect(args).toEqual({
        paths: [
          "content/toeic/ets19-t01/part_1.json",
          "content/toeic/ets19-t01/part_2.json",
        ],
      });
      return files;
    });
    await expect(loadTestParts(test)).resolves.toEqual(files);
  });
});
