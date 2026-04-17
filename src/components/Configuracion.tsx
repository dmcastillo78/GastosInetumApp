import React from "react";
import {
  Button,
  Card,
  Badge,
  makeStyles,
  shorthands,
  tokens,
  Toast,
  ToastTitle,
  useToastController,
  Toaster,
  useId,
} from "@fluentui/react-components";
import { 
  ArrowLeft20Regular, 
  Checkmark20Regular,
  DeleteDismiss20Regular,
  Info20Regular,
} from "@fluentui/react-icons";
import { useViaje } from "../context/ViajeContext";

const useStyles = makeStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.padding("16px"),
    paddingBottom: "80px",
    backgroundColor: tokens.colorNeutralBackground1,
    width: "100%",
    maxWidth: "100%",
    margin: "0 auto",
    boxSizing: "border-box",
  },
  header: {
    display: "flex",
    alignItems: "center",
    ...shorthands.gap("12px"),
    marginBottom: "24px",
  },
  title: {
    fontSize: "24px",
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
    marginLeft: "8px",
  },
  content: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap("24px"),
    maxWidth: "100%",
    width: "100%",
  },
  section: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap("12px"),
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
  },
  card: {
    ...shorthands.padding("20px"),
  },
  dataRow: {
    display: "flex",
    justifyContent: "space-between",
    ...shorthands.padding("8px", "0"),
    ...shorthands.borderBottom("1px", "solid", tokens.colorNeutralStroke2),
    "&:last-child": {
      ...shorthands.borderBottom("none"),
    },
  },
  dataLabel: {
    fontWeight: 600,
    color: tokens.colorNeutralForeground2,
  },
  dataValue: {
    color: tokens.colorNeutralForeground1,
  },
  spinnerContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    ...shorthands.padding("40px"),
  },
  actionButton: {
    width: "100%",
    minHeight: "48px",
    fontSize: "15px",
  },
  warningCard: {
    ...shorthands.padding("20px"),
    backgroundColor: tokens.colorPaletteYellowBackground2,
    ...shorthands.border("2px", "solid", tokens.colorPaletteYellowBorder2),
  },
  warningMessage: {
    color: tokens.colorPaletteYellowForeground2,
    marginBottom: "12px",
    display: "flex",
    alignItems: "center",
    ...shorthands.gap("8px"),
  },
  flowItem: {
    display: "flex",
    alignItems: "center",
    ...shorthands.gap("12px"),
    ...shorthands.padding("8px", "0"),
  },
  flowIcon: {
    color: tokens.colorPaletteGreenForeground1,
  },
  flowName: {
    color: tokens.colorNeutralForeground1,
  },
  versionText: {
    fontSize: "16px",
    color: tokens.colorNeutralForeground2,
  },
  buildInfo: {
    fontSize: "12px",
    color: tokens.colorNeutralForeground3,
    marginTop: "4px",
  },
  infoText: {
    fontSize: "12px",
    color: tokens.colorNeutralForeground3,
    fontStyle: "italic",
    marginTop: "8px",
  },
  viajeActivoInfo: {
    fontSize: "14px",
    color: tokens.colorBrandForeground1,
    fontWeight: 600,
  },
  linkButton: {
    textDecoration: "none",
    color: tokens.colorBrandForeground1,
    fontSize: "14px",
    "&:hover": {
      textDecoration: "underline",
    },
  },
});

// Helper para formatear fechas
const formatFecha = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (error) {
    return isoString;
  }
};

interface ConfiguracionProps {
  onBack: () => void;
}

