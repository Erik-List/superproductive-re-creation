import type { WorkflowCost, CostConfig } from "../types"
import { workflow } from "./workflow"

// ============================================================
// EY COST MODEL (Apple FY25)
// WorkflowCost tree (wraps workflow tree) + CostConfig
// ============================================================
//
// Team composition and AI costs now live on the Workflow (agents field).
// This file defines the WorkflowCost tree structure (for computeCost to fill)
// and the CostConfig (role rates + overhead).

// Helper to find sub-workflows by id
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

    // Risk & Scoping
    {
      workflow: sw("risk_scoping"),
      computed_hours: 0, role_hours: {},
      direct_human: 0, direct_ai: 0, overhead: 0, total: 0,
      sub_workflow_costs: [
        leaf("risk_scoping", "risk_assessment"),
        leaf("risk_scoping", "materiality"),
        leaf("risk_scoping", "account_scoping"),
        leaf("risk_scoping", "component_scoping"),
      ],
    },

    // Control Audit
    {
      workflow: sw("control_audit"),
      computed_hours: 0, role_hours: {},
      direct_human: 0, direct_ai: 0, overhead: 0, total: 0,
      sub_workflow_costs: [
        leaf("control_audit", "preliminary_control_id"),
        leaf("control_audit", "walkthroughs"),
        leaf("control_audit", "key_control_finalization"),
        leaf("control_audit", "design_effectiveness"),
        leaf("control_audit", "operating_effectiveness"),
        leaf("control_audit", "year_end_close"),
        leaf("control_audit", "deficiency_evaluation"),
      ],
    },

    // Substantive Testing
    {
      workflow: sw("substantive"),
      computed_hours: 0, role_hours: {},
      direct_human: 0, direct_ai: 0, overhead: 0, total: 0,
      sub_workflow_costs: [
        leaf("substantive", "interim_substantive"),
        leaf("substantive", "final_substantive"),
        leaf("substantive", "fraud_assessment"),
        leaf("substantive", "adjustments"),
      ],
    },

    // Specialist Work
    {
      workflow: sw("specialist"),
      computed_hours: 0, role_hours: {},
      direct_human: 0, direct_ai: 0, overhead: 0, total: 0,
      sub_workflow_costs: [
        leaf("specialist", "itgc_testing"),
        leaf("specialist", "valuation_specialist"),
        leaf("specialist", "tax_specialist"),
        leaf("specialist", "actuarial_specialist"),
      ],
    },

    // Reporting
    {
      workflow: sw("reporting"),
      computed_hours: 0, role_hours: {},
      direct_human: 0, direct_ai: 0, overhead: 0, total: 0,
      sub_workflow_costs: [
        leaf("reporting", "final_analytics"),
        leaf("reporting", "eqr"),
        leaf("reporting", "audit_committee"),
        leaf("reporting", "opinion"),
        leaf("reporting", "sec_filing"),
        leaf("reporting", "national_office"),
        leaf("reporting", "mgmt_letter"),
      ],
    },
  ],
}

// ---- CostConfig ----

// EY direct labor cost per hour: salary + benefits + payroll taxes (~1.3x base salary)
// divided by ~2,000 billable hours/year.
// Sources: Glassdoor, Levels.fyi, Big4Transparency, Going Concern, EY Transparency Report
export const costConfig: CostConfig = {
  name: "EY",
  default_allocation: 0.8,
  role_rates: [
    { role: "Engagement Partner", cost_per_hour: 320 },
    { role: "EQR Partner",        cost_per_hour: 320 },
    { role: "Senior Manager",     cost_per_hour: 165 },
    { role: "Manager",            cost_per_hour: 100 },
    { role: "Senior",             cost_per_hour: 70 },
    { role: "Staff",              cost_per_hour: 52 },
    { role: "GDS/Offshore",       cost_per_hour: 22 },
    { role: "Specialist",         cost_per_hour: 130 },
  ],
  overhead: {
    categories: [
      { name: "Technology",      rate: 0.20, description: "EY Canvas platform, Helix analytics, data extraction tools. EY invests $1B+ annually in audit technology." },
      { name: "Facilities",      rate: 0.15, description: "Office space, utilities, equipment across major markets" },
      { name: "Travel",          rate: 0.08, description: "Client site travel, component visits, international coordination" },
      { name: "Insurance",       rate: 0.18, description: "Professional liability insurance — mega-caps carry highest risk weighting" },
      { name: "Quality",         rate: 0.20, description: "Professional Practice consultations, methodology development, PCAOB inspection readiness, independence monitoring" },
      { name: "Training",        rate: 0.08, description: "Mandatory CPE, EY Badges, specialist certifications, onboarding" },
      { name: "Admin",           rate: 0.10, description: "HR, finance, legal, recruitment, engagement management" },
      { name: "Partner equity",  rate: 0.31, description: "Partner profit distributions beyond draw. Audit partners earn $500K-1.5M total; draw is ~40-60% of total economics." },
    ],
    total_rate: 1.30,
    engagements_amortized: 1,
  },
}
