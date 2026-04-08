import type { WorkflowCost, CostConfig } from "../types"
import { workflow } from "./workflow"

// ============================================================
// SUPERAUDIT COST MODEL (Apple FY25)
// WorkflowCost tree (mirrors engagement workflow tree) + CostConfig
// ============================================================
//
// 12 roles across US HQ, owned subs, and affiliates.
// 10× EY-equivalent rates to attract & retain top domain experts.
// AI Engineers benchmarked at $1M TC (leading applied AI lab mid-range).
// 145% overhead: multi-entity startup with one mega-cap engagement.
//
// Team composition and AI costs now live on the Workflow (agents field).
// This file defines the WorkflowCost tree structure (for computeCost to fill)
// and the CostConfig (role rates + overhead).

// Helpers to find sub-workflows by id
function sw(id: string) {
  return workflow.sub_workflows!.find(w => w.id === id)!
}
function swSub(parentId: string, childId: string) {
  return sw(parentId).sub_workflows!.find(w => w.id === childId)!
}

const leaf = (parentId: string, childId: string): WorkflowCost => ({
  workflow: swSub(parentId, childId),
  computed_hours: 0, role_hours: {},
  direct_human: 0, direct_ai: 0, overhead: 0, total: 0,
})

// ---- WorkflowCost tree ----

export const engagementCost: WorkflowCost = {
  workflow: workflow,
  computed_hours: 0, role_hours: {},
  direct_human: 0, direct_ai: 0, overhead: 0, total: 0,
  sub_workflow_costs: [

    // Stream 1: Engagement Setup & Predecessor
    {
      workflow: sw("engagement_setup"),
      computed_hours: 0, role_hours: {},
      direct_human: 0, direct_ai: 0, overhead: 0, total: 0,
      sub_workflow_costs: [
        leaf("engagement_setup", "predecessor_communication"),
        leaf("engagement_setup", "predecessor_workpaper_request"),
        leaf("engagement_setup", "engagement_letter_and_independence"),
        leaf("engagement_setup", "client_data_request"),
        leaf("engagement_setup", "system_inventory"),
        leaf("engagement_setup", "opening_balance_procedures"),
      ],
    },

    // Stream 2: Scoping & Risk Assessment
    {
      workflow: sw("scoping"),
      computed_hours: 0, role_hours: {},
      direct_human: 0, direct_ai: 0, overhead: 0, total: 0,
      sub_workflow_costs: [
        leaf("scoping", "public_data_scoping"),
        leaf("scoping", "client_data_scoping"),
        leaf("scoping", "component_scoping"),
        leaf("scoping", "predecessor_calibration"),
        leaf("scoping", "fraud_brainstorming"),
        leaf("scoping", "partner_scoping_lock"),
        leaf("scoping", "testing_plan_generation"),
      ],
    },

    // Stream 3: Control Audit
    {
      workflow: sw("control_audit"),
      computed_hours: 0, role_hours: {},
      direct_human: 0, direct_ai: 0, overhead: 0, total: 0,
      sub_workflow_costs: [
        leaf("control_audit", "control_identification"),
        leaf("control_audit", "entity_level_controls"),
        leaf("control_audit", "itgc_testing"),
        leaf("control_audit", "walkthroughs"),
        leaf("control_audit", "operating_effectiveness_testing"),
        leaf("control_audit", "period_end_controls"),
        leaf("control_audit", "deficiency_evaluation"),
      ],
    },

    // Stream 4: Substantive Testing
    {
      workflow: sw("substantive_testing"),
      computed_hours: 0, role_hours: {},
      direct_human: 0, direct_ai: 0, overhead: 0, total: 0,
      sub_workflow_costs: [
        leaf("substantive_testing", "interim_substantive"),
        leaf("substantive_testing", "final_substantive"),
        leaf("substantive_testing", "fraud_procedures"),
        leaf("substantive_testing", "misstatement_accumulation"),
      ],
    },

    // Stream 5: Specialist Work
    {
      workflow: sw("specialist_work"),
      computed_hours: 0, role_hours: {},
      direct_human: 0, direct_ai: 0, overhead: 0, total: 0,
      sub_workflow_costs: [
        leaf("specialist_work", "tax_specialist"),
        leaf("specialist_work", "valuation_specialist"),
        leaf("specialist_work", "actuarial_specialist"),
      ],
    },

    // Stream 6: Reporting & Opinion
    {
      workflow: sw("reporting"),
      computed_hours: 0, role_hours: {},
      direct_human: 0, direct_ai: 0, overhead: 0, total: 0,
      sub_workflow_costs: [
        leaf("reporting", "final_analytical_review"),
        leaf("reporting", "eqr"),
        leaf("reporting", "audit_committee_communication"),
        leaf("reporting", "opinion_and_filing"),
        leaf("reporting", "statutory_reporting"),
        leaf("reporting", "documentation_archival"),
      ],
    },
  ],
}

// ---- CostConfig ----

export const costConfig: CostConfig = {
  name: "Superaudit",
  default_allocation: 0.8,
  role_rates: [
    { role: "Engagement Partner",    cost_per_hour: 3_200 },  // 10× EY EP ($320)
    { role: "EQR Partner",           cost_per_hour: 3_200 },  // 10× EY EQR ($320)
    { role: "Engagement Manager",    cost_per_hour: 1_650 },  // 10× EY SM ($165)
    { role: "Senior Auditor",        cost_per_hour: 700 },    // 10× EY Senior ($70)
    { role: "AI Engineer",           cost_per_hour: 500 },    // ~$1M TC, leading AI lab benchmark
    { role: "Walkthrough Specialist", cost_per_hour: 1_300 }, // 10× EY Specialist ($130)
    { role: "Tax Specialist",        cost_per_hour: 1_300 },  // 10× EY Specialist ($130)
    { role: "Valuation Specialist",  cost_per_hour: 1_300 },  // 10× EY Specialist ($130)
    { role: "IT Audit Specialist",   cost_per_hour: 1_300 },  // 10× EY Specialist ($130)
    { role: "Component Partner",     cost_per_hour: 3_200 },  // 10× EY EP ($320)
    { role: "Component Senior",      cost_per_hour: 700 },    // 10× EY Senior ($70)
    { role: "Documentation Lead",    cost_per_hour: 520 },    // 10× EY Staff ($52)
  ],
  overhead: {
    categories: [
      { name: "Technology",  rate: 0.40, description: "Cloud infrastructure, LLM API costs, AI platform development amortized across all entities" },
      { name: "Insurance",   rate: 0.30, description: "Professional liability — startup premium, Fortune 50 client risk, multi-entity coverage" },
      { name: "Regulatory",  rate: 0.25, description: "PCAOB + 8 national regulator registrations, quality control, multi-jurisdiction inspections" },
      { name: "Admin",       rate: 0.20, description: "Multi-jurisdiction payroll, intercompany accounting, local legal counsel, HR, entity tax filings" },
      { name: "Quality",     rate: 0.10, description: "Internal quality review, methodology development, PCAOB inspection preparation" },
      { name: "Facilities",  rate: 0.08, description: "Co-working or small offices in 8+ jurisdictions — not Big 4 towers" },
      { name: "Travel",      rate: 0.07, description: "30 retail store visits, component coordination visits, client site travel" },
      { name: "Training",    rate: 0.05, description: "CPE, platform training, onboarding for ~44 people across entities" },
    ],
    total_rate: 1.45,
    engagements_amortized: 1,
  },
}
