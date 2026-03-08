import fs from "node:fs/promises";
import path from "node:path";
import Ajv, { type ErrorObject, type ValidateFunction } from "ajv";
import type { ActionModuleDefinition, ModuleRegistry } from "./types";

const MODULES_DIR = path.join(process.cwd(), "modules");
const CACHE_DIR = path.join(process.cwd(), ".cache");
const CACHE_FILE_PATH = path.join(CACHE_DIR, "module-endpoints.json");
const SCHEMA_PATH = path.join(process.cwd(), "schemas", "module.schema.json");

let validator: ValidateFunction | null = null;

async function compileValidator(): Promise<ValidateFunction> {
  if (validator) return validator;

  const schemaRaw = await fs.readFile(SCHEMA_PATH, "utf8");
  const schema = JSON.parse(schemaRaw) as object;
  const ajv = new Ajv({ allErrors: true, strict: false });
  validator = ajv.compile(schema);

  return validator;
}

function formatErrors(errors: ErrorObject[] | null | undefined): string {
  if (!errors?.length) return "Unknown schema validation error.";

  return errors
    .map((error) => {
      const pointer = error.instancePath || "/";
      return `${pointer} ${error.message ?? "is invalid"}`;
    })
    .join("; ");
}

async function listModuleManifestPaths(rootDir: string): Promise<string[]> {
  const output: string[] = [];

  try {
    const entries = await fs.readdir(rootDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(rootDir, entry.name);
      if (entry.isDirectory()) {
        output.push(...(await listModuleManifestPaths(fullPath)));
      } else if (entry.isFile() && entry.name === "module.json") {
        output.push(fullPath);
      }
    }
  } catch {
    return [];
  }

  return output.sort((left, right) => left.localeCompare(right));
}

async function isCacheFresh(manifestPaths: string[]): Promise<boolean> {
  try {
    const cacheStat = await fs.stat(CACHE_FILE_PATH);
    const cacheMtime = cacheStat.mtime.getTime();

    const schemaStat = await fs.stat(SCHEMA_PATH);
    if (schemaStat.mtime.getTime() > cacheMtime) return false;

    for (const manifestPath of manifestPaths) {
      const stat = await fs.stat(manifestPath);
      if (stat.mtime.getTime() > cacheMtime) {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}

function asModuleDefinition(raw: unknown): ActionModuleDefinition | null {
  if (!raw || typeof raw !== "object") return null;

  const candidate = raw as ActionModuleDefinition;

  if (
    typeof candidate.id !== "string" ||
    typeof candidate.name !== "string" ||
    typeof candidate.version !== "string" ||
    typeof candidate.description !== "string" ||
    !Array.isArray(candidate.actions)
  ) {
    return null;
  }

  return candidate;
}

function buildRegistry(modules: ActionModuleDefinition[], sourceFiles: string[], warnings: string[]): ModuleRegistry {
  return {
    version: 1,
    generated_at: new Date().toISOString(),
    source_files: sourceFiles,
    modules,
    endpoints: modules.flatMap((module) =>
      module.actions.map((action) => ({
        method: "POST" as const,
        route: `/api/modules/${module.id}/actions/${action.id}/run`,
        moduleId: module.id,
        moduleName: module.name,
        actionId: action.id,
        actionName: action.name,
        toolName: action.toolName
      }))
    ),
    warnings
  };
}

export async function generateModuleRegistry(options: { force?: boolean } = {}): Promise<ModuleRegistry> {
  const manifestPaths = await listModuleManifestPaths(MODULES_DIR);

  if (!options.force && (await isCacheFresh(manifestPaths))) {
    try {
      const cachedRaw = await fs.readFile(CACHE_FILE_PATH, "utf8");
      return JSON.parse(cachedRaw) as ModuleRegistry;
    } catch {
      // Continue with regeneration if cache was removed between freshness check and read.
    }
  }

  const warnings: string[] = [];
  const modules: ActionModuleDefinition[] = [];
  const validate = await compileValidator();

  for (const manifestPath of manifestPaths) {
    try {
      const raw = JSON.parse(await fs.readFile(manifestPath, "utf8")) as unknown;
      const valid = validate(raw);
      if (!valid) {
        warnings.push(`Invalid module manifest at ${manifestPath}: ${formatErrors(validate.errors)}`);
        continue;
      }

      const module = asModuleDefinition(raw);
      if (!module) {
        warnings.push(`Unable to parse module manifest shape at ${manifestPath}.`);
        continue;
      }

      modules.push(module);
    } catch (error) {
      warnings.push(
        `Failed to load module manifest at ${manifestPath}: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  modules.sort((left, right) => left.name.localeCompare(right.name));

  const registry = buildRegistry(modules, manifestPaths, warnings);
  await fs.mkdir(CACHE_DIR, { recursive: true });
  await fs.writeFile(CACHE_FILE_PATH, JSON.stringify(registry, null, 2), "utf8");

  return registry;
}

export async function readModuleRegistry(): Promise<ModuleRegistry> {
  return generateModuleRegistry({ force: false });
}

export function getModuleRegistryCachePath(): string {
  return CACHE_FILE_PATH;
}
