import { useRef } from "react";
import Header from "../components/Header";
import ProductCard from "../components/ProductCard";
import Footer from "../components/Footer";
// import type { PageProps } from "../routes";
import { useScrollMotion } from "../hooks/useScrollMotion";
import cake1 from "../assets/cake-1.jpg";
import cake2 from "../assets/cake-2.jpg";
import cake3 from "../assets/cake-3.jpg";
import cake4 from "../assets/cake-4.jpg";
import cake from "../assets/big-cake.jpg";
import ArrowOutwardOutlinedIcon from "@mui/icons-material/ArrowOutwardOutlined";
import CakeOutlinedIcon from "@mui/icons-material/CakeOutlined";
import { useQuery } from "@tanstack/react-query";
import { getMainCategory } from "../api/categoryApi";
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import { Link } from "react-router-dom";
import { products } from "../data/products";

const joyProducts = products.slice(0, 6);

const heroImages = [
  {
    src: cake1,
    alt: "Chocolate cake with berries",
  },
  {
    src: cake2,
    alt: "Berry cream celebration cake",
  },
  {
    src: cake3,
    alt: "Dark chocolate cake with ganache",
  },
  {
    src: cake4,
    alt: "Freshly baked pastries",
  },
];

function Home() {
  const shellRef = useRef<HTMLDivElement>(null);
  useScrollMotion(shellRef);

  const { data: mainCategories } = useQuery({
    queryKey: ["main-category"],
    queryFn: getMainCategory,
  });
  const categories = Array.isArray(mainCategories) ? mainCategories : [];

  return (
    <div className="app-shell" ref={shellRef}>
      <Header />
      <main>
        <section className="hero-section" id="home">
          <div className="hero-copy" data-parallax data-y="-110">
            <p className="eyebrow">Handcrafted with feeling</p>
            <h1>
              Cake for your <em>sweetest</em> moments.
            </h1>
            <p className="hero-description">
              Thoughtfully baked in small batches, with the finest ingredients
              and a little bit of magic in every layer.
            </p>
            <div className="hero-actions">
              <a className="primary-button" href="#shop">
                Explore cakes{" "}
                <span>
                  <ArrowOutwardOutlinedIcon fontSize="small" />
                </span>
              </a>
            </div>
            <div className="hero-note">
              <span className="note-icon">
                <CakeOutlinedIcon fontSize="small" />
              </span>
              <span>
                Freshly baked to order
                <br />
                <b>Made with love in Sri Lanka</b>
              </span>
            </div>
          </div>
          <div className="hero-art" aria-label="A decorated chocolate cake">
            <div
              className="art-glow"
              data-parallax
              data-y="160"
              data-scale="0.35"
              aria-hidden="true"
            />
            <div
              className="art-orbit art-orbit-one"
              data-parallax
              data-y="-35"
              aria-hidden="true"
            />
            <div
              className="art-orbit art-orbit-two"
              data-parallax
              data-y="55"
              aria-hidden="true"
            />
            <div className="cake-plate" aria-hidden="true" />
            <div
              className="hero-image-frame"
              data-parallax
              data-y="90"
              data-rotate="-3"
            >
              <div className="hero-image-stack">
                {heroImages.map((image, index) => (
                  <img
                    key={image.src}
                    src={image.src}
                    alt={index === 0 ? image.alt : ""}
                    aria-hidden={index > 0}
                  />
                ))}
              </div>
              <span className="image-shine" aria-hidden="true" />
            </div>
            <div className="art-stamp" aria-hidden="true">
              <span>made</span>
              <b>
                with
                <br />
                joy
              </b>
            </div>
            <span
              className="art-caption"
              data-parallax
              data-y="-170"
              data-x="-30"
              data-rotate="10"
            >
              a little
              <br />
              <b>joy</b>
            </span>
          </div>
        </section>

        <section className="joy-section" aria-labelledby="joy-heading">
          <div className="joy-heading">
            <p className="eyebrow" data-reveal="up">
              A little joy
            </p>
            <h2 id="joy-heading" data-reveal="up">
              Small slices.
              <br />
              <em>Big feelings.</em>
            </h2>
            <p data-reveal="up">
              Scroll through a little inspiration before choosing your next
              celebration.
            </p>
          </div>
          <div className="joy-viewport">
            <div className="joy-track" data-marquee>
              {[0, 1, 2, 3].map((set) => (
                <div className="joy-set" key={set} aria-hidden={set > 0}>
                  {products.map((product, index) => (
                    <figure
                      className="joy-card"
                      key={`${set}-${index}-${product.name}`}
                    >
                      <img
                        src={product.image}
                        alt={set === 0 ? product.name : ""}
                        loading="lazy"
                        decoding="async"
                      />
                      <figcaption>
                        {String(index + 1).padStart(2, "0")} / {product.name}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="category-strip" aria-label="Cake categories">
          <span data-reveal="up">Find your flavour</span>
          <div>
            {categories.map((category, index) => (
              <a
                key={`${category._id || category.categoryName}-${index}`}
                href="#shop"
              >
                {category.categoryName}
              </a>
            ))}
          </div>
        </section>

        <section className="shop-section" id="shop">
          <div className="section-heading">
            <div>
              <p className="eyebrow" data-reveal="up">
                The sweet edit
              </p>
              <h2 data-reveal="up">
                Made for sharing.
                <br />
                <em>Or not.</em>
              </h2>
            </div>
            <Link className="text-accent-foreground" to="/shop" data-reveal="up">
              View all cakes <ArrowRightAltIcon fontSize="small" />
            </Link>
          </div>
          <div className="product-grid">
            {joyProducts.map((product, index) => (
              <ProductCard
                key={`${product.name}-${index}`}
                product={product}
                // onAddToCart={onAddToCart}
              />
            ))}
          </div>
        </section>

        <section className="story-section" id="about">
          <div className="story-image">
            <img
              src={cake}
              alt="Freshly baked pastries"
              loading="lazy"
              data-parallax
              data-y="80"
            />
          </div>
          <div className="story-copy">
            <p className="eyebrow" data-reveal="up">
              The De&apos;Sleece way
            </p>
            <h2 data-reveal="up">
              Good things take
              <br />
              <em>time.</em>
            </h2>
            <p data-reveal="up">
              We believe a cake should feel like a warm hug. That&apos;s why
              every De&apos;Sleece creation is made slowly, intentionally, and
              with ingredients we&apos;re proud to put our name on.
            </p>
            <a
              className="primary-button dark-button"
              href="#contact"
              data-reveal="up"
            >
              Meet the bakers <span>↗</span>
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default Home;
