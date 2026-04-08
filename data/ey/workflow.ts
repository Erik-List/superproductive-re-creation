import type { Workflow } from "../types"

// ============================================================
// APPLE FY25 INTEGRATED AUDIT — EY ENGAGEMENT MODEL
// Fiscal year ended September 27, 2025
// Auditor: Ernst & Young LLP (since 2009, replacing KPMG)
// ============================================================
//
// Apple FY25 profile:
//   Revenue: $416B | Pre-tax income: ~$133B | Total assets: ~$360B
//   Segments: Products (iPhone, Mac, iPad, Wearables) + Services
//   Geographic: Americas, Europe, Greater China, Japan, Rest of Asia Pacific
//   Retail: ~540 stores across 27 countries (272 in US)
//   Entities: 100+ legal entities (Exhibit 21 lists 18 significant subsidiaries)
//   Employees: ~166,000
//   Audit fees (EY): $34.3M (FY25), $30.3M (FY24)
//
// Key differences from generic mega-cap:
//   - No owned manufacturing (contract mfg via Foxconn, Pegatron, etc.)
//   - No inventory observation at Apple-owned factories
//   - No defined benefit pension (DC plans only, minimal OPEB)
//   - 535 retail stores create retail-specific control and testing needs
//   - Complex transfer pricing (Ireland structure, EU state aid, 40+ jurisdictions)
//   - Significant legal contingencies (Epic Games, EU DMA, DOJ antitrust)
//   - Revenue recognition complexity (hardware + services bundles, App Store)
//   - September FY-end (not December)
//

