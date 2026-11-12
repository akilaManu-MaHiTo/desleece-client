import { useEffect } from 'react'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

/**
 * Inertia-based smooth wheel scrolling (Lenis), tuned to the same feel as myfrida.com:
 * a low lerp gives the long, soft glide, and touch devices keep their native scrolling.
 */
export function useSmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const lenis = new Lenis({
      autoRaf: true,
      autoToggle: true,
      anchors: true, // smooth-scroll in-page links like #shop and #about
      allowNestedScroll: true,
      smoothWheel: true,
      syncTouch: false,
      lerp: 0.085,
      wheelMultiplier: 0.9,
      touchMultiplier: 1,
      stopInertiaOnNavigate: true,
    })

    // Images and fonts can change the page height after first paint.
    const refresh = () => lenis.resize()
    window.addEventListener('load', refresh, { once: true })
    window.addEventListener('pageshow', refresh)

    return () => {
      window.removeEventListener('load', refresh)
      window.removeEventListener('pageshow', refresh)
      lenis.destroy()
    }
  }, [])
}
