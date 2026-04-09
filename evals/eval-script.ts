#!/usr/bin/env npx tsx
/**
 * Workflow Evaluation Orchestrator
 *
 * Spawns one orchestrator agent per engagement that owns the full correctness outcome:
 * evaluates all workflows, fixes issues, verifies with vitest, outputs results.
 *
 * Usage:
 *   npx tsx data/eval-workflows.ts                    # both engagements
 *   npx tsx data/eval-workflows.ts --only ey           # just EY
 *   npx tsx data/eval-workflows.ts --only superaudit  # just SC
 */

import { spawn, spawnSync } from "child_process"
import { mkdirSync, writeFileSync, readFileSync, existsSync, openSync, closeSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
import { requirements } from "../data/requirements"
import { costConfig as eyConfig } from "../data/ey/cost"
import { costConfig as scConfig } from "../data/superaudit/cost"

// ---- Config ----

const RESULTS_DIR = join(__dirname, "results")
const MODEL = "opus"
const EFFORT = "max"
const APP_DIR = join(__dirname, "..")

// ---- CLI args ----

const args = process.argv.slice(2)
const onlyArg = args.includes("--only") ? args[args.indexOf("--only") + 1] : null
const retries = args.includes("--retries") ? parseInt(args[args.indexOf("--retries") + 1]) : 1

// ---- Helpers ----

function validRequirementIds(): string {
  return requirements.map(r => r.id).join(", ")
}

function validRoles(eng: string): string {
  const config = eng === "ey" ? eyConfig : scConfig
  return config.role_rates.map(r => r.role).join(", ")
}

// ---- Orchestrator prompt ----

function buildOrchestratorPrompt(eng: "ey" | "superaudit"): string {
  const engName = eng === "ey" ? "EY" : "Superaudit"
  const engFile = `audit/app/data/${eng}/workflow.ts`
  const costFile = `audit/app/data/${eng}/cost.ts`

  const externalBenchmarks = eng === "ey"
    ? `- Apple's actual FY25 EY audit fee: $34.3M. Total cost + plausible margin (15-30%) should approximate this.
- ~305 people baseline (Big 4 mega-cap benchmark). Roster should reflect realistic peak demand.
- Duration: ~26 weeks for a September FY-end accelerated filer.`
    : `- AI-first audit economics: $1M+ cost floor for a Fortune 50 integrated audit.
- Stated ~75 humans (verify roster matches or correct the description).
- 23-week timeline driven by external bottlenecks (predecessor, client data, books closing).`

  return `You are an expert auditor evaluating and correcting the ${engName} engagement model. Read the engagement file first to identify the audit client, fiscal year, and engagement type. You have full authority to add, remove, merge, split, or restructure workflows to make the model correct.

## Key files
- ${engFile} — the engagement model (READ THIS FIRST)
- ${costFile} — CostConfig with role rates and overhead
- audit/app/data/types.ts — computeCost(), validateAllocation(), getHeadcount()
- audit/app/data/requirements.ts — valid requirement IDs
- audit/app/data/__tests__/verify.test.ts — vitest structural checks

## Phase 0: Review correction history

Before evaluating, read the history of prior eval runs to understand what has already been found and fixed:
- ${join(RESULTS_DIR, eng, "results.json")} — array of past run results (most recent first). Check: what corrections were applied in previous runs? Are the same issues recurring? If so, the root cause may need a structural fix rather than another description edit.
- ${join(RESULTS_DIR, eng, "traces")}/ — markdown traces of agent reasoning from prior runs. Skim the most recent trace to understand what was checked and what was missed.

Do NOT re-apply corrections that were already applied in a prior run unless they have regressed. Focus on issues prior runs missed or that have genuinely changed.

## Phase 1: Derive what the audit must cover

Before looking at the engagement model, reason from first principles about what the client's integrated audit requires. Use the client's public filings (10-K, proxy, Exhibit 21), PCAOB standards, and industry knowledge.

Build an explicit **scope map** with every material area. For each area, specify:
- The account/process/risk
- Why it is material or required (dollar amount, standard citation, or risk factor)
- What audit work it demands (substantive test, control test, specialist, communication, etc.)

Do not skip areas because they seem routine. The scope map is your ground truth for evaluating the model. Derive all required areas from the client's actual business, not from a template.

## Phase 2: Map scope to workflows

For every area in your scope map, find the specific workflow that tests it. The mapping must be explicit:
- Name the workflow ID
- Identify where in the workflow's description or requirement_ids the area is addressed
- If an area is only "implicitly" or "broadly" covered (no explicit mention in any workflow description or requirement_ids), that is a GAP. Do not rationalize gaps away.

"Addressed through broad substantive scope" is not acceptable for areas with dedicated procedures, specialized evidence sources, or distinct skill requirements.

## Phase 3: Domain plausibility, then per-workflow verification

For each leaf sub-workflow, assess domain plausibility FIRST, then verify structural correctness. Use web search to ground claims against current reality.

### Step 1: Ground against current audit practice

Use WebSearch/WebFetch to research how this type of audit work is currently executed. For each major workflow area (risk assessment, control testing, substantive testing, specialist work, reporting), establish:
- **Staffing models**: what roles, team sizes, and leverage ratios are standard for this engagement size? How are teams structured?
- **Tools and technology**: what audit platforms, data analytics tools, and AI capabilities are currently deployed in practice? What is still manual?
- **Typical hours and cost**: what do PCAOB inspection reports, proxy disclosures, and industry surveys reveal about hours by phase?
- **Regulatory requirements**: verify PCAOB standard citations against current standard text. Check for recent amendments.
- **Client facts**: verify dollar amounts, entity counts, and other quantitative claims against the client's most recent filings.

Use this as the baseline for plausibility assessment.

### Step 2: Per-workflow plausibility (RIGOROUS)

For EVERY leaf workflow, build an explicit plausibility case. Do not write "reasonable" or "plausible" without showing your work. For each leaf:

**a) Decompose the work into concrete tasks.** What does this workflow actually require someone (or an AI system) to do? List distinct activities with volumes. Use WebSearch to verify typical task volumes for this engagement type.

**b) Estimate hours per task from industry benchmarks.** Search for staffing norms, PCAOB inspection findings, and methodology guidance. Show the search queries you use. Examples:
- Hours per control for operating effectiveness testing
- Hours per jurisdiction for multi-jurisdictional tax work
- Walkthroughs per day including travel
- Confirmation cycle times

**c) Compare bottom-up estimate to modeled hours.** Show the math: "[benchmark] x [volume] = [expected hours] vs [modeled hours] = [ratio]".

**d) Assess the team composition against the work.** Does the role mix make sense for the tasks?

**e) For AI-driven workflows** (where AI agents perform primary work and humans review): assess whether the described AI approach is feasible with current frontier models. Consider:
- Can the described AI task actually be performed by current models? (e.g., full-population transaction testing is feasible; exercising professional skepticism in management interviews is not)
- Are the human review hours sufficient for the volume of AI output? If AI flags 2% of 10M transactions, humans must review 200K exceptions; is there enough time?
- Does the workflow correctly identify which tasks require irreducible human judgment (physical presence, legal signing authority, management inquiry, professional skepticism)?
- Are AI cost estimates realistic for the described compute? (token volumes, model tier, number of passes)

**f) Check for hidden dependencies.** Calendar time not reflected in hours (confirmation response time, attorney letters, component time zones).

Write a verdict for each leaf: **PASS** or **NEEDS_CORRECTION** (with explanation and proposed fix).

### Step 3: Cross-workflow plausibility

Compare related workflows with explicit ratios:
- **Stream proportions**: controls / substantive / specialist / reporting as % of total hours. Compare to industry benchmarks.
- **Specialist proportions**: are specialist hours proportional to the complexity of each area?
- **Component distribution**: total component hours / number of components. Is per-component coverage sufficient?
- **Partner leverage**: partner hours as % of total. Compare to benchmarks.

### Step 4: Cross-engagement plausibility

Read both engagement files. For each workflow that exists in both:
- Calculate the reduction ratio
- For reductions >95%, decompose into: (a) tasks AI can fully automate, (b) tasks AI can accelerate but humans must review, (c) tasks requiring irreducible human judgment
- Verify category (c) tasks have sufficient hours in the leaner model
- If insufficient, mark NEEDS_CORRECTION with specific tasks and proposed minimum hours

### Step 5: Readjust

If plausibility assessment reveals NEEDS_CORRECTION findings, correct the workflow parameters (team, allocation, timing, description) BEFORE moving to structural verification.

### Step 6: Structural verification

After plausibility corrections, verify each leaf:
1. **Description accuracy**: factual claims correct per web sources. Hour breakdowns match computed values (count x allocation x weeks x 40h). No role exceeds physical maximum hours.
2. **Team**: role mix matches the work. No missing roles, no roles without function.
3. **Allocation**: implied hours realistic. Not token (< 5% of need) and not impossible (exceeds capacity).
4. **Timing**: aligns with audit calendar. Duration sufficient. Inputs available within 1 week of start.
5. **Requirements**: requirement_ids cover all PCAOB standards the workflow implicates. No missing, no spurious.
6. **Inputs/Outputs**: declared inputs used, declared outputs produced. No phantom dependencies.

### Output for domain_plausibility

In the "domain_plausibility" criterion, include:
- Per-workflow verdict (PASS/NEEDS_CORRECTION) with explicit reasoning and math for each leaf
- Cross-workflow ratio analysis with benchmarks cited
- Cross-engagement reduction analysis with (a)/(b)/(c) decomposition
- All corrections made due to plausibility findings

## Phase 4: Evaluate system properties

- **Allocation integrity**: validateAllocation() must return 0 violations
- **Dependency DAG**: all inputs available within 1-week pipeline overlap of consumer start
- **Requirement coverage**: all 38 PCAOB requirements mapped to at least one workflow
- **Cost reasonableness**: external benchmarks:
${externalBenchmarks}
- **Headline numbers**: run computeCost() and computeMetrics(). Total cost, hours, headcount, and duration must be defensible.

## Phase 5: Correct

You have full authority to:
- **Edit** any field (description, team, allocation, timing, requirements, inputs/outputs)
- **Add** new workflows where scope gaps exist
- **Remove** workflows that duplicate or don't serve a distinct audit purpose
- **Restructure** parent/child relationships, merge or split workflows
- **Adjust the roster** if corrections require roles or headcount changes

Every correction must have a reason grounded in audit standards, public filings, or computational verification. After corrections, run vitest (npm test) and iterate until all tests pass.

## Constraints
- requirement_ids: ONLY from requirements.ts: ${validRequirementIds()}
- role names: ONLY from CostConfig: ${validRoles(eng)}
- allocation: > 0 and <= 1.0
- count: positive integers
- No ambiguous findings. Every issue gets a concrete correction.

## How to work
1. Read prior run history and most recent trace (Phase 0)
2. Read the engagement file
3. Run vitest to see current state
4. Build your scope map (Phase 1) before evaluating
5. Map scope to workflows (Phase 2), identify gaps
6. Evaluate each leaf workflow (Phase 3) and domain plausibility (Phase 3b)
7. Evaluate system properties (Phase 4)
7. Make all corrections (Phase 5), including adding/removing workflows for scope gaps
8. Run vitest again, iterate until passing
9. Output your results as a JSON object in your final message (the orchestrator captures it from the stream)

## Output
Your final message must contain this JSON object (the orchestrator will extract and prepend it to results.json):
{
  "run_at": "${new Date().toISOString()}",
  "engagement": "${eng}",
  "verdict": "PASS or NEEDS_CORRECTION",
  "headline_numbers": {
    "total_cost": "computed value",
    "labor_hours": "computed value",
    "headcount": "roster size",
    "duration_weeks": "computed value"
  },
  "scope_map": {
    "area_name": {"material_because":"...","addressed_by":"workflow_id or MISSING","evidence":"quote from workflow description or GAP"}
  },
  "criteria": {
    "scope_completeness": {"verdict":"...","detail":"...","gaps_found":[],"gaps_resolved":[]},
    "per_workflow_correctness": {"verdict":"...","detail":"..."},
    "domain_plausibility": {"verdict":"PASS or NEEDS_CORRECTION","detail":"...","per_workflow":[{"workflow_id":"...","verdict":"PASS or NEEDS_CORRECTION","reasoning":"..."}]},
    "allocation_integrity": {"verdict":"...","detail":"..."},
    "dependency_timing": {"verdict":"...","detail":"..."},
    "requirement_coverage": {"verdict":"...","detail":"..."},
    "cost_reasonableness": {"verdict":"...","detail":"..."},
    "headline_soundness": {"verdict":"...","detail":"..."}
  },
  "corrections_applied": [
    {"type":"edit|add|remove|restructure","workflow_id":"...","field":"...","old":"...","new":"...","reason":"..."}
  ],
  "vitest_status": "pass or fail"
}`
}

// ---- Per-engagement runner ----

async function runEngagement(eng: "ey" | "superaudit", maxAttempts: number): Promise<boolean> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`\n[${eng}] 📋 attempt ${attempt}/${maxAttempts} (model: ${MODEL}, effort: ${EFFORT})...\n`)

    const prompt = buildOrchestratorPrompt(eng)
    const historyPath = join(RESULTS_DIR, eng, "results.json")

    const priorHistory = existsSync(historyPath)
      ? JSON.parse(readFileSync(historyPath, "utf-8"))
      : []
    const history: unknown[] = Array.isArray(priorHistory) ? priorHistory : [priorHistory]
    const runStamp = new Date().toISOString().replace(/[:.]/g, "-")
    const tracesDir = join(RESULTS_DIR, eng, "traces")

    const streamPath = join(tracesDir, `${runStamp}.ndjson`)
    const stderrPath = join(RESULTS_DIR, eng, "stderr.log")
    const streamFd = openSync(streamPath, "w")
    const stderrFd = openSync(stderrPath, "w")

    const exitCode = await new Promise<number | null>((resolve) => {
      const child = spawn("claude", [
        "--print",
        "--model", MODEL,
        "--effort", EFFORT,
        "--permission-mode", "auto",
        "--output-format", "stream-json",
        "--verbose",
        "--add-dir", APP_DIR,
        "-p", prompt,
      ], { stdio: ["ignore", streamFd, stderrFd] })

      const timer = setTimeout(() => { child.kill("SIGTERM") }, 1800_000)
      child.on("close", (code) => { clearTimeout(timer); resolve(code) })
    })

    closeSync(streamFd)
    closeSync(stderrFd)

    const stdout = readFileSync(streamPath, "utf-8")
    const stderr = existsSync(stderrPath) ? readFileSync(stderrPath, "utf-8") : ""

    try {
      const lines = stdout.split("\n").filter(Boolean)
      const assistantMessages: any[] = []
      const resultMsgs: any[] = []

      for (const line of lines) {
        try {
          const obj = JSON.parse(line)
          if (obj.type === "result") resultMsgs.push(obj)
          else if (obj.type === "assistant") assistantMessages.push(obj)
        } catch {}
      }

      if (!resultMsgs.length) throw new Error("No result message in stream output")

      // Take the main agent result (most turns), not sub-agent results
      const resultMsg = resultMsgs.reduce((a, b) => (a.num_turns ?? 0) >= (b.num_turns ?? 0) ? a : b)

      const cost = resultMsg.total_cost_usd ?? 0
      const dur = (resultMsg.duration_ms ?? 0) / 1000

      // Parse result from agent's final message
      let runResult: Record<string, unknown> | null = null
      let resultStr = resultMsg.result ?? ""
      resultStr = resultStr.replace(/^```json\n?/, "").replace(/\n?```$/, "")
      const jsonMatch = resultStr.match(/\{[\s\S]*"engagement"[\s\S]*\}/)
      if (jsonMatch) {
        runResult = JSON.parse(jsonMatch[0])
      }

      if (runResult) {
        // Prepend to results.json (most recent first)
        history.unshift(runResult)
        writeFileSync(historyPath, JSON.stringify(history, null, 2))

        const verdict = (runResult as any)?.verdict ?? "unknown"
        const corrections = ((runResult as any)?.corrections_applied ?? []).length

        console.log(`[${eng}] ✅ complete → $${cost.toFixed(2)}, ${(dur / 60).toFixed(1)} min (verdict: ${verdict}, corrections: ${corrections})`)

        const tracePath = join(tracesDir, `${runStamp}.md`)
        const trace = buildTrace(eng, cost, dur, verdict, assistantMessages)
        writeFileSync(tracePath, trace)
        console.log(`[${eng}] Trace: ${tracePath}`)

        if (verdict === "PASS" && corrections === 0) {
          console.log(`[${eng}] 🎯 converged — PASS with 0 corrections`)
          return true
        } else {
          console.log(`[${eng}] 🔄 needs another pass (${corrections} corrections applied)`)
        }
      } else {
        console.log(`[${eng}] ⚠️  no structured results → $${cost.toFixed(2)}, ${(dur / 60).toFixed(1)} min`)
      }

      const denials = resultMsg.permission_denials ?? []
      if (denials.length > 0) {
        console.log(`[${eng}] ⚠️  ${denials.length} permission denials:`)
        for (const d of denials) {
          console.log(`[${eng}]   ${d.tool_name}: ${JSON.stringify(d.tool_input).slice(0, 100)}`)
        }
      }
    } catch (e) {
      const errorPath = join(tracesDir, `${runStamp}.error.txt`)
      writeFileSync(errorPath, `error: ${e}\n\nstdout (first 5000):\n${stdout.slice(0, 5000)}\n\nstderr:\n${stderr.slice(0, 2000)}\n\nexit: ${exitCode}`)
      console.log(`[${eng}] ❌ failed (exit ${exitCode}): ${e}`)
    }
  }

  return false
}

