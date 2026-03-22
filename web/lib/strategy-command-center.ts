export type RoadmapStatus = "not_started" | "in_progress" | "at_risk" | "blocked" | "done";

export interface RoadmapItem {
  id: string;
  quarter: "Q1" | "Q2" | "Q3" | "Q4";
  title: string;
  category: string;
  type: "parity" | "compliance" | "market_entry" | "stability" | "ecosystem";
  status: RoadmapStatus;
  reason: string;
}

export interface ProductDeepDive {
  id: string;
  title: string;
  parity: string;
  opportunity: string;
  watchout: string;
  linkedRoadmapIds: string[];
}

export interface AopPanelItem {
  title: string;
  value: string;
  note: string;
}

export interface RiskHiringItem {
  title: string;
  severity: "critical" | "high" | "medium";
  note: string;
}

export interface EpicItem {
  id: string;
  quarter: "Q1" | "Q2" | "Q3" | "Q4";
  name: string;
  pd: number;
  prio: "P0" | "P1" | "P2";
  cat: string;
  loss: string;
  notes: string;
  status: RoadmapStatus;
}

export interface ParityItem {
  name: string;
  us: number;
  best: number;
  who: string;
}

export interface StrategicPillar {
  title: string;
  color: string;
  desc: string;
}

export interface StrategicMoat {
  title: string;
  color: string;
  icon: string;
  body: string;
}

export interface FrictionZone {
  label: string;
  title: string;
  color: string;
  body: string;
}

export interface RiskItem {
  prob: "High" | "Med" | "Low";
  impact: "Critical" | "High" | "Med";
  name: string;
  mit: string;
}

export interface HireItem {
  role: string;
  when: string;
  why: string;
}

export interface CsuiteDecision {
  title: string;
  desc: string;
  color: string;
}

export interface GalleryItem {
  id: string;
  type: "v" | "h";
  icon: string;
  name: string;
  color: string;
  us: number | null;
  best: number | null;
  who: string | null;
  loss: string | null;
  opp: string | null;
  epics: string[];
  quarter: string;
  tag: string;
}

export interface KpiMetric {
  label: string;
  value: string;
  sub: string;
  accent: "red" | "amber" | "blue" | "green";
}

export interface InsightItem {
  label: string;
  value: string;
  sub: string;
  color: "red" | "amber" | "green" | "blue";
}

export interface StrategyCommandCenterModel {
  roadmap: RoadmapItem[];
  deepDives: ProductDeepDive[];
  aopPanels: AopPanelItem[];
  riskHiring: RiskHiringItem[];
  epics: EpicItem[];
  parityData: ParityItem[];
  pillars: StrategicPillar[];
  moats: StrategicMoat[];
  frictionZones: FrictionZone[];
  risks: RiskItem[];
  hires: HireItem[];
  decisions: CsuiteDecision[];
  gallery: GalleryItem[];
  kpiMetrics: KpiMetric[];
  insights: InsightItem[];
}

export const Q_META: Record<string, { label: string; sub: string; color: string }> = {
  Q1: { label: "CLOSE THE GAP",        sub: "Apr-Jun 2026", color: "#EF4444" },
  Q2: { label: "ENTERPRISE READY",     sub: "Jul-Sep 2026", color: "#F59E0B" },
  Q3: { label: "B2B & INTERNATIONAL",  sub: "Oct-Dec 2026", color: "#3B82F6" },
  Q4: { label: "MONETIZE ECOSYSTEM",   sub: "Jan-Mar 2027", color: "#10B981" },
};

export const CAT_COLORS: Record<string, string> = {
  "Products":        "#3B82F6",
  "Ecosystem":       "#06B6D4",
  "Collections":     "#F59E0B",
  "Risk/Compliance": "#EF4444",
  "AI":              "#8B5CF6",
  "Platform":        "#6B7280",
  "Accounting":      "#10B981",
  "Capital Markets": "#EC4899",
  "Quality/Ops":     "#9CA3AF",
};

