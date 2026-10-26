import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

// Ultra crisp Vietnam Flag (3:2 ratio, 26px x 18px)
const VietnamFlag = () => (
  <svg
    width="26"
    height="18"
    viewBox="0 0 30 20"
    style={{
      borderRadius: "3px",
      display: "block",
      flexShrink: 0,
      boxShadow: "0 0 0 1px rgba(0,0,0,0.12)",
    }}
    aria-label="Flag of Vietnam"
  >
    <rect width="30" height="20" fill="#DA251D" />
    <polygon
      points="15,3.8 16.9,9.6 23,9.6 18.1,13.2 20,19 15,15.4 10,19 11.9,13.2 7,9.6 13.1,9.6"
      fill="#FFFF00"
    />
  </svg>
);

// Ultra crisp UK Flag (3:2 ratio, 26px x 18px)
const UKFlag = () => (
  <svg
    width="26"
    height="18"
    viewBox="0 0 60 30"
    style={{
      borderRadius: "3px",
      display: "block",
      flexShrink: 0,
      boxShadow: "0 0 0 1px rgba(0,0,0,0.12)",
    }}
    aria-label="Flag of the United Kingdom"
  >
    <clipPath id="uk-flag-clip-hd">
      <rect width="60" height="30" rx="2" />
    </clipPath>
    <g clipPath="url(#uk-flag-clip-hd)">
      <rect width="60" height="30" fill="#012169" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#FFFFFF" strokeWidth="6" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="3.6" />
      <path d="M30,0 v30 M0,15 h60" stroke="#FFFFFF" strokeWidth="10" />
      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
    </g>
  </svg>
);

const languages = [
  {
    code: "vi",
    label: "Tiếng Việt",
    short: "VI",
    Flag: VietnamFlag,
  },
  {
    code: "en",
    label: "English",
    short: "EN",
    Flag: UKFlag,
  },
];

export const LanguageSwitcher = ({ className = "" }) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLangCode = (
    i18n.resolvedLanguage ||
    i18n.language ||
    "vi"
  ).startsWith("en")
    ? "en"
    : "vi";

  const currentLang =
    languages.find((l) => l.code === currentLangCode) || languages[0];

  const handleSelect = (code) => {
    i18n.changeLanguage(code);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const CurrentFlag = currentLang.Flag;

  return (
    <div
      ref={dropdownRef}
      className={`language-flag-dropdown position-relative d-inline-block ${className}`}
      style={{ userSelect: "none" }}
    >
      {/* Trigger Button with Flag & Dropdown Caret */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="d-flex align-items-center gap-2 border-0"
        style={{
          cursor: "pointer",
          padding: "6px 10px",
          borderRadius: "24px",
          backgroundColor: isOpen ? "#EAEAEA" : "#F4F4F4",
          transition: "all 0.2s ease-in-out",
          outline: "none",
        }}
        aria-expanded={isOpen}
        title={currentLang.label}
      >
        <CurrentFlag />
        <span
          className="fw-700 color-sec"
          style={{ fontSize: "12px", letterSpacing: "0.5px" }}
        >
          {currentLang.short}
        </span>
        {/* Prominent dropdown arrow */}
        <svg
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            flexShrink: 0,
            transition: "transform 0.25s ease",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          <path
            d="M1 1L5 5L9 1"
            stroke="#1E1F20"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Dropdown Floating Menu */}
      {isOpen && (
        <ul
          className="list-unstyled position-absolute m-0 p-1"
          style={{
            top: "calc(100% + 8px)",
            right: 0,
            minWidth: "165px",
            backgroundColor: "#FFFFFF",
            borderRadius: "10px",
            boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.15)",
            border: "1px solid #ECECEC",
            zIndex: 1050,
          }}
        >
          {languages.map(({ code, label, short, Flag }) => {
            const isSelected = code === currentLangCode;
            return (
              <li key={code}>
                <button
                  type="button"
                  onClick={() => handleSelect(code)}
                  className="w-100 d-flex align-items-center justify-content-between border-0 text-start px-3 py-2"
                  style={{
                    backgroundColor: isSelected ? "#FFF3F0" : "transparent",
                    color: isSelected ? "#e9613f" : "#1E1F20",
                    fontWeight: isSelected ? "700" : "500",
                    fontSize: "13px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected)
                      e.currentTarget.style.backgroundColor = "#F8F9FA";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected)
                      e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <Flag />
                    <span>{label}</span>
                  </div>
                  {isSelected ? (
                    <i
                      className="fa-solid fa-check"
                      style={{ fontSize: "11px", color: "#e9613f" }}
                    ></i>
                  ) : (
                    <span
                      style={{
                        fontSize: "11px",
                        color: "#92949F",
                      }}
                    >
                      {short}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default LanguageSwitcher;
