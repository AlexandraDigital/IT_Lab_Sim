import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ITLabSimulator from "./ITLabSimulator.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ITLabSimulator />
  </StrictMode>
);
