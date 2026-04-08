import { useState, useEffect, useRef } from "react"
import { t, Thesis, WorkflowComparison, SingleWorkflowComparison, DataModel, WorkflowTree, findWorkflow, eyCosted, scCosted, VitestOutput, EvalPipeline } from "./Components"

const REPO = "https://github.com/erik-list/superproductive-re-creation"

type TocEntry = { id: string; label: string; indent?: boolean }

const tocSections: TocEntry[] = [
  { id: "essay-title", label: "Part I: Radical Novelty" },
  { id: "essay-title", label: "Summary", indent: true },
  { id: "who-behind", label: "Who's Behind This?", indent: true },
  { id: "part-2", label: "Part II: AI Re-Creation in Detail" },
  { id: "how-ey-audits", label: "How EY Audits Apple", indent: true },
  { id: "why-recreate", label: "Why Recreate from Scratch?", indent: true },
  { id: "recreated-approach", label: "The Re-Created Audit", indent: true },
  { id: "verification", label: "Verification Mechanisms", indent: true },
  { id: "claims", label: "Model Limitations", indent: true },
  { id: "part-3", label: "Part III: Designing a Responsible Transition" },
  { id: "societal-implications", label: "Societal Implications", indent: true },
  { id: "public-benefit", label: "Optimizing for Public Benefit", indent: true },
]

function useActiveSection(ids: string[]): [string, (id: string) => void] {
  const [active, setActive] = useState(ids[0])
  const suppressUntil = useRef(0)

  const setManual = (id: string) => {
    setActive(id)
    suppressUntil.current = Date.now() + 800
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (Date.now() < suppressUntil.current) return
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id)
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px" }
    )
    for (const id of ids) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [ids])
  return [active, setManual]
}

// ============================================================
// TOC
// ============================================================

function TOC({ isMobile, activeSection, onSelect }: { isMobile: boolean; activeSection: string; onSelect: (id: string) => void }) {
  if (isMobile) {
    return (
      <nav style={{ marginBottom: 20 }}>
        {tocSections.map((s, i) => {
          const isActive = s.indent && activeSection === s.id
          const prevIsIndent = i > 0 && tocSections[i - 1].indent
          const isFirstIndent = s.indent && !prevIsIndent
          return (
            <a
              key={`${s.id}-${i}`}
              href={`#${s.id}`}
              onClick={() => onSelect(s.id)}
              style={{
                display: "block",
                fontFamily: t.serif,
                fontSize: s.indent ? 13 : 14,
                lineHeight: 1.4,
                color: isActive ? t.accent : t.muted,
                fontWeight: isActive ? 600 : s.indent ? 400 : 500,
                textDecoration: "none",
                paddingLeft: s.indent ? 16 : 0,
                marginTop: isFirstIndent ? 4 : s.indent ? 2 : (i === 0 ? 0 : 8),
              }}
            >
              {s.label}
            </a>
          )
        })}
      </nav>
    )
  }

  return (
    <nav style={{
      position: "sticky",
      top: 80,
      alignSelf: "start",
    }}>
      {tocSections.map((s, i) => {
        const isActive = s.indent && activeSection === s.id
        const prevIsIndent = i > 0 && tocSections[i - 1].indent
        const isFirstIndent = s.indent && !prevIsIndent
        return (
          <a
            key={`${s.id}-${i}`}
            href={`#${s.id}`}
            onClick={() => onSelect(s.id)}
            style={{
              display: "block",
              fontFamily: t.serif,
              fontSize: s.indent ? 11 : 13,
              lineHeight: 1.4,
              color: isActive ? t.accent : t.muted,
              fontWeight: isActive ? 600 : s.indent ? 400 : 500,
              textDecoration: "none",
              transition: "color 0.15s",
              borderLeft: isActive ? `2px solid ${t.accent}` : "2px solid transparent",
              paddingLeft: s.indent ? 20 : 12,
              marginTop: isFirstIndent ? 6 : s.indent ? 4 : (i === 0 ? 0 : 12),
            }}
          >
            {s.label}
          </a>
        )
      })}
    </nav>
  )
}

// ============================================================
// TYPOGRAPHY HELPERS
// ============================================================

const H2 = ({ id, children, isMobile }: { id: string; children: React.ReactNode; isMobile: boolean }) => (
  <h2 id={id} style={{
    fontFamily: t.serif,
    fontSize: isMobile ? 22 : 26,
    fontWeight: 600,
    color: t.text,
    marginTop: isMobile ? 48 : 64,
    marginBottom: 24,
    lineHeight: 1.3,
  }}>
    {children}
  </h2>
)

