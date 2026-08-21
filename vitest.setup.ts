import { randomFillSync } from "node:crypto";
import { afterEach } from "vitest";
import { clearMocks } from "@tauri-apps/api/mocks";

// jsdom has no WebCrypto — mockIPC() needs crypto.getRandomValues
Object.defineProperty(window, "crypto", {
  value: {
    getRandomValues: (buffer: ArrayBufferView) => randomFillSync(buffer),
  },
});

afterEach(() => {
  clearMocks();
});
