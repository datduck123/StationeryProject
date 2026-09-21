// Migrated from: index.html, lines 31-52; assets/js/app.js lines 52-56
// HTML->JSX conversion: class -> className, smooth fadeOut effect, route-transition support
import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export const Preloader = () => {
  const location = useLocation();
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    // Show preloader
    setVisible(true);
    setFading(false);

    // Scroll to top on route change
    window.scrollTo(0, 0);

    // Initial page load lasts slightly longer (1200ms), route transitions are snappy (500ms)
    const displayDuration = isFirstLoad.current ? 1200 : 500;
    isFirstLoad.current = false;

    // Start fade out
    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, displayDuration);

    // Remove from DOM after fade completes
    const removeTimer = setTimeout(() => {
      setVisible(false);
      setFading(false);

      // Re-trigger WOW.js animations on the newly loaded page
      if (typeof window !== "undefined" && window.WOW) {
        try {
          new window.WOW({ live: false }).init();
        } catch (e) {}
      }
    }, displayDuration + 500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [location.pathname]);

  if (!visible) return null;

  return (
    <div
      id="preloader"
      style={{
        opacity: fading ? 0 : 1,
        transition: "opacity 0.5s ease-out",
        pointerEvents: fading ? "none" : "auto",
      }}
    >
      <div className="loading loading07">
        <span data-text="S">S</span>
        <span data-text="t">t</span>
        <span data-text="a">a</span>
        <span data-text="t">t</span>
        <span data-text="i">i</span>
        <span data-text="o">o</span>
        <span data-text="n">n</span>
        <span data-text="e">e</span>
        <span data-text="r">r</span>
        <span data-text="y">y</span>
        <span
          data-text={"\u00A0"}
          style={{ width: "clamp(14px, 2vw, 38px)", display: "inline-block" }}
        >
          &nbsp;
        </span>
        <span data-text="T">T</span>
        <span data-text="a">a</span>
        <span data-text="l">l</span>
        <span data-text="e">e</span>
        <span data-text="s">s</span>
      </div>
    </div>
  );
};

export default Preloader;
