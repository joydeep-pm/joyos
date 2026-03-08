import { getSettings } from "@/lib/file-store";
import { fail, ok } from "@/app/api/_utils";

export async function GET() {
  try {
    const settings = await getSettings();
    return ok(settings, { source: "fallback" });
  } catch (error) {
    return fail(500, {
      code: "SETTINGS_READ_FAILED",
      message: error instanceof Error ? error.message : "Unable to read settings."
    });
  }
}
