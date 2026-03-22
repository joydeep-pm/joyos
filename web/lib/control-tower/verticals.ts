/**
 * Vertical definitions and shared types for the Control Tower.
 * This file is client-safe — no Node.js / fs imports.
 */

export const PRODUCT_VERTICALS = [
  { id: "personal_loan",       label: "Personal Loan",            charters: ["Personal Loan", "PL"] },
  { id: "gold_loan",           label: "Gold Loan",                charters: ["Gold Loan", "Gold"] },
  { id: "education_loan",      label: "Education Loan",           charters: ["Education Loan"] },
  { id: "las",                 label: "LAS",                      charters: ["LAS", "Loan Against Shares"] },
  { id: "lamf",                label: "LAMF",                     charters: ["LAMF", "Loan Against Mutual Funds"] },
  { id: "las_lamf",            label: "LAS / LAMF",               charters: ["LAS", "LAMF", "Loan Against Shares", "Loan Against Mutual Funds"] },
  { id: "mfi",                 label: "MFI",                      charters: ["MFI", "Microfinance"] },
  { id: "bnpl",                label: "BNPL / Credit Line",       charters: ["BNPL", "Credit Line", "BNPL / Credit Line"] },
  { id: "consumer_durables",   label: "Consumer Durables",        charters: ["Consumer Durables"] },
  { id: "business_loan",       label: "Business Loan / SCF",      charters: ["Business Loan", "SCF", "Business Loan / SCF"] },
  { id: "auto_loan",           label: "Auto Loan",                charters: ["Auto Loan"] },
  { id: "lap",                 label: "LAP",                      charters: ["LAP", "Loan Against Property"] },
  { id: "home_loan",           label: "Home Loan",                charters: ["Home Loan"] },
] as const;

export const PLATFORM_VERTICALS = [
  { id: "los",          label: "LOS",                charters: ["LOS", "Loan Origination", "Loan Origination System"] },
  { id: "collections",  label: "Collections",        charters: ["Collections"] },
  { id: "lms",          label: "LMS",                charters: ["LMS", "Loan Management", "Lending Platform"] },
  { id: "co_lending",   label: "Co-Lending",         charters: ["Co-Lending", "CoLending"] },
] as const;

export const ALL_VERTICALS = [...PRODUCT_VERTICALS, ...PLATFORM_VERTICALS];

export type VerticalId =
  | (typeof PRODUCT_VERTICALS)[number]["id"]
  | (typeof PLATFORM_VERTICALS)[number]["id"]
  | "overall";

export type StatusUpdateFormat = "teams_quick" | "business_status_update" | "roadmap_update";