// ---- Main ----

async function main() {
  // Prevent system sleep during long eval runs (platform-specific)
  let sleepBlocker: ReturnType<typeof spawn> | null = null
  if (process.platform === "darwin") {
    sleepBlocker = spawn("caffeinate", ["-is"], { stdio: "ignore", detached: true })
    sleepBlocker.unref()
    console.log(`☕ caffeinate started (pid ${sleepBlocker.pid})`)
  } else if (process.platform === "linux") {
    // systemd-inhibit blocks suspend/idle until the child process exits
    const check = spawnSync("which", ["systemd-inhibit"], { stdio: "ignore" })
    if (check.status === 0) {
      sleepBlocker = spawn("systemd-inhibit", ["--what=idle:sleep", "--who=eval-script", "--why=Running LLM evaluations", "sleep", "infinity"], { stdio: "ignore", detached: true })
      sleepBlocker.unref()
      console.log(`☕ systemd-inhibit started (pid ${sleepBlocker.pid})`)
    } else {
      console.log("⚠️  systemd-inhibit not found -- system may sleep during long runs")
    }
  } else {
    console.log(`⚠️  sleep prevention not implemented for ${process.platform} -- disable sleep manually if needed`)
  }

  mkdirSync(join(RESULTS_DIR, "ey"), { recursive: true })
  mkdirSync(join(RESULTS_DIR, "superaudit"), { recursive: true })
  mkdirSync(join(RESULTS_DIR, "ey", "traces"), { recursive: true })
  mkdirSync(join(RESULTS_DIR, "superaudit", "traces"), { recursive: true })

  const startTime = Date.now()
  const engagements: ("ey" | "superaudit")[] = onlyArg
    ? [onlyArg as "ey" | "superaudit"]
    : ["ey", "superaudit"]

  const results = await Promise.all(engagements.map(eng => runEngagement(eng, retries)))

  for (let i = 0; i < engagements.length; i++) {
    if (!results[i]) console.log(`\n  ⚠️  ${engagements[i]} did not converge after ${retries} attempt(s)`)
  }

  const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1)
  console.log(`\n✅ Done in ${elapsed} min.`)

  try { sleepBlocker?.kill() } catch {}
}

