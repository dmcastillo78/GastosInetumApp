import React, { useState, useEffect } from "react";
import {
  Button,
  Spinner,
  makeStyles,
  shorthands,
  tokens,
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionPanel,
} from "@fluentui/react-components";
import {
  VehicleCarProfileLtr20Regular,
  ReceiptMoney20Regular,
  Backpack20Regular,
  Settings20Regular,
  SignOut20Regular,
  History20Regular,
} from "@fluentui/react-icons";
import { useViaje } from "../context/ViajeContext";

// MSAL temporalmente deshabilitado - usando login con PIN
// import { useMsal, useIsAuthenticated } from "@azure/msal-react";
// import { graphScopes } from "../authConfig";

const useStyles = makeStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    ...shorthands.padding("20px", "16px"),
    minHeight: "100vh",
    backgroundColor: tokens.colorNeutralBackground1,
    position: "relative",
    width: "100%",
    maxWidth: "100%",
    margin: "0 auto",
    boxSizing: "border-box",
  },
  settingsButton: {
    position: "absolute",
    top: "20px",
    right: "20px",
  },
  logoutButton: {
    position: "absolute",
    top: "20px",
    left: "20px",
  },
  header: {
    textAlign: "center",
    marginBottom: "48px",
  },
  title: {
    fontSize: "32px",
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
    marginBottom: "8px",
  },
  subtitle: {
    fontSize: "18px",
    fontWeight: 400,
    color: tokens.colorNeutralForeground2,
  },
  userCaption: {
    fontSize: "12px",
    color: tokens.colorNeutralForeground3,
    marginTop: "8px",
  },
  buttonContainer: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap("16px"),
    width: "100%",
    maxWidth: "400px",
  },
  button: {
    minHeight: "48px",
    fontSize: "16px",
    fontWeight: 600,
    justifyContent: "flex-start",
    ...shorthands.padding("16px", "20px"),
    width: "100%",
  },
  viajeBanner: {
    ...shorthands.padding("12px", "20px"),
    ...shorthands.borderRadius("8px"),
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorNeutralForeground1,
    marginTop: "16px",
    fontSize: "14px",
    textAlign: "center",
    maxWidth: "600px",
  },
  viajeInfo: {
    fontWeight: 600,
    color: tokens.colorBrandForeground1,
  },
  noViaje: {
    color: tokens.colorNeutralForeground3,
    fontSize: "14px",
    fontStyle: "italic",
    marginTop: "16px",
  },
  guideSection: {
    width: "100%",
    maxWidth: "400px",
    marginTop: "32px",
  },
  guideContent: {
    ...shorthands.padding("16px"),
    ...shorthands.borderRadius("8px"),
    backgroundColor: tokens.colorNeutralBackground3,
  },
  guideStep: {
    display: "flex",
    ...shorthands.gap("12px"),
    marginBottom: "16px",
    "&:last-child": {
      marginBottom: 0,
    },
  },
  stepNumber: {
    fontSize: "20px",
    flexShrink: 0,
    width: "32px",
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: "14px",
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
    marginBottom: "4px",
  },
  stepDescription: {
    fontSize: "12px",
    lineHeight: "1.4",
    color: tokens.colorNeutralForeground2,
  },
});

// Helper para formatear fechas de ISO a DD/MM/YYYY
const formatFecha = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error("Error al formatear fecha:", error);
    return isoString;
  }
};

