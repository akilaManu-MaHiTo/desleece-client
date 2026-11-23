import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import ArrowOutwardOutlinedIcon from "@mui/icons-material/ArrowOutwardOutlined";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import Header from "../components/Header";
import CakeShelf from "../components/CakeShelf";
import Footer from "../components/Footer";
import type { Product } from "../components/ProductCard";
import { groupProductsByCategory } from "../data/categories";
import { useQueries, useQuery } from "@tanstack/react-query";
import { getMainCategory } from "../api/categoryApi";
import { getCakesByCategory, type Cake } from "../api/cakeApi";
import { useScrollMotion } from "../hooks/useScrollMotion";

type BagNote = { name: string; visible: boolean };

// Module-level so React Query can memoize the combined list between renders.
const combineCakes = (results: { data?: Cake[] }[]): Product[] =>
  results.flatMap((result) => (Array.isArray(result.data) ? result.data : []));

function ShopCakes() {
  // Drives the footer's data-reveal fade-ins; without it they stay at opacity 0.
  const shellRef = useRef<HTMLDivElement>(null);
  useScrollMotion(shellRef);

  const { data: mainCategories } = useQuery({
    queryKey: ["main-category"],
    queryFn: getMainCategory,
  });
  const categories = Array.isArray(mainCategories) ? mainCategories : [];
  const products: Product[] = useQueries({
    queries: categories.map((category) => ({
      queryKey: ["cakes", "category", category.categoryName],
      queryFn: () => getCakesByCategory(category.categoryName),
    })),
    combine: combineCakes,
  });
  const shelves = useMemo(
    () => groupProductsByCategory(products, mainCategories),
    [mainCategories, products],
  );
  const [activeShelf, setActiveShelf] = useState(shelves[0]?.id ?? "");
  const [cartCount, setCartCount] = useState(0);
  const [bagNote, setBagNote] = useState<BagNote | null>(null);
  const catalogRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!shelves.length) {
      setActiveShelf("");
    } else if (!shelves.some((shelf) => shelf.id === activeShelf)) {
      setActiveShelf(shelves[0].id);
    }
  }, [activeShelf, shelves]);

  // Highlight the category whose shelf is crossing the upper-middle of the screen.
  useEffect(() => {
    const sections = catalogRef.current?.querySelectorAll<HTMLElement>("[data-shelf]");
    if (!sections?.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveShelf(entry.target.getAttribute("data-shelf") ?? "");
        }
      },
      { rootMargin: "-35% 0px -60% 0px" },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [shelves]);

  // On narrow screens the nav scrolls sideways too; keep the active link in view.
  useEffect(() => {
    const nav = navRef.current;
    const link = nav?.querySelector<HTMLElement>(`[data-nav="${activeShelf}"]`);
    if (!nav || !link || nav.scrollWidth <= nav.clientWidth) return;
    nav.scrollTo({
      left: link.offsetLeft - (nav.clientWidth - link.offsetWidth) / 2,
      behavior: "smooth",
    });
  }, [activeShelf]);

  // Each add replaces the note object, which restarts the timer. The name stays while it fades out.
  useEffect(() => {
    if (!bagNote?.visible) return;
    const timer = window.setTimeout(
      () => setBagNote((note) => note && { ...note, visible: false }),
      2800,
    );
    return () => window.clearTimeout(timer);
  }, [bagNote]);

  const handleAddToCart = (product: Product) => {
    setCartCount((count) => count + 1);
    setBagNote({ name: product.name, visible: true });
  };

  return (
    <div className="app-shell shop-page" ref={shellRef}>
      <Header cartCount={cartCount} />
      <main>
        <section className="shop-hero">
          <div>
            <p className="eyebrow">The De&apos;Sleece bakery</p>
            <h1>
              Pick a little
              <br />
              <em>happiness.</em>
            </h1>
          </div>
          <div className="shop-hero-copy">
            <p>
              Cakes made slowly, with beautiful ingredients and plenty of
              feeling. Find something for the big moments, the small moments,
              and everything sweet in between.
            </p>
            <Link className="text-link" to="/#about">
              Our way of baking <span>↗</span>
            </Link>
          </div>
        </section>

        <section className="catalog-section" aria-labelledby="catalog-heading" ref={catalogRef}>
          <div className="catalog-heading">
            <div>
              <p className="eyebrow">Fresh from the oven</p>
              <h2 id="catalog-heading">
                Find your
                <br />
                <em>favourite.</em>
              </h2>
            </div>
            <p className="catalog-count">
              {products.length} cakes · {shelves.length} moods
            </p>
          </div>

          <nav className="shelf-nav" aria-label="Cake categories" ref={navRef}>
            {shelves.map((shelf) => (
              <a
                key={shelf.id}
                href={`#shelf-${shelf.id}`}
                data-nav={shelf.id}
                className={activeShelf === shelf.id ? "is-active" : ""}
                aria-current={activeShelf === shelf.id ? "location" : undefined}
                onClick={() => setActiveShelf(shelf.id)}
              >
                {shelf.name}
                <sup>{shelf.products.length}</sup>
              </a>
            ))}
          </nav>

          <div className="self-track">
            {shelves.map((shelf, index) => (
              <CakeShelf
                key={shelf.id}
                shelf={shelf}
                index={index}
                total={shelves.length}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        </section>

        <section className="shop-order-note">
          <div className="shop-order-note-mark">✦</div>
          <div>
            <p className="eyebrow">Made to order</p>
            <h2>Need something a little more <em>you?</em></h2>
            <p>
              Tell us what you&apos;re celebrating and we&apos;ll make a cake
              that feels like it belongs in the moment.
            </p>
            <Link className="primary-button dark-button" to="/#contact">
              Start a conversation <ArrowOutwardOutlinedIcon fontSize="small" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />

      <div className={`bag-note${bagNote?.visible ? " is-visible" : ""}`} role="status" aria-live="polite">
        {bagNote && (
          <>
            <FavoriteRoundedIcon fontSize="small" aria-hidden="true" />
            <span>
              Lovely choice. <strong>{bagNote.name}</strong> is in your bag.
            </span>
          </>
        )}
      </div>
    </div>
  );
}

export default ShopCakes;
