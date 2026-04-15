import React from "react";
import {
  Button,
  Spinner,
  makeStyles,
  shorthands,
  tokens,
} from "@fluentui/react-components";
import {
  VehicleCarProfileLtr20Regular,
  ReceiptMoney20Regular,
  Backpack20Regular,
  Settings20Regular,
} from "@fluentui/react-icons";
import { useViaje } from "../context/ViajeContext";

const useStyles = makeStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    ...shorthands.padding("40px", "20px"),
    minHeight: "100vh",
    backgroundColor: tokens.colorNeutralBackground1,
    position: "relative",
  },
  settingsButton: {
    position: "absolute",
    top: "20px",
    right: "20px",
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
  buttonContainer: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap("16px"),
    width: "100%",
    maxWidth: "400px",
  },
  button: {
    minHeight: "80px",
    fontSize: "18px",
    fontWeight: 600,
    justifyContent: "flex-start",
    ...shorthands.padding("20px", "24px"),
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
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const styles = useStyles();
  const { viajeActivo, isLoadingViaje } = useViaje();

  return (
    <div className={styles.container}>
      <Button
        appearance="subtle"
        icon={<Settings20Regular />}
        onClick={() => onNavigate("configuracion")}
        className={styles.settingsButton}
      />
      <div className={styles.header}>
        <h1 className={styles.title}>Gestión de Gastos Inetum</h1>
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
          icon={<Backpack20Regular />}
          className={styles.button}
          onClick={() => onNavigate("mis-viajes")}
        >
          Mis Viajes
        </Button>
      </div>
    </div>
  );
};
