import { useState } from "react";
import { NavLink } from "react-router-dom";
import logo from "../assets/DeSleece Logo.png";
import Bag from "../assets/bag-check.svg";
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
type HeaderProps = {
  cartCount?: number;
};

function Header({ cartCount }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      <header className="site-header">
        <NavLink className="brand" to="/" aria-label="De'Sleece home">
          <img className="brand-logo" src={logo} alt="De'Sleece" />
        </NavLink>
        <nav className="main-nav" aria-label="Main navigation">
          <NavLink className={({ isActive }) => (isActive ? "active" : "")} to="/" end>
            Home
          </NavLink>
          <NavLink className={({ isActive }) => (isActive ? "active" : "")} to="/shop">
            Shop cakes
          </NavLink>
          <a href="/#about">Our story</a>
          <a href="/#contact">Contact</a>
        </nav>
        <div className="header-actions">
          <button
            className="cart-button"
            type="button"
            aria-label={`${cartCount ?? 0} items in cart`}
          >
            <img src={Bag} alt="" aria-hidden="true" />
            <span>{cartCount ?? 0}</span>
          </button>
          <button
            className="menu-button"
            type="button"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>
      <div
        className={`mobile-menu-backdrop${isMenuOpen ? " is-open" : ""}`}
        onClick={closeMenu}
      />
      <aside
        className={`mobile-menu${isMenuOpen ? " is-open" : ""}`}
        id="mobile-menu"
        aria-label="Mobile navigation"
      >
        <button
          className="mobile-menu-close"
          type="button"
          aria-label="Close menu"
          onClick={closeMenu}
        >
          <CloseOutlinedIcon fontSize="large" />
        </button>
        <nav className="mobile-nav">
          <NavLink className={({ isActive }) => (isActive ? "active" : "")} to="/" end onClick={closeMenu}>
            Home
          </NavLink>
          <NavLink
            className={({ isActive }) => (isActive ? "active" : "")}
            to="/shop"
            onClick={closeMenu}
          >
            Shop cakes
          </NavLink>
          <a href="/#about" onClick={closeMenu}>
            Our story
          </a>
          <a href="/#contact" onClick={closeMenu}>
            Contact
          </a>
        </nav>
      </aside>
    </>
  );
}

export default Header;
