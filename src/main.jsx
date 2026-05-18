import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ITLabSimulator from "./ITLabSimulator.jsx";

// Register service worker for PWA functionality
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js").catch((err) => {
      console.log("Service Worker registration failed:", err);
    });
  });
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ITLabSimulator />
  </StrictMode>
);
