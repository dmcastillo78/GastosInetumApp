import React from "react";
import * as teamsJs from "@microsoft/teams-js";
import { FluentProvider, teamsLightTheme } from "@fluentui/react-components";
import { Home } from "../components/Home";
import { NuevoViaje } from "../components/NuevoViaje";
import { AnadirTicket } from "../components/AnadirTicket";
import { Configuracion } from "../components/Configuracion";
import { LoginPin } from "../components/LoginPin";
import { DetalleViaje } from "../components/DetalleViaje";

import "./App.css";

export default function App() {
  const [currentScreen, setCurrentScreen] = React.useState<string>("home");
  const [isLoggedIn, setIsLoggedIn] = React.useState(
    !!localStorage.getItem("userEmail")
  );
  const [isTeamsInitialized, setIsTeamsInitialized] = React.useState(
    import.meta.env.DEV
  );

  React.useEffect(() => {
    const initializeTeams = async () => {
      if (import.meta.env.DEV) {
        console.log("Modo desarrollo: saltando inicialización de Teams SDK");
        setIsTeamsInitialized(true);
        return;
      }

      try {
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Teams SDK timeout")), 2000);
        });

        const initPromise = teamsJs.app.initialize();

        await Promise.race([initPromise, timeoutPromise]);
        
        setIsTeamsInitialized(true);
        console.log("Teams SDK inicializado correctamente");
      } catch (error) {
        console.warn("Error al inicializar Teams SDK:", error);
        setIsTeamsInitialized(true);
      }
    };

    initializeTeams();
  }, []);

  const handleNavigate = (screen: string) => {
    setCurrentScreen(screen);
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    setIsLoggedIn(false);
    setCurrentScreen("home");
  };

  if (!isLoggedIn) {
    return (
      <FluentProvider theme={teamsLightTheme}>
        <LoginPin onLoginSuccess={handleLoginSuccess} />
      </FluentProvider>
    );
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case "home":
        return <Home onNavigate={handleNavigate} onLogout={handleLogout} />;
      case "nuevo-viaje":
        return <NuevoViaje onBack={() => handleNavigate("home")} onNavigate={handleNavigate} />;
      case "añadir-ticket":
        return <AnadirTicket onBack={() => handleNavigate("home")} />;
      case "configuracion":
        return <Configuracion onBack={() => handleNavigate("home")} />;
      case "detalle-viaje":
        return <DetalleViaje onBack={() => handleNavigate("home")} />;
      default:
        return <Home onNavigate={handleNavigate} onLogout={handleLogout} />;
    }
  };

  return (
    <FluentProvider theme={teamsLightTheme}>
      <div className="App">{renderScreen()}</div>
    </FluentProvider>
  );
}
