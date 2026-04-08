import { t, WorkflowComparison, DataModel, WorkflowTree, findWorkflow, eyCosted, scCosted, VitestOutput, EvalPipeline } from "./Components"

const REPO = "https://github.com/erik-list/superproductive-re-creation"
const DOMAIN = "superproductive-re-creation.com"

// ============================================================
// SHUFFLE ICON (same as App.tsx)
// ============================================================
function ShuffleIcon({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 256 256" fill="currentColor" style={{ display: "block" }}>
      <path d="M237.66 178.34a8 8 0 0 1 0 11.32l-24 24a8 8 0 0 1-11.32-11.32L212.69 192H200.94a72.12 72.12 0 0 1-58.59-30.15l-41.72-58.4A56.1 56.1 0 0 0 55.06 80H32a8 8 0 0 1 0-16h23.06a72.12 72.12 0 0 1 58.59 30.15l41.72 58.4A56.1 56.1 0 0 0 200.94 176h11.75l-10.35-10.34a8 8 0 0 1 11.32-11.32ZM143.06 107.23a8 8 0 0 0 11.24-1.45A56.1 56.1 0 0 1 200.94 80h11.75l-10.35 10.34a8 8 0 0 0 11.32 11.32l24-24a8 8 0 0 0 0-11.32l-24-24a8 8 0 0 0-11.32 11.32L212.69 64H200.94a72.12 72.12 0 0 0-58.59 30.15l-0.74 1.63a8 8 0 0 0 1.45 11.45Zm-30.12 41.54a8 8 0 0 0-11.24 1.45A56.1 56.1 0 0 1 55.06 176H32a8 8 0 0 0 0 16h23.06a72.12 72.12 0 0 0 58.59-30.15l.74-1.03a8 8 0 0 0-1.45-11.05Z" />
    </svg>
  )
}

// ============================================================
// TYPOGRAPHY (print-optimized, no isMobile — always desktop)
// ============================================================

const P = ({ children }: { children: React.ReactNode }) => (
  <p style={{
    fontFamily: t.serif,
    fontSize: 12,
    lineHeight: 1.7,
    color: t.text,
    marginBottom: 14,
  }}>
    {children}
  </p>
)

const B = ({ children }: { children: React.ReactNode }) => (
  <strong style={{ fontWeight: 700 }}>{children}</strong>
)

const A = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <span style={{ color: t.accent }}>{children}</span>
)

const UL = ({ children }: { children: React.ReactNode }) => (
  <ul style={{
    fontFamily: t.serif,
    fontSize: 12,
    lineHeight: 1.7,
    color: t.text,
    marginBottom: 14,
    marginLeft: 20,
    listStyleType: "disc",
  }}>
    {children}
  </ul>
)

const H2 = ({ id, children }: { id?: string; children: React.ReactNode }) => (
  <h2 id={id} style={{
    fontFamily: t.serif,
    fontSize: 20,
    fontWeight: 600,
    color: t.text,
    marginTop: 40,
    marginBottom: 18,
    lineHeight: 1.3,
  }}>
    {children}
  </h2>
)

const H3 = ({ id, children }: { id?: string; children: React.ReactNode }) => (
  <h3 id={id} style={{
    fontFamily: t.serif,
    fontSize: 15,
    fontWeight: 600,
    color: t.text,
    marginTop: 32,
    marginBottom: 12,
    lineHeight: 1.3,
  }}>
    {children}
  </h3>
)

const Separator = () => (
  <hr style={{
    border: "none",
    borderTop: `1px solid ${t.border}`,
    margin: "32px 0",
  }} />
)

const PageBreak = () => (
  <div style={{ pageBreakAfter: "always" as const }} />
)

const Visual = ({ children }: { children: React.ReactNode }) => (
  <div style={{ margin: "28px 0" }}>
    {children}
  </div>
)

// ============================================================
// COVER PAGE (includes ToC)
// ============================================================

