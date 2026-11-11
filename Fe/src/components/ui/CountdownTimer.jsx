// Migrated from: index.html, lines 2686-2703; assets/js/app.js lines 22, 308-321
// HTML->JSX conversion: class -> className, i18n support
import { useTranslation } from "react-i18next";
import { useCountdown } from "../../hooks/useCountdown";

export const CountdownTimer = ({ targetDate = "2026/12/31" }) => {
  const { t } = useTranslation();
  const { days, hours, minutes, seconds } = useCountdown(targetDate);

  return (
    <ul className="unstyled countdown">
      <li>
        <h2>{days}</h2>
        <h6 className="fw-500">{t("common.days")}</h6>
      </li>
      <li>
        <h2>{hours}</h2>
        <h6 className="fw-500">{t("common.hrs")}</h6>
      </li>
      <li>
        <h2>{minutes}</h2>
        <h6 className="fw-500">{t("common.min")}</h6>
      </li>
      <li>
        <h2>{seconds}</h2>
        <h6 className="fw-500">{t("common.secs")}</h6>
      </li>
    </ul>
  );
};

export default CountdownTimer;
