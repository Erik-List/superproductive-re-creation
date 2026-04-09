# Superproductive Re-Creation

An interactive research tool comparing Ernst & Young's Apple FY25 integrated audit against an AI-native recreation. Built on a typed data model with 327 structural tests and independent LLM evaluation.

**Live site:** [superproductive-re-creation.com](https://superproductive-re-creation.com)

## Key findings

With current AI capabilities and deliberately conservative assumptions (10x staff pay, startup-level overhead, no future model improvements), the recreated audit delivers:

- **-47%** cost ($25.3M to $13.3M)
- **-98%** labor hours (190K to 4,143)
- **-92%** headcount (539 to 44)
- **-13%** duration (26.5 to 23 weeks)

## Project structure

```
src/
  App.tsx              Main layout, scroll-reveal header
  Essay.tsx            Long-form article with interactive visualizations
  PDF.tsx              Print/PDF export view
  Components.tsx       All visualization components (trees, charts, toggles)
  theme.ts             Design tokens (colors, fonts, spacing)

data/
  types.ts             Core type definitions + cost computation logic
  requirements.ts      35 PCAOB auditing standards
  ey/
    workflow.ts      EY's Apple FY25 audit workflows (539 staff, 26.5 weeks)
    cost.ts            EY role rates and overhead structure
  superaudit/
    workflow.ts      AI-native recreation workflows (44 staff, 23 weeks)
    cost.ts            Superaudit cost model (10x pay, 145% overhead)
  __tests__/
    verify.test.ts     327 structural tests

evals/
  eval-script.ts       LLM evaluation orchestrator (spawns Claude agents)
  results/             Historical eval verdicts and traces per engagement
  archive/             Correction logs and progress tracking
```

## Tech stack

React 19, TypeScript 5.7, Vite 6, Vitest

## Getting started

```bash
npm install
npm run dev        # local dev server at localhost:5173
npm run build      # TypeScript check + production build
npm run preview    # preview production build locally
```

## The data model

Everything flows from recursive `Workflow` trees defined in [`data/types.ts`](data/types.ts):

- **Workflow** -- recursive tree with id, name, description, timing, inputs/outputs, requirement_ids, and agents (human team + AI cost)
- **WorkflowCost** -- wraps a Workflow with computed hours, role-level costs, overhead, and totals
- **CostConfig** -- engagement-wide pricing: role rates, default allocation, 8-category overhead structure
- **Requirement** -- PCAOB standard reference (id, description, source)

`computeCost()` recursively aggregates costs from leaves to root. Per leaf: `hours = count x allocation x weeks x 40h/week`, then `cost = hours x role_rate + overhead`.

Both engagements ([`data/ey/workflow.ts`](data/ey/workflow.ts) and [`data/superaudit/workflow.ts`](data/superaudit/workflow.ts)) use the same types, making them directly comparable.

## Testing

### Structural tests (vitest)

327 tests covering:

- **Tree integrity** -- WorkflowCost tree mirrors Workflow tree, parent timing spans children
- **DAG validation** -- no dangling inputs, no cycles
- **Allocation integrity** -- no role over-allocated in any week, allocations in (0, 1]
- **Requirement coverage** -- all 35 PCAOB standards mapped, no invalid requirement_ids
- **Cost plausibility** -- total cost, hours, headcount within defensible ranges per engagement

```bash
npm test                # run all 327 tests
npm run test:watch      # interactive watch mode
npm run test:verbose    # detailed per-test output
```

### LLM evaluation pipeline

A 5-phase evaluation using Claude agents that independently verify each engagement model:

1. **Scope mapping** -- derives required audit areas from Apple's public filings and PCAOB standards
2. **Workflow mapping** -- maps each scope area to specific workflows, flags gaps
3. **Domain plausibility** -- decomposes each leaf workflow into tasks, estimates hours from industry benchmarks, compares to modeled values
4. **System properties** -- allocation integrity, dependency DAG, requirement coverage, cost reasonableness
5. **Corrections** -- agents have full authority to edit workflows, then iterate until vitest passes

#### Setup: Claude Code CLI

The orchestrator spawns the `claude` CLI (Claude Code) with Opus model at max reasoning effort. Install and authenticate before running evaluations:

```bash
npm install -g @anthropic-ai/claude-code
claude                  # first run prompts for authentication
```

You need a Claude account with API access. See the [Claude Code docs](https://docs.claude.com/en/docs/claude-code/overview) for details.

#### Run evaluations

```bash
npx tsx evals/eval-script.ts                    # both engagements
npx tsx evals/eval-script.ts --only ey          # just EY
npx tsx evals/eval-script.ts --only superaudit  # just Superaudit
npx tsx evals/eval-script.ts --retries 3        # multiple convergence attempts
```

Each run takes up to 30 minutes per engagement. Results are stored in `evals/results/{ey,superaudit}/results.json` with full agent traces in `traces/`.

## Deployment

Static SPA with no backend. Deploy to any static host:

```bash
npm run build    # outputs to dist/
```

Works with Vercel, Netlify, Cloudflare Pages, or any static file server.

## License

[MIT](LICENSE)
