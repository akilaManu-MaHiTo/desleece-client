import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import ArrowOutwardOutlinedIcon from "@mui/icons-material/ArrowOutwardOutlined";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import Header from "../components/Header";
import CakeShelf from "../components/CakeShelf";
import Footer from "../components/Footer";
import ProductCard, { type Product } from "../components/ProductCard";
import { groupProductsByCategory } from "../data/categories";
import { useQueries, useQuery } from "@tanstack/react-query";
import { getMainCategory } from "../api/categoryApi";
import { getCakesByCategory, type Cake } from "../api/cakeApi";
import { useScrollMotion } from "../hooks/useScrollMotion";

type BagNote = { name: string; visible: boolean };

// Module-level so React Query can memoize the combined list between renders.
const combineCakes = (
  results: { data?: Cake[]; isLoading: boolean }[],
): { products: Product[]; isLoading: boolean } => ({
  products: results.flatMap((result) =>
    Array.isArray(result.data) ? result.data : [],
  ),
  isLoading: results.some((result) => result.isLoading),
});

function ShopCakes() {
  // Drives the footer's data-reveal fade-ins; without it they stay at opacity 0.
  const shellRef = useRef<HTMLDivElement>(null);
  useScrollMotion(shellRef);

  const { data: mainCategories, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ["main-category"],
    queryFn: getMainCategory,
  });
  const categories = Array.isArray(mainCategories) ? mainCategories : [];
  const {
    products,
    isLoading: isCakesLoading,
  } = useQueries({
    queries: categories.map((category) => ({
      queryKey: ["cakes", "category", category.categoryName],
      queryFn: () => getCakesByCategory(category.categoryName),
    })),
    combine: combineCakes,
  });
  const isLoading = isCategoriesLoading || isCakesLoading;
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

  useEffect(() => {
    if (!window.location.hash) return;

    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${window.location.search}`,
    );
  }, []);

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
              {isLoading
                ? "Loading cakes..."
                : `${products.length} cakes · ${shelves.length} moods`}
            </p>
          </div>

          <nav className="shelf-nav" aria-label="Cake categories" ref={navRef}>
            {isLoading
              ? [0, 1, 2].map((index) => (
                  <span
                    key={`loading-category-${index}`}
                    className="shelf-nav-skeleton skeleton-block"
                    aria-hidden="true"
                  />
                ))
              : shelves.map((shelf) => (
                  <a
                    key={shelf.id}
                    href="/shop"
                    data-nav={shelf.id}
                    className={activeShelf === shelf.id ? "is-active" : ""}
                    aria-current={
                      activeShelf === shelf.id ? "location" : undefined
                    }
                    onClick={(event) => {
                      event.preventDefault();
                      setActiveShelf(shelf.id);
                      document
                        .getElementById(`shelf-${shelf.id}`)
                        ?.scrollIntoView({
                          block: "start",
                          behavior: "smooth",
                        });
                    }}
                  >
                    {shelf.name}
                    <sup>{shelf.products.length}</sup>
                  </a>
                ))}
          </nav>

          <div className="self-track" aria-busy={isLoading}>
            {isLoading
              ? [0, 1].map((shelfIndex) => (
                  <section
                    key={`loading-shelf-${shelfIndex}`}
                    className="cake-shelf cake-shelf-loading"
                    aria-label="Loading cakes"
                  >
                    <header className="shelf-head">
                      <div className="shelf-title">
                        <span className="skeleton-block shelf-kicker-skeleton" />
                        <span className="skeleton-block shelf-title-skeleton" />
                        <span className="skeleton-block shelf-note-skeleton" />
                      </div>
                    </header>
                    <div className="shelf-track">
                      {[0, 1, 2, 3].map((cardIndex) => (
                        <ProductCard
                          key={`loading-card-${shelfIndex}-${cardIndex}`}
                          isLoading
                          reveal={false}
                        />
                      ))}
                    </div>
                  </section>
                ))
              : shelves.map((shelf, index) => (
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
