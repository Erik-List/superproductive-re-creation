import { useState, useEffect, useRef } from "react"
import Essay from "./Essay"
import PDF from "./PDF"
import { t } from "./theme"

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

export default function App() {
  const isMobile = useIsMobile()
  const headerVisible = useScrollReveal()
  const titleVisible = useTitleVisible()
  const [isPdf, setIsPdf] = useState(() => window.location.hash === "#pdf")

  useEffect(() => {
    const onHash = () => {
      if (window.location.hash === "#pdf") setIsPdf(true)
    }
    window.addEventListener("hashchange", onHash)
    return () => window.removeEventListener("hashchange", onHash)
  }, [])

  if (isPdf) {
    return <PDF />
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
