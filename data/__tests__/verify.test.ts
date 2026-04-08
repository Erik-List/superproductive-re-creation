import { describe, test, expect } from "vitest"
import type { Workflow, WorkflowCost, CostConfig } from "../types"
import { computeCost, validateAllocation, getWorkerType, getHeadcount } from "../types"
import { workflow as eyWorkflow } from "../ey/workflow"
import { engagementCost as eyCost, costConfig as eyConfig } from "../ey/cost"
import { workflow as scWorkflow } from "../superaudit/workflow"
import { engagementCost as scCost, costConfig as scConfig } from "../superaudit/cost"
import { requirements } from "../requirements"

// ---- Helpers ----

function collectLeaves(w: Workflow): Workflow[] {
  if (!w.sub_workflows?.length) return [w]
  return w.sub_workflows.flatMap(collectLeaves)
}

function collectAll(w: Workflow): Workflow[] {
  return [w, ...(w.sub_workflows ?? []).flatMap(collectAll)]
}

function collectAllCosts(wc: WorkflowCost): WorkflowCost[] {
  return [wc, ...(wc.sub_workflow_costs ?? []).flatMap(collectAllCosts)]
}

// ---- Engagement test data ----

const engagements = [
  {
    name: "EY",
    engagement: eyWorkflow,
    engagementCost: eyCost,
    costConfig: eyConfig,
    expectedHoursRange: [160_000, 230_000],
    expectedCostRange: [15_000_000, 50_000_000],
    expectedHeadcountRange: [250, 600],
  },
  {
    name: "Superaudit",
    engagement: scWorkflow,
    engagementCost: scCost,
    costConfig: scConfig,
    expectedHoursRange: [3_000, 6_000],
    expectedCostRange: [10_000_000, 18_000_000],
    expectedHeadcountRange: [30, 100],
  },
]

// ---- Tests ----

