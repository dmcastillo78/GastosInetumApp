import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import { ViajeProvider } from "../context/ViajeContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ViajeProvider>
      <App />
    </ViajeProvider>
  </StrictMode>
);
