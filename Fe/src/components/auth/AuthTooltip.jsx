/**
 * AuthTooltip component for displaying form validation errors as elegant tooltips
 * adhering to project colors and styling.
 */
export const AuthTooltip = ({ message, position = "top" }) => {
  if (!message) return null;

  return (
    <div
      className={`auth-tooltip-bubble auth-tooltip-${position}`}
      role="alert"
      aria-live="polite"
    >
      <div className="auth-tooltip-content">
        <i className="fa-solid fa-circle-exclamation auth-tooltip-icon"></i>
        <span>{message}</span>
      </div>
      <div className="auth-tooltip-arrow"></div>
    </div>
  );
};

export default AuthTooltip;
