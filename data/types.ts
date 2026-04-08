// ============================================================
// Shared workflow model — used by both ey/ and superaudit/
// ============================================================

// ---- Agents: who does the work ----

export type RoleAllocation = {
  count: number          // headcount
  allocation: number     // 0-1, fraction of 40h/week allocated to this workflow
}

export type Agents = {
  human?: {
    team: Record<string, number | RoleAllocation>
    // Root engagement: plain numbers = total available headcount (roster)
    //   e.g. { "Partner": 2, "Senior Manager": 6 }
    // Leaf workflows: RoleAllocation = who's on this + how much
    //   e.g. { "Partner": { count: 1, allocation: 0.3 },
    //          "Manager": { count: 3, allocation: 0.9 } }
  }
  ai?: {
    cost_usd: number
  }
}

// ---- Workflow: pure work structure ----

export type Workflow = {
  id: string
  name: string
  description: string

  // Fractal nesting
  sub_workflows?: Workflow[]

  // I/O for DAG inference (matched by type name string)
  inputs?: string[]
  outputs?: string[]

  // Timing (weeks from engagement start)
  timing?: { start: number; end: number }

  // Regulatory requirements this workflow satisfies
  requirement_ids?: string[]

  // Who does the work — team composition + AI compute
  agents: Agents
}

// ---- WorkflowCost: wraps a Workflow with computed cost data ----

export type WorkflowCost = {
  workflow: Workflow

  // All computed by computeCost
  computed_hours: number                 // human hours from team × timing × allocation
  role_hours: Record<string, number>     // hours per role
  direct_human: number
  direct_ai: number
  overhead: number
  total: number

  // Fractal nesting — mirrors workflow.sub_workflows
  sub_workflow_costs?: WorkflowCost[]
}

// ---- CostConfig: engagement-wide pricing ----

export type CostConfig = {
  name: string
  role_rates: { role: string; cost_per_hour: number }[]
  default_allocation: number   // fallback if leaf uses plain number instead of RoleAllocation
  overhead: {
    categories: { name: string; rate: number; description: string }[]
    total_rate: number
    engagements_amortized: number
  }
}

// ---- Requirement ----

export type Requirement = {
  id: string
  description: string
  source: string
}

// ---- Computed metrics (for comparison page) ----

export type EngagementMetrics = {
  total_cost: number
  labor_hours: number
  duration_weeks: number
  humans_required: number
}

// ---- Helpers ----

export function getWorkerType(w: Workflow): "ai" | "human" | "ai_human" {
  const hasHuman = !!w.agents.human?.team && Object.keys(w.agents.human.team).length > 0
  const hasAi = !!w.agents.ai
  if (hasHuman && hasAi) return "ai_human"
  if (hasAi) return "ai"
  return "human"
}

export function getHeadcount(w: Workflow): number {
  if (!w.agents.human?.team) return 0
  let total = 0
  for (const alloc of Object.values(w.agents.human.team)) {
    total += typeof alloc === "number" ? alloc : alloc.count
  }
  return total
}

function mergeRoleHours(children: WorkflowCost[]): Record<string, number> {
  const merged: Record<string, number> = {}
  for (const c of children) {
    for (const [role, hrs] of Object.entries(c.role_hours)) {
      merged[role] = (merged[role] ?? 0) + hrs
    }
  }
  return merged
}

// ---- Cost computation (recursive, fractal) ----