const H3 = ({ id, children, isMobile }: { id?: string; children: React.ReactNode; isMobile: boolean }) => (
  <h3 id={id} style={{
    fontFamily: t.serif,
    fontSize: isMobile ? 17 : 19,
    fontWeight: 600,
    color: t.text,
    marginTop: isMobile ? 36 : 48,
    marginBottom: 16,
    lineHeight: 1.3,
  }}>
    {children}
  </h3>
)

const P = ({ children, isMobile }: { children: React.ReactNode; isMobile: boolean }) => (
  <p style={{
    fontFamily: t.serif,
    fontSize: isMobile ? 15 : 16,
    lineHeight: 1.7,
    color: t.text,
    marginBottom: 20,
  }}>
    {children}
  </p>
)

const B = ({ children }: { children: React.ReactNode }) => (
  <strong style={{ fontWeight: 700 }}>{children}</strong>
)

const A = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    style={{
      color: t.accent,
      textDecoration: "none",
      borderBottom: `1px solid ${t.accent}40`,
    }}
  >
    {children}
  </a>
)

const UL = ({ children, isMobile }: { children: React.ReactNode; isMobile: boolean }) => (
  <ul style={{
    fontFamily: t.serif,
    fontSize: isMobile ? 15 : 16,
    lineHeight: 1.7,
    color: t.text,
    marginBottom: 20,
    marginLeft: 24,
    listStyleType: "disc",
  }}>
    {children}
  </ul>
)

const Visual = ({ children }: { children: React.ReactNode }) => (
  <div style={{ margin: "40px 0" }}>
    {children}
  </div>
)

const Separator = () => (
  <hr style={{
    border: "none",
    borderTop: `1px solid ${t.border}`,
    margin: "48px 0",
  }} />
)

// ============================================================
// ESSAY
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

function ModelToggle({ active, onChange }: { active: "ey" | "sc"; onChange: (m: "ey" | "sc") => void }) {
  return (
    <div style={{
      display: "flex",
      gap: 0,
      marginBottom: 16,
      borderRadius: 6,
      border: `1px solid ${t.border}`,
      overflow: "hidden",
    }}>
      <button
        onClick={() => onChange("ey")}
        style={{
          flex: 1, fontFamily: t.mono, fontSize: 11, fontWeight: 500,
          padding: "8px 0", border: "none", cursor: "pointer",
          background: active === "ey" ? t.text : "transparent",
          color: active === "ey" ? "#fff" : t.muted,
          textTransform: "uppercase", letterSpacing: "0.06em", transition: "all 0.15s",
        }}
      >Ernst & Young</button>
      <button
        onClick={() => onChange("sc")}
        style={{
          flex: 1, fontFamily: t.mono, fontSize: 11, fontWeight: 500,
          padding: "8px 0", border: "none", borderLeft: `1px solid ${t.border}`,
          cursor: "pointer",
          background: active === "sc" ? t.accent : "transparent",
          color: active === "sc" ? "#fff" : t.muted,
          textTransform: "uppercase", letterSpacing: "0.06em", transition: "all 0.15s",
        }}
      >Superaudit</button>
    </div>
  )
}