export const STRATEGY_COMMAND_CENTER: StrategyCommandCenterModel = {

  kpiMetrics: [
    { label: "FY26 Total Losses",    value: "100.5 Cr",  sub: "23 deals - India pipeline",          accent: "red"   },
    { label: "Demo Loss Rate",       value: "78.5%",      sub: "Philippines 100% - India 75%",        accent: "amber" },
    { label: "FY27 Roadmap",         value: "5,551 PD",   sub: "42 EPICs - ~40-45 engineers",         accent: "blue"  },
    { label: "Recoverable Pipeline", value: "49-55 Cr",   sub: "+25-40 Cr net-new - AI +15-25% ACV", accent: "green" },
  ],

  insights: [
    { label: "Why We Lose",          value: "57%",     sub: "Feature gaps - directly addressable",       color: "red"   },
    { label: "Almost Comply",        value: "62.5%",   sub: "Platform convinces, loses on depth",        color: "amber" },
    { label: "Gold Loan Parity",     value: "20%",     sub: "vs A3SL 90% - Rs 16 Cr at stake Q1",       color: "red"   },
    { label: "LAMF/LAS Parity",      value: "53%",     sub: "vs A3SL 95% - Rs 5 Cr at stake Q1",        color: "amber" },
    { label: "Islamic Finance TAM",  value: "USD 3.5B", sub: "GCC/ASEAN - zero revenue today",           color: "green" },
  ],

  epics: [
    { id: "ECO-01",   quarter: "Q1", name: "Co-lending Middleware & Enhancements",  pd: 243, prio: "P0", cat: "Ecosystem",       loss: "3 Cr",      notes: "Largest Q1 EPIC. Separate pod from Gold/LAMF. Risk: scope creep on triple-book accounting.",              status: "not_started" },
    { id: "PROD-03",  quarter: "Q1", name: "LAS/LAMF 1.0",                           pd: 126, prio: "P0", cat: "Products",        loss: "5 Cr",      notes: "Neo Finance to Nucleus. MF Central/CAMS/KFin lien marking. Release priority logic.",                       status: "not_started" },
    { id: "PROD-04",  quarter: "Q1", name: "Gold Critical Enhancements",              pd: 108, prio: "P0", cat: "Products",        loss: "16 Cr",     notes: "Piramal, L&T, ABCL to Pennant. Vault ops + ornament mgmt + auction readiness must ship together.",        status: "not_started" },
    { id: "PROD-01",  quarter: "Q1", name: "BNPL Credit Line Parity",                 pd: 171, prio: "P0", cat: "Products",        loss: "Pipeline",  notes: "BNPL pipeline stalled. Pre-EMI, moratorium, flex RPS gaps. Craft Silicon 85% vs Finflux 71%.",            status: "not_started" },
    { id: "PROD-02",  quarter: "Q1", name: "LAP 2.0 + Home Loan 1.0",                pd: 189, prio: "P0", cat: "Products",        loss: "6.5 Cr",    notes: "Kissht, InPrime, Saarthi. No dedicated HL product today. Sale-of-asset + richer collateral logic.",       status: "not_started" },
    { id: "PROD-05",  quarter: "Q1", name: "SCF 1.0",                                 pd: 108, prio: "P1", cat: "Products",        loss: "3 Cr",      notes: "Credflow. SCF coverage <10%. New category unlock. Anchor-dealer-vendor coverage.",                         status: "not_started" },
    { id: "COL-02a",  quarter: "Q1", name: "Auction & Repo MVP",                      pd: 108, prio: "P0", cat: "Collections",     loss: "-",         notes: "Mandatory for every gold/secured RFP. End-to-end auction + repossession workflows.",                       status: "not_started" },
    { id: "RISK-01",  quarter: "Q1", name: "ECL 1.0 + EIR Amortization",              pd: 126, prio: "P0", cat: "Risk/Compliance", loss: "-",         notes: "Hard compliance gate for all regulated lender RFPs. Ind AS 109 EIR + IFRS 9 ECL baseline.",              status: "not_started" },
    { id: "CFG-01",   quarter: "Q1", name: "Config Experience 1.0",                   pd: 45,  prio: "P1", cat: "Platform",        loss: "-",         notes: "Streamline config model and UX. Cited in demo debriefs as friction. Highest ROI/PD ratio.",                status: "not_started" },
    { id: "AI-01a",   quarter: "Q1", name: "AI Moat 1.0",                             pd: 45,  prio: "P1", cat: "AI",              loss: "-",         notes: "UC-11 GenAI Notifications, UC-02 Portfolio Insights, UC-13 Collectability Score.",                        status: "not_started" },
    { id: "OPE-01a",  quarter: "Q1", name: "Bug-a-thon 1.0",                          pd: 90,  prio: "P0", cat: "Quality/Ops",    loss: "-",         notes: "Harden core journeys. Reference quality is the cheapest sales asset.",                                      status: "not_started" },
    { id: "CMP-01",   quarter: "Q2", name: "DPDPA Compliance",                        pd: 126, prio: "P0", cat: "Risk/Compliance", loss: "-",         notes: "InfoSec gate in every bank/large NBFC deal. Finflux fails most InfoSec reviews today.",                   status: "not_started" },
    { id: "AUD-01",   quarter: "Q2", name: "Audit Module 2.0",                         pd: 81,  prio: "P0", cat: "Platform",        loss: "-",         notes: "Enterprise eval weakness. Immutable audit trail. Key ask in all Tier-1 NBFC evaluations.",                status: "not_started" },
    { id: "RISK-01b", quarter: "Q2", name: "Provisioning 2.0 (Stage-based)",           pd: 63,  prio: "P0", cat: "Risk/Compliance", loss: "-",         notes: "Board/regulator scrutiny. Stage-based provisioning. Collateral-aware rules.",                              status: "not_started" },
    { id: "COL-02b",  quarter: "Q2", name: "Legal Module + Yarding & Recovery",        pd: 153, prio: "P0", cat: "Collections",     loss: "14 Cr",     notes: "NPA system-of-record. Legal case lifecycle. Vehicle yarding. 14 Cr vehicle recovery enabler.",            status: "not_started" },
    { id: "SEG-01",   quarter: "Q2", name: "Microfinance & PSL Pack",                  pd: 108, prio: "P0", cat: "Products",        loss: "-",         notes: "Avanti, Svamaan, APFL, Chaitanya, Pragati pipeline. 5 of 11 MFI requirements in Q2.",                    status: "not_started" },
    { id: "SI-01",    quarter: "Q2", name: "SI-Ready Framework",                       pd: 81,  prio: "P1", cat: "Ecosystem",       loss: "-",         notes: "Scale delivery 3-5x without linear headcount. Distribution strategy, not just efficiency.",               status: "not_started" },
    { id: "OPE-01b",  quarter: "Q2", name: "Bug Bash 1.0 (Full Sprint)",               pd: 360, prio: "P0", cat: "Quality/Ops",    loss: "-",         notes: "SLA adherence. ~40 devs one full sprint. Non-negotiable.",                                                 status: "not_started" },
    { id: "PROD-04b", quarter: "Q2", name: "Gold High Enhancements",                   pd: 81,  prio: "P1", cat: "Products",        loss: "-",         notes: "Vault ops, high-volume branch flows, audit-grade trails.",                                                 status: "not_started" },
    { id: "PROD-03b", quarter: "Q2", name: "LAS 2.0",                                  pd: 45,  prio: "P1", cat: "Products",        loss: "-",         notes: "Dashboards, exposure logic, operational tooling.",                                                         status: "not_started" },
    { id: "AI-01b",   quarter: "Q2", name: "AI Moat 2.0",                              pd: 45,  prio: "P1", cat: "AI",              loss: "-",         notes: "UC-08 EWS First-Time Defaulter, UC-16 Anomaly Detection, UC-17 Post-Call Compliance.",                  status: "not_started" },
    { id: "PROD-06a", quarter: "Q3", name: "Auto Retail + Dealer Finance",              pd: 252, prio: "P0", cat: "Products",        loss: "14 Cr",     notes: "MBFS, IKF, Hinduja. Hypothecation, RC, NOC. Dealer/floorplan. Finbox + Qualtech competitors.",           status: "not_started" },
    { id: "PROD-06c", quarter: "Q3", name: "Lease Engine + Fleet Finance",              pd: 171, prio: "P0", cat: "Products",        loss: "3 Cr",      notes: "Drivn 3 Cr. Philippines/SEA leasing pipeline. Residual values, TDS, multi-asset structures.",           status: "not_started" },
    { id: "ISL-01",   quarter: "Q3", name: "Islamic Product Engine + Governance",       pd: 207, prio: "P0", cat: "Products",        loss: "-",         notes: "GCC/ASEAN. 3.5 Bn TAM. Murabaha + Ijarah + Musharakah + Shariah Governance.",                           status: "not_started" },
    { id: "CAP-01",   quarter: "Q3", name: "Direct Assignment + Securitization",        pd: 252, prio: "P0", cat: "Capital Markets", loss: "10-15 Cr",  notes: "Capital-light NBFC model. DA derecognition accounting requires Capital Markets SME by Q1 April.",        status: "not_started" },
    { id: "PROD-05b", quarter: "Q3", name: "MCA Daily Balance Engine",                  pd: 126, prio: "P1", cat: "Products",        loss: "-",         notes: "Core IP for MCA/SME programs. Finbox competitor. Variable repayments + recalculations.",                 status: "not_started" },
    { id: "CFO-02",   quarter: "Q3", name: "TDS Automation + Bank Recon",               pd: 207, prio: "P1", cat: "Accounting",      loss: "-",         notes: "Finance team migration gate. CFO-facing differentiator.",                                                  status: "not_started" },
    { id: "GOV-01",   quarter: "Q3", name: "Data Residency & Regulatory Packs",          pd: 81,  prio: "P1", cat: "Platform",        loss: "-",         notes: "Unblocks all international pipeline (GCC, SEA, Philippines).",                                            status: "not_started" },
    { id: "AI-01c",   quarter: "Q3", name: "AI Moat 3.0",                               pd: 45,  prio: "P1", cat: "AI",              loss: "-",         notes: "UC-14 Agentic Collections AI, UC-19 ECL ML Automation, UC-15 Settlement Simulation.",                  status: "not_started" },
    { id: "SEG-01b",  quarter: "Q3", name: "MFI Compliance & Lifecycle",                 pd: 108, prio: "P1", cat: "Products",        loss: "-",         notes: "6 of 11 MFI requirements. IRACP provisioning, DPD/SMA config.",                                           status: "not_started" },
    { id: "OPE-01c",  quarter: "Q3", name: "Bug-a-thon 2.0",                            pd: 90,  prio: "P0", cat: "Quality/Ops",    loss: "-",         notes: "Stabilize expanded B2B/Vehicle/Islamic surface.",                                                          status: "not_started" },
    { id: "AI-01d",   quarter: "Q4", name: "AI Moat 4.0 (Cross-Portfolio)",             pd: 45,  prio: "P0", cat: "AI",              loss: "+15-25% ACV", notes: "Price AI as premium module. Target 15-25% ACV uplift per enterprise client by Q4.",              status: "not_started" },
    { id: "ECO-03",   quarter: "Q4", name: "ERP/ADF Integrations + Reporting",           pd: 126, prio: "P0", cat: "Ecosystem",       loss: "-",         notes: "Turns 3-4 week ERP bottleneck into repeatable, billable accelerator.",                                    status: "not_started" },
    { id: "ISL-03",   quarter: "Q4", name: "Sukuk & Islamic Pooling Hooks",               pd: 63,  prio: "P1", cat: "Products",        loss: "-",         notes: "Completes Islamic finance suite for Tier-1 GCC capital markets.",                                          status: "not_started" },
    { id: "COL-04",   quarter: "Q4", name: "Collections AI & Workout Engine",             pd: 81,  prio: "P1", cat: "Collections",     loss: "-",         notes: "In-LMS collections vs Credgenics. ARPU uplift + reduced vendor dependency.",                             status: "not_started" },
    { id: "ECO-04",   quarter: "Q4", name: "Embedded Credit Toolkit",                     pd: 81,  prio: "P1", cat: "Ecosystem",       loss: "-",         notes: "3x TAM expansion into LSP and embedded finance without new direct sales.",                              status: "not_started" },
    { id: "OPE-01d",  quarter: "Q4", name: "Bug Bash 2.0 (Full Sprint)",                  pd: 360, prio: "P0", cat: "Quality/Ops",    loss: "-",         notes: "Platform-wide stability for rapid SI ecosystem onboarding.",                                               status: "not_started" },
  ],

  parityData: [
    { name: "Gold Loan",        us: 20, best: 90, who: "A3SL"          },
    { name: "Lease/Fleet",      us: 0,  best: 80, who: "Qualtech"       },
    { name: "Islamic Finance",  us: 0,  best: 90, who: "Path Solutions" },
    { name: "SCF",              us: 10, best: 80, who: "Multiple"       },
    { name: "LAMF/LAS",         us: 53, best: 95, who: "A3SL"          },
    { name: "Vehicle Finance",  us: 40, best: 85, who: "Finbox"         },
    { name: "BNPL/Credit Line", us: 71, best: 85, who: "Craft Silicon"  },
    { name: "LAP/Home Loan",    us: 82, best: 86, who: "Pennant"        },
    { name: "Personal Loan",    us: 82, best: 95, who: "Nucleus"        },
    { name: "Business Loan",    us: 84, best: 88, who: "A3SL"          },
    { name: "EDI/MCA",          us: 84, best: 88, who: "Twinline"       },
    { name: "Education",        us: 88, best: 97, who: "A3SL"          },
  ],

  pillars: [
    { title: "Close the Revenue Bleed",           color: "#EF4444", desc: "Rs 100+ Cr lost in FY26. 57% from core feature gaps in Gold (20% parity), LAMF (53%), BNPL/CL (71%) and Vehicle Finance. Q1 EPICs directly address Rs 57 Cr of this loss." },
    { title: "Pass the Compliance Firewall",       color: "#F59E0B", desc: "DPDPA, ECL provisioning, EIR, Audit Module 2.0 and NPA automation are mandatory gates blocking every bank and large NBFC deal. Q2 removes all four vetoes." },
    { title: "Enter Two New High-Value Markets",   color: "#3B82F6", desc: "Islamic Finance for GCC/ASEAN (USD 3.5 Bn TAM) and Capital Markets/B2B for mid-large NBFCs represent net-new revenue unavailable today. Both land in Q3." },
    { title: "Accelerate Delivery with AI",        color: "#10B981", desc: "AI code assistants recover 1,100-1,400 PDs of capacity - equivalent to 5-6 additional engineers through scaffolding reduction and AI-assisted testing. HITL maintained." },
    { title: "Build the Loss-Prevention Framework",color: "#8B5CF6", desc: "Hypercare, QBRs, horizontal reference clusters, product marketing, and win-loss closed loops address the 43% of losses attributable to trust deficit and incumbent advantage." },
  ],

  moats: [
    { title: "Islamic Finance / GCC",        color: "#F59E0B", icon: "medal", body: "No modern cloud-native Islamic LMS in GCC. USD 3.5 Bn TAM. 2-3 yr first-mover window before Temenos completes cloud-native transition." },
    { title: "AI-Native LMS Intelligence",   color: "#3B82F6", icon: "bot",   body: "LMS layer owns portfolio data, payment behavior, covenant signals. No LOS-focused AI vendor can replicate this. Target: +15-25% ACV from AI module." },
    { title: "Co-lending Orchestration Hub", color: "#10B981", icon: "zap",   body: "Co-lending AUM 40%+ YoY. Each program creates network effects. RBI co-lending directions maturation makes middleware critical infrastructure." },
  ],

  frictionZones: [
    { label: "01 Product",     title: "Product Maturity & Gaps",        color: "#EF4444", body: "Legacy-first mentality compounding tech debt. Enterprise grade deficit in Tier-1 NBFC RFPs. No robust CMS (WIP). Reporting lag." },
    { label: "02 Engineering", title: "Velocity & Innovation Dilemma",  color: "#F59E0B", body: "Maintenance trap: escalations consume roadmap sprints. Slow lab-to-market bridge. No defined AI application framework within LMS." },
    { label: "03 GTM",         title: "Sales Execution Misalignment",   color: "#3B82F6", body: "Go-after-all syndrome. Selling the wishlist vs stable capabilities. Low-resolution qualification. Semi-static demo platform losing deals at PoC." },
    { label: "04 Ecosystem",   title: "Ecosystem Stagnation",           color: "#8B5CF6", body: "Features siloed, not cross-pollinated. Underutilized M2P synergies (Recon360, MMS, IC). Collections stagnation vs Credgenics." },
    { label: "05 LOS/BRE",    title: "LOS Foundation (WIP)",            color: "#06B6D4", body: "LOS bolted-on, not embedded. Under-orchestrated BRE/Workflow. MFI replatforming drag ceding ground for 2 quarters." },
  ],

  risks: [
    { prob: "High", impact: "Critical", name: "Gold/LAMF loses bandwidth to ECO-01 in Q1",    mit: "Separate engineering pods. ECO-01 cannot cannibalize PROD-03/04." },
    { prob: "High", impact: "High",     name: "Capital Markets domain expertise gap delays Q3", mit: "Capital Markets SME engagement by Q1 April. Design validated before Q3 build." },
    { prob: "Med",  impact: "High",     name: "ISL-01 Shariah certification delays GCC entry",  mit: "Shariah advisor by Q1 June. AAOIFI standards from schema stage." },
    { prob: "Med",  impact: "High",     name: "Bug Bash deprioritized under feature pressure",  mit: "Bug Bash is non-negotiable. Reduce optional scope before touching quality." },
    { prob: "Low",  impact: "Critical", name: "DPDPA misses Q2, blocking large bank pipeline",  mit: "DPDPA is 126 PD, known scope. Risk is scheduling only. Mandate P0 in Q2." },
    { prob: "High", impact: "High",     name: "Philippines/SEA continues 100% LMS loss rate",   mit: "GOV-01 data residency (Q3) + localization specialist by Q2. Tighten qualification." },
  ],

  hires: [
    { role: "Capital Markets SME",        when: "Q1 Apr", why: "Validate DA/PTC accounting design"  },
    { role: "Islamic Finance Lead",        when: "Q1 May", why: "Shariah product design ownership"   },
    { role: "Shariah Advisor Partnership", when: "Q1 Jun", why: "Certification pathway (AAOIFI)"     },
    { role: "SI Program Lead",             when: "Q2 Jul", why: "Build + manage SI ecosystem"        },
    { role: "Senior SRE/DevOps",           when: "Q2 Aug", why: "Bank IT due diligence readiness"    },
  ],

  decisions: [
    { title: "Ring-fence Q1 Gold + LAMF pods from co-lending bandwidth",  desc: "Rs 21 Cr recovery at stake. Cannot be left to sprint-level negotiation.",              color: "#EF4444" },
    { title: "Approve Capital Markets SME and Islamic Finance Lead in Q1", desc: "90-day lead time. Delay in Q1 = Q3 slip = FY28 market entry.",                         color: "#F59E0B" },
    { title: "Mandate Bug Bash 1.0 and 2.0 as inviolable annual rituals",  desc: "Reference quality is the cheapest sales channel. Non-negotiable.",                     color: "#3B82F6" },
    { title: "Authorize SI-Ready Framework - two SI certifications by Q3", desc: "Breaks the implementation throughput ceiling without linear headcount.",                 color: "#10B981" },
    { title: "AI module pricing review by Q3 - AI cannot be bundled free", desc: "AI Moat is a pricing strategy. Target: first premium AI module sold by Q4.",            color: "#8B5CF6" },
  ],

  gallery: [
    { id: "gold",       type: "v", icon: "medal",  name: "Gold Loan",             color: "#F59E0B", us: 20,  best: 90, who: "A3SL",          loss: "16 Cr",    opp: null,                      epics: ["PROD-04","COL-02a","PROD-04b"],         quarter: "Q1-Q2", tag: "3 phases - 32 modules - RBI 2026 compliant" },
    { id: "las",        type: "v", icon: "chart",  name: "LAS / LAMF",            color: "#3B82F6", us: 53,  best: 95, who: "A3SL",          loss: "5 Cr",     opp: null,                      epics: ["PROD-03","PROD-03b"],                   quarter: "Q1-Q2", tag: "Loan Against Securities - Mutual Funds - Pledges" },
    { id: "bnpl",       type: "v", icon: "card",   name: "BNPL / Credit Line",    color: "#06B6D4", us: 71,  best: 85, who: "Craft Silicon", loss: "Pipeline", opp: null,                      epics: ["PROD-01"],                              quarter: "Q1",   tag: "Pre-EMI - Moratorium - Flex RPS - Credit Line drawdown" },
    { id: "vehicle",    type: "v", icon: "car",    name: "Vehicle Finance",       color: "#EF4444", us: 40,  best: 85, who: "Finbox",        loss: "15.5 Cr",  opp: null,                      epics: ["PROD-06a","PROD-06c"],                  quarter: "Q3",   tag: "Auto Retail - Dealer Finance - Lease - Fleet" },
    { id: "homeloan",   type: "v", icon: "home",   name: "Home Loan / LAP",       color: "#10B981", us: 82,  best: 86, who: "Pennant",       loss: "6.5 Cr",   opp: null,                      epics: ["PROD-02"],                              quarter: "Q1-Q2", tag: "LAP 2.0 - Home Loan 1.0 - Mortgage collateral" },
    { id: "mfi",        type: "v", icon: "wheat",  name: "Microfinance (MFI)",    color: "#10B981", us: 55,  best: 85, who: "Craft Silicon", loss: null,       opp: "MFI + co-lending pipeline", epics: ["SEG-01","SEG-01b"],                  quarter: "Q2-Q3", tag: "11 requirements - 2 phases - Craft Silicon competitive" },
    { id: "islamic",    type: "v", icon: "star",   name: "Islamic Finance / GCC", color: "#8B5CF6", us: 0,   best: 90, who: "Path Solutions",loss: null,       opp: "15-25 Cr - USD 3.5 Bn TAM", epics: ["ISL-01","ISL-03"],                   quarter: "Q3-Q4", tag: "Murabaha - Ijarah - Musharakah - Shariah Governance" },
    { id: "capital",    type: "v", icon: "bank",   name: "Capital Markets",       color: "#EC4899", us: 30,  best: 80, who: "Pennant",       loss: null,       opp: "10-15 Cr net-new",          epics: ["CAP-01"],                              quarter: "Q3",   tag: "Direct Assignment - Securitization - PTC" },
    { id: "scf",        type: "v", icon: "link",   name: "Supply Chain / MCA",    color: "#F59E0B", us: 10,  best: 80, who: "Multiple",      loss: "3 Cr",     opp: null,                      epics: ["PROD-05","PROD-05b"],                   quarter: "Q1-Q3", tag: "SCF 1.0 - Anchor-Dealer-Vendor - MCA Daily Balance" },
    { id: "colending",   type: "h", icon: "zap",   name: "Co-lending",              color: "#10B981", us: 65,  best: 90, who: "Yubi",         loss: "3 Cr",    opp: "40%+ AUM YoY",             epics: ["ECO-01"],                              quarter: "Q1",   tag: "Middleware - Triple-book - Bank-agnostic - Regulatory reporting" },
    { id: "compliance",  type: "h", icon: "shield", name: "Compliance Stack",       color: "#EF4444", us: null, best: null, who: null,        loss: null,      opp: "Unblocks all bank deals",   epics: ["CMP-01","RISK-01","AUD-01","RISK-01b"], quarter: "Q1-Q2", tag: "DPDPA - ECL/EIR - Audit 2.0 - Stage-based Provisioning" },
    { id: "ai",          type: "h", icon: "bot",    name: "AI Moat (1.0 to 4.0)", color: "#8B5CF6", us: null, best: null, who: null,          loss: null,      opp: "+15-25% ACV uplift",        epics: ["AI-01a","AI-01b","AI-01c","AI-01d"],   quarter: "Q1-Q4", tag: "12 Vue AI use cases - Collections intelligence - Premium Q4" },
    { id: "collections", type: "h", icon: "inbox",  name: "Collections Intelligence", color: "#06B6D4", us: 55, best: 85, who: "Credgenics", loss: "2.5 Cr",  opp: "ARPU uplift",               epics: ["COL-02a","COL-02b","COL-04"],           quarter: "Q1-Q4", tag: "Auction - Repo - Legal - Collections AI - Workout Engine" },
  ],

  roadmap: [
    {
      id: "gold-parity",
      quarter: "Q1",
      title: "Gold parity and recovery stack",
      category: "Product parity",
      type: "parity",
      status: "in_progress",
      reason: "High-confidence recovery category with strong commercial importance."
    },
    {
      id: "las-lamf",
      quarter: "Q1",
      title: "LAS / LAMF parity",
      category: "Product parity",
      type: "parity",
      status: "in_progress",
      reason: "Repeated loss theme with visible recoverability if protected well."
    },
    {
      id: "bnpl-baseline",
      quarter: "Q1",
      title: "BNPL / Credit Line baseline parity",
      category: "Product parity",
      type: "parity",
      status: "not_started",
      reason: "Important baseline retail credibility bet that cannot stay vague."
    },
    {
      id: "compliance-firewall",
      quarter: "Q2",
      title: "Compliance firewall items",
      category: "Compliance",
      type: "compliance",
      status: "at_risk",
      reason: "Commercially mandatory but easy to under-protect if treated as technical work."
    },
    {
      id: "stability-referenceability",
      quarter: "Q2",
      title: "Stability and referenceability",
      category: "Execution quality",
      type: "stability",
      status: "in_progress",
      reason: "Revenue protection layer that makes roadmap progress commercially believable."
    },
    {
      id: "capital-markets",
      quarter: "Q3",
      title: "Capital markets readiness",
      category: "New market",
      type: "market_entry",
      status: "at_risk",
      reason: "High-upside bet gated by specialist dependency clarity."
    },
    {
      id: "islamic-finance",
      quarter: "Q3",
      title: "Islamic finance / GCC readiness",
      category: "New market",
      type: "market_entry",
      status: "at_risk",
      reason: "High-upside bet that needs both product and certification readiness."
    },
    {
      id: "ecosystem-leverage",
      quarter: "Q4",
      title: "Ecosystem and monetization leverage",
      category: "Ecosystem",
      type: "ecosystem",
      status: "not_started",
      reason: "Later-year monetization layer that should not crowd out higher-certainty early bets."
    }
  ],
  deepDives: [
    {
      id: "gold",
      title: "Gold",
      parity: "20%",
      opportunity: "High-value recovery category with strong business visibility.",
      watchout: "Needs end-to-end parity and enforcement/recovery credibility, not partial depth.",
      linkedRoadmapIds: ["gold-parity", "stability-referenceability"]
    },
    {
      id: "las-lamf",
      title: "LAS / LAMF",
      parity: "53%",
      opportunity: "High-recoverability category if focus and depth are protected.",
      watchout: "Can get crowded out by broader ecosystem complexity.",
      linkedRoadmapIds: ["las-lamf"]
    },
    {
      id: "bnpl",
      title: "BNPL / Credit Line",
      parity: "71%",
      opportunity: "Important credibility baseline for modern retail and credit-line discussions.",
      watchout: "Needs clear definition of minimum parity, not broad aspirational scope.",
      linkedRoadmapIds: ["bnpl-baseline"]
    },
    {
      id: "capital-markets",
      title: "Capital Markets",
      parity: "Strategic bet",
      opportunity: "Non-linear upside and stronger business narrative if readiness is real.",
      watchout: "Unsafe to over-promise without specialist support.",
      linkedRoadmapIds: ["capital-markets"]
    },
    {
      id: "islamic",
      title: "Islamic Finance / GCC",
      parity: "Strategic bet",
      opportunity: "High-upside new-market entry with differentiated positioning.",
      watchout: "Needs product plus certification/advisory readiness before confident selling.",
      linkedRoadmapIds: ["islamic-finance"]
    }
  ],
  aopPanels: [
    { title: "Roadmap scale",        value: "5,551 PD",                        note: "42 EPICs across 4 quarters. Concentration and protection discipline matter more than total." },
    { title: "AI capacity recovery", value: "1,100-1,400 PD",                  note: "Equivalent to 5-6 additional engineers through scaffolding reduction and AI-assisted testing." },
    { title: "Commercial rule",      value: "Protect the few bets that matter", note: "The AOP works only if protected bets are not diluted by adjacent complexity." },
  ],
  riskHiring: [
    { title: "Compliance under-protection",    severity: "critical", note: "If treated as technical polish instead of a commercial gate, enterprise readiness collapses." },
    { title: "Capital markets specialist gap", severity: "high",     note: "Roadmap credibility weakens if specialist support remains assumed rather than secured." },
    { title: "Islamic finance readiness gap",  severity: "high",     note: "Product ambition can outrun certification/advisory readiness." },
    { title: "Referenceability under-owned",   severity: "medium",   note: "Roadmap progress may fail to convert commercially if proof and reference assets stay weak." },
  ],
};