const tocEntries = [
  { id: "pdf-part-1", title: "Part I: Radical Novelty", indent: 0 },
  { id: "pdf-who-behind", title: "Who's Behind This?", indent: 1 },
  { id: "pdf-part-2", title: "Part II: AI Re-Creation in Detail", indent: 0 },
  { id: "pdf-how-ey", title: "How EY Audits Apple", indent: 1 },
  { id: "pdf-why-recreate", title: "Why Think the Apple Audit from Scratch Instead of Transforming EY's Approach?", indent: 1 },
  { id: "pdf-recreated", title: "The AI Re-Created Audit: Auditing Apple with AI and 10x Staff Pay", indent: 1 },
  { id: "pdf-verification", title: "Verification Mechanisms", indent: 1 },
  { id: "pdf-claims", title: "Model Limitations", indent: 1 },
  { id: "pdf-part-3", title: "Part III: Designing a Responsible Transition", indent: 0 },
  { id: "pdf-societal", title: "Societal Implications", indent: 1 },
  { id: "pdf-public-benefit", title: "Optimizing for Public Benefit", indent: 1 },
]

function CoverPage() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      padding: "60px 0",
    }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8, color: t.text }}>
          <ShuffleIcon size={32} />
          <h1 style={{
            fontFamily: t.serif,
            fontSize: 32,
            fontWeight: 700,
            color: t.text,
            lineHeight: 1.2,
            letterSpacing: "-0.01em",
          }}>
            Superproductive Re-Creation
          </h1>
        </div>

        <p style={{
          fontFamily: t.serif,
          fontSize: 14,
          fontStyle: "italic",
          color: t.muted,
          marginBottom: 48,
        }}>
          Erik List
        </p>

        {/* ToC */}
        {tocEntries.map((s, i) => (
          <a key={i} href={`#${s.id}`} style={{
            display: "block",
            fontFamily: t.serif,
            fontSize: s.indent ? 14 : 16,
            fontWeight: s.indent ? 400 : 600,
            color: s.indent ? t.muted : t.text,
            paddingLeft: s.indent ? 12 : 0,
            lineHeight: 1.4,
            marginBottom: s.indent ? 5 : 12,
            marginTop: !s.indent && i > 0 ? 12 : 0,
            textDecoration: "none",
          }}>
            {s.title}
          </a>
        ))}
      </div>

      <p style={{
        fontFamily: t.mono,
        fontSize: 10,
        color: t.accent,
      }}>
        Published April 10, 2026 on {DOMAIN}
      </p>
    </div>
  )
}

// ============================================================
// CONTENT
// ============================================================

const eyStDescs: Record<string, string> = {
  interim_substantive: "144 staff test interim-period balances (April to June): revenue cut-off, A/R confirmations, deferred revenue rollforward, inventory, cash and investment confirmations, debt confirmations, share buyback transaction testing.",
  final_substantive: "268 staff complete remaining substantive testing through FY-end (September 27): bundled revenue allocation, PP&E existence, legal contingencies, derivatives, consolidation, ASR derivative fair value, treasury stock rollforward, EPS share count, subsequent events.",
  fraud_assessment: "117 staff test for fraud risk across global operations: presumed revenue recognition risk on hardware + services allocation, management override testing, journal entry sampling.",
  adjustments: "42 staff compile misstatements from all locations and evaluate against materiality: contingent liability estimation for active litigation, audit committee communication.",
}

const scStDescs: Record<string, string> = {
  interim_substantive: "12 staff and AI test interim-period balances (April to June): 100% journal entry and A/R confirmation coverage, ratio analytics by segment, cash and debt confirmations, share buyback transaction testing, auto-scanned component workpapers across 40+ jurisdictions.",
  final_substantive: "16 staff and AI complete substantive testing through FY-end (September 27): 100% revenue transaction testing, deferred revenue rollforward, legal contingency analysis, income tax review, PP&E verification across 535 retail stores, ASR derivative settlement, hedging derivatives, subsequent events.",
  fraud_procedures: "10 staff and AI test for fraud risk across all entities: 100% revenue transaction testing for existence, timing, and ASC 606 allocation, 100% journal entry override testing, accounting estimate bias evaluation.",
  misstatement_accumulation: "14 staff and AI compile misstatements from all streams and component locations: classifies factual, judgmental, and projected misstatements, evaluates against materiality, analyzes qualitative factors. Partner makes final conclusion.",
}

