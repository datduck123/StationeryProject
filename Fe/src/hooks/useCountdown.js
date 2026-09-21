// Migrated from: assets/js/app.js, lines 308-321
import { useState, useEffect } from "react";
import { calculateCountdown } from "../utils/helpers";

export const useCountdown = (targetDateString = "2026/12/31") => {
  const [timeLeft, setTimeLeft] = useState(() =>
    calculateCountdown(targetDateString),
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateCountdown(targetDateString));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDateString]);

  return timeLeft;
};

export default useCountdown;
