import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import EastRoundedIcon from "@mui/icons-material/EastRounded";
import WestRoundedIcon from "@mui/icons-material/WestRounded";
import ProductCard from "./ProductCard";
import type { CategoryShelf } from "../data/categories";

type CakeShelfProps = {
  shelf: CategoryShelf;
  index: number;
  total: number;
  onAddToCart: (productId: string) => void;
};

type ThumbDrag = {
  pointerId: number;
  startX: number;
  startScroll: number;
  scale: number;
};

const MIN_THUMB_WIDTH = 48;
const pad = (value: number) => String(value).padStart(2, "0");
const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));
const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const scrollBehavior = (): ScrollBehavior =>
  prefersReducedMotion() ? "auto" : "smooth";

/** One category as a horizontally scrolling shelf of cakes. */
function CakeShelf({ shelf, index, total, onAddToCart }: CakeShelfProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const thumbDrag = useRef<ThumbDrag | null>(null);
  const finishSettle = useRef<(() => void) | null>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const headingId = `shelf-${shelf.id}-heading`;

  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const max = track.scrollWidth - track.clientWidth;
    // Overflow that only covers the trailing padding hides no cards, so it doesn't count.
    const endPadding = parseFloat(getComputedStyle(track).paddingRight) || 0;
    const overflows = max > endPadding + 1;
    // Edge checks get a few pixels of slack for fractional scroll positions.
    setCanPrev(overflows && track.scrollLeft > 4);
    setCanNext(overflows && track.scrollLeft < max - 4);

    // The scrollbar thumb is sized and moved directly so scrolling never re-renders the cards.
    const bar = barRef.current;
    const thumb = thumbRef.current;
    if (bar && thumb && max > 0) {
      const thumbWidth = Math.max(
        MIN_THUMB_WIDTH,
        (bar.clientWidth * track.clientWidth) / track.scrollWidth,
      );
      const offset = (bar.clientWidth - thumbWidth) * (track.scrollLeft / max);
      thumb.style.width = `${thumbWidth}px`;
      thumb.style.transform = `translateX(${offset}px)`;
    }
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };

    measure();
    track.addEventListener("scroll", onScroll, { passive: true });
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(track);

    return () => {
      cancelAnimationFrame(frame);
      track.removeEventListener("scroll", onScroll);
      resizeObserver.disconnect();
    };
  }, [measure]);

  // `data-dragging` is set directly so React re-renders of className don't wipe it.
  // While it's set, CSS pauses scroll snapping and card hover effects.
  const startDragging = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    finishSettle.current?.();
    track.dataset.dragging = "true";
    window.getSelection()?.removeAllRanges();
  }, []);

  /** Glides to the card nearest `projected`, then turns snapping back on. */
  const settle = useCallback((projected: number) => {
    const track = trackRef.current;
    if (!track) return;

    const paddingLeft = parseFloat(getComputedStyle(track).paddingLeft) || 0;
    const trackLeft = track.getBoundingClientRect().left;
    const max = track.scrollWidth - track.clientWidth;

    let target = projected;
    let closest = Infinity;
    for (const card of Array.from(track.children)) {
      const cardStart =
        track.scrollLeft +
        card.getBoundingClientRect().left -
        trackLeft -
        paddingLeft;
      const distance = Math.abs(cardStart - projected);
      if (distance < closest) {
        closest = distance;
        target = cardStart;
      }
    }

    track.scrollTo({ left: clamp(target, 0, max), behavior: scrollBehavior() });

    const finish = () => {
      window.clearTimeout(timer);
      track.removeEventListener("scrollend", finish);
      delete track.dataset.dragging;
      finishSettle.current = null;
    };
    const timer = window.setTimeout(finish, 800);
    track.addEventListener("scrollend", finish);
    finishSettle.current = finish;
  }, []);

  useEffect(() => () => finishSettle.current?.(), []);

  // Click-and-drag on the cards for mouse users. Touch and trackpads keep native scrolling.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let pointerId: number | null = null;
    let dragging = false;
    let startX = 0;
    let startScroll = 0;
    let lastX = 0;
    let lastTime = 0;
    let velocity = 0; // px per ms, positive when the mouse moves right

    const suppressClick = (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || event.button !== 0) return;
      if (track.scrollWidth <= track.clientWidth) return;
      pointerId = event.pointerId;
      dragging = false;
      startX = lastX = event.clientX;
      startScroll = track.scrollLeft;
      lastTime = event.timeStamp;
      velocity = 0;
    };

    const onPointerUp = (event: PointerEvent) => {
      if (event.pointerId !== pointerId) return;
      pointerId = null;
      if (!dragging) return;
      dragging = false;

      // Releasing a drag over a card shouldn't also count as a click on it.
      track.addEventListener("click", suppressClick, {
        capture: true,
        once: true,
      });
      window.setTimeout(
        () => track.removeEventListener("click", suppressClick, true),
        0,
      );

      // Holding still before letting go means no throw.
      if (event.timeStamp - lastTime > 100) velocity = 0;
      settle(track.scrollLeft - velocity * 220);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerId !== pointerId) return;
      // The button was released somewhere we never heard about; finish instead of sticking.
      if (event.buttons === 0) {
        onPointerUp(event);
        return;
      }
      const distance = event.clientX - startX;

      // A small threshold keeps ordinary clicks (e.g. "Add to bag") working.
      if (!dragging) {
        if (Math.abs(distance) < 6) return;
        dragging = true;
        startDragging();
        track.setPointerCapture(event.pointerId);
      }

      const elapsed = event.timeStamp - lastTime;
      if (elapsed > 0) velocity = (event.clientX - lastX) / elapsed;
      lastX = event.clientX;
      lastTime = event.timeStamp;
      track.scrollLeft = startScroll - distance;
    };

    track.addEventListener("pointerdown", onPointerDown);
    track.addEventListener("pointermove", onPointerMove);
    track.addEventListener("pointerup", onPointerUp);
    track.addEventListener("pointercancel", onPointerUp);

    return () => {
      track.removeEventListener("pointerdown", onPointerDown);
      track.removeEventListener("pointermove", onPointerMove);
      track.removeEventListener("pointerup", onPointerUp);
      track.removeEventListener("pointercancel", onPointerUp);
    };
  }, [settle, startDragging]);

  // Scrollbar: drag the thumb, or click the rail to jump there.
  const onBarPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    const bar = barRef.current;
    const thumb = thumbRef.current;
    if (!track || !bar || !thumb || event.button !== 0) return;

    const max = track.scrollWidth - track.clientWidth;
    const barRect = bar.getBoundingClientRect();
    const thumbWidth = thumb.getBoundingClientRect().width;
    const travel = barRect.width - thumbWidth;
    if (max <= 0 || travel <= 0) return;
    event.preventDefault();

    if (event.target !== thumb) {
      const ratio = clamp(
        (event.clientX - barRect.left - thumbWidth / 2) / travel,
        0,
        1,
      );
      track.scrollTo({ left: ratio * max, behavior: scrollBehavior() });
      return;
    }

    bar.setPointerCapture(event.pointerId);
    bar.dataset.active = "true";
    thumbDrag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startScroll: track.scrollLeft,
      scale: max / travel,
    };
    startDragging();
  };

  const onBarPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = thumbDrag.current;
    const track = trackRef.current;
    if (!drag || !track || event.pointerId !== drag.pointerId) return;
    track.scrollLeft =
      drag.startScroll + (event.clientX - drag.startX) * drag.scale;
  };

  const onBarPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = thumbDrag.current;
    const track = trackRef.current;
    if (!drag || event.pointerId !== drag.pointerId) return;
    thumbDrag.current = null;
    if (barRef.current) delete barRef.current.dataset.active;
    if (track) settle(track.scrollLeft);
  };

  const scrollByPage = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({
      left: direction * track.clientWidth * 0.8,
      behavior: scrollBehavior(),
    });
  };

  const overflows = canPrev || canNext;
  const count = shelf.products.length;

  return (
    <section
      className="cake-shelf"
      id={`shelf-${shelf.id}`}
      data-shelf={shelf.id}
      aria-labelledby={headingId}
    >
      <header className="shelf-head">
        <div className="shelf-title">
          <p className="shelf-kicker">
            <span>
              {pad(index + 1)} / {pad(total)}
            </span>
            {shelf.name}
          </p>
          <h3 id={headingId}>
            {shelf.title} <em>{shelf.highlight}</em>
          </h3>
          <p className="shelf-note">{shelf.note}</p>
        </div>
        <div className="shelf-controls">
          <span className="shelf-count">
            {count} {count === 1 ? "cake" : "cakes"}
          </span>
          {canNext && (
            <span className="shelf-hint" aria-hidden="true">
              Swipe for more →
            </span>
          )}
          {overflows && (
            <div className="shelf-arrows">
              <button
                type="button"
                onClick={() => scrollByPage(-1)}
                disabled={!canPrev}
                aria-label={`Previous ${shelf.name} cakes`}
              >
                <WestRoundedIcon fontSize="small" />
              </button>
              <button
                type="button"
                onClick={() => scrollByPage(1)}
                disabled={!canNext}
                aria-label={`More ${shelf.name} cakes`}
              >
                <EastRoundedIcon fontSize="small" />
              </button>
            </div>
          )}
        </div>
      </header>

      <div
        className={`shelf-track${overflows ? " is-draggable" : ""}${canPrev ? " fade-start" : ""}${canNext ? " fade-end" : ""}`}
        ref={trackRef}
        onDragStart={(event) => event.preventDefault()}
      >
        {shelf.products.map((product, position) => (
          <ProductCard
            // Names can repeat in the sample data, so position keeps keys unique.
            key={`${product.name}-${position}`}
            product={product}
            onAddToCart={(productId) => onAddToCart(productId)}
            reveal={false}
          />
        ))}
      </div>

      {/* Mouse/touch convenience only; the arrow buttons and focusable cards cover keyboard use. */}
      <div
        className={`shelf-scrollbar${overflows ? "" : " is-hidden"}`}
        ref={barRef}
        aria-hidden="true"
        onPointerDown={onBarPointerDown}
        onPointerMove={onBarPointerMove}
        onPointerUp={onBarPointerUp}
        onPointerCancel={onBarPointerUp}
      >
        <div className="shelf-scrollbar-thumb" ref={thumbRef} />
      </div>
    </section>
  );
}

export default CakeShelf;
