import { useEffect, type RefObject } from 'react'

/*
 * Scroll-scrubbed motion in the style of myfrida.com. Every effect is a pure function of the
 * scroll position (eased with smoothstep), so it plays forwards on the way down and rewinds on
 * the way up. Elements opt in with data attributes:
 *
 *   data-parallax  data-y="120" data-x="0" data-rotate="-4" data-scale="0.2"
 *     Drifts the element as its section passes through the viewport. The values are the total
 *     travel across the whole pass, centred on the element's resting position.
 *
 *   data-reveal="up" | "tilt" | "slide"
 *     Fades and settles the element into place as it scrolls in. Items that share a parent and
 *     sit on the same row are staggered automatically.
 *
 *   data-marquee
 *     Slides a horizontal track sideways with page scroll. Its first child is one repeat.
 */

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value))
const smoothstep = (t: number) => t * t * (3 - 2 * t)

// Reveal timing, as on myfrida's staggered badges: an item starts when its top reaches 94% of
// the viewport height and settles over the next 48% of a viewport of scrolling.
const REVEAL_START = 0.94
const REVEAL_SPAN = 0.48
const REVEAL_MIN_SPAN = 0.15
const STAGGER = 0.105
const STAGGER_MAX = 0.42
const REVEAL_WINDOW = 0.58
const MARQUEE_SPEED = 1.2
const MOBILE_PARALLAX = 0.6

type RevealVariant = 'up' | 'tilt' | 'slide'

type Box = { top: number; height: number }

type ParallaxItem = {
  el: HTMLElement
  section: HTMLElement
  x: number
  y: number
  rotate: number
  scale: number
  box: Box
  restProgress: number
}

type RevealItem = {
  el: HTMLElement
  variant: RevealVariant
  top: number
  index: number
  start: number
  end: number
  alwaysShown: boolean
}

type MarqueeItem = {
  el: HTMLElement
  section: HTMLElement
  box: Box
  period: number
}

/** Document-relative top, ignoring CSS transforms so our own motion never feeds back into it. */
function layoutTop(el: HTMLElement) {
  let top = 0
  for (let node: HTMLElement | null = el; node; node = node.offsetParent as HTMLElement | null) {
    top += node.offsetTop
  }
  return top
}

function measureBox(el: HTMLElement): Box {
  return { top: layoutTop(el), height: el.offsetHeight }
}

function sectionOf(el: HTMLElement) {
  return el.parentElement?.closest<HTMLElement>('section, footer, [data-motion-root]') ?? el.parentElement ?? el
}

/** 0 when the box is just below the viewport, 1 when it has just left the top; eased. */
function passProgress(box: Box, scrollY: number, viewport: number) {
  const top = box.top - scrollY
  return smoothstep(clamp((viewport - top) / (viewport + box.height)))
}

function revealStyle(variant: RevealVariant, t: number, index: number) {
  const r = 1 - t
  switch (variant) {
    case 'tilt': {
      const side = index % 2 ? 1 : -1
      return { translate: `0 ${r * 72}px`, rotate: `${r * side * 4}deg`, scale: `${0.94 + 0.06 * t}` }
    }
    case 'slide':
      return { translate: `${r * -30}px ${r * 24}px`, rotate: `${r * -7}deg`, scale: `${0.93 + 0.07 * t}` }
    default:
      return { translate: `0 ${r * 44}px`, rotate: '0deg', scale: '1' }
  }
}

function numberAttr(el: HTMLElement, name: string) {
  const value = Number(el.dataset[name])
  return Number.isFinite(value) ? value : 0
}