function buildTrace(eng: string, cost: number, dur: number, verdict: string, messages: any[]): string {
  const lines: string[] = []
  const engName = eng === "ey" ? "EY" : "Superaudit"
  const timestamp = new Date().toISOString()

  lines.push(`# ${engName} Eval Trace -- ${timestamp}`)
  lines.push("")
  lines.push(`**Cost:** $${cost.toFixed(2)} | **Duration:** ${(dur / 60).toFixed(1)} min | **Verdict:** ${verdict}`)
  lines.push("")

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i]
    const content = msg.message?.content ?? []

    lines.push("---")
    lines.push("")
    lines.push(`## Turn ${i + 1}`)
    lines.push("")

    for (const block of content) {
      if (block.type === "text") {
        lines.push(block.text)
        lines.push("")
      } else if (block.type === "tool_use") {
        lines.push(`### Tool: ${block.name}`)
        const inputStr = JSON.stringify(block.input, null, 2)
        // Truncate very long inputs (e.g., file writes) to keep trace readable
        if (inputStr.length > 2000) {
          lines.push("```json")
          lines.push(inputStr.slice(0, 2000) + "\n... (truncated)")
          lines.push("```")
        } else {
          lines.push("```json")
          lines.push(inputStr)
          lines.push("```")
        }
        lines.push("")
      }
    }
  }

  return lines.join("\n")
}


main().catch(console.error)
