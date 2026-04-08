import { useState } from "react"
import { computeCost, computeMetrics } from "../data/types"
import type { WorkflowCost, Requirement } from "../data/types"
import { engagementCost as eyCost, costConfig as eyConfig } from "../data/ey/cost"
import { engagementCost as scCost, costConfig as scConfig } from "../data/superaudit/cost"
import { requirementById } from "../data/requirements"
import { t } from "./theme"

export { t } from "./theme"

// ============================================================
// DATA
// ============================================================

export const eyCosted = computeCost(eyCost, eyConfig)
export const scCosted = computeCost(scCost, scConfig)
export const eyMetrics = computeMetrics(eyCosted)
export const scMetrics = computeMetrics(scCosted)

// ============================================================
// FORMAT HELPERS
// ============================================================

const fmtCost = (n: number) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n.toFixed(0)}`
}
const fmtHours = (n: number) => {
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return `${n.toFixed(0)}`
}
const fmtMonths = (weeks: number) => `${(weeks / 4.33).toFixed(1)} mo`
const pctReduction = (baseline: number, sc: number) =>
  Math.round((1 - sc / baseline) * 100)

// ============================================================
// SECTION 1 — HOOK
// ============================================================

export function Thesis({ isMobile }: { isMobile: boolean }) {
  const costReduction = pctReduction(eyMetrics.total_cost, scMetrics.total_cost)
  const hoursReduction = pctReduction(eyMetrics.labor_hours, scMetrics.labor_hours)
  const headcountReduction = pctReduction(eyMetrics.humans_required, scMetrics.humans_required)
  const durationReduction = pctReduction(eyMetrics.duration_weeks, scMetrics.duration_weeks)

  const metrics = [
    { value: `${costReduction}%`, label: "cost reduction" },
    { value: `${hoursReduction}%`, label: "fewer labor hours" },
    { value: `${headcountReduction}%`, label: "fewer people" },
    { value: `${durationReduction}%`, label: "faster" },
  ]

  const eyHoursK = `${Math.round(eyMetrics.labor_hours / 1000).toLocaleString()},000`

  return (
    <section style={{ textAlign: "center", paddingBottom: isMobile ? 12 : 28 }}>
      {/* Thesis */}
      <h1 style={{
        fontFamily: t.serif,
        fontSize: isMobile ? 20 : 24,
        fontWeight: 400,
        fontStyle: "italic",
        lineHeight: 1.55,
        color: t.text,
        maxWidth: 660,
        margin: "0 auto 16px",
      }}>
        What happens when you recreate a {fmtCost(eyMetrics.total_cost)}, {eyHoursK}-hour, {eyMetrics.humans_required}-person workflow with current AI model capabilities?
      </h1>

      {/* Apple subtitle */}
      <p style={{
        fontFamily: t.serif,
        fontSize: 15,
        color: t.muted,
        fontWeight: 400,
        fontStyle: "normal",
        textAlign: "center",
        margin: isMobile ? "0 auto 28px" : "0 auto 52px",
      }}>
        Apple&rsquo;s annual audit workflow, but recreated for the current models
      </p>

      {/* Headline numbers */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
        maxWidth: isMobile ? undefined : 680,
        margin: isMobile ? "0 auto 20px" : "0 auto 44px",
        rowGap: isMobile ? 24 : 0,
      }}>
        {metrics.map((m, i) => (
          <div
            key={m.label}
            style={{
              padding: isMobile ? "0 16px" : "0 20px",
              borderLeft: isMobile
                ? (i % 2 === 1 ? `1px solid ${t.border}` : "none")
                : (i > 0 ? `1px solid ${t.border}` : "none"),
            }}
          >
            <div style={{
              fontFamily: t.mono,
              fontSize: isMobile ? 32 : 40,
              fontWeight: 700,
              color: t.text,
              letterSpacing: "-0.03em",
              lineHeight: 1,
            }}>
              {m.value}
            </div>
            <div style={{
              fontFamily: t.serif,
              fontSize: 13,
              color: t.muted,
              marginTop: 10,
              fontWeight: 400,
              lineHeight: 1.3,
            }}>
              {m.label}
            </div>
          </div>
        ))}
      </div>

    </section>
  )
}

// ============================================================
// SECTION 3 — SCALE CONTRAST
// ============================================================

const contrastRows = [
  {
    label: "Total Cost",
    ey: eyMetrics.total_cost,
    sc: scMetrics.total_cost,
    format: fmtCost,
  },
  {
    label: "Labor Hours",
    ey: eyMetrics.labor_hours,
    sc: scMetrics.labor_hours,
    format: fmtHours,
  },
  {
    label: "People",
    ey: eyMetrics.humans_required,
    sc: scMetrics.humans_required,
    format: (n: number) => `${n}`,
  },
  {
    label: "Duration",
    ey: eyMetrics.duration_weeks,
    sc: scMetrics.duration_weeks,
    format: fmtMonths,
  },
]

export function WorkflowComparison({ isMobile, eyOnly }: { isMobile: boolean; eyOnly?: boolean }) {
  if (isMobile) {
    return (
      <section style={{ paddingTop: 0, paddingBottom: 24 }}>
        {contrastRows.map((row, rowIndex) => {
          const reduction = pctReduction(row.ey, row.sc)
          const barPct = Math.max((row.sc / row.ey) * 100, 1.5)
          const isFirst = rowIndex === 0

          return (
            <div key={row.label} style={{
              padding: "18px 0",
              borderBottom: `1px solid ${t.border}`,
            }}>
              {/* Row label + reduction badge */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: 12,
              }}>
                <span style={{
                  fontFamily: t.serif,
                  fontSize: 13,
                  color: t.muted,
                  fontWeight: 500,
                }}>
                  {row.label}
                </span>
                {!eyOnly && (
                  <div style={{
                    fontFamily: t.mono,
                    fontSize: 12,
                    fontWeight: 600,
                    color: t.accent,
                    background: t.accentSubtle,
                    padding: "3px 8px",
                    borderRadius: 4,
                    letterSpacing: "-0.01em",
                  }}>
                    -{reduction}%
                  </div>
                )}
              </div>

              {/* EY row */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: 6,
              }}>
                {isFirst && (
                  <span style={{
                    fontFamily: t.mono,
                    fontSize: 9,
                    fontWeight: 500,
                    color: t.text,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}>
                    Ernst & Young
                  </span>
                )}
                {!isFirst && <span />}
                <span style={{
                  fontFamily: t.mono,
                  fontSize: 16,
                  fontWeight: 600,
                  color: t.text,
                  letterSpacing: "-0.02em",
                }}>
                  {row.format(row.ey)}
                </span>
              </div>
              <div style={{
                width: "100%",
                height: 3,
                background: t.text,
                opacity: 0.15,
                borderRadius: 1.5,
                marginBottom: eyOnly ? 0 : 10,
              }} />

              {/* SC row */}
              {!eyOnly && (
                <>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    marginBottom: 6,
                  }}>
                    {isFirst && (
                      <span style={{
                        fontFamily: t.mono,
                        fontSize: 9,
                        fontWeight: 500,
                        color: t.accent,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}>
                        Fictional AI Company (Superaudit)
                      </span>
                    )}
                    {!isFirst && <span />}
                    <span style={{
                      fontFamily: t.mono,
                      fontSize: 16,
                      fontWeight: 700,
                      color: t.accent,
                      letterSpacing: "-0.02em",
                    }}>
                      {row.format(row.sc)}
                    </span>
                  </div>
                  <div style={{
                    width: "100%",
                    height: 3,
                    background: t.border,
                    borderRadius: 1.5,
                    position: "relative",
                    overflow: "hidden",
                  }}>
                    <div style={{
                      width: `${barPct}%`,
                      height: "100%",
                      background: t.accent,
                      borderRadius: 1.5,
                    }} />
                  </div>
                </>
              )}
            </div>
          )
        })}
      </section>
    )
  }

  return (
    <section style={{ paddingTop: 0, paddingBottom: 48 }}>
      {/* Header row */}
      <div style={{
        display: "grid",
        gridTemplateColumns: eyOnly ? "140px 1fr" : "140px 1fr 1fr auto",
        alignItems: "baseline",
        paddingBottom: 14,
        borderBottom: `1px solid ${t.border}`,
        marginBottom: 0,
      }}>
        <div />
        <div style={{ ...colHeader, color: t.text }}>Ernst & Young</div>
        {!eyOnly && <div style={{ ...colHeader, color: t.accent }}>Fictional AI Company (Superaudit)</div>}
        {!eyOnly && <div style={{ ...colHeader, textAlign: "right", minWidth: 60 }}>Reduction</div>}
      </div>

      {/* Data rows */}
      {contrastRows.map((row) => {
        const reduction = pctReduction(row.ey, row.sc)
        const barPct = Math.max((row.sc / row.ey) * 100, 1.5)

        return (
          <div
            key={row.label}
            style={{
              display: "grid",
              gridTemplateColumns: eyOnly ? "140px 1fr" : "140px 1fr 1fr auto",
              alignItems: "center",
              padding: "22px 0",
              borderBottom: `1px solid ${t.border}`,
            }}
          >
            {/* Row label */}
            <div style={{
              fontFamily: t.serif,
              fontSize: 14,
              color: t.muted,
              fontWeight: 500,
            }}>
              {row.label}
            </div>

            {/* EY value + bar */}
            <div style={{ paddingRight: 24 }}>
              <div style={{
                fontFamily: t.mono,
                fontSize: 18,
                fontWeight: 600,
                color: t.text,
                letterSpacing: "-0.02em",
                marginBottom: 8,
              }}>
                {row.format(row.ey)}
              </div>
              <div style={{
                width: "100%",
                height: 3,
                background: t.text,
                opacity: 0.15,
                borderRadius: 1.5,
              }} />
            </div>

            {/* SC value + proportional bar */}
            {!eyOnly && (
              <div style={{ paddingRight: 24 }}>
                <div style={{
                  fontFamily: t.mono,
                  fontSize: 18,
                  fontWeight: 700,
                  color: t.accent,
                  letterSpacing: "-0.02em",
                  marginBottom: 8,
                }}>
                  {row.format(row.sc)}
                </div>
                <div style={{
                  width: "100%",
                  height: 3,
                  background: t.border,
                  borderRadius: 1.5,
                  position: "relative",
                  overflow: "hidden",
                }}>
                  <div style={{
                    width: `${barPct}%`,
                    height: "100%",
                    background: t.accent,
                    borderRadius: 1.5,
                  }} />
                </div>
              </div>
            )}

            {/* Reduction badge */}
            {!eyOnly && (
              <div style={{
                fontFamily: t.mono,
                fontSize: 12,
                fontWeight: 600,
                color: t.accent,
                background: t.accentSubtle,
                padding: "4px 10px",
                borderRadius: 4,
                textAlign: "right",
                minWidth: 60,
                letterSpacing: "-0.01em",
              }}>
                -{reduction}%
              </div>
            )}
          </div>
        )
      })}
    </section>
  )
}

const colHeader: React.CSSProperties = {
  fontFamily: t.mono,
  fontSize: 10,
  fontWeight: 500,
  color: t.mutedLight,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
}

export function findWorkflow(wc: WorkflowCost, id: string): WorkflowCost | null {
  if (wc.workflow.id === id) return wc
  for (const sub of wc.sub_workflow_costs || []) {
    const found = findWorkflow(sub, id)
    if (found) return found
  }
  return null
}

// ============================================================
// SECTION 4 — DEPTH
// ============================================================

// ---- Requirement badges (small pills under sub-workflow descriptions) ----

function RequirementBadges({ requirementIds, activeReq, onToggle }: {
  requirementIds: string[]
  activeReq: string | null
  onToggle?: (id: string) => void
}) {
  if (!requirementIds.length) return null
  return (
    <>
      <div style={{
        fontFamily: t.mono,
        fontSize: 9,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        color: t.mutedLight,
        marginLeft: 26,
        marginBottom: 2,
      }}>
        Requirements
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginLeft: 26, marginBottom: 6 }}>
        {requirementIds.map(id => {
          const req = requirementById[id]
          if (!req) return null
          const isActive = activeReq === id
          const isStatic = activeReq === null && !onToggle
          const label = req.source.replace("PCAOB ", "").replace("SOX ", "").split(" /")[0]
          return (
            <span key={id} onClick={onToggle ? (e) => { e.stopPropagation(); onToggle(id) } : undefined} style={{
              fontFamily: t.mono,
              fontSize: 11,
              padding: "3px 8px",
              borderRadius: 10,
              background: isActive ? t.highlightSubtle : isStatic ? `${t.border}30` : `${t.accent}12`,
              color: isActive ? t.highlight : isStatic ? t.muted : t.mutedLight,
              fontWeight: isActive ? 600 : isStatic ? 500 : 400,
              cursor: onToggle ? "pointer" : "default",
              transition: "all 0.15s",
            }}>
              {label}
            </span>
          )
        })}
      </div>
    </>
  )
}

// ---- Requirement strip (cards between headline and columns) ----

function RequirementStrip({ requirements, activeReq, onToggle }: {
  requirements: Requirement[]
  activeReq: string | null
  onToggle: (id: string) => void
}) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 6,
        justifyContent: "center",
      }}>
        {requirements.map(req => {
          const isActive = activeReq === req.id
          const label = req.source.replace("PCAOB ", "").replace("SOX ", "").split(" /")[0]
          return (
            <button
              key={req.id}
              onClick={() => onToggle(req.id)}
              style={{
                fontFamily: t.serif,
                fontSize: 11,
                fontWeight: isActive ? 600 : 400,
                padding: "3px 8px",
                borderRadius: 4,
                border: `1px solid ${isActive ? t.highlight : t.border}`,
                background: isActive ? t.highlightSubtle : "transparent",
                color: isActive ? t.highlight : t.muted,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {label}
            </button>
          )
        })}
      </div>
      {activeReq && requirementById[activeReq] && (
        <div style={{
          marginTop: 12,
          textAlign: "center",
          fontFamily: t.serif,
          fontSize: 12,
          lineHeight: 1.6,
          color: t.muted,
          maxWidth: 520,
          marginLeft: "auto",
          marginRight: "auto",
        }}>
          <span style={{ fontWeight: 600, color: t.text }}>
            {requirementById[activeReq].source}
          </span>
          {": "}
          {requirementById[activeReq].description}
        </div>
      )}
    </div>
  )
}

// ---- Compact tree ----

export function WorkflowTree({ wc, depth, rootLabel, highlightId, descriptions, activeRequirement, showRequirementBadges, onRequirementToggle }: {
  wc: WorkflowCost
  depth: number
  rootLabel?: string
  highlightId?: string
  descriptions?: Record<string, string>
  activeRequirement?: string | null
  showRequirementBadges?: boolean
  onRequirementToggle?: (id: string) => void
}) {
  const hasSubs = wc.sub_workflow_costs && wc.sub_workflow_costs.length > 0
  const desc = descriptions?.[wc.workflow.id]
  const hasExpandableContent = hasSubs || desc
  const [expanded, setExpanded] = useState(depth < 2)
  const hours = fmtHours(wc.computed_hours)
  const isHighlighted = highlightId != null && wc.workflow.id === highlightId

  return (
    <div style={{ marginLeft: depth > 0 ? 16 : 0 }}>
      <div
        onClick={hasExpandableContent ? () => setExpanded(!expanded) : undefined}
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 8,
          padding: "4px 0",
          cursor: hasExpandableContent ? "pointer" : "default",
          userSelect: "none",
        }}
      >
        {hasExpandableContent && (
          <span style={{
            fontFamily: t.mono,
            fontSize: 9,
            color: isHighlighted ? t.highlight : t.mutedLight,
            width: 10,
            flexShrink: 0,
          }}>
            {expanded ? "\u25BC" : "\u25B6"}
          </span>
        )}
        {!hasExpandableContent && <span style={{ width: 10, flexShrink: 0 }} />}
        <span style={{
          fontFamily: t.serif,
          fontSize: depth === 0 ? 13 : 12,
          fontWeight: (depth === 0 || isHighlighted) ? 600 : 400,
          color: isHighlighted ? t.highlight : (depth === 0 ? t.text : t.muted),
          flex: 1,
        }}>
          {depth === 0 && rootLabel ? rootLabel : wc.workflow.name}
        </span>
        <span style={{
          fontFamily: t.mono,
          fontSize: 11,
          color: isHighlighted ? t.highlight : (depth === 0 ? t.text : t.mutedLight),
          fontWeight: (depth === 0 || isHighlighted) ? 600 : 400,
          flexShrink: 0,
        }}>
          {hours}h{depth <= 2 && <> &middot; {fmtCost(wc.total)}</>}
        </span>
      </div>
      {expanded && hasSubs && (
        <div style={{
          borderLeft: `1px solid ${t.border}`,
          marginLeft: 4,
          paddingLeft: 0,
        }}>
          {wc.sub_workflow_costs!.map(sub => (
            <WorkflowTree key={sub.workflow.id} wc={sub} depth={depth + 1} highlightId={highlightId} descriptions={descriptions} activeRequirement={activeRequirement} showRequirementBadges={showRequirementBadges} onRequirementToggle={onRequirementToggle} />
          ))}
        </div>
      )}
      {expanded && desc && !hasSubs && (
        <div style={{
          marginLeft: 26,
          marginTop: 4,
          marginBottom: showRequirementBadges ? 4 : 10,
          fontFamily: t.serif,
          fontSize: 12,
          lineHeight: 1.6,
          color: t.muted,
          border: `1px solid ${t.border}`,
          borderRadius: 6,
          padding: "8px 12px",
        }}>
          {desc}
        </div>
      )}
      {expanded && showRequirementBadges && !hasSubs && wc.workflow.requirement_ids?.length && (
        <RequirementBadges requirementIds={wc.workflow.requirement_ids} activeReq={activeRequirement ?? null} onToggle={onRequirementToggle} />
      )}
    </div>
  )
}

// ---- Schema code ----

const schemaCode = `type Workflow = {
  id: string                          // unique key
  name: string                        // display name
  description: string                 // task summary
  sub_workflows?: Workflow[]          // recursive nesting
  inputs?: string[]                   // upstream data
  outputs?: string[]                  // downstream data
  timing?: { start: number; end: number }  // week range
  requirement_ids?: string[]          // PCAOB standard refs
  agents: Agents                      // human or AI
}

