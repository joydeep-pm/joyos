import { fail, ok } from "@/app/api/_utils";
import { getModuleRegistryCachePath, readModuleRegistry } from "@/lib/module-registry";

export async function GET() {
  try {
    const registry = await readModuleRegistry();
    return ok(
      {
        generated_at: registry.generated_at,
        cache_file: getModuleRegistryCachePath(),
        endpoints: registry.endpoints,
        warnings: registry.warnings,
        module_count: registry.modules.length,
        endpoint_count: registry.endpoints.length
      },
      { source: "fallback" }
    );
  } catch (error) {
    return fail(500, {
      code: "MODULE_ENDPOINTS_FAILED",
      message: error instanceof Error ? error.message : "Unable to read module endpoints cache."
    });
  }
}
