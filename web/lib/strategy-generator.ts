import fs from "node:fs/promises";
import path from "node:path";
import { getWorkspacePaths } from "@/lib/path";
import { getStrategyWorkspace } from "@/lib/strategy";

export type StrategyOutputType = "business_status_update" | "roadmap_update" | "executive_snapshot" | "board_summary";

const FY27_DIR = path.join("Knowledge", "Strategy", "FY27");

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

export async function generateStrategyOutput(type: StrategyOutputType) {
  const workspace = await getStrategyWorkspace();
  const root = getWorkspacePaths().root;
  const date = todayDate();

  const sharedSummary = workspace.currentShareableStatus?.body ?? "";

  let filename = "";
  let title = "";
  let content = "";

  if (type === "business_status_update") {
    filename = `Business-Status-Update-${date}.md`;
    title = "Business Status Update";
    content = `# Business Status Update\n\n## Update Title\n- Topic / Product Area: FY27 Product Strategy and Roadmap Status\n- Audience: Business Stakeholders\n- Date: ${date}\n\n## Executive Summary\n\n${sharedSummary.split("\n\n")[2] ?? "Current strategy is directionally clear, but requires active leadership protection and follow-through."}\n\n## Current Status\n\n### Overall status\n- In progress / needs continued leadership protection\n\n### Current protected priorities\n${workspace.protectedPriorities.map((item) => `- ${item}`).join("\n")}\n\n### Current watchouts\n${workspace.watchouts.map((item) => `- ${item}`).join("\n")}\n\n## Near-Term Outlook\n\nOver the next few weeks, progress should show up as stronger protection of key bets, clearer ownership of dependencies, and better stakeholder-ready communication.\n`;
  }

  if (type === "roadmap_update") {
    filename = `Roadmap-Update-${date}.md`;
    title = "Roadmap Update";
    content = `# Roadmap Update\n\n## Update Details\n- Audience: Business stakeholders / roadmap review stakeholders\n- Quarter / Period: FY27 current planning view\n- Date: ${date}\n\n## Summary\n\nThe roadmap remains strongest when a small number of protected bets are defended against adjacent complexity and under-owned dependencies.\n\n## Quarter Arc\n${workspace.roadmapQuarters
      .map((quarter) => `### ${quarter.quarter} — ${quarter.theme}\n- ${quarter.objective}`)
      .join("\n\n")}\n\n## Protected Bets\n${workspace.protectedPriorities.map((item) => `- ${item}`).join("\n")}\n\n## Current Watchouts\n${workspace.watchouts.map((item) => `- ${item}`).join("\n")}\n`;
  }

  if (type === "executive_snapshot") {
    filename = `Executive-Status-Snapshot-${date}.md`;
    title = "Executive Status Snapshot";
    content = `# Executive Status Snapshot\n\n## Snapshot Details\n- Topic: FY27 Product Strategy and Roadmap Status\n- Audience: Leadership / business stakeholders\n- Date: ${date}\n\n## One-Line Read\n\nFY27 strategy is clear, but success depends on disciplined protection of a few parity and compliance bets and better commercial confidence.\n\n## Headline Metrics / Facts\n${workspace.metrics.slice(0, 4).map((metric) => `- ${metric.label}: ${metric.value}`).join("\n")}\n\n## What Matters Most Right Now\n${workspace.protectedPriorities.slice(0, 3).map((item, index) => `${index + 1}. ${item}`).join("\n")}\n\n## Current Risks\n${workspace.watchouts.slice(0, 3).map((item) => `- ${item}`).join("\n")}\n`;
  }

  if (type === "board_summary") {
    filename = `Board-Style-Summary-${date}.md`;
    title = "Board-Style Summary";
    content = `# Board-Style Summary — ${date}\n\n## One-Line Read\n\nFY27 has a credible recovery path, but realization depends on protecting the most commercially important bets and closing the confidence gap around delivery and readiness.\n\n## Headline Facts\n${workspace.metrics.map((metric) => `- ${metric.label}: ${metric.value}`).join("\n")}\n\n## Board-Level Watch Items\n${workspace.watchouts.map((item) => `- ${item}`).join("\n")}\n\n## Current Actions Underway\n${workspace.decisionSupport.slice(0, 3).map((doc) => `- ${doc.title}`).join("\n")}\n`;
  }

  const absPath = path.join(root, FY27_DIR, filename);
  await fs.writeFile(absPath, content, "utf8");

  return {
    type,
    title,
    path: path.join(FY27_DIR, filename),
    filename,
    content
  };
}
