import React from "react";

/**
 * Dashed-outline emotion face icon (handcrafted minimalist SVG).
 * Replaces standard generic emojis with dashed line aesthetic faces.
 *
 * @param {Object} props
 * @param {number} props.rating - Rating level (1 to 5)
 * @param {number} [props.size=22] - Icon width and height in px
 * @param {string} [props.className] - Optional extra CSS class
 * @param {string} [props.color="currentColor"] - Stroke/fill color
 */
export const DashedEmotionFace = ({
  rating = 5,
  size = 22,
  className = "",
  color = "currentColor",
}) => {
  const level = Math.max(1, Math.min(5, Math.round(Number(rating) || 5)));

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={`dashed-emotion-face ${className}`.trim()}
      style={{ display: "inline-block", verticalAlign: "-0.22em", flexShrink: 0 }}
      aria-hidden="true"
    >
      {/* Dashed circular outline (~12 rounded dash pills around circle) */}
      <circle
        cx="12"
        cy="12"
        r="9.5"
        fill="none"
        stroke={color}
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeDasharray="2.2 2.7"
      />

      {/* Level 1: Rất không hài lòng (Very Bad - Angry Frown) */}
      {level === 1 && (
        <g stroke={color} fill={color}>
          <line x1="6.8" y1="8" x2="9.8" y2="9.5" strokeWidth="1.6" strokeLinecap="round" />
          <line x1="17.2" y1="8" x2="14.2" y2="9.5" strokeWidth="1.6" strokeLinecap="round" />
          <ellipse cx="8.5" cy="11.8" rx="1.3" ry="1.7" stroke="none" />
          <ellipse cx="15.5" cy="11.8" rx="1.3" ry="1.7" stroke="none" />
          <path
            d="M 7.8 17.2 Q 12 13.8 16.2 17.2"
            fill="none"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </g>
      )}

      {/* Level 2: Không hài lòng (Bad - Sad / Frown) */}
      {level === 2 && (
        <g stroke={color} fill={color}>
          <line x1="7.2" y1="8.6" x2="9.8" y2="8.2" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="16.8" y1="8.6" x2="14.2" y2="8.2" strokeWidth="1.4" strokeLinecap="round" />
          <ellipse cx="8.5" cy="11" rx="1.3" ry="1.8" stroke="none" />
          <ellipse cx="15.5" cy="11" rx="1.3" ry="1.8" stroke="none" />
          <path
            d="M 8.2 16.5 Q 12 14.5 15.8 16.5"
            fill="none"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </g>
      )}

      {/* Level 3: Bình thường (Fair - Neutral straight line mouth like sample image) */}
      {level === 3 && (
        <g stroke={color} fill={color}>
          <ellipse cx="8.5" cy="10.8" rx="1.3" ry="1.9" stroke="none" />
          <ellipse cx="15.5" cy="10.8" rx="1.3" ry="1.9" stroke="none" />
          <line x1="8" y1="16.2" x2="16" y2="16.2" strokeWidth="2.2" strokeLinecap="round" />
        </g>
      )}

      {/* Level 4: Hài lòng (Good - Sweet Smile) */}
      {level === 4 && (
        <g stroke={color} fill={color}>
          <ellipse cx="8.5" cy="10.8" rx="1.3" ry="1.9" stroke="none" />
          <ellipse cx="15.5" cy="10.8" rx="1.3" ry="1.9" stroke="none" />
          <path
            d="M 8 14.8 Q 12 18.2 16 14.8"
            fill="none"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </g>
      )}

      {/* Level 5: Tuyệt vời (Excellent - Beaming Joyful Smile & Cheerful Eyes) */}
      {level === 5 && (
        <g stroke={color} fill={color}>
          <path
            d="M 6.8 11.2 Q 8.5 8.4 10.2 11.2"
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M 13.8 11.2 Q 15.5 8.4 17.2 11.2"
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M 7.5 14 Q 12 19.8 16.5 14"
            fill="none"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </g>
      )}
    </svg>
  );
};

export default DashedEmotionFace;