export const Configuracion: React.FC<ConfiguracionProps> = ({ onBack }) => {
  const styles = useStyles();
  const { viajeActivo, clearViajeActivo } = useViaje();
  const toasterId = useId("toaster");
  const { dispatchToast } = useToastController(toasterId);

  const userEmail = localStorage.getItem("userEmail") || "No configurado";
  const userName = localStorage.getItem("userName") || "Usuario";

  // Handler para limpiar caché local
  const handleLimpiarCache = () => {
    const confirmacion = window.confirm(
      "⚠️ Esto eliminará el viaje activo de este dispositivo.\n\n" +
      "Los datos en Dataverse NO se eliminarán.\n\n" +
      "¿Continuar?"
    );

    if (confirmacion) {
      clearViajeActivo();
      dispatchToast(
        <Toast>
          <ToastTitle>✅ Caché local limpiada</ToastTitle>
        </Toast>,
        { intent: "success", timeout: 2000 }
      );
    }
  };

  const flows = [
    { name: "Viaje_Nuevo", description: "Crear nuevo viaje" },
    { name: "Viaje_ObtenerActivo", description: "Obtener viaje activo" },
    { name: "Viaje_Listar", description: "Listar todos los viajes" },
    { name: "Viaje_Actualizar", description: "Actualizar estado viaje" },
    { name: "Ticket_Nuevo", description: "Crear nuevo ticket" },
    { name: "Ticket_Listar", description: "Listar tickets de viaje" },
    { name: "SubirSAP", description: "Subir informe SAP" },
    { name: "SubirExcel", description: "Subir Excel liquidación" },
    { name: "ObtenerImagenesBase64", description: "Obtener imágenes para ZIP" },
  ];

  return (
    <div className={styles.container}>
      <Toaster toasterId={toasterId} />

      <div className={styles.header}>
        <Button
          appearance="subtle"
          icon={<ArrowLeft20Regular />}
          onClick={onBack}
        >
          Volver
        </Button>
        <h1 className={styles.title}>Configuración</h1>
      </div>

      <div className={styles.content}>
        {/* Información del usuario */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Información del usuario</h2>
          <Card className={styles.card}>
            <div className={styles.dataRow}>
              <span className={styles.dataLabel}>Nombre:</span>
              <span className={styles.dataValue}>{userName}</span>
            </div>
            <div className={styles.dataRow}>
              <span className={styles.dataLabel}>Email:</span>
              <span className={styles.dataValue}>{userEmail}</span>
            </div>
            <div className={styles.dataRow}>
              <span className={styles.dataLabel}>Autenticación:</span>
              <Badge appearance="filled" color="success">PIN</Badge>
            </div>
          </Card>
        </div>

        {/* Viaje activo */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Viaje activo</h2>
          <Card className={styles.card}>
            {viajeActivo ? (
              <>
                <div className={styles.dataRow}>
                  <span className={styles.dataLabel}>Número:</span>
                  <span className={styles.viajeActivoInfo}>{viajeActivo.numViaje}</span>
                </div>
                <div className={styles.dataRow}>
                  <span className={styles.dataLabel}>Fechas:</span>
                  <span className={styles.dataValue}>
                    {formatFecha(viajeActivo.fechaInicio)} → {formatFecha(viajeActivo.fechaFin)}
                  </span>
                </div>
                <div className={styles.dataRow}>
                  <span className={styles.dataLabel}>CECO:</span>
                  <span className={styles.dataValue}>{viajeActivo.ceco}</span>
                </div>
                <div className={styles.dataRow}>
                  <span className={styles.dataLabel}>SAP subido:</span>
                  <Badge appearance="filled" color={viajeActivo.sapSubido ? "success" : "subtle"}>
                    {viajeActivo.sapSubido ? "Sí" : "No"}
                  </Badge>
                </div>
                <div className={styles.dataRow}>
                  <span className={styles.dataLabel}>Excel generado:</span>
                  <Badge appearance="filled" color={viajeActivo.excelGenerado ? "success" : "subtle"}>
                    {viajeActivo.excelGenerado ? "Sí" : "No"}
                  </Badge>
                </div>
              </>
            ) : (
              <p className={styles.infoText}>No hay viaje activo establecido</p>
            )}
          </Card>
        </div>

        {/* Versión de la app */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Versión de la app</h2>
          <Card className={styles.card}>
            <p className={styles.versionText}>GastosInetumApp v1.0.0</p>
            <p className={styles.buildInfo}>Build: {new Date().toLocaleDateString()}</p>
            <p className={styles.buildInfo}>Entorno: {import.meta.env.DEV ? "Desarrollo" : "Producción"}</p>
          </Card>
        </div>

        {/* Flows configurados */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            Flows Power Automate 
            <Badge appearance="filled" color="brand" style={{ marginLeft: "8px" }}>
              {flows.length}
            </Badge>
          </h2>
          <Card className={styles.card}>
            {flows.map((flow) => (
              <div key={flow.name} className={styles.flowItem}>
                <Checkmark20Regular className={styles.flowIcon} />
                <div>
                  <div className={styles.flowName}>{flow.name}</div>
                  <div className={styles.infoText}>{flow.description}</div>
                </div>
              </div>
            ))}
          </Card>
        </div>

        {/* Links útiles */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Links útiles</h2>
          <Card className={styles.card}>
            <div className={styles.dataRow}>
              <span className={styles.dataLabel}>OneDrive:</span>
              <a 
                href="https://gfi1-my.sharepoint.com/personal/david_moreno-castillo_inetum_com/Documents/TicketsGastos"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.linkButton}
              >
                Abrir carpeta TicketsGastos
              </a>
            </div>
            <div className={styles.dataRow}>
              <span className={styles.dataLabel}>Dataverse:</span>
              <span className={styles.dataValue}>GastosInetumApp</span>
            </div>
          </Card>
        </div>

        {/* Acciones */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Acciones</h2>
          <Card className={styles.warningCard}>
            <div className={styles.warningMessage}>
              <Info20Regular />
              <span>Esto solo elimina el viaje activo de este dispositivo</span>
            </div>
            <Button
              appearance="secondary"
              icon={<DeleteDismiss20Regular />}
              className={styles.actionButton}
              onClick={handleLimpiarCache}
            >
              Limpiar caché local
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
