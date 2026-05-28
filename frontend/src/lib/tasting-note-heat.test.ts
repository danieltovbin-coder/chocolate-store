import { describe, expect, it } from "vitest";

import { tastingNoteHeatClasses, tastingNoteWarmth } from "./tasting-note-heat";

describe("tastingNoteWarmth", () => {
  it("ranks chili hotter than cinnamon and warm spice", () => {
    expect(tastingNoteWarmth("chili")).toBeGreaterThan(tastingNoteWarmth("cinnamon"));
    expect(tastingNoteWarmth("warm spice")).toBeGreaterThan(tastingNoteWarmth("cinnamon"));
  });

  it("ranks mint as coolest", () => {
    expect(tastingNoteWarmth("mint")).toBeLessThan(tastingNoteWarmth("fig"));
  });
});

describe("tastingNoteHeatClasses", () => {
  it("returns pink tones for cool notes and red for hot notes", () => {
    expect(tastingNoteHeatClasses("mint")).toContain("pink");
    expect(tastingNoteHeatClasses("chili")).toContain("red-900");
  });
});
