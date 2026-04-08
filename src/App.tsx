import { useState, useEffect, useRef } from "react"
import Essay from "./Essay"
import PDF from "./PDF"
import { t, WorkflowComparison, DataModel, WorkflowTree, findWorkflow, eyCosted, scCosted, VitestOutput, EvalPipeline } from "./Components"

// ============================================================
// RESPONSIVE HOOK
// ============================================================
function useIsMobile(breakpoint = 576) {
  const [isMobile, setIsMobile] = useState(
    window.innerWidth <= breakpoint
  )
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint}px)`)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mql.addEventListener("change", handler)
    return () => mql.removeEventListener("change", handler)
  }, [breakpoint])
  return isMobile
}

// ============================================================
// SCROLL-TO-REVEAL HOOK
// ============================================================
function useScrollReveal() {
  const [visible, setVisible] = useState(true)
  const lastY = useRef(0)
  const suppressUntil = useRef(0)

  useEffect(() => {
    const onAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const anchor = target.closest("a[href^='#']")
      if (anchor) {
        suppressUntil.current = Date.now() + 800
        setVisible(false)
      }
    }
    document.addEventListener("click", onAnchorClick)

    const onScroll = () => {
      if (Date.now() < suppressUntil.current) {
        lastY.current = window.scrollY
        return
      }
      const y = window.scrollY
      if (y < 50) {
        setVisible(true)
      } else if (y > lastY.current) {
        setVisible(false)
      } else {
        setVisible(true)
      }
      lastY.current = y
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      document.removeEventListener("click", onAnchorClick)
    }
  }, [])

  return visible
}

// ============================================================
// ICON OPTIONS — 3 crossing-arrow shuffle variants (pick one, delete the rest)
// ============================================================
// Phosphor shuffle icon
function ShuffleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 256 256" fill="currentColor" style={{ display: "block" }}>
      <path d="M237.66 178.34a8 8 0 0 1 0 11.32l-24 24a8 8 0 0 1-11.32-11.32L212.69 192H200.94a72.12 72.12 0 0 1-58.59-30.15l-41.72-58.4A56.1 56.1 0 0 0 55.06 80H32a8 8 0 0 1 0-16h23.06a72.12 72.12 0 0 1 58.59 30.15l41.72 58.4A56.1 56.1 0 0 0 200.94 176h11.75l-10.35-10.34a8 8 0 0 1 11.32-11.32ZM143.06 107.23a8 8 0 0 0 11.24-1.45A56.1 56.1 0 0 1 200.94 80h11.75l-10.35 10.34a8 8 0 0 0 11.32 11.32l24-24a8 8 0 0 0 0-11.32l-24-24a8 8 0 0 0-11.32 11.32L212.69 64H200.94a72.12 72.12 0 0 0-58.59 30.15l-0.74 1.63a8 8 0 0 0 1.45 11.45Zm-30.12 41.54a8 8 0 0 0-11.24 1.45A56.1 56.1 0 0 1 55.06 176H32a8 8 0 0 0 0 16h23.06a72.12 72.12 0 0 0 58.59-30.15l.74-1.03a8 8 0 0 0-1.45-11.05Z" />
    </svg>
  )
}

// ============================================================
// HEADER
// ============================================================
const HEADER_H = 56

function Header({ isMobile, visible, titleVisible }: {
  isMobile: boolean
  visible: boolean
  titleVisible: boolean
}) {
  const showBrand = !titleVisible

  return (
    <header style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      height: HEADER_H,
      background: "#f4f1eb",
      borderBottom: `1px solid ${t.border}`,
      zIndex: 100,
      transform: `translateY(${visible ? 0 : -HEADER_H}px)`,
      transition: "transform 0.3s ease",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div style={{
        width: "100%",
        maxWidth: isMobile ? undefined : 820,
        padding: isMobile ? "0 16px" : "0 24px",
        display: "flex",
        alignItems: "center",
      }}>
        {/* Brand */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          color: t.text,
        }}>
          <ShuffleIcon />
          <span style={{
            fontFamily: t.serif,
            fontSize: isMobile ? 14 : 16,
            fontWeight: 600,
            color: t.text,
          }}>
            Superproductive <span style={{ whiteSpace: "nowrap" }}>Re-Creation</span>
          </span>
        </div>
      </div>
    </header>
  )
}

// ============================================================
// MAIN APP
// ============================================================
function useTitleVisible() {
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const el = document.getElementById("essay-title")
    if (!el) { setVisible(false); return }
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return visible
}

const REPO = "https://github.com/erik-list/superproductive-re-creation"

const Pr = ({ children, isMobile }: { children: React.ReactNode; isMobile: boolean }) => (
  <p style={{ fontFamily: t.serif, fontSize: isMobile ? 15 : 16, lineHeight: 1.7, color: t.text, marginBottom: 20 }}>{children}</p>
)
const Br = ({ children }: { children: React.ReactNode }) => <strong style={{ fontWeight: 700 }}>{children}</strong>
const Ar = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: t.accent, textDecoration: "none", borderBottom: `1px solid ${t.accent}40` }}>{children}</a>
)
const ULr = ({ children, isMobile }: { children: React.ReactNode; isMobile: boolean }) => (
  <ul style={{ fontFamily: t.serif, fontSize: isMobile ? 15 : 16, lineHeight: 1.7, color: t.text, marginBottom: 20, marginLeft: 24, listStyleType: "disc" }}>{children}</ul>
)
const H2r = ({ children, isMobile }: { children: React.ReactNode; isMobile: boolean }) => (
  <h2 style={{ fontFamily: t.serif, fontSize: isMobile ? 22 : 26, fontWeight: 600, color: t.text, marginTop: isMobile ? 48 : 64, marginBottom: 24, lineHeight: 1.3 }}>{children}</h2>
)
const H3r = ({ children, isMobile }: { children: React.ReactNode; isMobile: boolean }) => (
  <h3 style={{ fontFamily: t.serif, fontSize: isMobile ? 17 : 19, fontWeight: 600, color: t.text, marginTop: isMobile ? 36 : 48, marginBottom: 16, lineHeight: 1.3 }}>{children}</h3>
)
const Vr = ({ children }: { children: React.ReactNode }) => <div style={{ margin: "40px 0" }}>{children}</div>
const Sep = () => <hr style={{ border: "none", borderTop: `1px solid ${t.border}`, margin: "48px 0" }} />

const eyStDescs: Record<string, string> = {
  interim_substantive: "144 de angajati testeaza soldurile din perioada interimara (aprilie-iunie): revenue cut-off, confirmari A/R, deferred revenue rollforward, inventar, confirmari de numerar si investitii, confirmari de datorii, testarea tranzactiilor share buyback.",
  final_substantive: "268 de angajati finalizeaza testarea substantiva pana la sfarsitul anului fiscal (27 septembrie): alocarea bundled revenue, existenta PP&E, contingente legale, derivative, consolidare, ASR derivative fair value, treasury stock rollforward, numararea actiunilor EPS, evenimente ulterioare.",
  fraud_assessment: "117 angajati testeaza riscul de frauda in operatiunile globale: riscul prezumat de recunoastere a veniturilor pentru hardware + services allocation, testarea management override, esantionarea inregistrarilor contabile.",
  adjustments: "42 de angajati compileaza erorile din toate locatiile si le evalueaza fata de materialitate: estimarea contingent liability pentru litigiile active, comunicarea cu audit committee.",
}
const scStDescs: Record<string, string> = {
  interim_substantive: "12 angajati si AI testeaza soldurile din perioada interimara (aprilie-iunie): acoperire 100% a inregistrarilor contabile si confirmarilor A/R, analize pe segmente, confirmari de numerar si datorii, testarea tranzactiilor share buyback, scanarea automata a dosarelor componentelor din peste 40 de jurisdictii.",
  final_substantive: "16 angajati si AI finalizeaza testarea substantiva pana la sfarsitul anului fiscal (27 septembrie): testare 100% a tranzactiilor de venituri, deferred revenue rollforward, analiza contingentelor legale, revizuirea impozitului pe venit, verificarea PP&E in 535 de magazine retail, decontarea ASR derivative, hedging derivatives, evenimente ulterioare.",
  fraud_procedures: "10 angajati si AI testeaza riscul de frauda in toate entitatile: testare 100% a tranzactiilor de venituri pentru existenta, sincronizare si alocare ASC 606, testare 100% a journal entry override, evaluarea biasului estimarilor contabile.",
  misstatement_accumulation: "14 angajati si AI compileaza erorile din toate stream-urile si locatiile componentelor: clasifica erorile factuale, de judecata si proiectate, evalueaza fata de materialitate, analizeaza factorii calitativi. Partenerul ia concluzia finala.",
}

function EssayRo({ isMobile }: { isMobile: boolean }) {
  return (
    <article>
      <p style={{ fontFamily: t.serif, fontSize: isMobile ? 15 : 16, color: t.accent, marginBottom: 32, lineHeight: 1.7 }}>
        <span style={{ fontStyle: "italic" }}>Pentru draga mea Anita, ca sa iti fie cel mai usor sa intelegi munca mea. Sper sa poti intelege chiar si cu termenii tehnici, daca nu, iti explic cu drag</span> 💗
      </p>

      <h1 style={{ fontFamily: t.serif, fontSize: isMobile ? 24 : 34, fontWeight: 700, color: t.text, lineHeight: 1.2, marginBottom: isMobile ? 20 : 16 }}>
        Superproductive <span style={{ whiteSpace: "nowrap" }}>Re-Creation</span>
      </h1>

      <Pr isMobile={isMobile}>
        Cu capabilitatile actuale ale AI, workflow-uri complexe de milioane de dolari care necesita sute de angajati pot fi comprimate in versiuni radical mai productive.
      </Pr>

      <Pr isMobile={isMobile}>
        Un exemplu riguros: auditul Apple FY25, un workflow cu 539 de angajati in peste 40 de jurisdictii pentru o companie cu venituri de $416B. Un audit recreat cu modelele AI actuale scade cu <Br>$12M (-47%)</Br> in cost, <Br>190K (-98%)</Br> in ore de munca, cu <Br>495 (-92%)</Br> mai putini oameni si devine <Br>13% mai rapid</Br>.
      </Pr>

      <Vr><div style={{ marginBottom: isMobile ? -24 : -48 }}><WorkflowComparison isMobile={isMobile} /></div></Vr>

      <Pr isMobile={isMobile}>
        Comparatia functioneaza chiar daca reducerile de cost sunt modelate deliberat conservator:
      </Pr>
      <ULr isMobile={isMobile}>
        <li>Castigul de productivitate presupune starea actuala a frontier models, nu un viitor AGI</li>
        <li>Fiecare rol de audit din compania fictiva (Superaudit) este platit de 10 ori mai mult decat echivalentul EY</li>
        <li>Overhead-ul Superaudit este setat la 145% din costurile directe, rata unui startup cu un singur client unde overhead-ul nu se poate distribui</li>
      </ULr>

      <Pr isMobile={isMobile}>
        Modelele pentru EY si pentru Superaudit sunt construite pe un data model tipizat cu 327 de teste structurale si evaluare independenta LLM. Intreaga metodologie, datele si testele sunt <Ar href={REPO}>open-source</Ar>.
      </Pr>

      <Pr isMobile={isMobile}>
        Modelul ar putea fi eronat cu 25% la fiecare estimare EY simultan, iar concluzia ar remodela tot economia industriei, cerand implementare responsabila. Fara eforturi de beneficiu public, cei care folosesc AI pentru solutii recreate vor construi averi, in timp ce cei multi care sunt inlocuiti se confrunta cu un viitor incert.
      </Pr>

      <Pr isMobile={isMobile}>
        Compresia radicala se generalizeaza la orice workflow complex care poate fi reprezentat digital si are cerinte masurabile obiectiv. Auditul este doar exemplul.
      </Pr>

      <Pr isMobile={isMobile}>
        Impactul socio-economic al castigurilor superproductive in workflow-uri complexe este imens si necesita implementare responsabila. Aceasta cercetare acopera cum functioneaza superproductive re-creation si prezinta primele idei pentru implementare responsabila.
      </Pr>

      <H3r isMobile={isMobile}>Cine este in spatele acestui proiect?</H3r>

      <Pr isMobile={isMobile}>
        Sunt <Ar href="https://linktr.ee/list.erik">Erik</Ar> si sunt profund curios despre construirea companiilor si (AI) engineering. Studiez la <Ar href="https://www.linkedin.com/feed/update/urn:li:activity:7412032473737564160/">WHU</Ar> si voi petrece vara construind produse AI la <Ar href="https://www.comstruct.com">Comstruct</Ar>, finantat de GV/20VC.
      </Pr>

      <Pr isMobile={isMobile}>
        Cred ca rationamentul puternic ar trebui sa vorbeasca de la sine in loc sa se bazeze pe credentiale. Pentru alte scrieri, vezi <Ar href="https://eriklist.substack.com/notes">colectia mea de ganduri</Ar>.
      </Pr>

      <Sep />

      <H2r isMobile={isMobile}>Partea II: AI Re-Creation in Detaliu</H2r>

      <H3r isMobile={isMobile}>Cum auditeaza EY compania Apple</H3r>

      <Pr isMobile={isMobile}>
        Auditarea Apple este o intreprindere masiva: $416B in venituri, 535 de magazine retail, productie contractuala in China, peste 40 de jurisdictii si peste 100 de entitati juridice. Auditul EY acopera <Br>5 workstream-uri majore</Br> cu <Br>190K+ ore de munca</Br>, <Br>539 de oameni</Br> pe parcursul a <Br>6 luni</Br>, costând <Br>$25.3M</Br> intern fata de un <Br>onorariu de $34.3M</Br> platit de Apple.
      </Pr>

      <Pr isMobile={isMobile}>
        Cele 5 workstream-uri urmeaza logica unui audit: mai intai, evaluarea a ce ar putea merge gresit si unde (planning and risk assessment). Apoi testarea daca controalele financiare interne ale Apple functioneaza (controls testing, inclusiv sisteme IT). Verificarea ca cifrele din situatiile financiare sunt corecte (substantive testing). Aceasta se coordoneaza in peste 40 de operatiuni nationale (group and component audit), apoi se leaga totul si se concluzioneaza (completion and reporting). Fiecare workstream major se descompune in mai multe sub-workflow-uri pe 2 niveluri.
      </Pr>

      <Vr>
        <div style={{ fontFamily: t.mono, fontSize: 10, fontWeight: 500, color: t.text, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14, paddingBottom: 10, borderBottom: `1px solid ${t.border}` }}>Ernst & Young</div>
        <WorkflowTree wc={eyCosted} depth={0} rootLabel="Current Workflow" />
      </Vr>

      <Pr isMobile={isMobile}>
        Nu exista nicio descompunere publica a acestui workflow. In schimb, am structurat toate informatiile disponibile intr-un <Ar href={`${REPO}/blob/main/data/ey/workflow.ts`}>data model</Ar> tipizat folosind definitii reutilizabile pentru workflow-uri, alocarea agentilor (umani sau AI) si cost.
      </Pr>

      <Pr isMobile={isMobile}>
        Onorariul total de audit ($34.3M) este exact, luat direct din proxy statement-ul Apple. Structura interna de costuri, ore, personal si alocari la nivel de workflow sunt estimate din rapoartele de transparenta PCAOB, dezvaluirile publice de metodologie si benchmark-uri din industrie.
      </Pr>

      <H3r isMobile={isMobile}>De ce sa gandesti auditul Apple de la zero in loc sa transformi abordarea EY?</H3r>

      <Pr isMobile={isMobile}>
        Ar putea EY pur si simplu sa foloseasca AI pentru a imbunatati workflow-ul existent? La urma urmei, ei sunt expertii cu dovada ca functioneaza.
      </Pr>

      <Pr isMobile={isMobile}>
        Este adevarat, dar transformarea unui workflow existent la scara mare are slabiciuni decisive fata de regandirea lui din primele principii. Este extrem de dificil sa distingi cerintele induse de proces de cerintele reale pentru a livra o solutie: daca un auditor este obisnuit sa testeze controalele accounts receivable intr-un anumit mod, gasirea unei noi abordari optime necesita mai mult efort decat sa incepi de la zero cu tehnologia actuala.
      </Pr>

      <Pr isMobile={isMobile}>
        Si chiar daca EY identifica optimul rapid, schimbarea, in special eliminarea muncii, este o provocare organizationala uriasa intr-un workflow care implica 539 de angajati in interiorul unei organizatii cu peste 400.000 de angajati.
      </Pr>

      <Pr isMobile={isMobile}>
        Totusi, re-creation nu inseamna sa fii orb la workflow-ul actual. Abordarea curenta este o referinta informativa valoroasa a unui sistem functional care include multi pasi bine optimizati. Ofera context care imbunatateste o abordare recreata.
      </Pr>

      <H3r isMobile={isMobile}>Auditul recreat cu AI: auditarea Apple cu AI si salariu de 10x</H3r>

      <Pr isMobile={isMobile}>
        Auditul are o proprietate foarte utila: indeplinirea cerintelor reglementare este masura obiectiv adevarata pentru succes. Sunt singurele cerinte reale pe care un model recreat trebuie sa le indeplineasca; orice altceva din workflow-ul EY este alegere metodologica sau obicei acumulat in proces.
      </Pr>

      <Pr isMobile={isMobile}>
        Cerintele reglementare in cazul Apple sunt 35 de standarde de audit pe care Public Company Accounting Oversight Board (PCAOB) le defineste. Aceste standarde prescriu ce trebuie sa faca un auditor, de la cum sa evalueze riscul de frauda pana la cum sa testeze soldurile conturilor, dar nu cum sa o faca.
      </Pr>

      <Pr isMobile={isMobile}>
        Workflow-ul recreat indeplineste toate cele 35 de cerinte PCAOB cat mai eficient posibil cu capabilitatile AI actuale, folosind acelasi <Ar href={`${REPO}/blob/main/data/types.ts`}>data model</Ar> tipizat ca si baseline-ul EY. Cuprinde <Br>6 stream-uri</Br> cu <Br>4.143 ore de munca (-98%)</Br>, <Br>44 de angajati (-92%)</Br> pe <Br>23 de saptamani (-13%)</Br> costând <Br>$13.3M (-47%)</Br>.
      </Pr>

      <Vr>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 32 }}>
          <div style={{ opacity: 0.4 }}>
            <div style={{ fontFamily: t.mono, fontSize: 10, fontWeight: 500, color: t.text, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14, paddingBottom: 10, borderBottom: `1px solid ${t.border}` }}>Ernst & Young</div>
            <WorkflowTree wc={eyCosted} depth={0} rootLabel="Current Workflow" highlightId="substantive" />
          </div>
          <div>
            <div style={{ fontFamily: t.mono, fontSize: 10, fontWeight: 500, color: t.accent, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14, paddingBottom: 10, borderBottom: `1px solid ${t.accent}40` }}>Superaudit</div>
            <WorkflowTree wc={scCosted} depth={0} rootLabel="Recreated Workflow" highlightId="substantive_testing" />
          </div>
        </div>
      </Vr>

      <Pr isMobile={isMobile}>
        Contrastul izbitor dintre EY si o noua abordare AI se intelege cel mai bine prin substantive testing, cel mai mare workstream si unde se duce cea mai mare parte a muncii de audit. Substantive testing este locul unde auditorii verifica ca cifrele din situatiile financiare ale Apple sunt de fapt corecte, cont cu cont.
      </Pr>

      <Pr isMobile={isMobile}>
        In abordarea actuala a EY, 144 de angajati testeaza soldurile din perioada interimara din aprilie pana in iunie: revenue cut-off, confirmari A/R, deferred revenue rollforward, inventar si confirmari de investitii. Apoi 268 de angajati finalizeaza restul testarii substantive pana la sfarsitul anului fiscal: alocarea bundled revenue, existenta PP&E, contingente legale, derivative, consolidare si evenimente ulterioare. 117 angajati testeaza riscul de frauda in operatiunile globale, iar 42 de angajati compileaza erorile din toate locatiile si le evalueaza fata de materialitate. Esantionarea este metoda principala: auditorii selecteaza 25-40 de tranzactii per cont si extrapoleaza.
      </Pr>

      <Vr>
        <div style={{ fontFamily: t.mono, fontSize: 10, fontWeight: 500, color: t.text, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14, paddingBottom: 10, borderBottom: `1px solid ${t.border}` }}>Ernst & Young</div>
        {(() => {
          const eyST = findWorkflow(eyCosted, "substantive")
          return eyST ? <WorkflowTree wc={eyST} depth={0} descriptions={eyStDescs} showRequirementBadges /> : null
        })()}
      </Vr>

      <Pr isMobile={isMobile}>
        Aceleasi cerinte reglementare sunt indeplinite cu 28 de oameni in loc de 412, nu prin taieri de colturi, ci prin testarea fiecarei tranzactii acolo unde EY esantioneaza doar cateva zeci.
      </Pr>

      <Pr isMobile={isMobile}>
        In abordarea recreata, 12 angajati (-92% fata de 144) si AI gestioneaza testarea substantiva interimara cu acoperire 100% a inregistrarilor contabile si confirmarilor A/R, analize pe segmente si scanarea automata a dosarelor de lucru ale componentelor din peste 40 de jurisdictii. 16 angajati si AI finalizeaza testarea de sfarsit de an cu testare 100% a tranzactiilor de venituri, verificarea PP&E in 535 de magazine retail si acoperire completa a derivativelor si evenimentelor ulterioare.
      </Pr>

      <Vr>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 32 }}>
          <div style={{ opacity: 0.4 }}>
            <div style={{ fontFamily: t.mono, fontSize: 10, fontWeight: 500, color: t.text, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14, paddingBottom: 10, borderBottom: `1px solid ${t.border}` }}>Ernst & Young</div>
            {(() => {
              const eyST = findWorkflow(eyCosted, "substantive")
              return eyST ? <WorkflowTree wc={eyST} depth={0} descriptions={eyStDescs} showRequirementBadges /> : null
            })()}
          </div>
          <div>
            <div style={{ fontFamily: t.mono, fontSize: 10, fontWeight: 500, color: t.accent, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14, paddingBottom: 10, borderBottom: `1px solid ${t.accent}40` }}>Superaudit</div>
            {(() => {
              const scST = findWorkflow(scCosted, "substantive_testing")
              return scST ? <WorkflowTree wc={scST} depth={0} descriptions={scStDescs} showRequirementBadges /> : null
            })()}
          </div>
        </div>
      </Vr>

      <Pr isMobile={isMobile}>
        Acest tipar se repeta in tot workflow-ul. Acolo unde EY se bazeaza pe judecata umana pentru a defini scopul, a esantiona si a documenta, modelul recreat foloseste AI pentru a procesa cuprinzator si aduce doar exceptiile pentru decizie umana. In acest fel, bottleneck-ul se muta de la forta de munca la dependente externe: disponibilitatea datelor clientului, termenele legale si calendarele reglementare.
      </Pr>

      <Pr isMobile={isMobile}>
        Workflow-ul recreat este conceput sa fie fezabil, nu optimist:
      </Pr>
      <ULr isMobile={isMobile}>
        <li>Castigul de productivitate presupune starea actuala a frontier models, nu un viitor AGI</li>
        <li>Oamenii in the loop aproba sau corecteaza fiecare output AI</li>
        <li>Fiecare rol de audit din compania fictiva (Superaudit) este platit de 10x mai mult decat echivalentul EY; AI Engineers la $500/ora, comparabil cu inginerii de la laboratoarele AI de top</li>
        <li>Overhead-ul Superaudit este setat la 145% din costurile directe, rata unui startup cu un singur client</li>
      </ULr>

      <Pr isMobile={isMobile}>
        Intreaga descompunere a workflow-ului este disponibila in <Ar href={`${REPO}/blob/main/data/superaudit/workflow.ts`}>data model</Ar>.
      </Pr>

      <H3r isMobile={isMobile}>Mecanisme de verificare</H3r>

      <Pr isMobile={isMobile}>
        Am proiectat modelele de workflow pentru verificabilitate. <Ar href={`${REPO}/blob/main/data/types.ts`}>Data model-ul</Ar> este strict tipizat, impunand o structura repetabila pentru workflow-uri, alocarea agentilor si cost.
      </Pr>

      <Vr>
        <div style={{ fontFamily: t.serif, fontSize: isMobile ? 15 : 16, fontWeight: 700, color: t.text, lineHeight: 1.7, marginBottom: 8 }}>Data Model:</div>
        <DataModel isMobile={isMobile} schemaOnly />
      </Vr>

      <Pr isMobile={isMobile}>
        Pe langa aceasta, un sistem de verificare pe trei niveluri a modelat ambele modele pe parcursul acestei cercetari:
      </Pr>

      <Pr isMobile={isMobile}>
        <Br>Deep research prompts</Br> au validat afirmatiile fundamentale impotriva surselor primare: datele financiare Apple FY25 confirmate din 10-K, aplicabilitatea standardelor PCAOB, structura workflow-ului EY si fezabilitatea Superaudit.
      </Pr>

      <Pr isMobile={isMobile}>
        <Br>Teste structurale automate</Br> verifica acoperirea cerintelor pentru toate cele 35 de standarde PCAOB, dependentele input/output intre workflow-uri si consistenta personal-ore.
      </Pr>

      <Vr><VitestOutput isMobile={isMobile} /></Vr>

      <Pr isMobile={isMobile}>
        <Br>Evaluare LLM independenta</Br> scrutinizeaza corectitudinea factuala a fiecarui workflow. Un pipeline de corectie editeaza data model-ul pe baza constatarilor pana cand toate testele trec.
      </Pr>

      <Vr><EvalPipeline isMobile={isMobile} /></Vr>

      <Pr isMobile={isMobile}>
        Atingerea acelei strategii de verificare a fost ea insasi iterativa, de la deep research prompts pe workflow-uri individuale la un pipeline unificat cu instructiunile si accesul la instrumente corecte. Fiecare corectie a facut modelul mai conservator.
      </Pr>

      <Pr isMobile={isMobile}>
        Rezultatele complete ale evaluarii, jurnalele de corectii si documentele de cercetare aprofundata sunt disponibile la <Ar href={`${REPO}/tree/main/evals`}>repo/evals</Ar>.
      </Pr>

      <H3r isMobile={isMobile}>Limitarile modelului</H3r>

      <Pr isMobile={isMobile}>
        Ambele workflow-uri sunt aproximari.
      </Pr>

      <Pr isMobile={isMobile}>
        Fiecare workflow EY a fost verificat pentru corectitudine factuala si soliditate structurala, dar nu impotriva <i>implementarii reale</i>. Similar, fiecare workflow recreat a fost verificat pentru plauzibilitate, dar nu este efectiv implementat. Pentru EY, atingerea unei acurateti aproape de 100% necesita verificarea impotriva surselor primare interne ale EY. Realizarea oricaruia dintre workflow-urile recreate necesita semnificativ mai multa profunzime.
      </Pr>

      <Pr isMobile={isMobile}>
        Comparatia ignora de asemenea ce este necesar pentru a castiga mandatul de a audita Apple. Auditorii Big 4 au reputatie de lunga durata atat cu companiile Fortune 50, cat si cu autoritatile de reglementare. Chiar daca o solutie este semnificativ mai buna (47% mai putin cost la aceeasi calitate obiectiva), brandul influenteaza factorii de decizie.
      </Pr>

      <Pr isMobile={isMobile}>
        Cu toate acestea, afirmatia cercetarii se mentine: cu capabilitatile AI actuale aplicate unui workflow cu cerinte masurabile obiectiv, structura costurilor se prabuseste chiar si sub presupuneri deliberat conservatoare. Daca costul real, orele si numarul de personal al EY sunt toate simultan cu 25% mai mici decat cele modelate, solutia recreata livreaza totusi o reducere de 30% a costurilor, cu 97% mai putine ore de munca si 89% mai putini angajati.
      </Pr>

      <Sep />

      <H2r isMobile={isMobile}>Partea III: Proiectarea unei tranzitii responsabile</H2r>

      <Pr isMobile={isMobile}>
        Aceasta cercetare a modelat un singur workflow. Acel workflow a trecut de la 539 de oameni la 44, de la 190.000 de ore la 4.000, indeplinind acelasi standard reglementar la un salariu individual mai mare. Daca macar o fractiune din industriile knowledge-work vad o compresie similara, milioane de roluri sunt afectate.
      </Pr>

      <Pr isMobile={isMobile}>
        Castigurile de productivitate demonstrate in aceasta cercetare sunt aici, construite pe capabilitatile AI actuale. Intrebarea deschisa nu este capacitatea tehnica, ci designul economic: cum sa structurezi tranzitiile astfel incat castigurile superproductive re-creation sa fie impartite pe scara larga.
      </Pr>

      <H3r isMobile={isMobile}>Implicatii sociale</H3r>

      <Pr isMobile={isMobile}>
        Revolutia Industriala timpurie ofera un <Ar href="https://knowablemagazine.org/content/article/society/2025/ai-jobs-economy-lessons-from-industrial-revolution">precedent sumbru</Ar>: noua tehnologie a inlocuit muncitorii calificati intr-un ritm pe care institutiile nu l-au putut absorbi. Tesatorii de razboi manual, printre cei mai bine platiti artizani din Anglia, si-au vazut mijloacele de trai prabusindu-se intr-o singura generatie. Decenii de agitatie sociala au urmat inainte ca protectiile muncii, educatia publica si noile structuri de angajare sa se puna la punct.
      </Pr>

      <Pr isMobile={isMobile}>
        A te baza pe legislatie pare o linie de aparare fragila; dureaza ani in timp ce AI avanseaza in luni. In schimb, autoreglementarea de catre constructorii de companii care creeaza solutii recreate este singura parghie care se misca suficient de rapid.
      </Pr>

      <H3r isMobile={isMobile}>Optimizarea pentru beneficiul public</H3r>

      <Pr isMobile={isMobile}>
        Cum ar putea arata asta in practica? Sa consideram un model in care lucratorii inlocuiti primesc o plata unica in valoare de mai multe multipli ale venitului asteptat la pensionare, alaturi de participare la capitalul companiei recreate. Lucratorii care au construit cunostintele de workflow care fac re-creation posibila ar imparti valoarea pe care o creeaza. Cei care pleaca sunt cu adevarat intr-o situatie mai buna decat daca tranzitia nu ar fi avut loc niciodata.
      </Pr>

      <Pr isMobile={isMobile}>
        Bunavointa creata de programele generoase de tranzitie este un avantaj competitiv: mai putina rezistenta la schimbare, facilitare de catre personalul specializat care intelege workflow-urile recreate si credibilitatea de a castiga clienti acolo unde increderea si responsabilitatea sociala conteaza.
      </Pr>

      <Pr isMobile={isMobile}>
        Daca companiile AI superproductive aliniaza interesele actionarilor cu beneficiul public, suntem pregatiti pentru un viitor extraordinar de prosper.
      </Pr>
    </article>
  )
}

export default function App() {
  const isMobile = useIsMobile()
  const headerVisible = useScrollReveal()
  const titleVisible = useTitleVisible()
  const [isPdf, setIsPdf] = useState(() => window.location.hash === "#pdf")
  const [path] = useState(() => window.location.pathname)

  useEffect(() => {
    const onHash = () => {
      if (window.location.hash === "#pdf") setIsPdf(true)
    }
    window.addEventListener("hashchange", onHash)
    return () => window.removeEventListener("hashchange", onHash)
  }, [])

  if (isPdf) return <PDF />

  if (path === "/anita-xoxo") {
    return (
      <>
        <Header isMobile={isMobile} visible={headerVisible} titleVisible={false} />
        <div style={{
          maxWidth: isMobile ? undefined : 820,
          margin: "0 auto",
          padding: isMobile ? `${HEADER_H + 24}px 16px 32px` : `${HEADER_H + 48}px 24px 64px`,
          fontFamily: t.serif,
        }}>
          <EssayRo isMobile={isMobile} />
        </div>
      </>
    )
  }

  return (
    <>
      <Header
        isMobile={isMobile}
        visible={headerVisible}
        titleVisible={titleVisible}
      />
      <div style={{
        maxWidth: isMobile ? undefined : 820,
        margin: "0 auto",
        padding: isMobile ? `${HEADER_H + 24}px 16px 32px` : `${HEADER_H + 48}px 24px 64px`,
        fontFamily: t.serif,
      }}>
        <Essay isMobile={isMobile} />
      </div>
    </>
  )
}