export function computeCost(wc: WorkflowCost, config: CostConfig): WorkflowCost {
  if (wc.sub_workflow_costs) {
    const computed = wc.sub_workflow_costs.map(c => computeCost(c, config))
    return {
      ...wc,
      sub_workflow_costs: computed,
      computed_hours: computed.reduce((s, c) => s + c.computed_hours, 0),
      role_hours: mergeRoleHours(computed),
      direct_human: computed.reduce((s, c) => s + c.direct_human, 0),
      direct_ai: computed.reduce((s, c) => s + c.direct_ai, 0),
      overhead: computed.reduce((s, c) => s + c.overhead, 0),
      total: computed.reduce((s, c) => s + c.total, 0),
    }
  }

  const { agents, timing } = wc.workflow
  const weeks = (timing?.end ?? 0) - (timing?.start ?? 0)

  // Compute per-role hours from team × weeks × 40h × allocation
  const role_hours: Record<string, number> = {}
  if (agents.human?.team) {
    for (const [role, alloc] of Object.entries(agents.human.team)) {
      const { count, allocation } =
        typeof alloc === "number"
          ? { count: alloc, allocation: config.default_allocation }
          : alloc
      role_hours[role] = count * weeks * 40 * allocation
    }
  }
  const computed_hours = Object.values(role_hours).reduce((a, b) => a + b, 0)

  // Cost from role hours × rates
  const rateMap = Object.fromEntries(config.role_rates.map(r => [r.role, r.cost_per_hour]))
  const direct_human = Object.entries(role_hours)
    .reduce((s, [role, hrs]) => s + hrs * (rateMap[role] ?? 0), 0)
  const direct_ai = agents.ai?.cost_usd ?? 0

  const effectiveRate = config.overhead.total_rate / config.overhead.engagements_amortized
  const overhead = (direct_human + direct_ai) * effectiveRate

  return {
    ...wc,
    computed_hours,
    role_hours,
    direct_human,
    direct_ai,
    overhead,
    total: direct_human + direct_ai + overhead,
  }
}

// ---- Allocation validation ----

export type AllocationEntry = {
  week: number
  role: string
  allocated: number
  available: number
  overAllocated: boolean
}

export type AllocationReport = {
  entries: AllocationEntry[]
  valid: boolean
  violations: AllocationEntry[]
}

function collectLeaves(w: Workflow): Workflow[] {
  if (!w.sub_workflows?.length) return [w]
  return w.sub_workflows.flatMap(collectLeaves)
}

export function validateAllocation(root: Workflow, config: CostConfig): AllocationReport {
  // Extract roster from root
  const roster: Record<string, number> = {}
  if (root.agents.human?.team) {
    for (const [role, val] of Object.entries(root.agents.human.team)) {
      roster[role] = typeof val === "number" ? val : val.count
    }
  }

  // Collect all leaves with timing + team
  const leaves = collectLeaves(root).filter(w => w.timing && w.agents.human?.team)

  // Find time range
  const starts = leaves.map(w => w.timing!.start)
  const ends = leaves.map(w => w.timing!.end)
  if (!starts.length) return { entries: [], valid: true, violations: [] }
  const minWeek = Math.floor(Math.min(...starts))
  const maxWeek = Math.ceil(Math.max(...ends))

  const entries: AllocationEntry[] = []

  for (let week = minWeek; week < maxWeek; week++) {
    // Sum allocation per role across active leaves
    const allocated: Record<string, number> = {}
    for (const leaf of leaves) {
      if (leaf.timing!.start <= week && week < leaf.timing!.end) {
        for (const [role, alloc] of Object.entries(leaf.agents.human!.team)) {
          const { count, allocation } =
            typeof alloc === "number"
              ? { count: alloc, allocation: config.default_allocation }
              : alloc
          allocated[role] = (allocated[role] ?? 0) + count * allocation
        }
      }
    }

    // Compare to roster
    for (const [role, amount] of Object.entries(allocated)) {
      const available = roster[role] ?? 0
      entries.push({
        week,
        role,
        allocated: Math.round(amount * 100) / 100,
        available,
        overAllocated: amount > available + 0.001,
      })
    }
  }

  const violations = entries.filter(e => e.overAllocated)
  return { entries, valid: violations.length === 0, violations }
}

// ---- Metrics extraction (for comparison page) ----

function computeTiming(w: Workflow): { start: number; end: number } {
  if (w.timing) return w.timing
  if (!w.sub_workflows?.length) return { start: 0, end: 0 }
  const childTimings = w.sub_workflows.map(computeTiming)
  return {
    start: Math.min(...childTimings.map(t => t.start)),
    end: Math.max(...childTimings.map(t => t.end)),
  }
}

export function computeMetrics(wc: WorkflowCost): EngagementMetrics {
  const timing = computeTiming(wc.workflow)
  return {
    total_cost: wc.total,
    labor_hours: wc.computed_hours,
    duration_weeks: timing.end - timing.start,
    humans_required: getHeadcount(wc.workflow),
  }
}
