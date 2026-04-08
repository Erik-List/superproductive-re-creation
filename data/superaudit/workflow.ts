import type { Workflow } from "../types"

// ============================================================
// SUPERAUDIT AI-FIRST APPLE FY25 INTEGRATED AUDIT
// First-year engagement (takeover from EY)
// Fiscal year ended September 27, 2025
// ============================================================
//
// Apple FY25 profile:
//   Revenue: $416B | Pre-tax income: ~$130B | Total assets: ~$350B
//   Segments: Products (iPhone, Mac, iPad, Wearables) + Services
//   Geographic: Americas, Europe, Greater China, Japan, Rest of Asia Pacific
//   Retail: ~535 stores across 26 countries (272 in US)
//   Entities: 100+ legal entities (Exhibit 21 lists ~19 significant)
//   Employees: ~166,000
//   No owned manufacturing (contract mfg via Foxconn, Pegatron)
//   No defined benefit pension (DC plans only)
//
// Design principles:
//   1. AI proposes, humans decide — every significant judgment needs human approval
//   2. Same PCAOB testing standards, faster execution (not a new evidence model)
//   3. Predecessor workpapers are a bonus, not a dependency (AS 2610 comms required,
//      but engagement proceeds with public data + client data if workpapers never arrive)
//   4. Progressive client data access — Year 1 uses client extracts, not direct API
//   5. Full scope including component audits across 40+ jurisdictions
//
// Corporate structure:
//   US parent + wholly owned subs (Ireland, UK, Germany, Australia, Singapore)
//   + licensed affiliates (China, India, Japan — local practitioner ownership required)
//   All staff use the same AI platform. Uniform rates across entities.
//
// Component coordination fully integrated into Scoping and Control Audit
// streams (matching EY's structure). No standalone component stream.
//
// Timeline: 23 weeks (early July → early December 2025)
//   Weeks 0–2:   Pre-client (public data only)
//   Weeks 2–13:  Pre-close (client data arriving progressively)
//   Weeks 13–23: Post-close (books closed Sept 27; 30-40 days to opinion)
//
// Human team (~44 people across all entities):
//   US HQ (21): 2 EPs, EQR, 2 Engagement Mgrs, 3 AI Engineers, 4 Walkthrough Specialists,
//     5 Senior Auditors, Tax Specialist, Valuation Specialist, IT Audit Specialist,
//     Documentation Lead
//   Component entities (23): 8 Component Partners (1 per jurisdiction) + 15 Component
//     Seniors (~2 per jurisdiction across Ireland, UK, Germany, Australia, Singapore,
//     China, Japan, India)
//

