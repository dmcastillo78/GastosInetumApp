import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { ViajeProvider } from "../context/ViajeContext";

// MSAL temporalmente deshabilitado
// import { PublicClientApplication } from "@azure/msal-browser";
// import { MsalProvider } from "@azure/msal-react";
// import { msalConfig } from "../authConfig";
// import { AuthProvider } from "../context/AuthContext";
// const msalInstance = new PublicClientApplication(msalConfig);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ViajeProvider>
      <App />
    </ViajeProvider>
  </StrictMode>
);
