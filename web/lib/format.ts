export function friendlyDate(value?: string): string {
  if (!value) return "No due date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

export function statusLabel(value: string): string {
  const labels: Record<string, string> = {
    n: "Not started",
    s: "In progress",
    b: "Blocked",
    d: "Done"
  };
  return labels[value] ?? value;
}
