// Migrated from: assets/js/app.js, lines 175-185
import { useState, useEffect } from "react";

export const useStickyHeader = (scrollPosition = 130) => {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > scrollPosition) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrollPosition]);

  return isSticky;
};

export default useStickyHeader;
