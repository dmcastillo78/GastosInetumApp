import React from "react";
import {
  Button,
  Spinner,
  Card,
  makeStyles,
  shorthands,
  tokens,
} from "@fluentui/react-components";
import { ArrowLeft20Regular, Checkmark20Regular } from "@fluentui/react-icons";
import { app, authentication } from "@microsoft/teams-js";

const useStyles = makeStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.padding("20px"),
    minHeight: "100vh",
    backgroundColor: tokens.colorNeutralBackground1,
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
    maxWidth: "800px",
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
  errorCard: {
    ...shorthands.padding("20px"),
    backgroundColor: tokens.colorPaletteRedBackground2,
    ...shorthands.border("2px", "solid", tokens.colorPaletteRedBorder2),
  },
  errorMessage: {
    color: tokens.colorPaletteRedForeground2,
    marginBottom: "12px",
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
  infoText: {
    fontSize: "12px",
    color: tokens.colorNeutralForeground3,
    fontStyle: "italic",
    marginTop: "8px",
  },
});

interface UserInfo {
  displayName: string;
  mail: string;
  jobTitle: string;
}

interface ConfiguracionProps {
  onBack: () => void;
}

export const Configuracion: React.FC<ConfiguracionProps> = ({ onBack }) => {
  const styles = useStyles();
  const [userInfo, setUserInfo] = React.useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchUserInfo = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Inicializar Teams SDK
      await app.initialize();
      
      // Obtener token de autenticación
      const token = await authentication.getAuthToken();
      
      // Hacer petición a Microsoft Graph
      const response = await fetch("https://graph.microsoft.com/v1.0/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error al obtener información del usuario: ${response.status}`);
      }

      const data = await response.json();
      
      setUserInfo({
        displayName: data.displayName || "N/A",
        mail: data.mail || data.userPrincipalName || "N/A",
        jobTitle: data.jobTitle || "N/A",
      });
    } catch (err) {
      console.error("Error al obtener información del usuario:", err);
      
      // Manejo específico de errores de Teams
      if (err instanceof Error) {
        const errorMessage = err.message || "";
        if (errorMessage.includes("not initialized") || 
            errorMessage.includes("not in teams") ||
            errorMessage.includes("FrameContext")) {
          setError("Esta función requiere ejecutarse dentro de Microsoft Teams");
        } else {
          setError(errorMessage);
        }
      } else {
        setError("No se pudo obtener la información del usuario");
      }
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchUserInfo();
  }, []);

  const flows = [
    { name: "NuevoViaje", active: true },
    { name: "ObtenerViajeActivo", active: true },
    { name: "NuevoTicket", active: true },
    { name: "ActualizarTicket", active: true },
  ];

  return (
    <div className={styles.container}>
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
          
          {isLoading ? (
            <Card className={styles.card}>
              <div className={styles.spinnerContainer}>
                <Spinner size="medium" label="Cargando información del usuario..." />
              </div>
            </Card>
          ) : error ? (
            <Card className={styles.errorCard}>
              <p className={styles.errorMessage}>{error}</p>
              <Button appearance="primary" onClick={fetchUserInfo}>
                Reintentar
              </Button>
              <p className={styles.infoText}>
                En desarrollo local, la autenticación con Teams no está disponible. 
                Despliega la app en Teams para probar esta función.
              </p>
            </Card>
          ) : userInfo ? (
            <Card className={styles.card}>
              <div className={styles.dataRow}>
                <span className={styles.dataLabel}>Nombre:</span>
                <span className={styles.dataValue}>{userInfo.displayName}</span>
              </div>
              <div className={styles.dataRow}>
                <span className={styles.dataLabel}>Email:</span>
                <span className={styles.dataValue}>{userInfo.mail}</span>
              </div>
              <div className={styles.dataRow}>
                <span className={styles.dataLabel}>Cargo:</span>
                <span className={styles.dataValue}>{userInfo.jobTitle}</span>
              </div>
            </Card>
          ) : null}
        </div>

        {/* Versión de la app */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Versión de la app</h2>
          <Card className={styles.card}>
            <p className={styles.versionText}>GastosInetumApp v0.1.0</p>
          </Card>
        </div>

        {/* Flows configurados */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Flows configurados</h2>
          <Card className={styles.card}>
            {flows.map((flow) => (
              <div key={flow.name} className={styles.flowItem}>
                <Checkmark20Regular className={styles.flowIcon} />
                <span className={styles.flowName}>{flow.name}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
};