export function useScrollMotion(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const mobileQuery = window.matchMedia('(max-width: 767.98px)')

    const parallax: ParallaxItem[] = [...root.querySelectorAll<HTMLElement>('[data-parallax]')].map((el) => ({
      el,
      section: sectionOf(el),
      x: numberAttr(el, 'x'),
      y: numberAttr(el, 'y'),
      rotate: numberAttr(el, 'rotate'),
      scale: numberAttr(el, 'scale'),
      box: { top: 0, height: 0 },
      restProgress: 0,
    }))

    const reveals: RevealItem[] = [...root.querySelectorAll<HTMLElement>('[data-reveal]')].map((el) => {
      const variant = el.dataset.reveal
      return {
        el,
        variant: variant === 'tilt' || variant === 'slide' ? variant : 'up',
        top: 0,
        index: 0,
        start: 0,
        end: 1,
        alwaysShown: false,
      }
    })

    const marquees: MarqueeItem[] = [...root.querySelectorAll<HTMLElement>('[data-marquee]')].map((el) => ({
      el,
      section: sectionOf(el),
      box: { top: 0, height: 0 },
      period: 0,
    }))

    let parallaxFactor = 1

    function measure() {
      const viewport = window.innerHeight
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - viewport)
      parallaxFactor = mobileQuery.matches ? MOBILE_PARALLAX : 1

      for (const item of parallax) {
        item.box = measureBox(item.section)
        // Sections already on screen at load rest exactly where the layout puts them.
        item.restProgress = item.box.top < viewport ? passProgress(item.box, 0, viewport) : 0.5
      }

      for (const item of marquees) {
        item.box = measureBox(item.section)
        item.period = (item.el.firstElementChild as HTMLElement | null)?.offsetWidth ?? 0
      }

      // Stagger siblings that share a row; a new row restarts the count.
      const rows = new Map<Element | null, { top: number; count: number }>()
      for (const item of reveals) {
        item.top = layoutTop(item.el)
        const row = rows.get(item.el.parentElement)
        if (row && Math.abs(row.top - item.top) < 8) {
          item.index = ++row.count
        } else {
          item.index = 0
          rows.set(item.el.parentElement, { top: item.top, count: 0 })
        }

        // Never let a reveal finish below the bottom of the page.
        item.end = Math.min(item.top - viewport * (REVEAL_START - REVEAL_SPAN), maxScroll)
        item.start = Math.min(item.top - viewport * REVEAL_START, item.end - viewport * REVEAL_MIN_SPAN)
        item.alwaysShown = item.start <= 0
      }
    }

    function render() {
      const viewport = window.innerHeight
      const scrollY = window.scrollY

      for (const item of parallax) {
        const p = passProgress(item.box, scrollY, viewport) - item.restProgress
        const x = p * item.x * parallaxFactor
        const y = p * item.y * parallaxFactor
        item.el.style.transform =
          `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) rotate(${(p * item.rotate).toFixed(3)}deg) scale(${(1 + p * item.scale).toFixed(4)})`
      }

      for (const item of marquees) {
        if (!item.period) continue
        const top = item.box.top - scrollY
        const progress = clamp((viewport - top) / (viewport + item.box.height))
        const shift = (progress * item.period * MARQUEE_SPEED) % item.period
        item.el.style.transform = `translate3d(${(-shift).toFixed(2)}px, 0, 0)`
      }

      for (const item of reveals) {
        let t = 1
        if (!item.alwaysShown) {
          const progress = clamp((scrollY - item.start) / (item.end - item.start))
          const delay = Math.min(item.index * STAGGER, STAGGER_MAX)
          t = smoothstep(clamp((progress - delay) / REVEAL_WINDOW))
        }
        const style = revealStyle(item.variant, t, item.index)
        item.el.style.opacity = t.toFixed(3)
        item.el.style.translate = style.translate
        item.el.style.rotate = style.rotate
        item.el.style.scale = style.scale
      }
    }

    let frame = 0
    const schedule = () => {
      if (!frame) {
        frame = requestAnimationFrame(() => {
          frame = 0
          render()
        })
      }
    }
    const remeasure = () => {
      measure()
      schedule()
    }

    measure()
    render()

    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', remeasure)
    window.addEventListener('load', remeasure)
    const resizeObserver = new ResizeObserver(remeasure)
    resizeObserver.observe(root)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', remeasure)
      window.removeEventListener('load', remeasure)
      resizeObserver.disconnect()
      for (const { el } of [...parallax, ...marquees]) el.style.removeProperty('transform')
      for (const { el } of reveals) {
        for (const prop of ['opacity', 'translate', 'rotate', 'scale']) el.style.removeProperty(prop)
      }
    }
  }, [rootRef])
}
