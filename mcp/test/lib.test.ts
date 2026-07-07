import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, writeFileSync, mkdirSync, readFileSync, existsSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { createRepo, isCoreName, CORE_NAMES, ENTRY_FILENAME_RE } from "../src/lib.js";

function today(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

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
  it("limits search results", () => {
    const hits = createRepo(root).searchBackground("company B", 1);
    expect(hits.length).toBe(1);
  });
  it("matches frontmatter tags and filenames", () => {
    writeFileSync(join(root, "notes", "2026-03-01-tagged.md"), "---\ndate: 2026-03-01\ntags: [ai, career]\n---\nAI tooling note.");
    const tagHits = createRepo(root).searchBackground("career");
    expect(tagHits.some((h) => h.matchType === "tag")).toBe(true);
    const fileHits = createRepo(root).searchBackground("2026-03-01-tagged");
    expect(fileHits.some((h) => h.matchType === "filename")).toBe(true);
  });
  it("adds an entry", () => {
    createRepo(root).addEntry("notes", "2026-03-01-x.md", "prefers tests first");
    expect(readFileSync(join(root, "notes", "2026-03-01-x.md"), "utf-8")).toContain("tests first");
  });
  it("appends core content and updates last_updated", () => {
    writeFileSync(join(root, "profile.md"), "---\ntype: profile\nlast_updated: 2000-01-01\n---\n# Profile\n");
    const result = createRepo(root).appendCore("profile", "## Work\n- Builds MCP tools");
    const content = readFileSync(join(root, "profile.md"), "utf-8");

    expect(content).toContain(`last_updated: ${today()}`);
    expect(content).toContain("## Work\n- Builds MCP tools");
    expect(result).toMatchObject({ modified: "profile.md", mode: "append", last_updated: today(), frontmatterUpdated: true });
  });
  it("adds last_updated frontmatter when a core file has none", () => {
    writeFileSync(join(root, "constraints.md"), "# Constraints\nKeep changes small.");
    createRepo(root).appendCore("constraints", "## Tools\n- No raw/private writes");
    const content = readFileSync(join(root, "constraints.md"), "utf-8");

    expect(content.startsWith(`---\nlast_updated: ${today()}\n---\n`)).toBe(true);
    expect(content).toContain("# Constraints");
  });
  it("adds last_updated to existing core frontmatter when missing", () => {
    writeFileSync(join(root, "preferences.md"), "---\ntype: preferences\n---\n# Preferences\n");
    createRepo(root).appendCore("preferences", "## Communication\n- Concise");
    const content = readFileSync(join(root, "preferences.md"), "utf-8");

    expect(content.startsWith(`---\ntype: preferences\nlast_updated: ${today()}\n---\n`)).toBe(true);
    expect(content).toContain("## Communication\n- Concise");
  });
  it("upserts a core section without duplicating the heading", () => {
    writeFileSync(join(root, "profile.md"), "---\ntype: profile\nlast_updated: 2000-01-01\n---\n# Profile\n\n## Work\n- Old\n\n## Skills\n- TypeScript\n");
    const result = createRepo(root).appendCore("profile", "- New", "## Work");
    const content = readFileSync(join(root, "profile.md"), "utf-8");

    expect(content).toContain("## Work\n\n- New\n\n## Skills");
    expect(content).not.toContain("- Old");
    expect(content.match(/^## Work$/gm)?.length).toBe(1);
    expect(result).toMatchObject({ modified: "profile.md", mode: "upsert", sectionHeading: "## Work", sectionExisted: true });
  });
  it("flags private paths", () => {
    expect(createRepo(root).isPrivatePath("raw/private/secret.md")).toBe(true);
    expect(createRepo(root).isPrivatePath("episodes/x.md")).toBe(false);
  });
});

describe("isCoreName", () => {
  it("accepts the three core names", () => {
    expect(isCoreName("profile")).toBe(true);
    expect(isCoreName("preferences")).toBe(true);
    expect(isCoreName("constraints")).toBe(true);
  });
  it("rejects path traversal and invalid names", () => {
    expect(isCoreName("../raw/private/secret")).toBe(false);
    expect(isCoreName("raw/private/x")).toBe(false);
    expect(isCoreName("profile\nfoo")).toBe(false);
  });
  it("CORE_NAMES matches the exported values", () => {
    expect(CORE_NAMES).toEqual(["profile", "preferences", "constraints"]);
  });
});

describe("Entry filename validation", () => {
  it("accepts valid YYYY-MM-DD-slug.md names", () => {
    expect(ENTRY_FILENAME_RE.test("2026-07-04-new-job.md")).toBe(true);
    expect(ENTRY_FILENAME_RE.test("2026-07-04-x.md")).toBe(true);
  });
  it("rejects path traversal", () => {
    const r = createRepo(root);
    expect(() => r.addEntry("episodes", "../raw/private/x.md", "hacked")).toThrow();
    expect(() => r.addEntry("notes", "x/../y.md", "hacked")).toThrow();
  });
  it("rejects invalid entry filenames", () => {
    const r = createRepo(root);
    expect(() => r.addEntry("episodes", "invalid.md", "bad")).toThrow();
    expect(() => r.addEntry("episodes", "2026-07-04 no spaces.md", "bad")).toThrow();
    expect(() => r.addEntry("notes", "2026-07-04-UPPER.md", "bad")).toThrow();
  });
  it("reads a specific entry", () => {
    const r = createRepo(root);
    expect(r.readEntry("episodes", "2026-01-01-a.md")).toContain("company B");
  });
});