describe.each(engagements)("$name engagement", ({
  engagement, engagementCost, costConfig,
  expectedHoursRange, expectedCostRange, expectedHeadcountRange,
}) => {
  const computed = computeCost(engagementCost, costConfig)
  const allWorkflows = collectAll(engagement)
  const leaves = collectLeaves(engagement)
  const allCosts = collectAllCosts(computed)
  const parentCosts = allCosts.filter(wc => wc.sub_workflow_costs?.length)

  // --- Structural ---

  describe("structural", () => {
    test("WorkflowCost tree mirrors Workflow tree", () => {
      function checkMirror(wc: WorkflowCost, w: Workflow): void {
        expect(wc.workflow.id).toBe(w.id)
        const wcChildren = wc.sub_workflow_costs ?? []
        const wChildren = w.sub_workflows ?? []
        expect(wcChildren.length).toBe(wChildren.length)
        for (let i = 0; i < Math.min(wcChildren.length, wChildren.length); i++) {
          checkMirror(wcChildren[i], wChildren[i])
        }
      }
      checkMirror(engagementCost, engagement)
    })

    test("parent timing spans children", () => {
      const parents = allWorkflows.filter(w => w.sub_workflows?.length)
      for (const p of parents) {
        const childTimings = p.sub_workflows!.filter(c => c.timing).map(c => c.timing!)
        if (!childTimings.length || !p.timing) continue
        const minStart = Math.min(...childTimings.map(t => t.start))
        const maxEnd = Math.max(...childTimings.map(t => t.end))
        expect(p.timing.start, `${p.id}: start`).toBeLessThanOrEqual(minStart)
        expect(p.timing.end, `${p.id}: end`).toBeGreaterThanOrEqual(maxEnd)
      }
    })

    test("no dangling inputs", () => {
      const EXTERNAL = new Set([
        "PriorYearFile", "PublicFilings", "IndustryContext", "FinancialData",
        "EntityStructure", "GovernanceDocuments", "ControlDocumentation",
        "ControlPopulationData", "ComponentWorkpapers",
      ])
      const allOutputs = new Set<string>()
      for (const w of allWorkflows) for (const o of w.outputs ?? []) allOutputs.add(o)
      for (const w of allWorkflows) {
        for (const inp of w.inputs ?? []) {
          expect(allOutputs.has(inp) || EXTERNAL.has(inp), `${w.id} requires "${inp}"`).toBe(true)
        }
      }
    })

    test("no DAG cycles", () => {
      const outputToProducer = new Map<string, string[]>()
      for (const w of allWorkflows) for (const o of w.outputs ?? []) {
        if (!outputToProducer.has(o)) outputToProducer.set(o, [])
        outputToProducer.get(o)!.push(w.id)
      }
      const adj = new Map<string, Set<string>>()
      for (const w of allWorkflows) {
        adj.set(w.id, new Set())
        for (const inp of w.inputs ?? []) {
          for (const producer of outputToProducer.get(inp) ?? []) {
            if (producer !== w.id) adj.get(w.id)!.add(producer)
          }
        }
      }
      const WHITE = 0, GRAY = 1, BLACK = 2
      const color = new Map<string, number>()
      for (const w of allWorkflows) color.set(w.id, WHITE)
      const cycles: string[] = []
      const stack: string[] = []
      function dfs(u: string) {
        color.set(u, GRAY); stack.push(u)
        for (const v of adj.get(u) ?? []) {
          if (color.get(v) === GRAY) cycles.push(stack.slice(stack.indexOf(v)).join(" → "))
          else if (color.get(v) === WHITE) dfs(v)
        }
        stack.pop(); color.set(u, BLACK)
      }
      for (const w of allWorkflows) if (color.get(w.id) === WHITE) dfs(w.id)
      expect(cycles, `Cycles found: ${cycles.join("; ")}`).toHaveLength(0)
    })

    test("overhead categories sum to total_rate", () => {
      const categorySum = costConfig.overhead.categories.reduce((s, c) => s + c.rate, 0)
      expect(Math.abs(costConfig.overhead.total_rate - categorySum)).toBeLessThan(0.002)
    })

    test("unique IDs across engagement", () => {
      const ids = allWorkflows.map(w => w.id)
      const dupes = ids.filter((id, i) => ids.indexOf(id) !== i)
      expect(dupes, `Duplicate IDs: ${dupes.join(", ")}`).toHaveLength(0)
    })
  })

  // --- Per-leaf ---

  describe("per-leaf", () => {
    const leafData = leaves.map(l => ({ id: l.id, leaf: l }))

    describe.each(leafData)("$id", ({ leaf }) => {
      test("has agents (human and/or ai)", () => {
        const hasHuman = leaf.agents.human?.team && Object.keys(leaf.agents.human.team).length > 0
        const hasAi = !!leaf.agents.ai
        expect(hasHuman || hasAi, "no agents defined").toBe(true)
      })

      test("all team roles exist in CostConfig", () => {
        const configRoles = new Set(costConfig.role_rates.map(r => r.role))
        if (!leaf.agents.human?.team) return
        for (const role of Object.keys(leaf.agents.human.team)) {
          expect(configRoles.has(role), `role "${role}" not in CostConfig`).toBe(true)
        }
      })

      test("allocation ∈ (0, 1] for all roles", () => {
        if (!leaf.agents.human?.team) return
        for (const [role, alloc] of Object.entries(leaf.agents.human.team)) {
          if (typeof alloc === "object") {
            expect(alloc.allocation, `${role} allocation`).toBeGreaterThan(0)
            expect(alloc.allocation, `${role} allocation`).toBeLessThanOrEqual(1)
          }
        }
      })

      test("count > 0 for all roles", () => {
        if (!leaf.agents.human?.team) return
        for (const [role, alloc] of Object.entries(leaf.agents.human.team)) {
          const count = typeof alloc === "number" ? alloc : alloc.count
          expect(count, `${role} count`).toBeGreaterThan(0)
        }
      })

      test("has timing with start < end", () => {
        expect(leaf.timing, "missing timing").toBeDefined()
        if (leaf.timing) {
          expect(leaf.timing.end, "end must be > start").toBeGreaterThan(leaf.timing.start)
        }
      })
    })
  })

  // --- Allocation ---

  describe("allocation", () => {
    test("no role over-allocated in any week", () => {
      const report = validateAllocation(engagement, costConfig)
      if (!report.valid) {
        const summary = report.violations.slice(0, 5).map(v =>
          `week ${v.week}: ${v.role} allocated=${v.allocated}, available=${v.available}`
        ).join("; ")
        expect.fail(`${report.violations.length} violations: ${summary}`)
      }
    })
  })

  // --- Cost fractals ---

  describe("cost", () => {
    test("cost fractal: parent total = sum(children)", () => {
      for (const p of parentCosts) {
        const childTotal = p.sub_workflow_costs!.reduce((s, c) => s + c.total, 0)
        expect(Math.abs(p.total - childTotal), `${p.workflow.id}`).toBeLessThan(0.01)
      }
    })

    test("hours fractal: parent computed_hours = sum(children)", () => {
      for (const p of parentCosts) {
        const childHours = p.sub_workflow_costs!.reduce((s, c) => s + c.computed_hours, 0)
        expect(Math.abs(p.computed_hours - childHours), `${p.workflow.id}`).toBeLessThan(0.01)
      }
    })

    test("total cost in plausible range", () => {
      expect(computed.total).toBeGreaterThan(expectedCostRange[0])
      expect(computed.total).toBeLessThan(expectedCostRange[1])
    })

    test("computed hours in plausible range", () => {
      expect(computed.computed_hours).toBeGreaterThan(expectedHoursRange[0])
      expect(computed.computed_hours).toBeLessThan(expectedHoursRange[1])
    })
  })

  // --- PCAOB ---

  describe("pcaob", () => {
    test("all requirement_ids reference valid IDs", () => {
      const validIds = new Set(requirements.map(r => r.id))
      for (const w of allWorkflows) {
        for (const rid of w.requirement_ids ?? []) {
          expect(validIds.has(rid), `${w.id} references unknown: ${rid}`).toBe(true)
        }
      }
    })

    test("all requirements covered by at least one workflow", () => {
      const covered = new Set<string>()
      for (const w of allWorkflows) {
        for (const rid of w.requirement_ids ?? []) covered.add(rid)
      }
      const missing = requirements.map(r => r.id).filter(id => !covered.has(id))
      expect(missing, `Missing: ${missing.join(", ")}`).toHaveLength(0)
    })
  })

  // --- Apple-specific ---

  describe("apple-specific", () => {
    test("no manufacturing-primary language", () => {
      const mfgTerms = ["inventory observation", "manufacturing cost", "factory walkthrough", "production cost accounting"]
      for (const w of allWorkflows) {
        const desc = w.description.toLowerCase()
        for (const term of mfgTerms) {
          if (desc.includes(term)) {
            expect(
              desc.includes("no ") || desc.includes("not ") || desc.includes("contract"),
              `${w.id}: contains "${term}" without negation/qualification`
            ).toBe(true)
          }
        }
      }
    })
  })

  // --- Headcount ---

  describe("headcount", () => {
    test("roster headcount in plausible range", () => {
      const hc = getHeadcount(engagement)
      expect(hc).toBeGreaterThanOrEqual(expectedHeadcountRange[0])
      expect(hc).toBeLessThanOrEqual(expectedHeadcountRange[1])
    })
  })

  // --- DAG timing ---

  describe("dag-timing", () => {
    test("all leaf inputs are available before consumer starts", () => {
      // Build output→producer timing map from all leaves
      const outputTiming = new Map<string, number>() // output name → earliest end time
      for (const w of leaves) {
        if (!w.timing || !w.outputs) continue
        for (const out of w.outputs) {
          const existing = outputTiming.get(out)
          if (existing === undefined || w.timing.end < existing) {
            outputTiming.set(out, w.timing.end)
          }
        }
      }

      // Also collect parent-level outputs (they aggregate children)
      for (const w of allWorkflows) {
        if (w.sub_workflows?.length && w.outputs) {
          // Parent output is available when its last child finishes
          const childEnds = w.sub_workflows
            .filter(c => c.timing)
            .map(c => c.timing!.end)
          if (childEnds.length) {
            const parentEnd = Math.max(...childEnds)
            for (const out of w.outputs) {
              const existing = outputTiming.get(out)
              if (existing === undefined || parentEnd < existing) {
                outputTiming.set(out, parentEnd)
              }
            }
          }
        }
      }

      const EXTERNAL = new Set([
        "PriorYearFile", "PublicFilings", "IndustryContext", "FinancialData",
        "EntityStructure", "GovernanceDocuments", "ControlDocumentation",
        "ControlPopulationData", "ComponentWorkpapers",
      ])

      const violations: string[] = []
      for (const w of leaves) {
        if (!w.timing || !w.inputs) continue
        for (const inp of w.inputs) {
          if (EXTERNAL.has(inp)) continue
          const producerEnd = outputTiming.get(inp)
          if (producerEnd === undefined) continue // dangling input checked elsewhere
          if (w.timing.start < producerEnd) {
            const gap = producerEnd - w.timing.start
            // Allow up to 1 week pipeline overlap (standard rolling-start)
            if (gap > 1) {
              violations.push(`${w.id} starts week ${w.timing.start} but needs "${inp}" (available week ${producerEnd}, gap: ${gap.toFixed(1)}w)`)
            }
          }
        }
      }
      expect(violations, `DAG timing violations (>1w gap):\n${violations.join("\n")}`).toHaveLength(0)
    })
  })
})
