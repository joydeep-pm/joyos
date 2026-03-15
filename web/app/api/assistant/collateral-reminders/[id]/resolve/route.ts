import { fail, ok } from "@/app/api/_utils";
import { resolveCollateralReminder } from "@/lib/assistant/collateral-reminder-engine";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const reminder = await resolveCollateralReminder(id);

  if (!reminder) {
    return fail(404, {
      code: "collateral_reminder_not_found",
      message: `Collateral reminder not found: ${id}`
    });
  }

  return ok(reminder);
}