type Agents = {
  human?: {
    team: Record<string, number | RoleAllocation>  // role → allocation
  }
  ai?: {
    cost_usd: number                  // inference cost
  }
}

type RoleAllocation = {
  count: number                       // people in role
  allocation: number                  // share of 40h/wk
}

type WorkflowCost = {
  workflow: Workflow                   // costed workflow
  computed_hours: number              // aggregated hours
  role_hours: Record<string, number>  // hours per role
  direct_human: number                // labor cost
  direct_ai: number                   // AI compute cost
  overhead: number                    // applied overhead
  total: number                       // all-in cost
  sub_workflow_costs?: WorkflowCost[] // recursive costing
}

type CostConfig = {
  name: string                        // engagement name
  role_rates: { role: string; cost_per_hour: number }[]  // hourly rates
  default_allocation: number          // default share
  overhead: {
    categories: { name: string; rate: number }[]  // cost categories
    total_rate: number                // overhead multiplier
    engagements_amortized: number     // amortization base
  }
}`

// ---- Mobile drill-down tree ----

function MobileDrillDownTree({ wc, descriptions, activeRequirement, showRequirementBadges, highlightId, defaultDrillPath, onRequirementToggle }: {
  wc: WorkflowCost
  descriptions?: Record<string, string>
  activeRequirement?: string | null
  showRequirementBadges?: boolean
  highlightId?: string
  defaultDrillPath?: string[]
  onRequirementToggle?: (id: string) => void
}) {
  const [drillPath, setDrillPath] = useState<string[]>(defaultDrillPath ?? [])

  // Walk the drillPath to find the current node
  let current = wc
  for (const id of drillPath) {
    const found = current.sub_workflow_costs?.find(s => s.workflow.id === id)
    if (found) current = found
    else break
  }

  const hasSubs = current.sub_workflow_costs && current.sub_workflow_costs.length > 0
  const desc = descriptions?.[current.workflow.id]

  return (
    <div>
      {/* Breadcrumb / back button */}
      {drillPath.length > 0 && (
        <div
          onClick={() => setDrillPath(drillPath.slice(0, -1))}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "10px 0",
            cursor: "pointer",
            userSelect: "none",
            borderBottom: `1px solid ${t.border}`,
            marginBottom: 4,
          }}
        >
          <span style={{
            fontFamily: t.mono,
            fontSize: 12,
            color: t.mutedLight,
          }}>
            {"\u25C0"}
          </span>
          <span style={{
            fontFamily: t.serif,
            fontSize: 14,
            fontWeight: 600,
            color: t.text,
          }}>
            {current.workflow.name}
          </span>
        </div>
      )}

      {/* Summary line */}
      <div style={{
        padding: "8px 0 12px",
        fontFamily: t.mono,
        fontSize: 11,
        color: t.mutedLight,
      }}>
        {fmtHours(current.computed_hours)}h {"\u00B7"} {fmtCost(current.total)}
      </div>

      {/* Children or leaf content */}
      {hasSubs ? (
        current.sub_workflow_costs!.map(sub => {
          const subHasSubs = sub.sub_workflow_costs && sub.sub_workflow_costs.length > 0
          const subDesc = descriptions?.[sub.workflow.id]
          const canDrill = subHasSubs || subDesc
          const isHighlighted = highlightId != null && sub.workflow.id === highlightId

          return (
            <div
              key={sub.workflow.id}
              onClick={canDrill ? () => setDrillPath([...drillPath, sub.workflow.id]) : undefined}
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                gap: 8,
                padding: "10px 0",
                borderBottom: `1px solid ${t.border}`,
                cursor: canDrill ? "pointer" : "default",
                userSelect: "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                {canDrill && (
                  <span style={{
                    fontFamily: t.mono,
                    fontSize: 9,
                    color: isHighlighted ? t.highlight : t.mutedLight,
                  }}>
                    {"\u25B6"}
                  </span>
                )}
                <span style={{
                  fontFamily: t.serif,
                  fontSize: 13,
                  fontWeight: isHighlighted ? 600 : 400,
                  color: isHighlighted ? t.highlight : t.text,
                }}>
                  {sub.workflow.name}
                </span>
              </div>
              <span style={{
                fontFamily: t.mono,
                fontSize: 11,
                color: isHighlighted ? t.highlight : t.mutedLight,
                fontWeight: isHighlighted ? 600 : 400,
                flexShrink: 0,
              }}>
                {fmtHours(sub.computed_hours)}h {"\u00B7"} {fmtCost(sub.total)}
              </span>
            </div>
          )
        })
      ) : desc ? (
        <div style={{
          fontFamily: t.serif,
          fontSize: 13,
          lineHeight: 1.65,
          color: t.muted,
          padding: "8px 0",
        }}>
          {desc}
          {showRequirementBadges && current.workflow.requirement_ids?.length && (
            <div style={{ marginTop: 8, marginLeft: -26 }}>
              <RequirementBadges requirementIds={current.workflow.requirement_ids} activeReq={activeRequirement ?? null} onToggle={onRequirementToggle} />
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}

export function SingleWorkflowComparison({ isMobile, static: isStatic }: { isMobile: boolean; static?: boolean }) {
  const [activeReq, setActiveReq] = useState<string | null>(isStatic ? null : (isMobile ? "substantive_procedures" : "journal_entry_fraud_testing"))
  const toggleReq = isStatic ? undefined : (id: string) => setActiveReq(activeReq === id ? null : id)
  const eyST = findWorkflow(eyCosted, "substantive")
  const scST = findWorkflow(scCosted, "substantive_testing")
  const parentReqIds = (eyST?.workflow.requirement_ids ?? [])
    .map(id => requirementById[id])
    .filter((r): r is Requirement => r != null)

  const eyDescriptions: Record<string, string> = {
    interim_substantive: "144 staff test interim-period balances (April to June): revenue cut-off, A/R confirmations, deferred revenue rollforward, inventory, cash and investment confirmations, debt confirmations, share buyback transaction testing.",
    final_substantive: "268 staff complete remaining substantive testing through FY-end (September 27): bundled revenue allocation, PP&E existence, legal contingencies, derivatives, consolidation, ASR derivative fair value, treasury stock rollforward, EPS share count, subsequent events.",
    fraud_assessment: "117 staff test for fraud risk across global operations: presumed revenue recognition risk on hardware + services allocation, management override testing, journal entry sampling.",
    adjustments: "42 staff compile misstatements from all locations and evaluate against materiality: contingent liability estimation for active litigation, audit committee communication.",
  }

  const scDescriptions: Record<string, string> = {
    interim_substantive: "12 staff and AI test interim-period balances (April to June): 100% journal entry and A/R confirmation coverage, ratio analytics by segment, cash and debt confirmations, share buyback transaction testing, auto-scanned component workpapers across 40+ jurisdictions.",
    final_substantive: "16 staff and AI complete substantive testing through FY-end (September 27): 100% revenue transaction testing, deferred revenue rollforward, legal contingency analysis, income tax review, PP&E verification across 535 retail stores, ASR derivative settlement, hedging derivatives, subsequent events.",
    fraud_procedures: "10 staff and AI test for fraud risk across all entities: 100% revenue transaction testing for existence, timing, and ASC 606 allocation, 100% journal entry override testing, accounting estimate bias evaluation.",
    misstatement_accumulation: "14 staff and AI compile misstatements from all streams and component locations: classifies factual, judgmental, and projected misstatements, evaluates against materiality, analyzes qualitative factors. Partner makes final conclusion.",
  }

  const [activeModel, setActiveModel] = useState<"ey" | "sc">("ey")

  const modelToggle = (
    <div style={{
      display: "flex",
      gap: 0,
      marginBottom: 16,
      borderRadius: 6,
      border: `1px solid ${t.border}`,
      overflow: "hidden",
    }}>
      <button
        onClick={() => setActiveModel("ey")}
        style={{
          flex: 1,
          fontFamily: t.mono,
          fontSize: 11,
          fontWeight: 500,
          padding: "8px 0",
          border: "none",
          cursor: "pointer",
          background: activeModel === "ey" ? t.text : "transparent",
          color: activeModel === "ey" ? "#fff" : t.muted,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          transition: "all 0.15s",
        }}
      >
        Ernst & Young
      </button>
      <button
        onClick={() => setActiveModel("sc")}
        style={{
          flex: 1,
          fontFamily: t.mono,
          fontSize: 11,
          fontWeight: 500,
          padding: "8px 0",
          border: "none",
          borderLeft: `1px solid ${t.border}`,
          cursor: "pointer",
          background: activeModel === "sc" ? t.accent : "transparent",
          color: activeModel === "sc" ? "#fff" : t.muted,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          transition: "all 0.15s",
        }}
      >
        Superaudit
      </button>
    </div>
  )

  if (isMobile) {
    const mobileTreeWc = activeModel === "ey" ? eyCosted : scCosted
    const mobileStWc = activeModel === "ey" ? eyST : scST
    const mobileStDescs = activeModel === "ey" ? eyDescriptions : scDescriptions

    return (
      <section style={{ padding: "20px 0" }}>
        <h2 style={{
          fontFamily: t.serif,
          fontSize: 18,
          fontWeight: 500,
          fontStyle: "italic",
          color: t.text,
          textAlign: "center",
          marginBottom: 20,
        }}>
          Every task to perform an Apple audit, modeled and costed
        </h2>

        {/* Full workflow tree with toggle */}
        {modelToggle}
        <MobileDrillDownTree
          key={`full-${activeModel}`}
          wc={mobileTreeWc}
          highlightId={activeModel === "ey" ? "substantive" : "substantive_testing"}
        />

        {/* Single workflow example */}
        <div style={{ textAlign: "center", marginTop: 28, marginBottom: 10 }}>
          <span style={{
            fontFamily: t.mono,
            fontSize: 10,
            fontWeight: 600,
            color: t.highlight,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            background: t.highlightSubtle,
            borderRadius: 4,
            padding: "4px 10px",
            display: "inline-block",
          }}>
            Substantive Testing Workflow
          </span>
        </div>
        <h3 style={{
          fontFamily: t.serif,
          fontSize: 18,
          fontWeight: 500,
          fontStyle: "italic",
          color: t.text,
          textAlign: "center",
          marginBottom: 8,
        }}>
          Verifying Account Balances
        </h3>
        <p style={{
          fontFamily: t.serif,
          fontSize: 13,
          color: t.muted,
          textAlign: "center",
          marginBottom: 16,
        }}>
          Meeting the same regulatory requirements with different approaches
        </p>

        {!isStatic && (
          <RequirementStrip
            requirements={parentReqIds}
            activeReq={activeReq}
            onToggle={(id) => setActiveReq(activeReq === id ? null : id)}
          />
        )}

        {modelToggle}
        {mobileStWc && (
          <MobileDrillDownTree
            key={`st-${activeModel}`}
            wc={mobileStWc}
            highlightId={activeModel === "ey" ? "substantive" : "substantive_testing"}
            descriptions={mobileStDescs}
            activeRequirement={activeReq}
            showRequirementBadges
            onRequirementToggle={toggleReq}
            defaultDrillPath={[activeModel === "ey" ? "interim_substantive" : "interim_substantive"]}
          />
        )}
      </section>
    )
  }

  return (
    <section style={{ padding: "48px 0" }}>
      <h2 style={{
        fontFamily: t.serif,
        fontSize: 20,
        fontWeight: 500,
        fontStyle: "italic",
        color: t.text,
        textAlign: "center",
        marginBottom: 40,
      }}>
        Every task to perform an Apple audit, modeled and costed
      </h2>

      {/* Side-by-side trees */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 32,
        marginBottom: 48,
      }}>
        <div>
          <div style={{
            fontFamily: t.mono,
            fontSize: 10,
            fontWeight: 500,
            color: t.text,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 14,
            paddingBottom: 10,
            borderBottom: `1px solid ${t.border}`,
          }}>
            Ernst & Young
          </div>
          <WorkflowTree wc={eyCosted} depth={0} rootLabel="Current Workflow" highlightId="substantive" />
        </div>
        <div>
          <div style={{
            fontFamily: t.mono,
            fontSize: 10,
            fontWeight: 500,
            color: t.accent,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 14,
            paddingBottom: 10,
            borderBottom: `1px solid ${t.accent}40`,
          }}>
            Superaudit
          </div>
          <WorkflowTree wc={scCosted} depth={0} rootLabel="Recreated Workflow" highlightId="substantive_testing" />
        </div>
      </div>

      {/* Single workflow example */}
      <div style={{ textAlign: "center", marginBottom: 10 }}>
        <span style={{
          fontFamily: t.mono,
          fontSize: 10,
          fontWeight: 600,
          color: t.highlight,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          background: t.highlightSubtle,
          borderRadius: 4,
          padding: "4px 10px",
          display: "inline-block",
        }}>
          Substantive Testing Workflow
        </span>
      </div>
      <h3 style={{
        fontFamily: t.serif,
        fontSize: 20,
        fontWeight: 500,
        fontStyle: "italic",
        color: t.text,
        textAlign: "center",
        marginBottom: 8,
      }}>
        Verifying Account Balances
      </h3>
      <p style={{
        fontFamily: t.serif,
        fontSize: 14,
        color: t.muted,
        textAlign: "center",
        marginBottom: 24,
      }}>
        Meeting the same regulatory requirements with different approaches
      </p>

      {!isStatic && (
        <RequirementStrip
          requirements={parentReqIds}
          activeReq={activeReq}
          onToggle={(id) => setActiveReq(activeReq === id ? null : id)}
        />
      )}

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 48,
        marginBottom: 56,
      }}>
        {/* EY Column */}
        <div>
          <div style={{
            fontFamily: t.mono,
            fontSize: 10,
            fontWeight: 500,
            color: t.text,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 14,
            paddingBottom: 10,
            borderBottom: `1px solid ${t.border}`,
          }}>
            Ernst & Young
          </div>
          {eyST && <WorkflowTree wc={eyST} depth={0} highlightId="substantive" descriptions={eyDescriptions} activeRequirement={activeReq} showRequirementBadges onRequirementToggle={toggleReq} />}
        </div>

        {/* Superaudit Column */}
        <div>
          <div style={{
            fontFamily: t.mono,
            fontSize: 10,
            fontWeight: 500,
            color: t.accent,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 14,
            paddingBottom: 10,
            borderBottom: `1px solid ${t.accent}40`,
          }}>
            Superaudit
          </div>
          {scST && <WorkflowTree wc={scST} depth={0} highlightId="substantive_testing" descriptions={scDescriptions} activeRequirement={activeReq} showRequirementBadges onRequirementToggle={toggleReq} />}
        </div>
      </div>

    </section>
  )
}

// ============================================================
// SECTION 6 — DATA MODEL
// ============================================================

const structuralTests = [
  "Each workflow is a typed object",
  "Internal consistency verified: timing, cost, inputs/outputs",
  "No staff member over-committed in any week",
  "All costs within expected range for engagement size",
  "All 35 regulatory requirements fulfilled by both models",
]

const perWorkflowTests = [
  "Every workflow has assigned team and timeline",
  "All roles exist in cost model",
  "Staff counts and allocations valid",
  "Factual correctness verified against official audit reports",
  "Apple-specific context validated",
]

function TestCategory({ label, count, items, isMobile }: {
  label: string
  count: string
  items: string[]
  isMobile: boolean
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: isMobile ? "flex-start" : "baseline",
        gap: isMobile ? 8 : 0,
        marginBottom: 10,
      }}>
        <span style={{
          fontFamily: t.mono,
          fontSize: 10,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: t.text,
        }}>
          {label}
        </span>
        <span style={{
          fontFamily: t.mono,
          fontSize: 10,
          color: t.mutedLight,
          flexShrink: 0,
        }}>
          {count}
        </span>
      </div>
      {items.map(item => (
        <div key={item} style={{
          fontFamily: t.serif,
          fontSize: isMobile ? 12 : 13,
          lineHeight: isMobile ? 1.6 : 1.8,
          color: t.muted,
          display: "flex",
          gap: 8,
        }}>
          <span style={{ color: t.accent, flexShrink: 0 }}>✓</span>
          <span>{item}</span>
        </div>
      ))}
    </div>
  )
}

export function DataModel({ isMobile, schemaOnly }: { isMobile: boolean; schemaOnly?: boolean }) {
  const [showSchema, setShowSchema] = useState(schemaOnly ? true : false)

  if (schemaOnly) {
    return (
      <section style={{ padding: isMobile ? "16px 0" : "24px 0" }}>
        <pre style={{
          fontFamily: t.mono,
          fontSize: isMobile ? 10 : 12,
          lineHeight: 1.65,
          color: t.muted,
          padding: isMobile ? "16px 12px" : "24px 28px",
          border: `1px solid ${t.border}`,
          borderRadius: 6,
          overflowX: "auto",
          whiteSpace: isMobile ? "pre-wrap" : "pre",
          wordBreak: isMobile ? "break-word" : undefined,
          margin: 0,
        }}>
          {schemaCode.split("\n").map((rawLine, i) => {
            const line = isMobile ? rawLine.replace(/\s*\/\/.*$/, "") : rawLine
            const highlighted = line
              .replace(/^(type )(\w+)/, (_, kw, name) => `${kw}<T>${name}</T>`)
              .replace(/(\w+)\[\]/g, (_, name) => `<T>${name}</T>[]`)
              .replace(/: (Workflow|WorkflowCost|Agents|RoleAllocation|Record<[^>]+>)/g, (_, name) => `: <T>${name}</T>`)
            if (!highlighted.includes("<T>")) return <span key={i}>{line}{"\n"}</span>
            const parts = highlighted.split(/(<T>.*?<\/T>)/)
            return (
              <span key={i}>
                {parts.map((part, j) => {
                  const match = part.match(/^<T>(.*)<\/T>$/)
                  if (match) return <span key={j} style={{ color: t.accent }}>{match[1]}</span>
                  return part
                })}
                {"\n"}
              </span>
            )
          })}
        </pre>
      </section>
    )
  }

  return (
    <section style={{ padding: isMobile ? "24px 0" : "48px 0" }}>
      <h3 style={{
        fontFamily: t.serif,
        fontSize: isMobile ? 18 : 20,
        fontWeight: 500,
        fontStyle: "italic",
        color: t.text,
        textAlign: "center",
        marginBottom: 12,
      }}>
        The workflows are built to be verified
      </h3>
      <p style={{
        fontFamily: t.serif,
        fontSize: isMobile ? 13 : 14,
        lineHeight: 1.65,
        color: t.muted,
        textAlign: "center",
        maxWidth: isMobile ? undefined : 540,
        margin: isMobile ? "0 auto 24px" : "0 auto 32px",
      }}>
        Both workflows are instances of the same TypeScript type, a fractal
        decomposition where every task has defined team, timing, cost, and
        regulatory requirements.
      </p>

      {/* Schema toggle */}
      <div style={{ marginBottom: isMobile ? 24 : 36 }}>
        <div style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: showSchema ? (isMobile ? 16 : 24) : 0,
        }}>
          <button
            onClick={() => setShowSchema(!showSchema)}
            style={{
              fontFamily: t.mono,
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: isMobile ? "0.06em" : "0.02em",
              textTransform: isMobile ? "uppercase" : undefined,
              padding: isMobile ? "8px 0" : "6px 18px",
              borderRadius: isMobile ? 6 : 20,
              border: `1px solid ${t.border}`,
              background: showSchema ? t.text : "transparent",
              color: showSchema ? "#fff" : t.muted,
              cursor: "pointer",
              transition: "all 0.15s",
              width: isMobile ? "100%" : undefined,
            }}
          >
            {showSchema ? "Hide Data Model" : "Show Data Model"}
          </button>
        </div>

        {showSchema && (
          <pre style={{
            fontFamily: t.mono,
            fontSize: isMobile ? 10 : 12,
            lineHeight: 1.65,
            color: t.muted,
            padding: isMobile ? "16px 12px" : "24px 28px",
            border: `1px solid ${t.border}`,
            borderRadius: 6,
            overflowX: "auto",
            whiteSpace: isMobile ? "pre-wrap" : "pre",
            wordBreak: isMobile ? "break-word" : undefined,
            margin: 0,
          }}>
            {schemaCode.split("\n").map((rawLine, i) => {
              const line = isMobile ? rawLine.replace(/\s*\/\/.*$/, "") : rawLine
              const highlighted = line
                .replace(/^(type )(\w+)/, (_, kw, name) => `${kw}<T>${name}</T>`)
                .replace(/(\w+)\[\]/g, (_, name) => `<T>${name}</T>[]`)
                .replace(/: (Workflow|WorkflowCost|Agents|RoleAllocation|Record<[^>]+>)/g, (_, name) => `: <T>${name}</T>`)
              if (!highlighted.includes("<T>")) return <span key={i}>{line}{"\n"}</span>
              const parts = highlighted.split(/(<T>.*?<\/T>)/)
              return (
                <span key={i}>
                  {parts.map((part, j) => {
                    const match = part.match(/^<T>(.*)<\/T>$/)
                    if (match) return <span key={j} style={{ color: t.accent }}>{match[1]}</span>
                    return part
                  })}
                  {"\n"}
                </span>
              )
            })}
          </pre>
        )}
      </div>

      {/* Test results */}
      <div style={{ maxWidth: isMobile ? undefined : 480, margin: "0 auto 36px" }}>
        <TestCategory label="Structural Tests" count="16 tests × 2 models" items={structuralTests} isMobile={isMobile} />
        <TestCategory label="Per-Workflow Tests & Evals" count="5 tests × 60 workflows" items={perWorkflowTests} isMobile={isMobile} />
      </div>

      {/* GitHub CTA */}
      <p style={{
        fontFamily: t.serif,
        fontSize: 14,
        color: t.muted,
        textAlign: "center",
      }}>
        Every assumption is published and inspectable.{" "}
        <a
          href="https://github.com/erik-list/superproductive-re-creation"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: t.accent,
            textDecoration: "none",
            borderBottom: `1px solid ${t.accent}40`,
          }}
        >
          View Repo for Workflows & Tests →
        </a>
      </p>
    </section>
  )
}

// ============================================================
// VITEST OUTPUT
// ============================================================

const testCategories = [
  { name: "structural", count: "6 tests", result: "passed" },
  { name: "per-workflow", count: "5 × 41", result: "passed" },
  { name: "allocation", count: "1 test", result: "passed" },
  { name: "cost", count: "4 tests", result: "passed" },
  { name: "pcaob", count: "2 tests", result: "passed" },
  { name: "apple-specific", count: "1 test", result: "passed" },
  { name: "headcount", count: "1 test", result: "passed" },
  { name: "dag-timing", count: "1 test", result: "passed" },
]

export function VitestOutput({ isMobile }: { isMobile: boolean }) {
  return (
    <div style={{
      fontFamily: t.mono,
      fontSize: isMobile ? 10 : 12,
      lineHeight: 1.8,
      color: t.muted,
      border: `1px solid ${t.border}`,
      borderRadius: 6,
      padding: isMobile ? "16px 12px" : "20px 24px",
      breakInside: "avoid" as const,
      overflowX: "auto",
    }}>
      <div style={{ color: t.text, fontWeight: 600, marginBottom: 2 }}>
        VITEST  v4.1.0
      </div>
      <div style={{ color: t.mutedLight, fontSize: isMobile ? 9 : 10, marginBottom: 12 }}>
        Sample test run, covering both EY and Superaudit models
      </div>
      {testCategories.map((cat) => (
        <div key={cat.name} style={{
          display: "flex",
          gap: isMobile ? 12 : 20,
        }}>
          <span style={{ minWidth: isMobile ? 100 : 140 }}>{cat.name}</span>
          <span style={{ minWidth: isMobile ? 60 : 80, color: t.mutedLight }}>{cat.count}</span>
          <span>{cat.result}</span>
        </div>
      ))}
      <div style={{ marginTop: 12, borderTop: `1px solid ${t.border}`, paddingTop: 12 }}>
        <span>Tests  </span>
        <span style={{ fontWeight: 600, color: t.text }}>327 passed</span>
        <span>  (0 failed)</span>
      </div>
      <div style={{ color: t.mutedLight }}>
        Duration  289ms
      </div>
    </div>
  )
}

// ============================================================
// EVAL PIPELINE
// ============================================================

const pipelinePhases = [
  { name: "Derive Scope", desc: "for Audit" },
  { name: "Map to", desc: "Workflows" },
  { name: "Evaluate", desc: "Each Workflow" },
  { name: "Evaluate", desc: "System Properties" },
  { name: "Correct", desc: "& Verify" },
]

export function EvalPipeline({ isMobile }: { isMobile: boolean }) {
  if (isMobile) {
    return (
      <div style={{
        breakInside: "avoid" as const,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}>
        {pipelinePhases.map((phase, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 180 }}>
            <div style={{
              border: `1px solid ${t.border}`,
              borderRadius: 6,
              padding: "12px 14px",
              width: "100%",
              textAlign: "center",
            }}>
              <div style={{
                fontFamily: t.mono,
                fontSize: 10,
                fontWeight: 600,
                color: t.text,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}>
                {phase.name}
              </div>
              <div style={{
                fontFamily: t.serif,
                fontSize: 12,
                color: t.muted,
                marginTop: 2,
              }}>
                {phase.desc}
              </div>
            </div>
            {i < pipelinePhases.length - 1 && (
              <div style={{
                textAlign: "center",
                color: t.mutedLight,
                fontSize: 14,
                padding: "4px 0",
              }}>
                ↓
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 0,
      breakInside: "avoid" as const,
    }}>
      {pipelinePhases.map((phase, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", flex: 1 }}>
          <div style={{
            border: `1px solid ${t.border}`,
            borderRadius: 6,
            padding: "14px 10px",
            flex: 1,
            textAlign: "center",
          }}>
            <div style={{
              fontFamily: t.mono,
              fontSize: 10,
              fontWeight: 600,
              color: t.text,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}>
              {phase.name}
            </div>
            <div style={{
              fontFamily: t.serif,
              fontSize: 11,
              color: t.muted,
              marginTop: 3,
            }}>
              {phase.desc}
            </div>
          </div>
          {i < pipelinePhases.length - 1 && (
            <span style={{
              color: t.mutedLight,
              fontSize: 14,
              padding: "0 6px",
              flexShrink: 0,
            }}>
              →
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