export const workflow: Workflow = {
  id: "superaudit_apple_fy25_audit",
  name: "Superaudit Apple FY25 Integrated Audit (fictional)",
  description:
    "Superaudit is a fictional AI-native audit firm. AI-first integrated audit of Apple Inc. FY ended September 27, 2025. First-year engagement (takeover from EY). Two opinions (FS + ICFR). ~4,143 human hours, ~44 humans across US HQ + 5 owned subs + 3 licensed affiliates, 23 weeks elapsed. Component coordination fully integrated into Scoping and Control Audit streams (no standalone component stream). Elapsed time driven by external bottlenecks (predecessor, client data, books closing), not labor.",
  agents: {
    human: {
      team: {
        "Engagement Partner": 2,
        "EQR Partner": 1,
        "Engagement Manager": 2,
        "AI Engineer": 3,
        "Walkthrough Specialist": 4,
        "Senior Auditor": 5,
        "Tax Specialist": 1,
        "Valuation Specialist": 1,
        "IT Audit Specialist": 1,
        "Component Partner": 8,
        "Component Senior": 15,
        "Documentation Lead": 1,
      }
    }
  },
  sub_workflows: [

    // ================================================================
    // STREAM 1: ENGAGEMENT SETUP & PREDECESSOR TRANSITION
    // ================================================================
    // Handles the first-year takeover. Designed so nothing downstream
    // DEPENDS on predecessor workpapers arriving.
    {
      id: "engagement_setup",
      name: "Predecessor Transition",
      description:
        "First-year takeover logistics: predecessor communication (AS 2610), independence across ~44 people and 8+ entities, client data requests, system inventory, opening balance procedures. Predecessor workpapers are NOT a gate — downstream streams proceed regardless.",
      timing: { start: 0, end: 4 },
      outputs: ["EngagementLetter", "IndependenceConfirmation", "ClientDataRequest", "SystemInventory", "OpeningBalancePlan", "PredecessorCommunicationMemo"],
      agents: {},
      sub_workflows: [
        {
          id: "predecessor_communication",
          name: "Predecessor Communication",
          description:
            "Partner-to-partner call with EY engagement partner per AS 2610. Inquire about client integrity, disagreements with management, reasons for auditor change. Document conclusions.",
          timing: { start: 0, end: 1 },
          outputs: ["PredecessorCommunicationMemo"],
          requirement_ids: ["predecessor_communication"],
          agents: {
            human: {
              team: {
                "Engagement Partner": { count: 1, allocation: 0.2 },
              }
            }
          },
        },
        {
          id: "predecessor_workpaper_request",
          name: "Predecessor Workpaper Request",
          description:
            "Reasoning-tier model, workpaper_read access. Ingests PredecessorCommunicationMemo + PCAOB standards (AS 2610, AS 2510). Generates comprehensive workpaper request list covering all Apple-specific areas: revenue recognition (ASC 606 bundles), transfer pricing (Ireland structure, €13B EU state aid), 535 retail stores, App Store/services. Outputs structured PredecessorRequestTracker JSON with priority-ranked items. Partner customizes and sends to EY — expect 4-8 week response time. NOT a gate: nothing downstream depends on receiving these. 4h human (partner review + customization).",
          timing: { start: 0, end: 2 },
          inputs: ["PredecessorCommunicationMemo"],
          outputs: ["PredecessorRequestTracker"],
          agents: {
            human: {
              team: {
                "Engagement Partner": { count: 1, allocation: 0.05 },
              }
            },
            ai: { cost_usd: 20 }
          },
        },
        {
          id: "engagement_letter_and_independence",
          name: "Engagement Letter & Independence",
          description:
            "Independence confirmation across ~44 people in 8+ entities plus 3 affiliate firms. Group engagement letter + local engagement letters per sub/affiliate. Each entity needs its own independence check against Apple's full relationship network. SOX 202 non-audit service inventory. PCAOB registration verification for all jurisdictions.",
          timing: { start: 0, end: 1 },
          outputs: ["EngagementLetter", "IndependenceConfirmation"],
          requirement_ids: ["non_audit_service_preapproval"],
          agents: {
            human: {
              team: {
                "Engagement Manager": { count: 1, allocation: 0.3 },
                "Senior Auditor": { count: 1, allocation: 0.3 },
              }
            }
          },
        },
        {
          id: "client_data_request",
          name: "Client Data Request",
          description:
            "Reasoning-tier model, public_data access via edgar_api + xbrl_parser. Parses Apple's 10-K structure to generate tailored PBC request. Excludes factory inventory (contract mfg via Foxconn), includes: retail store list (535 stores × 26 countries), App Store/services revenue breakdowns, entity structure across 40+ jurisdictions, SAP trial balance extract specifications. Outputs structured ClientDataRequest JSON with Phase 1 (available now) and Phase 2 (post-close) items. Manager reviews (2h), partner approves (2h).",
          timing: { start: 0, end: 1 },
          inputs: ["PublicFilings"],
          outputs: ["ClientDataRequest"],
          agents: {
            human: {
              team: {
                "Engagement Manager": { count: 1, allocation: 0.05 },
                "Engagement Partner": { count: 1, allocation: 0.05 },
              }
            },
            ai: { cost_usd: 40 }
          },
        },
        {
          id: "system_inventory",
          name: "System Inventory",
          description:
            "Coding-tier model, client_data_read access via document_parser. Parses Apple IT disclosures + client-provided system documentation. Catalogs each system: name, vendor, business processes, data flows, interfaces, owning entity. Expected inventory: SAP S/4HANA (financials), retail POS (535 stores), App Store/iTunes Connect (digital revenue), iCloud services, treasury/hedging, supply chain (Foxconn integration), HR/payroll (166K employees). Categorizes by audit relevance: ITGC-in-scope, data-extraction-in-scope, or out-of-scope. Outputs structured SystemInventory JSON. Gates ITGC scoping. Manager reviews (2h), partner approves (2h).",
          timing: { start: 1, end: 3 },
          inputs: ["ClientDataRequest"],
          outputs: ["SystemInventory"],
          agents: {
            human: {
              team: {
                "IT Audit Specialist": { count: 1, allocation: 0.05 },
                "Engagement Manager": { count: 1, allocation: 0.025 },
                "Engagement Partner": { count: 1, allocation: 0.025 },
              }
            },
            ai: { cost_usd: 30 }
          },
        },
        {
          id: "opening_balance_procedures",
          name: "Opening Balance Procedures",
          description:
            "Reasoning-tier model, public_data + client_data_read access via edgar_api + gl_reader + analytics_engine. Compares FY24 10-K balances against Q1 FY25 10-Q for consistency per AS 2101. Analyzes GL opening balances against prior year audited figures. Identifies accounts requiring additional first-year procedures: significant estimates (deferred revenue, legal contingencies, tax UTPs), areas with accounting policy changes, accounts where predecessor access would materially improve evidence. Designed to produce valid output WITHOUT predecessor workpapers. Outputs structured OpeningBalancePlan JSON with per-account procedure requirements. Senior auditor reviews (8h), manager validates (4h).",
          timing: { start: 2, end: 4 },
          inputs: ["PublicFilings", "FinancialData"],
          outputs: ["OpeningBalancePlan"],
          requirement_ids: ["substantive_procedures"],
          agents: {
            human: {
              team: {
                "Senior Auditor": { count: 1, allocation: 0.1 },
                "Engagement Manager": { count: 1, allocation: 0.05 },
              }
            },
            ai: { cost_usd: 100 }
          },
        },
      ],
    },

    // ================================================================
    // STREAM 2: SCOPING & RISK ASSESSMENT
    // ================================================================
    // Progressive three-pass design. Each pass refines with more data.
    // Partner locks after fraud brainstorming + final review.
    {
      id: "scoping",
      name: "Scoping & Risk Assessment",
      description:
        "Progressive three-pass scoping: public data → client data → predecessor calibration. AI executes analysis; humans make all judgment calls. Fraud brainstorming is a mandatory team event (AS 2110.49-.53) including key component partners. Partner locks scoping before downstream streams execute.",
      timing: { start: 0, end: 9 },
      outputs: ["ReviewedScopingOutput", "TestingPlan", "ComponentAuditInstructions", "ComponentScope"],
      requirement_ids: [
        "risk_assessment_procedures", "fraud_risk_assessment",
        "revenue_recognition_fraud_presumption", "materiality_establishment",
        "significant_account_identification", "audit_strategy", "risk_to_procedure_linkage",
        "component_auditor_supervision",
      ],
      agents: {},
      sub_workflows: [
        {
          id: "public_data_scoping",
          name: "Public Data Scoping",
          description:
            "Reasoning-tier model, public_data access only via edgar_api + xbrl_parser + analytics_engine. Ingests 10-K, 10-Qs, 8-Ks, proxy, Exhibit 21, peer financials (SIC 3571 peers via XBRL Frames API). Establishes preliminary materiality (~0.75% of $416B revenue = ~$3B overall, ~$2.25B performance). Identifies 8-12 high-risk areas from 10-K risk factors, MD&A, and industry context. Scopes ~25 significant subsidiaries from Exhibit 21 (covers 20-40% of 100+ entities). Classifies fraud risks per AS 2110.68 (revenue recognition presumed). Outputs structured ScopingOutput JSON. Flags areas requiring client data for Phase 2 refinement. ~15 min, ~$60.",
          timing: { start: 0, end: 0.5 },
          inputs: ["PublicFilings", "IndustryContext"],
          outputs: ["PreliminaryScopingOutput"],
          requirement_ids: ["risk_assessment_procedures", "materiality_establishment", "significant_account_identification", "audit_strategy"],
          agents: { ai: { cost_usd: 60 } },
        },
        {
          id: "client_data_scoping",
          name: "Client Data Scoping",
          description:
            "Reasoning-tier model, client_data_read access via gl_reader + analytics_engine + document_parser. Integrates Phase 1 output with: trial balance from SAP extract (real balances replace public estimates), complete entity list (100+ entities with revenue/asset contribution percentages), board minutes (parsed for management concerns, tone at top), segment detail (Products vs. Services, 5 geographic segments). Recalculates materiality from GL balances. Builds complete significant account matrix with risk-to-assertion mapping. Determines component scope type per entity (full/specified/analytical/none) based on contribution thresholds. Outputs structured ScopingOutput JSON replacing Phase 1 preliminary. ~30 min, ~$160.",
          timing: { start: 2, end: 4 },
          inputs: ["PreliminaryScopingOutput", "FinancialData", "EntityStructure", "GovernanceDocuments"],
          outputs: ["ScopingOutput"],
          requirement_ids: ["risk_assessment_procedures", "materiality_establishment", "significant_account_identification", "risk_to_procedure_linkage"],
          agents: { ai: { cost_usd: 160 } },
        },
        {
          id: "component_scoping",
          name: "Component Scoping",
          description:
            "Reasoning-tier model, public_data + client_data_read access via edgar_api + analytics_engine + structured_output. Analyzes Exhibit 21 + full entity structure. Maps revenue/assets by jurisdiction to determine contribution percentages. Proposes scope type per component based on quantitative thresholds and qualitative risk factors. Expected: ~8 full-scope (Ireland, China, UK, Japan, Australia, Germany, India, Singapore), ~15 specified procedures (smaller subs with specific risks), ~20+ analytical only (immaterial entities). Outputs structured ComponentScope JSON per entity. Partner approves (12h), manager coordinates (8h).",
          timing: { start: 2, end: 4 },
          inputs: ["PreliminaryScopingOutput", "EntityStructure"],
          outputs: ["ComponentScope"],
          requirement_ids: ["component_auditor_supervision"],
          agents: {
            human: {
              team: {
                "Engagement Partner": { count: 1, allocation: 0.15 },
                "Engagement Manager": { count: 1, allocation: 0.1 },
              }
            },
            ai: { cost_usd: 60 }
          },
        },
        {
          id: "predecessor_calibration",
          name: "Predecessor Calibration",
          description:
            "Reasoning-tier model, workpaper_read + client_data_read access via document_parser + analytics_engine. IF EY workpapers received: parses predecessor risk assessment, materiality, significant accounts, control findings; generates structured diff against Superaudit Phase 2 output; flags where assessments diverge (new risks identified, risks EY had that Superaudit doesn't, materiality differences). IF NOT received: compares Phase 2 output against public-data-derived expectations and industry benchmarks for reasonableness. Outputs structured CalibratedScopingOutput JSON with delta annotations. Engagement proceeds regardless. Partner reviews delta analysis (4h).",
          timing: { start: 4, end: 6 },
          inputs: ["ScopingOutput", "PriorYearFile"],
          outputs: ["CalibratedScopingOutput"],
          agents: {
            human: {
              team: {
                "Engagement Partner": { count: 1, allocation: 0.05 },
              }
            },
            ai: { cost_usd: 80 }
          },
        },
        {
          id: "fraud_brainstorming",
          name: "Fraud Brainstorming",
          description:
            "AS 2110.49-.53: mandatory team discussion. Includes key component partners (at minimum Ireland partner). 2h session × 7 people (EP, EQR, Engagement Mgr, 2 senior auditors, Ireland component partner, tax specialist). AI prepares briefing package. Conclusions: revenue recognition presumed, management override always presumed, additional identified risks.",
          timing: { start: 5, end: 6 },
          inputs: ["CalibratedScopingOutput"],
          outputs: ["FraudBrainstormingMemo", "FraudRiskSummary"],
          requirement_ids: ["fraud_risk_assessment", "revenue_recognition_fraud_presumption"],
          agents: {
            human: {
              team: {
                "Engagement Partner": { count: 1, allocation: 0.05 },
                "EQR Partner": { count: 1, allocation: 0.05 },
                "Engagement Manager": { count: 1, allocation: 0.05 },
                "Senior Auditor": { count: 2, allocation: 0.05 },
                "Component Partner": { count: 1, allocation: 0.05 },
                "Tax Specialist": { count: 1, allocation: 0.05 },
              }
            }
          },
        },
        {
          id: "partner_scoping_lock",
          name: "Partner Scoping Lock",
          description:
            "THE quality gate. Partner reviews complete scoping package: materiality, risk matrix, significant accounts, component scope, testing plan, fraud risks. 3-6h EP review + 1-2h senior manager validation. Once locked, downstream streams execute.",
          timing: { start: 6, end: 7 },
          inputs: ["CalibratedScopingOutput", "FraudBrainstormingMemo"],
          outputs: ["ReviewedScopingOutput"],
          requirement_ids: ["risk_assessment_procedures", "audit_strategy"],
          agents: {
            human: {
              team: {
                "Engagement Partner": { count: 1, allocation: 0.15 },
                "Engagement Manager": { count: 1, allocation: 0.05 },
              }
            }
          },
        },
        {
          id: "testing_plan_generation",
          name: "Testing Plan & Component Instructions",
          description:
            "Reasoning-tier model, client_data_read + workpaper_write access via structured_output + workpaper_generator + template_renderer. Consumes locked ReviewedScopingOutput + ComponentScope. Generates: (1) risk-to-procedure linkage matrix per AS 2301.08 — every significant account/assertion mapped to specific test procedures; (2) control testing plan — which controls to test per significant account, sample sizes per AS 2201 frequency guidance; (3) substantive testing plan — procedures per account with nature/timing/extent; (4) AS 1205 compliant written instructions per component — materiality allocation from group materiality, significant risks specific to each jurisdiction, required procedures with nature/timing/extent, reporting templates, deadlines, communication protocols. More detailed instructions for affiliates (China, India, Japan) where supervision requirements are higher per AS 1205. Apple-specific: no inventory observation (contract mfg), retail store sampling plan (30 of 535 stores for walkthroughs), App Store revenue testing approach (full-population timing tests), transfer pricing procedures, Ireland transfer pricing emphasis, China related-party emphasis, Japan revenue cut-off emphasis. Outputs structured TestingPlan + ComponentAuditInstructions JSON. Partner approves group test plan (6h) and reviews full-scope component instructions (20h), manager reviews test plan (12h) and specified procedure instructions (20h).",
          timing: { start: 7, end: 9 },
          inputs: ["ReviewedScopingOutput", "ComponentScope"],
          outputs: ["TestingPlan", "ComponentAuditInstructions"],
          requirement_ids: ["risk_to_procedure_linkage", "component_auditor_supervision"],
          agents: {
            human: {
              team: {
                "Engagement Partner": { count: 1, allocation: 0.325 },
                "Engagement Manager": { count: 1, allocation: 0.4 },
              }
            },
            ai: { cost_usd: 280 }
          },
        },
      ],
    },

    // ================================================================
    // STREAM 3: CONTROL AUDIT
    // ================================================================
    // Largest stream. EY: 70,000h → Superaudit: ~1,985h.
    // Includes ~270h component control testing, component monitoring
    // supervision, and component findings evaluation (dissolved from
    // former standalone component coordination stream).
    {
      id: "control_audit",
      name: "Control Audit",
      description:
        "Per-control testing pipeline across ALL entities (central + component). Includes ~270h component control testing. Full-population AI testing for software controls. Same PCAOB standards as Big 4, executed faster. EY baseline: 70,000h.",
      timing: { start: 4, end: 19 },
      inputs: ["ReviewedScopingOutput", "SystemInventory", "ControlDocumentation"],
      outputs: ["ControlAuditOutput", "DeficiencyConclusions", "ComponentResults"],
      requirement_ids: [
        "control_identification_and_testing", "entity_level_controls",
        "walkthrough_per_process", "design_effectiveness", "operating_effectiveness",
        "period_end_controls", "deficiency_severity_evaluation", "material_weakness_adverse_opinion",
        "component_auditor_supervision", "component_findings_evaluation",
      ],
      agents: {},
      sub_workflows: [
        {
          id: "control_identification",
          name: "Control Identification",
          description:
            "Reasoning-tier model, client_data_read access via document_parser. Parses Apple's SOX narratives, process flowcharts, and control documentation across central and component entities. Identifies 150-300 controls, selects 80-120 key controls based on risk assessment linkage. Classifies each: ~35% software (automated three-way match, system calculations), ~45% human-software-assisted (manual review of system report), ~20% fully manual (physical counts, approvals). Apple-specific controls: retail POS revenue recognition, App Store transaction timing, services revenue allocation (ASC 606 bundles), treasury hedge effectiveness, intercompany elimination. Outputs structured ControlMatrix JSON with control-to-risk-to-account linkage. Manager reviews matrix (24h), partner approves (16h).",
          timing: { start: 4, end: 6 },
          inputs: ["ScopingOutput", "ControlDocumentation"],
          outputs: ["ControlMatrix"],
          requirement_ids: ["control_identification_and_testing"],
          agents: {
            human: {
              team: {
                "Engagement Manager": { count: 1, allocation: 0.3 },
                "Engagement Partner": { count: 1, allocation: 0.2 },
                "Senior Auditor": { count: 1, allocation: 0.1 },
              }
            },
            ai: { cost_usd: 400 }
          },
        },
        {
          id: "entity_level_controls",
          name: "Entity-Level Controls",
          description:
            "Reasoning-tier model, client_data_read access via document_parser + analytics_engine. Evaluates Apple's COSO framework across five components: control environment (code of conduct, whistleblower, board composition), risk assessment (ERM process, management risk identification), information/communication (IT governance, internal reporting), monitoring (internal audit function, self-assessment), control activities (authorization policies, segregation). Sources: board minutes, audit committee materials, code of conduct, internal audit charter, org charts. Outputs structured EntityLevelControlConclusion JSON with per-component assessment and identified deficiencies. Partner evaluates governance and conducts management interviews (12h), manager coordinates and documents (8h).",
          timing: { start: 5, end: 7 },
          inputs: ["ControlMatrix", "GovernanceDocuments"],
          outputs: ["EntityLevelControlConclusion"],
          requirement_ids: ["entity_level_controls"],
          agents: {
            human: {
              team: {
                "Engagement Partner": { count: 1, allocation: 0.15 },
                "Engagement Manager": { count: 1, allocation: 0.1 },
              }
            },
            ai: { cost_usd: 60 }
          },
        },
        {
          id: "itgc_testing",
          name: "IT General Controls Testing",
          description:
            "Fast-tier model for population testing + coding-tier for config analysis. Client_system_read access via system_config_reader + population_tester + gl_reader. Tests 30-60 systems across central and component entities. Per system: (1) access management — pulls full user access list, tests segregation of duties against role matrix, identifies privileged access, tests provisioning/deprovisioning against HR records; (2) change management — pulls change logs, matches to approved change tickets, identifies emergency changes, tests migration controls; (3) operations — pulls job schedules, tests backup/recovery, reviews incident logs. Full-population testing for all automated checks. Outputs structured ITGCResults JSON per system. Human: IT audit specialist conducts personnel interviews and evaluates results (100h). Walkthrough specialists perform system configuration reviews, ITGC walkthroughs, and component ITGC oversight (200h). ITGC gate: ineffective ITGCs trigger substantive-only fallback for affected controls.",
          timing: { start: 5, end: 10 },
          inputs: ["SystemInventory", "ControlMatrix"],
          outputs: ["ITGCResults"],
          requirement_ids: ["operating_effectiveness"],
          agents: {
            human: {
              team: {
                "IT Audit Specialist": { count: 1, allocation: 0.5 },
                "Walkthrough Specialist": { count: 2, allocation: 0.5 },
              }
            },
            ai: { cost_usd: 600 }
          },
        },
        {
          id: "walkthroughs",
          name: "Walkthroughs",
          description:
            "Multimodal-tier model for document/flowchart analysis + fast-tier for transaction tracing. Client_data_read + client_system_read access via document_parser + gl_reader + system_config_reader. AS 2201.34: at least one walkthrough per significant process across ALL entities. 15-25 significant processes. For software-dominant processes: traces actual transactions through system logs end-to-end (e.g., App Store purchase → revenue recognition → GL posting), documents each control point and information flow, ~30-60 min each including AS 1215 documentation. For physical processes: prepares walkthrough guides and expected observations; humans execute on-site. Includes component monitoring: AI scans component walkthrough documentation for completeness against required control points and processes, EM reviews flagged gaps. Outputs structured WalkthroughResults JSON per process with control points, information flows, and design effectiveness conclusions. Physical: 30 US retail store visits × 4h = 120h + component location walkthroughs. 280h central + 60h component + 3h component monitoring = 343h total.",
          timing: { start: 7, end: 11 },
          inputs: ["ControlMatrix", "ControlDocumentation"],
          outputs: ["WalkthroughResults"],
          requirement_ids: ["walkthrough_per_process", "design_effectiveness"],
          agents: {
            human: {
              team: {
                "Walkthrough Specialist": { count: 3, allocation: 0.55 },
                "Component Senior": { count: 3, allocation: 0.1 },
                "Senior Auditor": { count: 1, allocation: 0.1 },
                "Component Partner": { count: 1, allocation: 0.075 },
                "Engagement Manager": { count: 1, allocation: 0.02 },
              }
            },
            ai: { cost_usd: 310 }
          },
        },
        {
          id: "operating_effectiveness_testing",
          name: "Operating Effectiveness Testing",
          description:
            "Fast-tier model, client_system_read access via population_tester + sample_selector + gl_reader + system_config_reader. Per key control (80-120 across all entities): Software controls (30-40): full-population testing — examines every instance the control operated (e.g., all ~500K three-way matches in AP), compares each against expected behavior, flags exceptions with root cause, human reviews exception summaries (2-4h/control, ~100h total). Human-software-assisted controls (40-50): tests completeness/accuracy of system reports against source data (full population), then human inspects samples of review evidence per AS 2201 frequency (4-6h/control, ~300h). Manual controls (15-25): selects statistical samples per frequency (daily: 25-40, weekly: 5-15, monthly: 2-4), humans inspect evidence (8-12h/control, ~300h). Includes component monitoring: AI auto-scans component control workpapers for completeness and consistency against instructions, EM coordinates status calls and reviews exceptions. Outputs structured OperatingEffectivenessResult JSON per control with population size, items tested, exceptions, conclusion. 754h central + 160h component testing = 914h total.",
          timing: { start: 10, end: 15 },
          inputs: ["ControlMatrix", "WalkthroughResults", "ITGCResults", "ControlPopulationData"],
          outputs: ["OperatingEffectivenessResults"],
          requirement_ids: ["operating_effectiveness"],
          agents: {
            human: {
              team: {
                "Senior Auditor": { count: 4, allocation: 0.625 },
                "Walkthrough Specialist": { count: 3, allocation: 0.3 },
                "Component Senior": { count: 4, allocation: 0.2 },
                "Engagement Manager": { count: 1, allocation: 0.35 },
                "AI Engineer": { count: 1, allocation: 0.02 },
              }
            },
            ai: { cost_usd: 1015 }
          },
        },
        {
          id: "period_end_controls",
          name: "Period-End Controls",
          description:
            "Fast-tier model, client_system_read access via population_tester + gl_reader. Roll-forward from interim testing to September 27 year-end across all entities. Software controls: re-runs full-population tests for Q4 activity through year-end date — same tests as interim but for the untested period. Human-software-assisted and manual: re-tests sample of Q4 instances. Financial close walkthrough: traces September 27 close process through consolidation. Includes light component monitoring: AI scans period-end component workpapers, EM reviews flagged exceptions. Outputs structured PeriodEndResults JSON confirming continued operating effectiveness or identifying deterioration. 156h central + 16h component testing = 172h total.",
          timing: { start: 14, end: 18 },
          inputs: ["OperatingEffectivenessResults"],
          outputs: ["PeriodEndResults"],
          requirement_ids: ["period_end_controls"],
          agents: {
            human: {
              team: {
                "Senior Auditor": { count: 2, allocation: 0.35 },
                "Walkthrough Specialist": { count: 1, allocation: 0.2 },
                "Component Senior": { count: 1, allocation: 0.1 },
                "Engagement Manager": { count: 1, allocation: 0.075 },
              }
            },
            ai: { cost_usd: 405 }
          },
        },
        {
          id: "deficiency_evaluation",
          name: "Deficiency Evaluation",
          description:
            "Reasoning-tier model, workpaper_read + workpaper_write access via analytics_engine + structured_output + workpaper_generator. Aggregates all control test results from ALL entities and locations, including component findings. For each control with exceptions: classifies deficiency severity per AS 2201.62-70 framework (material weakness / significant deficiency / deficiency). Evaluates combinations: groups individually minor deficiencies affecting the same account/assertion, assesses whether combination elevates severity. Identifies compensating controls that mitigate identified deficiencies. Aggregates component findings: translates component-level misstatements to group materiality (currency conversion, contribution percentages), evaluates whether component deficiencies individually or in aggregate affect the group ICFR opinion, identifies component issues requiring group-level adjustments. Generates proposed severity classifications with detailed rationale — all proposals, partner makes final determination. Outputs structured ControlAuditOutput + DeficiencyConclusions + ComponentResults JSON. Partner evaluates severity classifications, compensating controls, and determines ICFR conclusion (70h). Manager coordinates analysis and reviews component findings (44h). Senior auditors compile deficiency evidence (40h). Component partners oversee local evaluations (24h). Component senior aggregates local findings (10h). 154h central + 34h component = 188h total.",
          timing: { start: 17, end: 19 },
          inputs: ["OperatingEffectivenessResults", "PeriodEndResults", "ComponentWorkpapers"],
          outputs: ["ControlAuditOutput", "DeficiencyConclusions", "ComponentResults"],
          requirement_ids: ["deficiency_severity_evaluation", "material_weakness_adverse_opinion", "component_findings_evaluation"],
          agents: {
            human: {
              team: {
                "Engagement Partner": { count: 1, allocation: 0.875 },
                "Engagement Manager": { count: 1, allocation: 0.55 },
                "Senior Auditor": { count: 2, allocation: 0.25 },
                "Component Partner": { count: 3, allocation: 0.1 },
                "Component Senior": { count: 1, allocation: 0.125 },
              }
            },
            ai: { cost_usd: 160 }
          },
        },
      ],
    },

    // ================================================================
    // STREAM 4: SUBSTANTIVE TESTING
    // ================================================================
    // EY: 75,200h → Superaudit: ~1,424h.
    // Includes ~594h component substantive testing.
    {
      id: "substantive_testing",
      name: "Substantive Testing",
      description:
        "Account balance testing across ALL entities (central + component). Includes ~594h component substantive work. AI tests full population of journal entries and revenue transactions. No inventory observation at Apple-owned factories (contract mfg). EY baseline: 75,200h.",
      timing: { start: 8, end: 19 },
      inputs: ["ReviewedScopingOutput", "ControlAuditOutput", "FinancialData"],
      outputs: ["FinalSubstantiveResults", "AdjustmentsSummary"],
      requirement_ids: [
        "substantive_procedures", "receivables_confirmation", "subsequent_events",
        "misstatement_accumulation", "journal_entry_fraud_testing", "management_override_evaluation",
      ],
      agents: {},
      sub_workflows: [
        {
          id: "interim_substantive",
          name: "Interim Substantive Testing",
          description:
            "Fast-tier model, client_data_read + client_system_read + external_confirmation access via population_tester + gl_reader + analytics_engine + confirmation_manager. Journal entry testing (AS 2401.61-.67): analyzes 100% of journal entries across all entities — flags entries with fraud indicators (round amounts, post-close entries, unusual accounts, entries by senior management, entries without descriptions). Receivable confirmations (AS 2310): generates confirmation requests, tracks responses, tests alternative procedures for non-responses. Cash and investment confirmations: sends bank confirmations, verifies $160B+ marketable securities against custodian statements and pricing services. Debt confirmations: confirms $110B+ commercial paper and term debt balances with counterparties. Share repurchase: tests Q1-Q3 buyback transactions ($90B+/year) against board authorization, verifies ASR derivative terms. Interim analytics: ratio analysis by segment and geography against prior year and budget. Includes component monitoring: AI auto-scans component substantive workpapers across 40+ jurisdictions for completeness and proper materiality application, EM coordinates status calls with full-scope component entities and reviews flagged exceptions — higher supervision intensity for affiliate entities (China, India, Japan). Outputs structured InterimSubstantiveResults JSON. Human: senior auditors review exceptions and management inquiries (160h), manager coordinates and reviews (50h), walkthrough specialist supports retail store observation (30h), AI engineer maintains pipelines (4h). Component seniors perform interim testing (200h), component partners provide oversight (30h). 244h central + 230h component = 474h total.",
          timing: { start: 8, end: 13 },
          inputs: ["ReviewedScopingOutput", "FinancialData", "TestingPlan"],
          outputs: ["InterimSubstantiveResults"],
          requirement_ids: ["substantive_procedures", "receivables_confirmation", "journal_entry_fraud_testing"],
          agents: {
            human: {
              team: {
                "Senior Auditor": { count: 2, allocation: 0.4 },
                "Component Senior": { count: 5, allocation: 0.2 },
                "Engagement Manager": { count: 1, allocation: 0.25 },
                "Walkthrough Specialist": { count: 1, allocation: 0.15 },
                "Component Partner": { count: 2, allocation: 0.075 },
                "AI Engineer": { count: 1, allocation: 0.02 },
              }
            },
            ai: { cost_usd: 820 }
          },
        },
        {
          id: "final_substantive",
          name: "Final Substantive Testing",
          description:
            "Fast-tier model for population testing + reasoning-tier for complex estimates. Client_data_read + client_system_read access via population_tester + gl_reader + analytics_engine + structured_output. Roll-forward to September 27. Revenue: tests 100% of transactions for timing (cut-off), existence, and ASC 606 bundle allocation (App Store, services, hardware bundles). Tests deferred revenue roll-forward. Legal contingencies: analyzes Epic v. Apple, EU DMA compliance, DOJ antitrust — compares disclosures against public case status. Income taxes: ETR analysis, deferred tax rollforward, transfer pricing benchmarking, UTP evaluation ($22B reserve). PP&E: retail store asset verification (535 stores). Cash and investments: roll-forward bank confirmations, verifies $160B+ investment portfolio existence and fair value pricing against custodian records and pricing services. Debt and borrowings: roll-forward $110B+ commercial paper and term debt confirmations, tests terms, interest calculations, and fair value disclosures. Share buyback program: tests ASR derivative settlement and accounting per ASC 815, treasury stock roll-forward, board authorization compliance for $90B+/year repurchase program. Hedging derivatives: tests foreign currency and interest rate hedge designation, effectiveness per ASC 815, and fair value measurements. Operating leases: tests ROU assets and lease liabilities for 535 retail stores, offices, and data centers per ASC 842. Accounts payable: tests ~$54B AP balance against vendor statements and subsequent disbursements. Accrued liabilities: tests warranty reserves, employee compensation accruals, and other accrued expenses. Inventory: alternative existence and valuation procedures for ~$7B finished goods and in-transit inventory (no observation — contract manufacturing model). Subsequent events through opinion date per AS 2801. Includes component monitoring: AI auto-scans year-end component substantive workpapers (224h component work) — intensive review for complex estimates (legal contingencies, transfer pricing, tax UTPs), EM coordinates status calls and reviews exceptions with higher scrutiny for affiliate entities. Outputs structured FinalSubstantiveResults + TestedBalances JSON. 376h central + 224h component = 600h total.",
          timing: { start: 14, end: 18 },
          inputs: ["InterimSubstantiveResults", "OperatingEffectivenessResults", "ITGCResults", "FinancialData"],
          outputs: ["FinalSubstantiveResults", "TestedBalances"],
          requirement_ids: ["substantive_procedures", "subsequent_events"],
          agents: {
            human: {
              team: {
                "Senior Auditor": { count: 3, allocation: 0.4 },
                "Component Senior": { count: 6, allocation: 0.2 },
                "Engagement Manager": { count: 1, allocation: 0.35 },
                "Engagement Partner": { count: 1, allocation: 0.2 },
                "Component Partner": { count: 2, allocation: 0.1 },
                "Walkthrough Specialist": { count: 2, allocation: 0.2 },
                "AI Engineer": { count: 1, allocation: 0.2 },
              }
            },
            ai: { cost_usd: 1025 }
          },
        },
        {
          id: "fraud_procedures",
          name: "Fraud Procedures",
          description:
            "Reasoning-tier model, client_data_read + client_system_read access via population_tester + gl_reader + analytics_engine. Revenue recognition (presumed fraud risk per AS 2110.68): tests 100% of revenue transactions across all entities for existence (shipped/delivered?), timing (correct period?), allocation (ASC 606 bundle split reasonable?). App Store: matches transaction timestamps against revenue recognition dates. Services: tests allocation methodology for bundled subscriptions. Management override (always presumed per AS 2401): tests all journal entries for override indicators, evaluates significant accounting estimates for bias (warranty reserves, legal contingencies, tax UTPs), reviews significant unusual transactions. Outputs structured FraudAssessment JSON with per-risk conclusions. 108h central + 62h component = 170h total.",
          timing: { start: 16, end: 18 },
          inputs: ["InterimSubstantiveResults", "FraudRiskSummary"],
          outputs: ["FraudAssessment"],
          requirement_ids: ["journal_entry_fraud_testing", "management_override_evaluation", "revenue_recognition_fraud_presumption"],
          agents: {
            human: {
              team: {
                "Engagement Partner": { count: 1, allocation: 0.25 },
                "Senior Auditor": { count: 2, allocation: 0.3 },
                "AI Engineer": { count: 1, allocation: 0.3 },
                "Component Senior": { count: 3, allocation: 0.15 },
                "Engagement Manager": { count: 1, allocation: 0.2 },
                "Component Partner": { count: 2, allocation: 0.1625 },
              }
            },
            ai: { cost_usd: 600 }
          },
        },
        {
          id: "misstatement_accumulation",
          name: "Misstatement Accumulation",
          description:
            "Reasoning-tier model, workpaper_read + workpaper_write access via analytics_engine + structured_output + workpaper_generator. Compiles ALL identified misstatements from ALL streams and ALL component locations. Classifies each: factual (definite), judgmental (estimation difference), projected (extrapolated from sample). Evaluates aggregate against materiality ($3B overall, $2.25B performance). Analyzes qualitative factors: do misstatements change a trend? convert a loss to income? affect covenant compliance? involve fraud? Outputs structured MisstatementSummary + AdjustmentsSummary JSON with proposed conclusion (unmodified/qualified). Partner evaluates qualitative factors and makes final aggregate assessment (30h). Manager coordinates management discussions (20h). Senior auditors compile misstatements across streams (40h). AI engineer supports analytics (12h). Component partners oversee local aggregation (30h). Component seniors compile component misstatements (48h). 102h central + 78h component = 180h total.",
          timing: { start: 18, end: 19 },
          inputs: ["FinalSubstantiveResults", "FraudAssessment", "ComponentResults"],
          outputs: ["MisstatementSummary", "AdjustmentsSummary"],
          requirement_ids: ["misstatement_accumulation"],
          agents: {
            human: {
              team: {
                "Engagement Partner": { count: 1, allocation: 0.75 },
                "Engagement Manager": { count: 1, allocation: 0.5 },
                "Senior Auditor": { count: 2, allocation: 0.5 },
                "Component Partner": { count: 3, allocation: 0.25 },
                "Component Senior": { count: 6, allocation: 0.2 },
                "AI Engineer": { count: 1, allocation: 0.3 },
              }
            },
            ai: { cost_usd: 100 }
          },
        },
      ],
    },

    // ================================================================
    // STREAM 5: SPECIALIST WORK
    // ================================================================
    // Includes ~42h component specialist work (local tax oversight,
    // component valuations, retirement benefit verification).
    {
      id: "specialist_work",
      name: "Specialist Work",
      description:
        "Tax (dominant — Apple's transfer pricing across 40+ jurisdictions, €13B EU state aid, ~$22B UTBs), valuation (limited), actuarial (minimal). Includes ~42h component specialist work. EY baseline: 40,000h.",
      timing: { start: 4, end: 18 },
      inputs: ["ReviewedScopingOutput", "FinancialData"],
      outputs: ["SpecialistOutput"],
      requirement_ids: ["specialist_evaluation"],
      agents: {},
      sub_workflows: [
        {
          id: "tax_specialist",
          name: "Tax Specialist Work",
          description:
            "Reasoning-tier model, client_data_read access via gl_reader + analytics_engine + structured_output. Apple's transfer pricing is among the most scrutinized globally. ETR analysis (reconcile effective rate to statutory), deferred tax asset/liability rollforward (verify realizability), transfer pricing benchmarking (arm's length analysis for Ireland structure, €13B EU state aid context), UTP evaluation ($22B uncertain tax positions — assess technical merit per ASC 740-10, likelihood thresholds), GILTI/FDII/BEAT calculations, Pillar Two impact assessment. Component tax: reviews local compliance across 40+ jurisdictions for consistency with group positions. Outputs structured TaxConclusions JSON. Human: specialist review of AI analysis (40h), UTP evaluation requiring judgment (20h), transfer pricing methodology assessment (20h), component tax oversight (20h). 96h central + 4h component = 100h total.",
          timing: { start: 6, end: 18 },
          inputs: ["ReviewedScopingOutput", "FinancialData"],
          outputs: ["TaxConclusions"],
          requirement_ids: ["specialist_evaluation"],
          agents: {
            human: {
              team: {
                "Tax Specialist": { count: 1, allocation: 0.1 },
                "Engagement Partner": { count: 1, allocation: 0.05 },
                "Engagement Manager": { count: 1, allocation: 0.03 },
                "AI Engineer": { count: 1, allocation: 0.02 },
                "Component Partner": { count: 1, allocation: 0.008 },
              }
            },
            ai: { cost_usd: 400 }
          },
        },
        {
          id: "valuation_specialist",
          name: "Valuation Specialist Work",
          description:
            "Reasoning-tier model, client_data_read access via analytics_engine + structured_output. Limited scope for Apple (minimal goodwill from few large acquisitions). Impairment indicators: tests qualitative/quantitative triggers for goodwill and intangible assets. Investment fair values: tests Level 1/2/3 fair value measurements for Apple's $100B+ investment portfolio. Derivative fair values: validates ASR (accelerated share repurchase) derivative valuations and foreign currency/interest rate hedge fair values. Stock compensation: validates Black-Scholes/Monte Carlo inputs against market data (volatility, risk-free rate, expected term). Component valuation: reviews local entity asset valuations. Outputs structured ValuationConclusions JSON. Human: specialist reviews (20h), component oversight (10h). 42h central + 8h component = 50h total.",
          timing: { start: 8, end: 16 },
          inputs: ["ReviewedScopingOutput", "FinancialData"],
          outputs: ["ValuationConclusions"],
          requirement_ids: ["specialist_evaluation"],
          agents: {
            human: {
              team: {
                "Valuation Specialist": { count: 1, allocation: 0.1 },
                "Senior Auditor": { count: 1, allocation: 0.025 },
                "Component Senior": { count: 1, allocation: 0.025 },
                "AI Engineer": { count: 1, allocation: 0.00625 },
              }
            },
            ai: { cost_usd: 160 }
          },
        },
        {
          id: "actuarial_specialist",
          name: "Actuarial Specialist Work",
          description:
            "Fast-tier model, client_data_read access via analytics_engine + structured_output. Minimal scope: Apple has DC plans only (401(k) match + non-US equivalents). No DB pension, no material OPEB. Verifies: DC plan contribution calculations against plan documents, employer match formulas, vesting schedules. Non-US: reviews local retirement obligations in 40+ jurisdictions for proper classification (DC vs. DB) and disclosure. Component: ensures each jurisdiction's retirement obligations properly reported. Outputs structured ActuarialConclusions JSON. Human: specialist reviews (20h), component oversight (30h). 20h central + 30h component = 50h total.",
          timing: { start: 10, end: 16 },
          inputs: ["ReviewedScopingOutput"],
          outputs: ["ActuarialConclusions"],
          requirement_ids: ["specialist_evaluation"],
          agents: {
            human: {
              team: {
                "Senior Auditor": { count: 1, allocation: 0.085 },
                "Component Senior": { count: 2, allocation: 0.05 },
                "Component Partner": { count: 1, allocation: 0.025 },
              }
            },
            ai: { cost_usd: 80 }
          },
        },
      ],
    },

    // ================================================================
    // STREAM 6: REPORTING & OPINION
    // ================================================================
    // 30-40 days post-close to opinion (Year 1).
    // Includes statutory reporting across 8 jurisdictions.
    {
      id: "reporting",
      name: "Reporting & Opinion",
      description:
        "Final analytics, EQR, audit committee communication, dual opinion (FS + ICFR), SEC filing, statutory reporting across 8 jurisdictions, documentation archival. 30-40 days post-close to opinion (Year 1). EQR cannot be AI (AS 1220).",
      timing: { start: 19, end: 23 },
      inputs: ["ControlAuditOutput", "FinalSubstantiveResults", "AdjustmentsSummary", "SpecialistOutput", "ComponentResults"],
      outputs: ["AuditOpinion", "FiledTenK", "ArchivedAuditFile", "StatutoryReports"],
      requirement_ids: [
        "final_analytical_review", "eqr_mandatory", "eqr_independence",
        "audit_committee_communication", "deficiency_written_communication",
        "fs_opinion_format", "integrated_icfr_opinion", "cam_disclosure",
        "tenure_disclosure", "ten_k_filing_deadline",
        "documentation_completion", "documentation_retention",
      ],
      agents: {},
      sub_workflows: [
        {
          id: "final_analytical_review",
          name: "Final Analytical Procedures",
          description:
            "Fast-tier model, workpaper_read access via analytics_engine. Overall analytical review per AS 2810.04. Computes ratios, trends, and variance analysis across: consolidated financials, each segment (Products, Services), each geography (Americas, Europe, Greater China, Japan, Rest of Asia Pacific), and component-level results. Compares against prior year, budget, industry benchmarks, and expectations from scoping. Flags unexpected relationships or significant fluctuations not already explained by audit evidence. Outputs structured AnalyticalReviewOutput JSON. AI-only, ~30 min, ~$60.",
          timing: { start: 19, end: 19.5 },
          inputs: ["FinalSubstantiveResults", "AdjustmentsSummary"],
          outputs: ["AnalyticalReviewOutput"],
          requirement_ids: ["final_analytical_review"],
          agents: { ai: { cost_usd: 60 } },
        },
        {
          id: "eqr",
          name: "Engagement Quality Review",
          description:
            "AS 1220: independent second-partner review. CANNOT be AI. Review all significant judgments across 10 required areas. AI-structured review package highlights judgments, exceptions, conclusions. Apple CAMs: revenue recognition, legal contingencies, income taxes. EQR partner (50h) + supporting team prep (50h). 2-3 days for dual-opinion mega-cap.",
          timing: { start: 19.5, end: 21 },
          inputs: ["ControlAuditOutput", "FinalSubstantiveResults", "AnalyticalReviewOutput", "MisstatementSummary"],
          outputs: ["EQRSignOff"],
          requirement_ids: ["eqr_mandatory", "eqr_independence"],
          agents: {
            human: {
              team: {
                "EQR Partner": { count: 1, allocation: 0.85 },
                "Senior Auditor": { count: 2, allocation: 0.2 },
                "Engagement Manager": { count: 1, allocation: 0.25 },
                "Engagement Partner": { count: 1, allocation: 0.1 },
                "Documentation Lead": { count: 1, allocation: 0.067 },
              }
            }
          },
        },
        {
          id: "audit_committee_communication",
          name: "Audit Committee Communication",
          description:
            "Reasoning-tier model, workpaper_read + workpaper_write access via template_renderer + structured_output + workpaper_generator. Prepares AS 1301 required communications for Apple's Audit and Finance Committee. Drafts: presentation deck summarizing audit results (scope, key findings, misstatements, CAMs), deficiency written communications (any significant deficiencies or material weaknesses per AS 2201.78-84), management letter (process improvement recommendations). Outputs structured AuditCommitteePresentation + supporting documents. Partner prepares and delivers presentation, reviews deficiency letters, finalizes management letter (32h). Manager coordinates document preparation (12h). Senior auditor compiles supporting materials (6h).",
          timing: { start: 21, end: 22 },
          inputs: ["EQRSignOff", "DeficiencyConclusions"],
          outputs: ["AuditCommitteePresentation"],
          requirement_ids: ["audit_committee_communication", "deficiency_written_communication"],
          agents: {
            human: {
              team: {
                "Engagement Partner": { count: 1, allocation: 0.8 },
                "Engagement Manager": { count: 1, allocation: 0.3 },
                "Senior Auditor": { count: 1, allocation: 0.15 },
              }
            },
            ai: { cost_usd: 40 }
          },
        },
        {
          id: "opinion_and_filing",
          name: "Opinion & Filing",
          description:
            "Reasoning-tier model, workpaper_read + workpaper_write access via template_renderer + structured_output + xbrl_parser. Drafts dual opinion: (1) financial statement opinion (unmodified/qualified/adverse/disclaimer), (2) ICFR opinion (unmodified/adverse). Drafts CAM disclosures for Apple (expected: revenue recognition, legal contingencies, income taxes). Includes tenure disclosure, XBRL-tagged audit report. Performs final subsequent events check through opinion date per AS 2801. Outputs structured AuditOpinion JSON + formatted report documents. Partner reviews, signs, and coordinates EDGAR filing (15h). Manager coordinates filing logistics (10h). AI engineer prepares XBRL tags and report formatting (10h). Documentation lead assembles filing package (10h). Senior auditor performs final checks (5h). LAF deadline: 60 days post September 27.",
          timing: { start: 22, end: 22.5 },
          inputs: ["AuditCommitteePresentation"],
          outputs: ["AuditOpinion", "FiledTenK"],
          requirement_ids: ["fs_opinion_format", "integrated_icfr_opinion", "cam_disclosure", "tenure_disclosure", "ten_k_filing_deadline"],
          agents: {
            human: {
              team: {
                "Engagement Partner": { count: 1, allocation: 0.75 },
                "Engagement Manager": { count: 1, allocation: 0.5 },
                "AI Engineer": { count: 1, allocation: 0.5 },
                "Documentation Lead": { count: 1, allocation: 0.5 },
                "Senior Auditor": { count: 1, allocation: 0.25 },
              }
            },
            ai: { cost_usd: 40 }
          },
        },
        {
          id: "statutory_reporting",
          name: "Statutory Reporting",
          description:
            "Reasoning-tier model, workpaper_read + workpaper_write access via template_renderer + structured_output. Drafts local statutory audit reports per jurisdiction-specific format: Ireland (Irish Companies Act 2014 s.336), UK (UK Companies Act 2006 s.495), Germany (HGB §322), Australia (Corporations Act 2001 s.307C), Singapore (Companies Act s.207), China (Chinese Auditing Standards), Japan (Companies Act Art.396), India (Companies Act 2013 s.143). Each report references group audit conclusions translated to local requirements. Outputs formatted statutory report per jurisdiction. Local partner reviews and signs each (~10h avg × 8 jurisdictions = 80h).",
          timing: { start: 20, end: 23 },
          inputs: ["ControlAuditOutput", "FinalSubstantiveResults", "ComponentResults"],
          outputs: ["StatutoryReports"],
          agents: {
            human: {
              team: {
                "Component Partner": { count: 4, allocation: 0.15 },
                "Component Senior": { count: 1, allocation: 0.0667 },
              }
            },
            ai: { cost_usd: 100 }
          },
        },
        {
          id: "documentation_archival",
          name: "Documentation Archival",
          description:
            "Fast-tier model, workpaper_read + workpaper_write access via cross_reference_checker + workpaper_generator. AS 1215 compliance: assembles complete audit file within 14 days of report release. Auto-indexes all workpapers across all streams and all components. Verifies: every requirement_id has linked workpapers, all cross-references resolve, no orphaned documents, review sign-offs complete, component workpapers integrated. Checks retention requirements (7 years per SOX 802). Includes local archival per jurisdiction. Outputs archival completeness report + indexed file structure. Partner review and sign-off (15h), senior auditors compile and clean workpapers (30h), documentation lead assembles and indexes archive (20h), AI engineer validates cross-references (10h), manager and component coordination (15h).",
          timing: { start: 22.5, end: 23 },
          inputs: ["AuditOpinion"],
          outputs: ["ArchivedAuditFile"],
          requirement_ids: ["documentation_completion", "documentation_retention"],
          agents: {
            human: {
              team: {
                "Documentation Lead": { count: 1, allocation: 1.0 },
                "Senior Auditor": { count: 2, allocation: 0.75 },
                "AI Engineer": { count: 1, allocation: 0.5 },
                "Engagement Partner": { count: 1, allocation: 0.75 },
                "Engagement Manager": { count: 1, allocation: 0.375 },
                "Component Senior": { count: 1, allocation: 0.375 },
              }
            },
            ai: { cost_usd: 60 }
          },
        },
      ],
    },
  ],
}
