// Global CSS stylesheets imported in exact original cascade order
import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/vendor/bootstrap.min.css";
import "./styles/vendor/font-awesome.css";
import "./styles/vendor/slick-slider.css";
import "./styles/vendor/slick-theme.css";
import "./styles/vendor/wow.min.css";
import "./styles/app.css";
import "./i18n";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
