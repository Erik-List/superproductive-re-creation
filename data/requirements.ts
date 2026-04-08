import type { Requirement } from "./types"

// 35 PCAOB / SOX / SEC requirements for an integrated audit.
// IDs are descriptive snake_case. Referenced by Workflow.requirement_ids.

export const requirements: Requirement[] = [
  // Risk Assessment & Fraud
  { id: "risk_assessment_procedures", description: "Perform risk assessment procedures to identify and assess risks of material misstatement (includes fraud brainstorming discussion per AS 2110.49-.53 and significant risk determination per AS 2110.71)", source: "PCAOB AS 2110" },
  { id: "fraud_risk_assessment", description: "Assess fraud risk, including risk of management override of controls", source: "PCAOB AS 2401" },
  { id: "revenue_recognition_fraud_presumption", description: "Revenue recognition is a presumed fraud risk (rebuttable)", source: "PCAOB AS 2110.68" },
  { id: "journal_entry_fraud_testing", description: "Test journal entries for evidence of possible fraud", source: "PCAOB AS 2401 .61-.67" },
  { id: "management_override_evaluation", description: "Evaluate management override of controls", source: "PCAOB AS 2401 .66-.67" },
  { id: "audit_strategy", description: "Establish overall audit strategy: determine scope, timing, direction, and resources", source: "PCAOB AS 2101" },
  { id: "predecessor_communication", description: "Communicate with predecessor auditor regarding client integrity and disagreements (first-year engagements)", source: "PCAOB AS 2610" },
  { id: "risk_to_procedure_linkage", description: "Design and perform audit procedures that address assessed risks for each relevant assertion of each significant account", source: "PCAOB AS 2301.08" },

  // Materiality & Scoping
  { id: "materiality_establishment", description: "Establish materiality for planning and evaluating audit results", source: "PCAOB AS 2105" },

  // ICFR
  { id: "significant_account_identification", description: "Identify significant accounts and relevant assertions for ICFR", source: "PCAOB AS 2201" },
  { id: "control_identification_and_testing", description: "Identify and test controls over all significant accounts", source: "PCAOB AS 2201 .28-.33" },
  { id: "entity_level_controls", description: "Test entity-level controls", source: "PCAOB AS 2201 .22-.27" },
  { id: "walkthrough_per_process", description: "Perform at least one walkthrough per significant process ('ordinarily sufficient')", source: "PCAOB AS 2201 .34-.35" },
  { id: "design_effectiveness", description: "Evaluate design effectiveness of each key control", source: "PCAOB AS 2201 .42-.43" },
  { id: "operating_effectiveness", description: "Obtain sufficient evidence of control operating effectiveness", source: "PCAOB AS 2201 .44-.61" },
  { id: "period_end_controls", description: "Test period-end financial reporting process controls", source: "PCAOB AS 2201 .22" },
  { id: "deficiency_severity_evaluation", description: "Evaluate severity of each control deficiency identified", source: "PCAOB AS 2201 .62-.70" },
  { id: "material_weakness_adverse_opinion", description: "Material weakness triggers mandatory adverse ICFR opinion", source: "PCAOB AS 2201 .87-.88" },
  { id: "integrated_icfr_opinion", description: "Issue ICFR opinion integrated with FS audit (not standalone)", source: "PCAOB AS 2201 .85-.98" },

  // Substantive Testing
  { id: "substantive_procedures", description: "Perform substantive procedures responsive to assessed risks for all relevant assertions of significant accounts", source: "PCAOB AS 2301" },
  { id: "receivables_confirmation", description: "Confirmation of receivables is presumptively necessary", source: "PCAOB AS 2310" },
  { id: "subsequent_events", description: "Evaluate subsequent events through opinion date", source: "PCAOB AS 2905" },
  { id: "misstatement_accumulation", description: "Accumulate and evaluate all misstatements identified during the audit", source: "PCAOB AS 2810" },
  { id: "final_analytical_review", description: "Perform overall analytical review near end of audit", source: "PCAOB AS 2810 .04" },

  // Component Auditors & Specialists
  { id: "component_auditor_supervision", description: "Supervise and review component auditor work; may need to perform procedures at component", source: "PCAOB AS 1205" },
  { id: "component_findings_evaluation", description: "Group auditor must evaluate component auditor findings for group-level impact", source: "PCAOB AS 1205" },
  { id: "specialist_evaluation", description: "Evaluate specialist work and competence; auditor takes responsibility for conclusions", source: "PCAOB AS 1210" },

  // Quality Review
  { id: "eqr_mandatory", description: "Engagement Quality Review (EQR) is mandatory before report issuance", source: "SOX Section 104(a) / PCAOB AS 1220" },
  { id: "eqr_independence", description: "EQR reviewer must be independent of the engagement team", source: "PCAOB AS 1220 .03-.04" },

  // Communication & Reporting
  { id: "audit_committee_communication", description: "Communicate specific required matters to audit committee", source: "PCAOB AS 1301" },
  { id: "deficiency_written_communication", description: "Communicate material weaknesses and significant deficiencies in writing to audit committee and management", source: "PCAOB AS 1305 / AS 1301" },
  { id: "non_audit_service_preapproval", description: "All non-audit services require audit committee pre-approval", source: "SOX Section 202" },
  { id: "fs_opinion_format", description: "Issue financial statement opinion in prescribed format", source: "PCAOB AS 3101" },
  { id: "cam_disclosure", description: "Disclose Critical Audit Matters (CAMs) in audit report for LAFs", source: "PCAOB AS 3101 .11-.17" },
  { id: "tenure_disclosure", description: "Disclose auditor tenure in audit report", source: "PCAOB AS 3101 .08(k)" },

  // Documentation & Filing
  { id: "ten_k_filing_deadline", description: "LAF must file 10-K within 60 days of fiscal year-end", source: "SEC Rule 13a-10" },
  { id: "documentation_completion", description: "Complete audit documentation within 14 days of report release", source: "PCAOB AS 1215" },
  { id: "documentation_retention", description: "Retain audit documentation for 7 years", source: "SOX Section 802 / PCAOB AS 1215" },
]

