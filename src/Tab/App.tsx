import React from "react";
import * as teamsJs from "@microsoft/teams-js";
import { FluentProvider, teamsLightTheme } from "@fluentui/react-components";
import { Home } from "../components/Home";
import { NuevoViaje } from "../components/NuevoViaje";
import { AnadirTicket } from "../components/AnadirTicket";
import { Configuracion } from "../components/Configuracion";

import "./App.css";

export default function App() {
  const [currentScreen, setCurrentScreen] = React.useState<string>("home");
  const [isTeamsInitialized, setIsTeamsInitialized] = React.useState(
    import.meta.env.DEV // En desarrollo, inicializar directamente
  );

  React.useEffect(() => {
    const initializeTeams = async () => {
      // En desarrollo, no esperar a Teams SDK
      if (import.meta.env.DEV) {
        console.log("Modo desarrollo: saltando inicialización de Teams SDK");
        setIsTeamsInitialized(true);
        return;
      }

      // En producción, intentar inicializar con timeout
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
        // Mostrar la app igualmente
        setIsTeamsInitialized(true);
      }
    };

    initializeTeams();
  }, []);

  const handleNavigate = (screen: string) => {
    setCurrentScreen(screen);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "home":
        return <Home onNavigate={handleNavigate} />;
      case "nuevo-viaje":
        return <NuevoViaje onBack={() => handleNavigate("home")} onNavigate={handleNavigate} />;
      case "añadir-ticket":
        return <AnadirTicket onBack={() => handleNavigate("home")} />;
      case "configuracion":
        return <Configuracion onBack={() => handleNavigate("home")} />;
      case "mis-viajes":
        return (
          <div style={{ padding: "40px", textAlign: "center" }}>
            <h2>Mis Viajes</h2>
            <p>Pantalla en desarrollo</p>
            <button onClick={() => handleNavigate("home")}>Volver</button>
          </div>
        );
      default:
        return <Home onNavigate={handleNavigate} />;
    }
  };

  return (
    <FluentProvider theme={teamsLightTheme}>
      <div className="App">{renderScreen()}</div>
    </FluentProvider>
  );
}