interface HomeProps {
  onNavigate: (screen: string) => void;
  onLogout: () => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate, onLogout }) => {
  const styles = useStyles();
  const { viajeActivo, isLoadingViaje } = useViaje();
  
  const userName = localStorage.getItem("userName") || "Usuario";
  
  // Estado para controlar si la guía está expandida
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem("guideExpanded");
    // Si no hay valor guardado (primer uso), expandir por defecto
    return saved === null ? true : saved === "true";
  });

  // Guardar estado en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem("guideExpanded", String(isGuideOpen));
  }, [isGuideOpen]);

  return (
    <div className={styles.container}>
      {/* Botón Cerrar sesión */}
      <Button
        appearance="subtle"
        size="small"
        icon={<SignOut20Regular />}
        onClick={onLogout}
        className={styles.logoutButton}
        title="Cerrar sesión"
      />

      {/* Botón Configuración */}
      <Button
        appearance="subtle"
        icon={<Settings20Regular />}
        onClick={() => onNavigate("configuracion")}
        className={styles.settingsButton}
      />

      <div className={styles.header}>
        <h1 className={styles.title}>Gestión de Gastos Inetum</h1>
        <p className={styles.userCaption}>👤 {userName}</p>
        <p className={styles.subtitle}>¿Qué quieres hacer?</p>
        
        {isLoadingViaje ? (
          <div className={styles.viajeBanner}>
            <Spinner size="tiny" /> Cargando viaje activo...
          </div>
        ) : viajeActivo ? (
          <div className={styles.viajeBanner}>
            <span className={styles.viajeInfo}>Viaje activo:</span> {viajeActivo.numViaje} | {formatFecha(viajeActivo.fechaInicio)} → {formatFecha(viajeActivo.fechaFin)} | CECO: {viajeActivo.ceco}
          </div>
        ) : (
          <p className={styles.noViaje}>Sin viaje activo</p>
        )}
      </div>

      <div className={styles.buttonContainer}>
        <Button
          appearance="primary"
          size="large"
          icon={<VehicleCarProfileLtr20Regular />}
          className={styles.button}
          onClick={() => onNavigate("nuevo-viaje")}
        >
          Nuevo Viaje
        </Button>

        <Button
          appearance="primary"
          size="large"
          icon={<ReceiptMoney20Regular />}
          className={styles.button}
          onClick={() => onNavigate("añadir-ticket")}
        >
          Añadir Ticket
        </Button>

        <Button
          appearance="primary"
          size="large"
          icon={<History20Regular />}
          className={styles.button}
          onClick={() => onNavigate("mis-viajes")}
        >
          Mis Viajes
        </Button>

        <Button
          appearance="primary"
          size="large"
          icon={<Backpack20Regular />}
          className={styles.button}
          onClick={() => onNavigate("detalle-viaje")}
        >
          Detalle Viaje
        </Button>
      </div>

      {/* Mini guía de uso */}
      <div className={styles.guideSection}>
        <Accordion 
          collapsible 
          openItems={isGuideOpen ? ["guide"] : []}
          onToggle={(_, data) => setIsGuideOpen(data.openItems.includes("guide"))}
        >
          <AccordionItem value="guide">
            <AccordionHeader>💡 ¿Cómo funciona?</AccordionHeader>
            <AccordionPanel>
              <div className={styles.guideContent}>
                <div className={styles.guideStep}>
                  <div className={styles.stepNumber}>🧳</div>
                  <div className={styles.stepContent}>
                    <div className={styles.stepTitle}>Nuevo Viaje</div>
                    <div className={styles.stepDescription}>
                      Pega el correo SAP con los datos del viaje para registrarlo automáticamente.
                    </div>
                  </div>
                </div>

                <div className={styles.guideStep}>
                  <div className={styles.stepNumber}>🧾</div>
                  <div className={styles.stepContent}>
                    <div className={styles.stepTitle}>Añadir Ticket</div>
                    <div className={styles.stepDescription}>
                      Fotografía cada gasto durante el viaje. La IA extrae los datos automáticamente.
                    </div>
                  </div>
                </div>

                <div className={styles.guideStep}>
                  <div className={styles.stepNumber}>📊</div>
                  <div className={styles.stepContent}>
                    <div className={styles.stepTitle}>Generar documentos (desde Detalle Viaje)</div>
                    <div className={styles.stepDescription}>
                      Accede a Detalle Viaje para generar la hoja Excel de liquidación. Encontrarás la plantilla de correo lista para solicitar el informe SAP, con los datos del viaje ya rellenados.
                    </div>
                  </div>
                </div>

                <div className={styles.guideStep}>
                  <div className={styles.stepNumber}>📤</div>
                  <div className={styles.stepContent}>
                    <div className={styles.stepTitle}>Enviar a Expenses (desde Detalle Viaje)</div>
                    <div className={styles.stepDescription}>
                      Sube el informe SAP recibido, genera el ZIP con todos los tickets en PDF y usa la plantilla de correo preparada para enviar la liquidación a expenses.es@inetum.com.
                    </div>
                  </div>
                </div>
              </div>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};
