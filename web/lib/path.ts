import path from "node:path";

export function getPersonalOsRoot(): string {
  if (process.env.PERSONAL_OS_ROOT) {
    return path.resolve(process.env.PERSONAL_OS_ROOT);
  }

  return path.resolve(process.cwd(), "..");
}

export function getWorkspacePaths() {
  const root = getPersonalOsRoot();

  return {
    root,
    tasksDir: path.join(root, "Tasks"),
    knowledgeDir: path.join(root, "Knowledge"),
    backlogPath: path.join(root, "BACKLOG.md"),
    goalsPath: path.join(root, "GOALS.md")
  };
}