export default function Essay({ isMobile }: { isMobile: boolean }) {
  const sectionIds = tocSections.map(s => s.id)
  const [activeSection, setActiveSection] = useActiveSection(sectionIds)
  const [fullTreeModel, setFullTreeModel] = useState<"ey" | "sc">("sc")
  const [stModel, setStModel] = useState<"ey" | "sc">("sc")
  const [stActiveReq, setStActiveReq] = useState<string | null>("substantive_procedures")

  const article = (
    <article>
      <p style={{
        fontFamily: t.mono,
        fontSize: 11,
        color: t.mutedLight,
        marginBottom: 16,
      }}>
        <a href="https://linktr.ee/list.erik" target="_blank" rel="noopener noreferrer" style={{ color: t.mutedLight, textDecoration: "none", borderBottom: `1px solid ${t.border}` }}>Erik List</a>
        {" | April 10, 2026 | "}
        <a href="/superproductive-re-creation.pdf" target="_blank" rel="noopener noreferrer" style={{ color: t.mutedLight, textDecoration: "none", borderBottom: `1px solid ${t.border}` }}>PDF</a>
      </p>

      <h1 id="essay-title" style={{
        fontFamily: t.serif,
        fontSize: isMobile ? 24 : 34,
        fontWeight: 700,
        color: t.text,
        lineHeight: 1.2,
        marginBottom: isMobile ? 20 : 16,
      }}>
        Superproductive <span style={{ whiteSpace: "nowrap" }}>Re-Creation</span>
      </h1>

      {isMobile && <TOC isMobile={true} activeSection={activeSection} onSelect={setActiveSection} />}

      {/* ── Part I ── */}
      <P isMobile={isMobile}>
        With current AI capabilities, complex multi-million dollar workflows requiring hundreds of staff members can be compressed into radically more productive versions.
      </P>

      <P isMobile={isMobile}>
        Consider a rigorously worked example: Apple's FY25 audit, a workflow spanning 539 staff members across 40+ jurisdictions for a company with $416B in revenue. An audit recreated to harness the current AI models drops by <B>$12M (-47%)</B> in cost, <B>190K (-98%)</B> in labor hours with <B>495 (-92%)</B> fewer people while becoming <B>13% faster</B>.
      </P>

      <Visual><div style={{ marginBottom: isMobile ? -24 : -48 }}><WorkflowComparison isMobile={isMobile} /></div></Visual>

      <P isMobile={isMobile}>
        The comparison works even if cost reductions are deliberately modeled conservatively:
      </P>
      <UL isMobile={isMobile}>
        <li>The productivity gain assumes the current state of frontier models, not future AGI</li>
        <li>Every audit role in the fictional company (Superaudit) is paid 10x the EY equivalent</li>
        <li>Overhead of Superaudit is set at 145% direct costs, the rate of a startup with a single client where overhead can't spread across several clients</li>
      </UL>

      <P isMobile={isMobile}>
        The models for both EY and the fictional Superaudit are built on a typed data model with 327 structural tests and independent LLM evaluation. The full methodology, data, and tests are <A href={REPO}>open-source</A>.
      </P>

      <P isMobile={isMobile}>
        The model could be off by 25% across every EY estimate simultaneously and the finding would still reshape industry economics, urging for responsible deployment (<a href="#claims" style={{ color: t.accent, textDecoration: "none", borderBottom: `1px solid ${t.accent}40` }}>details</a>). Without public benefit efforts those who harness AI for re-created solutions will build fortunes, while the many that get displaced face an uncertain, daunting future.
      </P>

      <P isMobile={isMobile}>
        Radical compression generalizes to any complex workflow that can be digitally represented and has objectively measurable requirements. Audit is just the example.
      </P>

      <P isMobile={isMobile}>
        The socio-economic impact of superproductive gains across complex workflows is immense and requires responsible deployment. This research covers how superproductive re-creation works and presents first ideas to deploy responsibly.
      </P>

      <H3 id="who-behind" isMobile={isMobile}>Who's Behind This?</H3>

      <P isMobile={isMobile}>
        I'm <A href="https://linktr.ee/list.erik">Erik</A> and am deeply curious about building companies and (AI) engineering. I study at <A href="https://www.linkedin.com/feed/update/urn:li:activity:7412032473737564160/">WHU</A> and will spend the summer shipping AI products at GV/20VC-backed <A href="https://www.comstruct.com">Comstruct</A>.
      </P>

      <P isMobile={isMobile}>
        I believe strong reasoning should speak for itself instead of deferring to credentials. For further writing, see my <A href="https://eriklist.substack.com/notes">thought collection</A>.
      </P>

      <Separator />

      {/* ── Part II ── */}
      <H2 id="part-2" isMobile={isMobile}>Part II: AI Re-Creation in Detail</H2>

      <H3 id="how-ey-audits" isMobile={isMobile}>How EY Audits Apple</H3>

      <P isMobile={isMobile}>
        Auditing Apple is a massive undertaking: $416B in revenue, 535 retail stores, contract manufacturing across China, 40+ jurisdictions, and 100+ legal entities. EY's audit spans <B>5 major workstreams</B> across <B>190K+ labor hours</B> with <B>539 people</B> over <B>6 months</B>, costing <B>$25.3M</B> internally against a <B>$34.3M fee</B> paid by Apple.
      </P>

      <P isMobile={isMobile}>
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

      <P isMobile={isMobile}>
        No publicly available decomposition of this workflow exists. Instead I structured all available information into a typed <A href={`${REPO}/blob/main/data/ey/workflow.ts`}>data model</A> using reusable definitions for workflows, agent allocation (human or AI), and cost.
      </P>

      <P isMobile={isMobile}>
        The total audit fee ($34.3M) is exact, taken directly from Apple's proxy statement. The internal cost structure, hours, staffing, and workflow-level allocations are estimated from PCAOB transparency reports, public methodology disclosures, and industry benchmarks. The model also accounts for Apple-specific audit complexities: revenue recognition across hardware bundles, services, and licensing; 535 retail store inventory observations; and component audits of contract manufacturers.
      </P>

      <H3 id="why-recreate" isMobile={isMobile}>Why Think the Apple Audit from Scratch Instead of Transforming EY's Approach?</H3>

      <P isMobile={isMobile}>
        Could EY simply use AI to enhance their existing workflow? After all, they are the experts with proof of it working.
      </P>

      <P isMobile={isMobile}>
        It is true but transforming an existing large-scale workflow has decisive weaknesses over rethinking it from first principles. It is extremely difficult to distinguish process-induced requirements from the actual requirements to deliver a solution: if an auditor is used to testing accounts receivable controls a certain way, finding a new optimal approach requires more effort than starting with current technology from scratch.
      </P>

      <P isMobile={isMobile}>
        And even if EY identifies the optimum quickly, changing, especially removing, work is a huge organizational challenge in a workflow touching 539 staff members inside an organization with over 400,000 employees.
      </P>

      <P isMobile={isMobile}>
        Still, re-creation doesn't mean being blind to the current workflow. The current approach is a valuable informative reference of a working system that includes many well-optimized steps. It gives context that improves a recreated approach.
      </P>

      <H3 id="recreated-approach" isMobile={isMobile}>The AI Re-Created Audit: Auditing Apple with AI and 10x Staff Pay</H3>

      <P isMobile={isMobile}>
        Audit has a very useful property: meeting regulatory requirements is the objectively true measure for success. They are the only real requirements a re-created model must fulfill; everything else in EY's workflow is methodological choice or process-accumulated habit.
      </P>

      <P isMobile={isMobile}>
        The regulatory requirements in Apple's case are 35 auditing standards the Public Company Accounting Oversight Board (PCAOB) defines. These standards prescribe what an auditor must do, from how to assess fraud risk to how to test account balances, but not how to do it.
      </P>

      <P isMobile={isMobile}>
        The re-created workflow meets all 35 PCAOB requirements as effectively as possible with current AI capabilities, using the same typed <A href={`${REPO}/blob/main/data/types.ts`}>data model</A> as the EY baseline. It comprises <B>6 streams</B> with <B>4,143 labor hours (-98%)</B> of <B>44 staff members (-92%)</B> for <B>23 weeks (-13%)</B> costing <B>$13.3M (-47%)</B>.
      </P>

      {/* Full comparison: both trees */}
      <Visual>
        {isMobile ? (
          <>
            <ModelToggle active={fullTreeModel} onChange={setFullTreeModel} />
            <WorkflowTree
              wc={fullTreeModel === "ey" ? eyCosted : scCosted}
              depth={0}
              rootLabel={fullTreeModel === "ey" ? "Current Workflow" : "Recreated Workflow"}
              highlightId={fullTreeModel === "ey" ? "substantive" : "substantive_testing"}
            />
          </>
        ) : (
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
        )}
      </Visual>

      <P isMobile={isMobile}>
        The striking contrast between EY and a new AI approach is best understood through substantive testing, the largest workstream and where the bulk of audit labor goes. Substantive testing is where auditors verify that the numbers in Apple's financial statements are actually correct, account by account.
      </P>

      <P isMobile={isMobile}>
        In EY's current approach, 144 staff test interim-period balances from April to June: revenue cut-off, A/R confirmations, deferred revenue rollforward, inventory, and investment confirmations. Then 268 staff complete the remaining substantive testing through fiscal year-end: bundled revenue allocation, PP&E existence, legal contingencies, derivatives, consolidation, and subsequent events. 117 staff test for fraud risk across global operations, and 42 staff compile misstatements from all locations and evaluate against materiality. Sampling is the core method: auditors select 25-40 transactions per account and extrapolate.
      </P>

      {/* EY substantive tree with descriptions + requirements */}
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

      <P isMobile={isMobile}>
        The same regulatory requirements are met with 28 people instead of 412, not by cutting corners but by testing every transaction where EY samples a few dozen.
      </P>

      <P isMobile={isMobile}>
        In the re-created approach, 12 staff (-92% from 144) and AI handle interim substantive testing with 100% journal entry and A/R confirmation coverage, ratio analytics by segment, and auto-scanned component workpapers across 40+ jurisdictions. 16 staff and AI complete year-end testing with 100% revenue transaction testing, PP&E verification across 535 retail stores, and full derivative and subsequent events coverage.
      </P>

      {/* SC substantive tree with descriptions + requirements, EY muted side by side */}
      <Visual>
        {isMobile ? (
          <>
            <ModelToggle active={stModel} onChange={setStModel} />
            {(() => {
              const wc = stModel === "ey" ? findWorkflow(eyCosted, "substantive") : findWorkflow(scCosted, "substantive_testing")
              const descs = stModel === "ey" ? eyStDescs : scStDescs
              const hlId = stModel === "ey" ? "substantive" : "substantive_testing"
              return wc ? <WorkflowTree wc={wc} depth={0} highlightId={hlId} descriptions={descs} showRequirementBadges activeRequirement={stActiveReq} onRequirementToggle={(id) => setStActiveReq(stActiveReq === id ? null : id)} /> : null
            })()}
          </>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
            <div style={{ opacity: 0.4 }}>
              <div style={{
                fontFamily: t.mono, fontSize: 10, fontWeight: 500, color: t.text,
                textTransform: "uppercase", letterSpacing: "0.08em",
                marginBottom: 14, paddingBottom: 10, borderBottom: `1px solid ${t.border}`,
              }}>Ernst & Young</div>
              {(() => {
                const eyST = findWorkflow(eyCosted, "substantive")
                return eyST ? <WorkflowTree wc={eyST} depth={0} highlightId="substantive" descriptions={eyStDescs} showRequirementBadges activeRequirement={stActiveReq} onRequirementToggle={(id) => setStActiveReq(stActiveReq === id ? null : id)} /> : null
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
                return scST ? <WorkflowTree wc={scST} depth={0} highlightId="substantive_testing" descriptions={scStDescs} showRequirementBadges activeRequirement={stActiveReq} onRequirementToggle={(id) => setStActiveReq(stActiveReq === id ? null : id)} /> : null
              })()}
            </div>
          </div>
        )}
      </Visual>

      <P isMobile={isMobile}>
        This pattern repeats across the workflow. Where EY relies on human judgment to scope, sample, and document, the re-created model uses AI to process comprehensively and surfaces only exceptions for human decision. In that way, the bottleneck shifts from labor to external dependencies: client data readiness, legal timelines, and regulatory calendars.
      </P>

      <P isMobile={isMobile}>
        The recreated workflow is designed to be feasible, not optimistic:
      </P>
      <UL isMobile={isMobile}>
        <li>The productivity gain assumes the current state of frontier models, not future AGI</li>
        <li>Humans in the loop approve or correct every AI output</li>
        <li>Every audit role in the fictional company (Superaudit) is paid 10x the EY equivalent; AI Engineers at $500/hr, on par with frontier AI lab engineers</li>
        <li>Overhead of Superaudit is set at 145% direct costs, the rate of a startup with a single client where overhead can't spread across several clients</li>
      </UL>

      <P isMobile={isMobile}>
        The full workflow decomposition is available in the <A href={`${REPO}/blob/main/data/superaudit/workflow.ts`}>data model</A>.
      </P>

      <H3 id="verification" isMobile={isMobile}>Verification Mechanisms</H3>

      <P isMobile={isMobile}>
        I designed the workflow models for verifiability. The <A href={`${REPO}/blob/main/data/types.ts`}>data model</A> is strictly typed, enforcing a repeatable structure for workflows, agent allocation, and cost.
      </P>

      <Visual>
        <div style={{
          fontFamily: t.serif, fontSize: isMobile ? 15 : 16, fontWeight: 700, color: t.text,
          lineHeight: 1.7, marginBottom: 8,
        }}>Data Model:</div>
        <DataModel isMobile={isMobile} schemaOnly />
      </Visual>

      <P isMobile={isMobile}>
        On top of that, a three-layer verification system shaped both models over the course of this research:
      </P>

      <P isMobile={isMobile}>
        <B>Deep research prompts</B> validated foundational claims against primary sources: Apple's FY25 financials confirmed from the 10-K, PCAOB standard applicability, EY workflow structure, and Superaudit feasibility.      </P>

      <P isMobile={isMobile}>
        <B>Automated structural tests</B> check requirement coverage across all 35 PCAOB standards, input/output dependencies between workflows, and staffing-to-hours consistency.
      </P>

      <Visual><VitestOutput isMobile={isMobile} /></Visual>

      <P isMobile={isMobile}>
        <B>Independent LLM evaluation</B> scrutinize each workflow's factual correctness. A correction pipeline edits the data model based on findings until all tests pass.
      </P>

      <Visual><EvalPipeline isMobile={isMobile} /></Visual>

      <P isMobile={isMobile}>
        Reaching that verification strategy was itself iterative, from deep research prompts over single workflows to a unified pipeline with the correct instructions and tool access. Every correction made the model more conservative.
      </P>

      <P isMobile={isMobile}>
        The full evaluation results, correction logs, and deep research documents are available at <A href={`${REPO}/tree/main/evals`}>repo/evals</A>.
      </P>

      <H3 id="claims" isMobile={isMobile}>Model Limitations</H3>

      <P isMobile={isMobile}>
        Both workflows are approximations.
      </P>

      <P isMobile={isMobile}>
        Each EY workflow was checked for factual correctness and structural soundness but not against <i>actual implementation</i>. Similarly, each recreated workflow was checked for plausibility but is not actually engineered. For EY, getting to near 100% accuracy requires checking against EY's internal primary sources. Making any of the re-created workflows work requires significantly more depth.
      </P>

      <P isMobile={isMobile}>
        The comparison also disregards what it takes to win a mandate to audit Apple. Big 4 auditors have long-lasting reputation with both Fortune 50 companies and regulators. Even if a solution is significantly better (47% less cost at the same objective quality), brand influences decision-makers. While the 10x pay increase for audit-domain roles creates strong incentives for professionals to switch and bring their personal network, winning the mandate is not accounted for.
      </P>

      <P isMobile={isMobile}>
        Nevertheless, the claim of the research holds: with current AI capabilities applied to a workflow with objectively measurable requirements, the cost structure collapses even under deliberately conservative assumptions. This applies even under deliberately conservative assumptions: if EY's actual cost, hours, and headcount are all simultaneously 25% lower than modeled, the re-created solution still delivers a 30% cost reduction, 97% fewer labor hours with 89% fewer staff.
      </P>

      <Separator />

      {/* ── Part III ── */}
      <H2 id="part-3" isMobile={isMobile}>Part III: Designing a Responsible Transition</H2>

      <P isMobile={isMobile}>
        This research modeled a single workflow. That workflow went from 539 people to 44, from 190,000 hours to 4,000, while meeting the same regulatory standard at higher individual pay. If even a fraction of knowledge-work industries see similar compression, millions of roles are affected.
      </P>

      <P isMobile={isMobile}>
        The productivity gains demonstrated in this research are here, built on current AI capabilities. The open question is not technical capability but rather economic design: how to structure transitions so the gains of superproductive re-creation are shared broadly.
      </P>

      <H3 id="societal-implications" isMobile={isMobile}>Societal Implications</H3>

      <P isMobile={isMobile}>
        The early Industrial Revolution offers a <A href="https://knowablemagazine.org/content/article/society/2025/ai-jobs-economy-lessons-from-industrial-revolution">sobering precedent</A>: new technology displaced skilled workers at a pace institutions could not absorb. Handloom weavers, among the best-paid artisans in England, saw their livelihoods collapse within a generation. Decades of social upheaval followed before labor protections, public education, and new employment structures caught up.
      </P>

      <P isMobile={isMobile}>
        Relying on legislation seems like a brittle line of defense; it takes years while AI advances in months. Instead, self-regulation by company builders of re-created solutions is the only lever that moves fast enough.
      </P>

      <H3 id="public-benefit" isMobile={isMobile}>Optimizing for Public Benefit</H3>

      <P isMobile={isMobile}>
        What could that look like in practice? Consider a model where displaced workers receive a one-time payout worth several multiples of their expected retirement income, alongside equity participation in the re-created company. The workers who built the workflow knowledge that makes re-creation possible would share in the value it creates. Those who leave are genuinely better off than if the transition had never happened.
      </P>

      <P isMobile={isMobile}>
        The good-will created by generous transition programs is a competitive advantage: less resistance to change, facilitation by domain-specific staff who understand the workflows being re-created, and the credibility to win clients where trust and social responsibility matters.
      </P>

      <P isMobile={isMobile}>
        If superproductive AI companies align shareholder interests with public benefit, we are set for an extraordinarily prosperous future.
      </P>
    </article>
  )

  if (isMobile) {
    return (
      <div>
        {article}
      </div>
    )
  }

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "160px 1fr",
      gap: 32,
    }}>
      <TOC isMobile={false} activeSection={activeSection} onSelect={setActiveSection} />
      {article}
    </div>
  )
}