// Lookup by ID
export const requirementById = Object.fromEntries(
  requirements.map(r => [r.id, r])
)

// Legacy R-number mapping (for backward compatibility with workflow.jsx)
export const legacyIdMap: Record<string, string> = {
  R1: "risk_assessment_procedures",
  R2: "fraud_risk_assessment",
  R3: "revenue_recognition_fraud_presumption",
  R4: "journal_entry_fraud_testing",
  R5: "management_override_evaluation",
  R6: "materiality_establishment",
  R7: "significant_account_identification",
  R8: "control_identification_and_testing",
  R9: "entity_level_controls",
  R10: "walkthrough_per_process",
  R11: "design_effectiveness",
  R12: "operating_effectiveness",
  R13: "period_end_controls",
  R14: "deficiency_severity_evaluation",
  R15: "material_weakness_adverse_opinion",
  R16: "integrated_icfr_opinion",
  R17: "substantive_procedures",
  R18: "receivables_confirmation",
  R19: "subsequent_events",
  R20: "misstatement_accumulation",
  R21: "final_analytical_review",
  R22: "component_auditor_supervision",
  R23: "component_findings_evaluation",
  R24: "specialist_evaluation",
  R25: "eqr_mandatory",
  R26: "eqr_independence",
  R27: "audit_committee_communication",
  R28: "deficiency_written_communication",
  R29: "non_audit_service_preapproval",
  R30: "fs_opinion_format",
  R31: "cam_disclosure",
  R32: "tenure_disclosure",
  R33: "ten_k_filing_deadline",
  R34: "documentation_completion",
  R35: "documentation_retention",
  R36: "audit_strategy",
  R38: "predecessor_communication",
  R39: "risk_to_procedure_linkage",
}
