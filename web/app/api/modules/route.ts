import { fail, ok } from "@/app/api/_utils";
import { listActionModules } from "@/lib/modules";

export async function GET() {
  try {
    const modules = await listActionModules();
    return ok(modules, { source: "fallback" });
  } catch (error) {
    return fail(500, {
      code: "MODULE_LIST_FAILED",
      message: error instanceof Error ? error.message : "Unable to list action modules."
    });
  }
}
