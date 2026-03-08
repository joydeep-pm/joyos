import fs from "node:fs/promises";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { generateModuleRegistry, getModuleRegistryCachePath } from "@/lib/module-registry";

const invalidModuleDir = path.join(process.cwd(), "modules", "zz-invalid-test-module");
const invalidModulePath = path.join(invalidModuleDir, "module.json");

async function cleanupInvalidModule() {
  await fs.rm(invalidModuleDir, { recursive: true, force: true });
}

beforeEach(async () => {
  await cleanupInvalidModule();
  await fs.rm(getModuleRegistryCachePath(), { force: true });
});

afterEach(async () => {
  await cleanupInvalidModule();
});

describe("module registry", () => {
  it("generates endpoint cache file", async () => {
    const registry = await generateModuleRegistry({ force: true });
    const cacheRaw = await fs.readFile(getModuleRegistryCachePath(), "utf8");
    const cached = JSON.parse(cacheRaw) as { endpoints: unknown[]; modules: unknown[] };

    expect(registry.modules.length).toBeGreaterThan(0);
    expect(registry.endpoints.length).toBeGreaterThan(0);
    expect(cached.modules.length).toBe(registry.modules.length);
    expect(cached.endpoints.length).toBe(registry.endpoints.length);
  });

  it("reuses fresh cache when not forced", async () => {
    const first = await generateModuleRegistry({ force: true });
    const second = await generateModuleRegistry({ force: false });

    expect(second.generated_at).toBe(first.generated_at);
  });

  it("skips invalid manifests and records warnings", async () => {
    await fs.mkdir(invalidModuleDir, { recursive: true });
    await fs.writeFile(
      invalidModulePath,
      JSON.stringify({
        id: "broken",
        name: "Broken",
        version: "1.0.0",
        description: "invalid"
      }),
      "utf8"
    );

    const registry = await generateModuleRegistry({ force: true });

    expect(registry.modules.some((module) => module.id === "broken")).toBe(false);
    expect(registry.warnings.length).toBeGreaterThan(0);
  });
});
