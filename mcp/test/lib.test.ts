import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { mkdtempSync, rmSync, writeFileSync, mkdirSync, readFileSync, existsSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { createRepo } from "../src/lib.js";

let root: string;
beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "pb-"));
  writeFileSync(join(root, "profile.md"), "# Profile\nStaff engineer.");
  mkdirSync(join(root, "episodes"));
  mkdirSync(join(root, "notes"));
  mkdirSync(join(root, "raw", "private"), { recursive: true });
  writeFileSync(join(root, "episodes", "2026-01-01-a.md"), "moved to company B");
  writeFileSync(join(root, "episodes", "2026-02-01-b.md"), "launched project X");
  writeFileSync(join(root, "raw", "private", "secret.md"), "secret company B info");
});
afterEach(() => rmSync(root, { recursive: true, force: true }));

describe("Repo", () => {
  it("reads a core file", () => {
    expect(createRepo(root).readCore("profile")).toContain("Staff engineer");
  });
  it("lists recent episodes newest-first", () => {
    expect(createRepo(root).listRecent("episodes", 1)).toEqual(["2026-02-01-b.md"]);
  });
  it("searches background but never returns raw/private matches", () => {
    const hits = createRepo(root).searchBackground("company B");
    expect(hits.some((h) => h.file.includes("2026-01-01-a.md"))).toBe(true);
    expect(hits.some((h) => h.file.includes("private"))).toBe(false);
  });
  it("adds an entry", () => {
    createRepo(root).addEntry("notes", "2026-03-01-x.md", "prefers tests first");
    expect(readFileSync(join(root, "notes", "2026-03-01-x.md"), "utf-8")).toContain("tests first");
  });
  it("flags private paths", () => {
    expect(createRepo(root).isPrivatePath("raw/private/secret.md")).toBe(true);
    expect(createRepo(root).isPrivatePath("episodes/x.md")).toBe(false);
  });
});
