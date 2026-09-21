// Migrated from: index.html, lines 3235-3238; assets/js/app.js lines 36-50
// HTML->JSX conversion: class -> className, href onClick handling
import { useBackToTop } from "../../hooks/useBackToTop";

export const BackToTop = () => {
  const { show, scrollToTop } = useBackToTop(300);

  return (
    <a
      href="#main-wrapper"
      id="backto-top"
      className={`back-to-top ${show ? "show" : ""}`}
      onClick={scrollToTop}
      aria-label="Back to top"
    >
      <i className="fas fa-angle-up"></i>
    </a>
  );
};

export default BackToTop;