export const workflow: Workflow = {
  id: "ey_apple_fy25_audit",
  name: "Apple FY25 Integrated Audit (EY)",
  description: "Full-scope integrated audit of Apple Inc. FY ended September 27, 2025. Two opinions (FS + ICFR). $416B revenue, ~540 retail stores, 27 countries, contract manufacturing model, complex services revenue.",
  agents: {
    human: {
      team: {
        "Engagement Partner": 2,
        "EQR Partner": 2,
        "Senior Manager": 10,
        "Manager": 35,
        "Senior": 75,
        "Staff": 85,
        "GDS/Offshore": 265,
        "Specialist": 65,
      }
    }
  },
  sub_workflows: [

    // ---- Risk & Scoping ----
    {
      id: "risk_scoping",
      name: "Scoping & Risk Assessment",
      description: "Risk assessment, materiality, significant account identification, and component scoping for Apple. Simpler business model than diversified industrials (two segments: Products + Services) but complex revenue recognition and global retail footprint.",
      agents: {},
      outputs: ["ScopingOutput"],
      requirement_ids: ["risk_assessment_procedures", "fraud_risk_assessment", "revenue_recognition_fraud_presumption", "materiality_establishment", "significant_account_identification", "audit_strategy", "predecessor_communication", "risk_to_procedure_linkage"],
      sub_workflows: [
        {
          id: "risk_assessment",
          name: "Risk Assessment & Audit Strategy",
          description: "Identify and assess risks per AS 2110. Apple-specific high-risk areas: revenue recognition (hardware + services bundles, App Store commission timing), legal contingencies (Epic, EU DMA, DOJ), transfer pricing, stock-based compensation. ~8-12 high-risk areas.",
          inputs: ["PriorYearFile", "PublicFilings", "IndustryContext"],
          outputs: ["RiskAssessment"],
          timing: { start: 0, end: 3 },
          requirement_ids: ["risk_assessment_procedures", "fraud_risk_assessment", "audit_strategy", "risk_to_procedure_linkage"],
          agents: {
            human: {
              team: {
                "Engagement Partner": { count: 1, allocation: 0.25 },
                "Senior Manager": { count: 2, allocation: 0.70 },
                "Manager": { count: 2, allocation: 0.60 },
                "Senior": { count: 2, allocation: 0.50 },
                "Staff": { count: 1, allocation: 0.40 },
              }
            }
          },
        },
        {
          id: "materiality",
          name: "Materiality Determination",
          description: "Establish materiality and tolerable misstatement per AS 2105. Apple FY25: revenue $416B, pre-tax income ~$133B. Common benchmarks applied under firm methodology: 0.5-1% of revenue ($2-4B) or 5% of pre-tax income (~$6.6B). Tolerable misstatement at 50-75% of overall materiality, based on assessed risk.",
          inputs: ["FinancialData"],
          outputs: ["Materiality"],
          timing: { start: 2, end: 4.5 },
          requirement_ids: ["materiality_establishment"],
          agents: {
            human: {
              team: {
                "Engagement Partner": { count: 1, allocation: 0.10 },
                "Senior Manager": { count: 1, allocation: 0.35 },
                "Manager": { count: 1, allocation: 0.30 },
                "Senior": { count: 1, allocation: 0.20 },
              }
            }
          },
        },
        {
          id: "account_scoping",
          name: "Significant Account & Assertion Scoping",
          description: "Determine significant accounts per AS 2201. Apple has fewer process areas than diversified industrials — no manufacturing cost accounting, no inventory WIP. Key accounts: revenue, accounts receivable, deferred revenue (services), legal contingencies, income taxes, PP&E (retail stores), intangibles. ~12-20 significant accounts.",
          inputs: ["RiskAssessment", "Materiality", "FinancialData"],
          outputs: ["SignificantAccountMatrix"],
          timing: { start: 3.5, end: 6.5 },
          requirement_ids: ["significant_account_identification"],
          agents: {
            human: {
              team: {
                "Engagement Partner": { count: 1, allocation: 0.05 },
                "Senior Manager": { count: 1, allocation: 0.50 },
                "Manager": { count: 2, allocation: 0.55 },
                "Senior": { count: 2, allocation: 0.45 },
                "Staff": { count: 1, allocation: 0.30 },
              }
            }
          },
        },
        {
          id: "component_scoping",
          name: "Component Scoping & GAI Issuance",
          description: "Scope Apple's global components. Fewer full-scope components than diversified industrials (Apple's operations are more centralized) but 40+ jurisdictions require component auditor coverage. Amended AS 1201 (Dec 2024): written instructions and affirmations for each component team.",
          inputs: ["RiskAssessment", "EntityStructure"],
          outputs: ["ComponentScope", "ScopingOutput"],
          timing: { start: 4, end: 8 },
          requirement_ids: ["component_auditor_supervision"],
          agents: {
            human: {
              team: {
                "Engagement Partner": { count: 1, allocation: 0.10 },
                "Senior Manager": { count: 3, allocation: 0.70 },
                "Manager": { count: 6, allocation: 0.70 },
                "Senior": { count: 5, allocation: 0.60 },
                "Staff": { count: 4, allocation: 0.50 },
                "GDS/Offshore": { count: 15, allocation: 0.65 },
              }
            }
          },
        },
      ],
    },

    // ---- Control Audit ----
    {
      id: "control_audit",
      name: "Control Audit",
      description: "Control testing across Apple's operations: corporate, retail (~540 stores), and services. Higher automation than industrial mega-caps — Apple's systems are heavily software-controlled. Retail store controls are a distinct testing population.",
      agents: {},
      inputs: ["ScopingOutput"],
      outputs: ["ICFROpinion", "DeficiencyConclusions"],
      requirement_ids: ["control_identification_and_testing", "entity_level_controls", "walkthrough_per_process", "design_effectiveness", "operating_effectiveness", "period_end_controls", "deficiency_severity_evaluation", "material_weakness_adverse_opinion", "integrated_icfr_opinion"],
      sub_workflows: [
        {
          id: "preliminary_control_id",
          name: "Preliminary Control Identification",
          description: "Build draft control matrix from Apple's process documentation. Fewer process areas than industrial mega-caps (no manufacturing, no inventory production). Key areas: revenue cycle (retail POS, online, App Store, services), procurement, treasury, financial close, IT operations, retail store operations.",
          inputs: ["ControlDocumentation"],
          outputs: ["PreliminaryControlList"],
          timing: { start: 5, end: 7 },
          requirement_ids: ["control_identification_and_testing", "entity_level_controls"],
          agents: {
            human: {
              team: {
                "Senior Manager": { count: 2, allocation: 0.60 },
                "Manager": { count: 5, allocation: 0.65 },
                "Senior": { count: 6, allocation: 0.60 },
                "Staff": { count: 4, allocation: 0.50 },
                "GDS/Offshore": { count: 18, allocation: 0.70 },
              }
            }
          },
        },
        {
          id: "walkthroughs",
          name: "Walkthroughs & Process Understanding",
          description: "Walk through key transaction cycles per AS 2201.34. No factory walkthroughs (contract manufacturing). Includes: retail store revenue cycle at representative locations, App Store/services revenue, procurement, treasury, financial close. Retail walkthroughs at sample of ~540 stores.",
          inputs: ["PreliminaryControlList"],
          outputs: ["WalkthroughResult"],
          timing: { start: 7, end: 10 },
          requirement_ids: ["walkthrough_per_process"],
          agents: {
            human: {
              team: {
                "Engagement Partner": { count: 1, allocation: 0.10 },
                "Senior Manager": { count: 3, allocation: 0.50 },
                "Manager": { count: 8, allocation: 0.65 },
                "Senior": { count: 18, allocation: 0.80 },
                "Staff": { count: 15, allocation: 0.75 },
                "GDS/Offshore": { count: 30, allocation: 0.65 },
              }
            }
          },
        },
        {
          id: "key_control_finalization",
          name: "Key Control Finalization",
          description: "Revise control matrix based on walkthrough findings. Finalize ~600-1,200 key controls per AS 2201.37-39. Apple's higher automation rate means more software/IT-dependent controls and fewer manual controls than industrial peers.",
          inputs: ["PreliminaryControlList", "WalkthroughResult"],
          outputs: ["ControlList"],
          timing: { start: 9.5, end: 11 },
          requirement_ids: ["control_identification_and_testing"],
          agents: {
            human: {
              team: {
                "Senior Manager": { count: 3, allocation: 0.60 },
                "Manager": { count: 8, allocation: 0.70 },
                "Senior": { count: 8, allocation: 0.65 },
                "Staff": { count: 5, allocation: 0.50 },
                "GDS/Offshore": { count: 40, allocation: 0.70 },
              }
            }
          },
        },
        {
          id: "design_effectiveness",
          name: "Design Effectiveness Testing",
          description: "Assess whether each control's design addresses the risk per AS 2201.42-43. Apple's automated controls are typically well-designed but IT-dependent — design testing emphasis on system configuration and IPCs.",
          inputs: ["ControlList", "WalkthroughResult"],
          outputs: ["DesignConclusions"],
          timing: { start: 10, end: 13 },
          requirement_ids: ["design_effectiveness"],
          agents: {
            human: {
              team: {
                "Engagement Partner": { count: 1, allocation: 0.05 },
                "Senior Manager": { count: 2, allocation: 0.40 },
                "Manager": { count: 8, allocation: 0.65 },
                "Senior": { count: 12, allocation: 0.80 },
                "Staff": { count: 8, allocation: 0.60 },
                "GDS/Offshore": { count: 35, allocation: 0.72 },
              }
            }
          },
        },
        {
          id: "operating_effectiveness",
          name: "Operating Effectiveness Testing",
          description: "Test ~600-1,200 key controls across Apple's operations. Higher proportion of automated controls reduces sample sizes vs. industrial peers but Apple's heavy automation increases IT-dependent control population and ITGC reliance testing. Retail store controls tested at sample of locations. Sample sizes: 15-30 daily/weekly, 6-12 monthly/quarterly.",
          inputs: ["ControlList", "DesignConclusions"],
          outputs: ["OperatingEffectivenessResults"],
          timing: { start: 12, end: 18 },
          requirement_ids: ["operating_effectiveness"],
          agents: {
            human: {
              team: {
                "Engagement Partner": { count: 2, allocation: 0.10 },
                "Senior Manager": { count: 4, allocation: 0.30 },
                "Manager": { count: 12, allocation: 0.65 },
                "Senior": { count: 25, allocation: 0.87 },
                "Staff": { count: 35, allocation: 0.92 },
                "GDS/Offshore": { count: 122, allocation: 0.92 },
              }
            }
          },
        },
        {
          id: "year_end_close",
          name: "Year-End Roll-Forward & Close Procedures",
          description: "Roll-forward control testing from interim to September 27 FY-end. Apple's September FY-end means year-end close procedures run October-November rather than January-February.",
          inputs: ["OperatingEffectivenessResults"],
          outputs: ["YearEndResults"],
          timing: { start: 17, end: 18.5 },
          requirement_ids: ["period_end_controls"],
          agents: {
            human: {
              team: {
                "Senior Manager": { count: 3, allocation: 0.40 },
                "Manager": { count: 8, allocation: 0.65 },
                "Senior": { count: 18, allocation: 0.85 },
                "Staff": { count: 25, allocation: 0.90 },
                "GDS/Offshore": { count: 85, allocation: 0.88 },
              }
            }
          },
        },
        {
          id: "deficiency_evaluation",
          name: "Deficiency Evaluation",
          description: "Aggregate control audit conclusions across all locations per AS 2201.62-70. Evaluate deficiency combinations across corporate, retail, and component locations. Apple's global retail footprint adds complexity to aggregation.",
          inputs: ["OperatingEffectivenessResults", "YearEndResults"],
          outputs: ["ICFROpinion", "DeficiencyConclusions"],
          timing: { start: 17.5, end: 20.5 },
          requirement_ids: ["deficiency_severity_evaluation", "material_weakness_adverse_opinion", "deficiency_written_communication", "component_findings_evaluation"],
          agents: {
            human: {
              team: {
                "Engagement Partner": { count: 2, allocation: 0.20 },
                "Senior Manager": { count: 4, allocation: 0.60 },
                "Manager": { count: 10, allocation: 0.65 },
                "Senior": { count: 9, allocation: 0.60 },
                "Staff": { count: 5, allocation: 0.40 },
                "GDS/Offshore": { count: 25, allocation: 0.65 },
              }
            }
          },
        },
      ],
    },

    // ---- Substantive Testing ----
    {
      id: "substantive",
      name: "Substantive Testing",
      description: "Account balance testing. No inventory observation at Apple-owned factories (contract manufacturing). Key substantive areas: revenue (hardware + services bundles), deferred revenue, legal contingencies, income taxes, PP&E (retail), receivables.",
      agents: {},
      inputs: ["ScopingOutput", "DeficiencyConclusions"],
      outputs: ["TestedBalances", "AdjustmentsSummary"],
      requirement_ids: ["substantive_procedures", "receivables_confirmation", "subsequent_events", "misstatement_accumulation", "journal_entry_fraud_testing", "management_override_evaluation"],
      sub_workflows: [
        {
          id: "interim_substantive",
          name: "Interim Substantive Testing",
          description: "Test significant account balances for interim period (April-June). No physical inventory observation at Apple factories — contract manufacturers (Foxconn, Pegatron) handle production; Apple's finished goods inventory ($5.7B) tested via third-party confirmations, SOC report reliance (AS 2601), and goods-in-transit cutoff testing. Cash & investments (~$132B): bank and custodian confirmations, fair value testing of marketable securities (ASC 320), unrealized gain/loss verification. Accounts payable (~$70B): vendor statement reconciliation, interim AP balance testing, three-way match for procurement transactions. Debt (~$99B term notes and commercial paper): lender confirmations, interest expense recalculation. Operating lease testing (ASC 842) for 540+ retail store leases: right-of-use asset and lease liability interim balances. Share buyback program: Q1-Q3 repurchase transaction testing against board authorization, broker confirmations. Focus: revenue cut-off, receivable confirmations, deferred revenue rollforward, investment portfolio testing.",
          inputs: ["ScopingOutput"],
          outputs: ["InterimResults"],
          timing: { start: 9, end: 16.5 },
          requirement_ids: ["substantive_procedures", "receivables_confirmation"],
          agents: {
            human: {
              team: {
                "Engagement Partner": { count: 1, allocation: 0.10 },
                "Senior Manager": { count: 3, allocation: 0.40 },
                "Manager": { count: 10, allocation: 0.70 },
                "Senior": { count: 20, allocation: 0.85 },
                "Staff": { count: 30, allocation: 0.90 },
                "GDS/Offshore": { count: 80, allocation: 0.88 },
              }
            }
          },
        },
        {
          id: "final_substantive",
          name: "Final Substantive Testing",
          description: "Complete remaining substantive testing through September 27 FY-end. Follow-up on interim exceptions, subsequent events (AS 2905). Services revenue recognition: test allocation of bundled hardware + services arrangements. PP&E existence testing for ~$50B net PP&E including tooling at contractor sites. Stock-based compensation (ASC 718): RSU grant-date fair value and expense testing across ~166,000 employees. Legal contingency evaluation (ASC 450): attorney letter procedures for Epic Games, EU DMA, DOJ antitrust matters. Accounts payable: year-end cut-off procedures for ~$70B AP, search for unrecorded liabilities, subsequent payment testing. Derivative instruments: foreign currency and interest rate hedge effectiveness testing (ASC 815). Consolidation and intercompany elimination testing across 100+ entities. Lease accounting finalization (ASC 842): year-end right-of-use asset and lease liability balances for 540+ retail and corporate leases. Debt: year-end confirmation and fair value disclosure testing. Share buyback program: ASR derivative/forward contract fair value (ASC 815), treasury stock year-end rollforward, 10b5-1 plan compliance, weighted-average share count for EPS.",
          inputs: ["InterimResults", "ITGCConclusions"],
          outputs: ["TestedBalances"],
          timing: { start: 17.5, end: 20.5 },
          requirement_ids: ["substantive_procedures", "subsequent_events"],
          agents: {
            human: {
              team: {
                "Engagement Partner": { count: 2, allocation: 0.15 },
                "Senior Manager": { count: 4, allocation: 0.45 },
                "Manager": { count: 12, allocation: 0.80 },
                "Senior": { count: 30, allocation: 0.92 },
                "Staff": { count: 50, allocation: 0.95 },
                "GDS/Offshore": { count: 172, allocation: 0.92 },
              }
            }
          },
        },
        {
          id: "fraud_assessment",
          name: "Fraud Procedures",
          description: "Per AS 2401: revenue recognition fraud risk presumed (hardware + services allocation, App Store timing). Management override testing across all entities. App Store/services revenue allocation is estimation-heavy. Journal entry testing across global operations.",
          inputs: ["InterimResults"],
          outputs: ["FraudAssessment"],
          timing: { start: 18.5, end: 20.5 },
          requirement_ids: ["journal_entry_fraud_testing", "management_override_evaluation", "revenue_recognition_fraud_presumption"],
          agents: {
            human: {
              team: {
                "Engagement Partner": { count: 2, allocation: 0.20 },
                "Senior Manager": { count: 4, allocation: 0.60 },
                "Manager": { count: 8, allocation: 0.70 },
                "Senior": { count: 15, allocation: 0.80 },
                "Staff": { count: 20, allocation: 0.75 },
                "GDS/Offshore": { count: 68, allocation: 0.80 },
              }
            }
          },
        },
        {
          id: "adjustments",
          name: "Misstatement Accumulation",
          description: "Compile misstatements from all locations per AS 2810. Apple's significant legal contingencies (Epic Games, EU DMA/antitrust, DOJ) increase complexity of misstatement accumulation — contingent liability estimation drives judgment-heavy adjustments.",
          inputs: ["TestedBalances", "FraudAssessment"],
          outputs: ["AdjustmentsSummary"],
          timing: { start: 19.5, end: 21.5 },
          requirement_ids: ["misstatement_accumulation", "audit_committee_communication"],
          agents: {
            human: {
              team: {
                "Engagement Partner": { count: 1, allocation: 0.15 },
                "Senior Manager": { count: 3, allocation: 0.55 },
                "Manager": { count: 5, allocation: 0.60 },
                "Senior": { count: 5, allocation: 0.50 },
                "Staff": { count: 3, allocation: 0.40 },
                "GDS/Offshore": { count: 25, allocation: 0.70 },
              }
            }
          },
        },
      ],
    },

    // ---- Specialist Work ----
    {
      id: "specialist",
      name: "Specialist Work",
      description: "ITGC testing and tax (co-largest blocks — Apple's transfer pricing is arguably the most scrutinized in global history), valuation (limited — Apple does fewer large acquisitions), actuarial (minimal — DC plans only).",
      agents: {},
      inputs: ["ScopingOutput"],
      outputs: ["SpecialistOutput", "ITGCConclusions"],
      requirement_ids: ["specialist_evaluation", "control_identification_and_testing"],
      sub_workflows: [
        {
          id: "itgc_testing",
          name: "IT General Controls Testing",
          description: "Test ITGCs across Apple's in-scope systems: SAP (financials), retail POS systems, App Store/iTunes Connect, iCloud services infrastructure, supply chain management, treasury systems. Fewer systems than diversified industrials (no factory ERP). ~30-60 in-scope systems, 15 ITGCs per system.",
          inputs: ["ScopingOutput"],
          outputs: ["ITGCConclusions"],
          timing: { start: 9, end: 17 },
          requirement_ids: ["control_identification_and_testing", "operating_effectiveness"],
          agents: {
            human: {
              team: {
                "Senior Manager": { count: 2, allocation: 0.35 },
                "Manager": { count: 8, allocation: 0.65 },
                "Senior": { count: 15, allocation: 0.80 },
                "Staff": { count: 15, allocation: 0.70 },
                "Specialist": { count: 30, allocation: 0.92 },
              }
            }
          },
        },
        {
          id: "valuation_specialist",
          name: "Valuation Specialist Work",
          description: "Evaluate goodwill impairment (limited — Apple carries minimal goodwill relative to revenue), fair value of investments, and any acquisition-related purchase price allocations. Apple's balance sheet is simpler than most mega-caps in this regard.",
          inputs: ["ScopingOutput"],
          outputs: ["ValuationConclusions"],
          timing: { start: 10, end: 19 },
          requirement_ids: ["specialist_evaluation"],
          agents: {
            human: {
              team: {
                "Senior Manager": { count: 1, allocation: 0.20 },
                "Manager": { count: 3, allocation: 0.35 },
                "Senior": { count: 5, allocation: 0.40 },
                "Staff": { count: 3, allocation: 0.30 },
                "Specialist": { count: 10, allocation: 0.55 },
                "GDS/Offshore": { count: 6, allocation: 0.30 },
              }
            }
          },
        },
        {
          id: "tax_specialist",
          name: "Tax Specialist Work",
          description: "Apple's multi-jurisdiction transfer pricing is among the most complex in global auditing. ~$22B unrecognized tax benefits (among the largest of any US public company), €13B EU state aid resolution (largest in EU history), $38.4B deferred tax assets requiring realizability assessment. ASC 740 provision review across 40+ jurisdictions, transfer pricing documentation and arm's length testing, UTB assessment, GILTI/FDII/BEAT/Pillar Two calculations, intercompany transaction testing across 20+ major entities, and tax rate reconciliation analysis.",
          inputs: ["ScopingOutput"],
          outputs: ["TaxConclusions"],
          timing: { start: 10, end: 20 },
          requirement_ids: ["specialist_evaluation"],
          agents: {
            human: {
              team: {
                "Senior Manager": { count: 3, allocation: 0.50 },
                "Manager": { count: 6, allocation: 0.65 },
                "Senior": { count: 10, allocation: 0.70 },
                "Staff": { count: 6, allocation: 0.55 },
                "Specialist": { count: 30, allocation: 0.90 },
              }
            }
          },
        },
        {
          id: "actuarial_specialist",
          name: "Actuarial & Other Specialist Work",
          description: "Minimal scope — Apple has defined contribution plans only (401(k) match, non-US equivalents). No defined benefit pension obligations, no material OPEB. Limited to reviewing DC plan compliance and non-US retirement plan obligations in key jurisdictions.",
          inputs: ["ScopingOutput"],
          outputs: ["ActuarialConclusions"],
          timing: { start: 12, end: 19 },
          requirement_ids: ["specialist_evaluation"],
          agents: {
            human: {
              team: {
                "Senior Manager": { count: 1, allocation: 0.15 },
                "Manager": { count: 2, allocation: 0.20 },
                "Senior": { count: 3, allocation: 0.20 },
                "Staff": { count: 2, allocation: 0.15 },
                "Specialist": { count: 4, allocation: 0.42 },
                "GDS/Offshore": { count: 3, allocation: 0.15 },
              }
            }
          },
        },
      ],
    },

    // ---- Reporting ----
    {
      id: "reporting",
      name: "Reporting & Opinion",
      description: "Final analytics, EQR, audit committee communication, dual opinion (FS + ICFR), SEC filing, management letter. Apple files 10-K within 60 days of September FY-end (~late November).",
      agents: {},
      inputs: ["ICFROpinion", "TestedBalances", "AdjustmentsSummary", "SpecialistOutput"],
      outputs: ["AuditOpinion"],
      requirement_ids: ["final_analytical_review", "eqr_mandatory", "eqr_independence", "audit_committee_communication", "deficiency_written_communication", "non_audit_service_preapproval", "fs_opinion_format", "cam_disclosure", "tenure_disclosure", "ten_k_filing_deadline", "documentation_completion", "documentation_retention"],
      sub_workflows: [
        {
          id: "final_analytics",
          name: "Final Analytical Procedures",
          description: "Final overall analytical review of Apple's audited financial statements (AS 2810.04). Must cover consolidated balances and component-level analytics across all geographic segments.",
          inputs: ["AdjustmentsSummary"],
          outputs: ["AnalyticalReviewOutput"],
          timing: { start: 20.5, end: 22 },
          requirement_ids: ["final_analytical_review"],
          agents: {
            human: {
              team: {
                "Engagement Partner": { count: 1, allocation: 0.15 },
                "Senior Manager": { count: 3, allocation: 0.65 },
                "Manager": { count: 4, allocation: 0.60 },
                "Senior": { count: 5, allocation: 0.55 },
                "Staff": { count: 3, allocation: 0.40 },
                "GDS/Offshore": { count: 10, allocation: 0.50 },
              }
            }
          },
        },
        {
          id: "eqr",
          name: "Engagement Quality Review (EQR)",
          description: "Second partner-level review per AS 1220. Key judgment areas for Apple: revenue recognition (bundled arrangements), legal contingency estimation, transfer pricing, deferred revenue. 3-5 days for mega-caps.",
          inputs: ["AnalyticalReviewOutput", "ICFROpinion"],
          outputs: ["EQRSignOff"],
          timing: { start: 21.5, end: 23.5 },
          requirement_ids: ["eqr_mandatory", "eqr_independence"],
          agents: {
            human: {
              team: {
                "EQR Partner": { count: 2, allocation: 0.80 },
                "Engagement Partner": { count: 2, allocation: 0.30 },
                "Senior Manager": { count: 5, allocation: 0.70 },
                "Manager": { count: 5, allocation: 0.60 },
                "Senior": { count: 6, allocation: 0.52 },
                "Staff": { count: 2, allocation: 0.30 },
              }
            }
          },
        },
        {
          id: "audit_committee",
          name: "Audit Committee Communication",
          description: "Communicate audit results to Apple's Audit and Finance Committee per AS 1301. Apple's committee meets ~8-10x/year.",
          inputs: ["EQRSignOff"],
          outputs: ["AuditCommitteePresentation"],
          timing: { start: 22.5, end: 24 },
          requirement_ids: ["audit_committee_communication", "deficiency_written_communication", "non_audit_service_preapproval"],
          agents: {
            human: {
              team: {
                "Engagement Partner": { count: 2, allocation: 0.40 },
                "Senior Manager": { count: 4, allocation: 0.60 },
                "Manager": { count: 3, allocation: 0.50 },
                "Senior": { count: 3, allocation: 0.40 },
                "Staff": { count: 2, allocation: 0.30 },
                "GDS/Offshore": { count: 9, allocation: 0.40 },
              }
            }
          },
        },
        {
          id: "opinion",
          name: "Opinion Finalization & Sign-Off",
          description: "Partner signs dual opinion (FS + ICFR). CAM identification — Apple's likely CAMs: revenue recognition (bundled arrangements), legal contingencies, income taxes.",
          inputs: ["AuditCommitteePresentation"],
          outputs: ["AuditOpinion"],
          timing: { start: 23.5, end: 24.5 },
          requirement_ids: ["fs_opinion_format", "integrated_icfr_opinion", "cam_disclosure", "tenure_disclosure"],
          agents: {
            human: {
              team: {
                "Engagement Partner": { count: 2, allocation: 0.80 },
                "Senior Manager": { count: 4, allocation: 0.70 },
                "Manager": { count: 3, allocation: 0.55 },
                "Senior": { count: 3, allocation: 0.40 },
                "Staff": { count: 2, allocation: 0.25 },
                "GDS/Offshore": { count: 6, allocation: 0.35 },
              }
            }
          },
        },
        {
          id: "sec_filing",
          name: "SEC Filing & Documentation",
          description: "File Apple's 10-K with audit reports on EDGAR. LAF deadline: 60 days after September 27 FY-end (~late November). AS 1215 14-day archival across workpapers from all locations.",
          inputs: ["AuditOpinion"],
          outputs: ["FiledTenK"],
          timing: { start: 24.5, end: 26.5 },
          requirement_ids: ["ten_k_filing_deadline", "documentation_completion", "documentation_retention"],
          agents: {
            human: {
              team: {
                "Senior Manager": { count: 1, allocation: 0.20 },
                "Manager": { count: 2, allocation: 0.30 },
                "Senior": { count: 3, allocation: 0.35 },
                "Staff": { count: 3, allocation: 0.30 },
                "GDS/Offshore": { count: 11, allocation: 0.45 },
              }
            }
          },
        },
        {
          id: "national_office",
          name: "National Office Consultations",
          description: "Consult with EY's Professional Practice group on complex matters: revenue recognition for bundled hardware + services, legal contingency estimation (Epic, EU DMA, DOJ), transfer pricing methodology, App Store commission accounting.",
          inputs: ["ScopingOutput"],
          outputs: ["NOCConclusions"],
          timing: { start: 10, end: 24 },
          agents: {
            human: {
              team: {
                "Engagement Partner": { count: 1, allocation: 0.05 },
                "Senior Manager": { count: 2, allocation: 0.20 },
                "Manager": { count: 3, allocation: 0.20 },
                "Senior": { count: 4, allocation: 0.13 },
                "Staff": { count: 2, allocation: 0.10 },
                "GDS/Offshore": { count: 4, allocation: 0.10 },
              }
            }
          },
        },
        {
          id: "mgmt_letter",
          name: "Management Letter & Exit",
          description: "Management recommendations letter consolidating findings from all locations. Written communication of significant deficiencies and control recommendations to management per AS 1305. Exit meeting with Apple's CFO/Controller.",
          inputs: ["AuditOpinion"],
          outputs: ["ManagementLetter"],
          timing: { start: 24.5, end: 26.5 },
          requirement_ids: ["deficiency_written_communication"],
          agents: {
            human: {
              team: {
                "Engagement Partner": { count: 2, allocation: 0.40 },
                "Senior Manager": { count: 3, allocation: 0.50 },
                "Manager": { count: 2, allocation: 0.35 },
                "Senior": { count: 2, allocation: 0.30 },
                "Staff": { count: 2, allocation: 0.20 },
                "GDS/Offshore": { count: 4, allocation: 0.25 },
              }
            }
          },
        },
      ],
    },
  ],
}
