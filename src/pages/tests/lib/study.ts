interface PartFileShape {
  items?: unknown[];
  groups?: unknown[];
}

/** Parse a part file into navigation units: items (single questions) or
 *  groups (question sets — a group counts as one unit), whichever exists.
 *  Returns [] when neither is present. Throws on invalid JSON. */
export function parseUnits(partContent: string): unknown[] {
  const part = JSON.parse(partContent) as PartFileShape;
  return part.items ?? part.groups ?? [];
}
