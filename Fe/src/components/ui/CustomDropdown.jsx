// Migrated from: assets/js/app.js, lines 58-104; shop-grid-sidebar.html lines 520-547
// HTML->JSX conversion: class -> className, stroke-width -> strokeWidth, stroke-linecap -> strokeLinecap, stroke-linejoin -> strokeLinejoin
import { useState, useRef, useEffect } from "react";

export const CustomDropdown = ({
  options = ["high to low", "low", "high", "discounted"],
  defaultValue = "high to low",
  id = "dropdown8",
  arrowId = "drp-arrow8",
  destinationId = "destination8",
  onSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(defaultValue);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  const handleSelectOption = (option) => {
    setSelected(option);
    setIsOpen(false);
    if (onSelect) onSelect(option);
  };

  useEffect(() => {
    setSelected(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  return (
    <div
      ref={dropdownRef}
      className={`wrapper-dropdown ${isOpen ? "active" : ""}`}
      id={id}
      onClick={toggleDropdown}
    >
      <span className="selected-display" id={destinationId}>
        {selected}
      </span>
      <svg
        id={arrowId}
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`arrow transition-all ml-auto rotate-180 ${isOpen ? "rotated" : ""}`}
      >
        <path
          d="M7 14.5l5-5 5 5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <ul
        className="topbar-dropdown bg-lightest-gray"
        style={{ display: isOpen ? "block" : "none" }}
      >
        {options.map((option, idx) => (
          <li
            key={idx}
            className="item dark-black"
            onClick={(e) => {
              e.stopPropagation();
              handleSelectOption(option);
            }}
          >
            {option}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CustomDropdown;