function Content() {
  return (
    <article>
      {/* ── Part I ── */}
      <P>
        With current AI capabilities, complex multi-million dollar workflows requiring hundreds of staff members can be compressed into radically more productive versions.
      </P>

      <P>
        Consider a rigorously worked example: Apple's FY25 audit, a workflow spanning 539 staff members across 40+ jurisdictions for a company with $416B in revenue. An audit recreated to harness the current AI models drops by <B>$12M (-47%)</B> in cost, <B>190K (-98%)</B> in labor hours with <B>495 (-92%)</B> fewer people while becoming <B>13% faster</B>.
      </P>

      <Visual><WorkflowComparison isMobile={false} /></Visual>

      <P>
        The comparison works even if cost reductions are deliberately modeled conservatively:
      </P>
      <UL>
        <li>The productivity gain assumes the current state of frontier models, not future AGI</li>
        <li>Every audit role in the fictional company (Superaudit) is paid 10x the EY equivalent</li>
        <li>Overhead of Superaudit is set at 145% direct costs, the rate of a startup with a single client where overhead can't spread across several clients</li>
      </UL>

      <P>
        The models for both EY and the fictional Superaudit are built on a typed data model with 327 structural tests and independent LLM evaluation. The full methodology, data, and tests are <A href={REPO}>open-source</A>.
      </P>

      <P>
        The model could be off by 25% across every EY estimate simultaneously and the finding would still reshape industry economics, urging for responsible deployment. Without public benefit efforts those who harness AI for re-created solutions will build fortunes, while the many that get displaced face an uncertain, daunting future.
      </P>

      <P>
        Radical compression generalizes to any complex workflow that can be digitally represented and has objectively measurable requirements. Audit is just the example.
      </P>

      <P>
        The socio-economic impact of superproductive gains across complex workflows is immense and requires responsible deployment. This research covers how superproductive re-creation works and presents first ideas to deploy responsibly.
      </P>

      <H3 id="pdf-who-behind">Who's Behind This?</H3>

      <P>
        I'm <A href="https://linktr.ee/list.erik">Erik</A> and am deeply curious about building companies and (AI) engineering. I study at <A href="https://www.linkedin.com/feed/update/urn:li:activity:7412032473737564160/">WHU</A> and will spend the summer shipping AI products at GV/20VC-backed <A href="https://www.comstruct.com">Comstruct</A>.
      </P>

      <P>
        I believe strong reasoning should speak for itself instead of deferring to credentials. For further writing, see my <A href="https://eriklist.substack.com/notes">thought collection</A>.
      </P>

      <Separator />

      {/* ── Part II ── */}
      <H2 id="pdf-part-2">Part II: AI Re-Creation in Detail</H2>

      <H3 id="pdf-how-ey">How EY Audits Apple</H3>

      <P>
        Auditing Apple is a massive undertaking: $416B in revenue, 535 retail stores, contract manufacturing across China, 40+ jurisdictions, and 100+ legal entities. EY's audit spans <B>5 major workstreams</B> across <B>190K+ labor hours</B> with <B>539 people</B> over <B>6 months</B>, costing <B>$25.3M</B> internally against a <B>$34.3M fee</B> paid by Apple.
      </P>

      <P>
        The 5 workstreams follow the logic of an audit: first, assess what could go wrong and where (planning and risk assessment). Then test whether Apple's internal financial controls actually work (controls testing, including IT systems). Verify that the numbers in the financial statements are correct (substantive testing). This is coordinated across 40+ country operations (group and component audit), then tied together and concluded (completion and reporting). Each major workstream decomposes into several sub-workflows spanning 2 layers.
      </P>

      <Visual>
        <div style={{
          fontFamily: t.mono, fontSize: 10, fontWeight: 500, color: t.text,
          textTransform: "uppercase", letterSpacing: "0.08em",
          marginBottom: 14, paddingBottom: 10, borderBottom: `1px solid ${t.border}`,
        }}>Ernst & Young</div>
        <WorkflowTree wc={eyCosted} depth={0} rootLabel="Current Workflow" />
      </Visual>

      <P>
        No publicly available decomposition of this workflow exists. Instead I structured all available information into a typed <A href={`${REPO}/blob/main/data/ey/workflow.ts`}>data model</A> using reusable definitions for workflows, agent allocation (human or AI), and cost.
      </P>

      <P>
        The total audit fee ($34.3M) is exact, taken directly from Apple's proxy statement. The internal cost structure, hours, staffing, and workflow-level allocations are estimated from PCAOB transparency reports, public methodology disclosures, and industry benchmarks. The model also accounts for Apple-specific audit complexities: revenue recognition across hardware bundles, services, and licensing; 535 retail store inventory observations; and component audits of contract manufacturers.
      </P>

      <H3 id="pdf-why-recreate">Why Think the Apple Audit from Scratch Instead of Transforming EY's Approach?</H3>

      <P>
        Could EY simply use AI to enhance their existing workflow? After all, they are the experts with proof of it working.
      </P>

      <P>
        It is true but transforming an existing large-scale workflow has decisive weaknesses over rethinking it from first principles. It is extremely difficult to distinguish process-induced requirements from the actual requirements to deliver a solution: if an auditor is used to testing accounts receivable controls a certain way, finding a new optimal approach requires more effort than starting with current technology from scratch.
      </P>

      <P>
        And even if EY identifies the optimum quickly, changing, especially removing, work is a huge organizational challenge in a workflow touching 539 staff members inside an organization with over 400,000 employees.
      </P>

      <P>
        Still, re-creation doesn't mean being blind to the current workflow. The current approach is a valuable informative reference of a working system that includes many well-optimized steps. It gives context that improves a recreated approach.
      </P>

      <H3 id="pdf-recreated">The AI Re-Created Audit: Auditing Apple with AI and 10x Staff Pay</H3>

      <P>
        Audit has a very useful property: meeting regulatory requirements is the objectively true measure for success. They are the only real requirements a re-created model must fulfill; everything else in EY's workflow is methodological choice or process-accumulated habit.
      </P>

      <P>
        The regulatory requirements in Apple's case are 35 auditing standards the Public Company Accounting Oversight Board (PCAOB) defines. These standards prescribe what an auditor must do, from how to assess fraud risk to how to test account balances, but not how to do it.
      </P>

      <P>
        The re-created workflow meets all 35 PCAOB requirements as effectively as possible with current AI capabilities, using the same typed <A href={`${REPO}/blob/main/data/types.ts`}>data model</A> as the EY baseline. It comprises <B>6 streams</B> with <B>4,143 labor hours (-98%)</B> of <B>44 staff members (-92%)</B> for <B>23 weeks (-13%)</B> costing <B>$13.3M (-47%)</B>.
      </P>

      {/* Side-by-side trees: EY muted, SC full */}
      <Visual>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
          <div style={{ opacity: 0.4 }}>
            <div style={{
              fontFamily: t.mono, fontSize: 10, fontWeight: 500, color: t.text,
              textTransform: "uppercase", letterSpacing: "0.08em",
              marginBottom: 14, paddingBottom: 10, borderBottom: `1px solid ${t.border}`,
            }}>Ernst & Young</div>
            <WorkflowTree wc={eyCosted} depth={0} rootLabel="Current Workflow" highlightId="substantive" />
          </div>
          <div>
            <div style={{
              fontFamily: t.mono, fontSize: 10, fontWeight: 500, color: t.accent,
              textTransform: "uppercase", letterSpacing: "0.08em",
              marginBottom: 14, paddingBottom: 10, borderBottom: `1px solid ${t.accent}40`,
            }}>Superaudit</div>
            <WorkflowTree wc={scCosted} depth={0} rootLabel="Recreated Workflow" highlightId="substantive_testing" />
          </div>
        </div>
      </Visual>

      <P>
        The striking contrast between EY and a new AI approach is best understood through substantive testing, the largest workstream and where the bulk of audit labor goes. Substantive testing is where auditors verify that the numbers in Apple's financial statements are actually correct, account by account.
      </P>

      <P>
        In EY's current approach, 144 staff test interim-period balances from April to June: revenue cut-off, A/R confirmations, deferred revenue rollforward, inventory, and investment confirmations. Then 268 staff complete the remaining substantive testing through fiscal year-end: bundled revenue allocation, PP&E existence, legal contingencies, derivatives, consolidation, and subsequent events. 117 staff test for fraud risk across global operations, and 42 staff compile misstatements from all locations and evaluate against materiality. Sampling is the core method: auditors select 25-40 transactions per account and extrapolate.
      </P>

      {/* EY substantive tree with descriptions + requirement badges (no highlighting) */}
      <Visual>
        <div style={{
          fontFamily: t.mono, fontSize: 10, fontWeight: 500, color: t.text,
          textTransform: "uppercase", letterSpacing: "0.08em",
          marginBottom: 14, paddingBottom: 10, borderBottom: `1px solid ${t.border}`,
        }}>Ernst & Young</div>
        {(() => {
          const eyST = findWorkflow(eyCosted, "substantive")
          return eyST ? <WorkflowTree wc={eyST} depth={0} descriptions={eyStDescs} showRequirementBadges /> : null
        })()}
      </Visual>

      <P>
        The same regulatory requirements are met with 28 people instead of 412, not by cutting corners but by testing every transaction where EY samples a few dozen.
      </P>

      <P>
        In the re-created approach, 12 staff (-92% from 144) and AI handle interim substantive testing with 100% journal entry and A/R confirmation coverage, ratio analytics by segment, and auto-scanned component workpapers across 40+ jurisdictions. 16 staff and AI complete year-end testing with 100% revenue transaction testing, PP&E verification across 535 retail stores, and full derivative and subsequent events coverage.
      </P>

      {/* Side-by-side substantive trees: EY muted, SC full (no highlighting) */}
      <Visual>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
          <div style={{ opacity: 0.4 }}>
            <div style={{
              fontFamily: t.mono, fontSize: 10, fontWeight: 500, color: t.text,
              textTransform: "uppercase", letterSpacing: "0.08em",
              marginBottom: 14, paddingBottom: 10, borderBottom: `1px solid ${t.border}`,
            }}>Ernst & Young</div>
            {(() => {
              const eyST = findWorkflow(eyCosted, "substantive")
              return eyST ? <WorkflowTree wc={eyST} depth={0} descriptions={eyStDescs} showRequirementBadges /> : null
            })()}
          </div>
          <div>
            <div style={{
              fontFamily: t.mono, fontSize: 10, fontWeight: 500, color: t.accent,
              textTransform: "uppercase", letterSpacing: "0.08em",
              marginBottom: 14, paddingBottom: 10, borderBottom: `1px solid ${t.accent}40`,
            }}>Superaudit</div>
            {(() => {
              const scST = findWorkflow(scCosted, "substantive_testing")
              return scST ? <WorkflowTree wc={scST} depth={0} descriptions={scStDescs} showRequirementBadges /> : null
            })()}
          </div>
        </div>
      </Visual>

      <P>
        This pattern repeats across the workflow. Where EY relies on human judgment to scope, sample, and document, the re-created model uses AI to process comprehensively and surfaces only exceptions for human decision. In that way, the bottleneck shifts from labor to external dependencies: client data readiness, legal timelines, and regulatory calendars.
      </P>

      <P>
        The recreated workflow is designed to be feasible, not optimistic:
      </P>
      <UL>
        <li>The productivity gain assumes the current state of frontier models, not future AGI</li>
        <li>Humans in the loop approve or correct every AI output</li>
        <li>Every audit role in the fictional company (Superaudit) is paid 10x the EY equivalent; AI Engineers at $500/hr, on par with frontier AI lab engineers</li>
        <li>Overhead of Superaudit is set at 145% direct costs, the rate of a startup with a single client where overhead can't spread across several clients</li>
      </UL>

      <P>
        The full workflow decomposition is available in the <A href={`${REPO}/blob/main/data/superaudit/workflow.ts`}>data model</A>.
      </P>

      <H3 id="pdf-verification">Verification Mechanisms</H3>

      <P>
        I designed the workflow models for verifiability. The <A href={`${REPO}/blob/main/data/types.ts`}>data model</A> is strictly typed, enforcing a repeatable structure for workflows, agent allocation, and cost.
      </P>

      <Visual>
        <div style={{
          fontFamily: t.serif, fontSize: 12, fontWeight: 700, color: t.text,
          lineHeight: 1.7, marginBottom: 8,
        }}>Data Model:</div>
        <DataModel isMobile={false} schemaOnly />
      </Visual>

      <P>
        On top of that, a three-layer verification system shaped both models over the course of this research:
      </P>

      <P>
        <B>Deep research prompts</B> validated foundational claims against primary sources: Apple's FY25 financials confirmed from the 10-K, PCAOB standard applicability, EY workflow structure, and Superaudit feasibility.      </P>

      <P>
        <B>Automated structural tests</B> check requirement coverage across all 35 PCAOB standards, input/output dependencies between workflows, and staffing-to-hours consistency.
      </P>

      <Visual><VitestOutput isMobile={false} /></Visual>

      <P>
        <B>Independent LLM evaluation</B> scrutinize each workflow's factual correctness. A correction pipeline edits the data model based on findings until all tests pass.
      </P>

      <Visual><EvalPipeline isMobile={false} /></Visual>

      <P>
        Reaching that verification strategy was itself iterative, from deep research prompts over single workflows to a unified pipeline with the correct instructions and tool access. Every correction made the model more conservative.
      </P>

      <P>
        The full evaluation results, correction logs, and deep research documents are available at <A href={`${REPO}/tree/main/evals`}>repo/evals</A>.
      </P>

      <H3 id="pdf-claims">Model Limitations</H3>

      <P>
        Both workflows are approximations.
      </P>

      <P>
        Each EY workflow was checked for factual correctness and structural soundness but not against <i>actual implementation</i>. Similarly, each recreated workflow was checked for plausibility but is not actually engineered. For EY, getting to near 100% accuracy requires checking against EY's internal primary sources. Making any of the re-created workflows work requires significantly more depth.
      </P>

      <P>
        The comparison also disregards what it takes to win a mandate to audit Apple. Big 4 auditors have long-lasting reputation with both Fortune 50 companies and regulators. Even if a solution is significantly better (47% less cost at the same objective quality), brand influences decision-makers. While the 10x pay increase for audit-domain roles creates strong incentives for professionals to switch and bring their personal network, winning the mandate is not accounted for.
      </P>

      <P>
        Nevertheless, the claim of the research holds: with current AI capabilities applied to a workflow with objectively measurable requirements, the cost structure collapses even under deliberately conservative assumptions. This applies even under deliberately conservative assumptions: if EY's actual cost, hours, and headcount are all simultaneously 25% lower than modeled, the re-created solution still delivers a 30% cost reduction, 97% fewer labor hours with 89% fewer staff.
      </P>

      <Separator />

      {/* ── Part III ── */}
      <H2 id="pdf-part-3">Part III: Designing a Responsible Transition</H2>

      <P>
        This research modeled a single workflow. That workflow went from 539 people to 44, from 190,000 hours to 4,000, while meeting the same regulatory standard at higher individual pay. If even a fraction of knowledge-work industries see similar compression, millions of roles are affected.
      </P>

      <P>
        The productivity gains demonstrated in this research are here, built on current AI capabilities. The open question is not technical capability but rather economic design: how to structure transitions so the gains of superproductive re-creation are shared broadly.
      </P>

      <H3 id="pdf-societal">Societal Implications</H3>

      <P>
        The early Industrial Revolution offers a <A href="https://knowablemagazine.org/content/article/society/2025/ai-jobs-economy-lessons-from-industrial-revolution">sobering precedent</A>: new technology displaced skilled workers at a pace institutions could not absorb. Handloom weavers, among the best-paid artisans in England, saw their livelihoods collapse within a generation. Decades of social upheaval followed before labor protections, public education, and new employment structures caught up.
      </P>

      <P>
        Relying on legislation seems like a brittle line of defense; it takes years while AI advances in months. Instead, self-regulation by company builders of re-created solutions is the only lever that moves fast enough.
      </P>

      <H3 id="pdf-public-benefit">Optimizing for Public Benefit</H3>

      <P>
        What could that look like in practice? Consider a model where displaced workers receive a one-time payout worth several multiples of their expected retirement income, alongside equity participation in the re-created company. The workers who built the workflow knowledge that makes re-creation possible would share in the value it creates. Those who leave are genuinely better off than if the transition had never happened.
      </P>

      <P>
        The good-will created by generous transition programs is a competitive advantage: less resistance to change, facilitation by domain-specific staff who understand the workflows being re-created, and the credibility to win clients where trust and social responsibility matters.
      </P>

      <P>
        If superproductive AI companies align shareholder interests with public benefit, we are set for an extraordinarily prosperous future.
      </P>
    </article>
  )
}

// ============================================================
// PDF (exported)
// ============================================================

export default function PDF() {
  return (
    <div style={{
      maxWidth: 700,
      margin: "0 auto",
      padding: "0 24px",
      fontFamily: t.serif,
      background: "#fff",
      color: t.text,
    }}>
      <style>{`
        @media print {
          @page { margin: 20mm; size: A4; }
          body { background: #fff !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          button, [data-no-print] { display: none !important; }
        }
      `}</style>

      <CoverPage />
      <PageBreak />
      <Content />
    </div>
  )
}
