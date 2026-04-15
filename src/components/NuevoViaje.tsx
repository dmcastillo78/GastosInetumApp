import React from "react";
import {
  Button,
  Textarea,
  Spinner,
  Card,
  makeStyles,
  shorthands,
  tokens,
} from "@fluentui/react-components";
import { ArrowLeft20Regular } from "@fluentui/react-icons";

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
    ...shorthands.gap("20px"),
    maxWidth: "800px",
    width: "100%",
  },
  textarea: {
    minHeight: "200px",
  },
  buttonGroup: {
    display: "flex",
    ...shorthands.gap("12px"),
  },
  spinnerContainer: {
    display: "flex",
    alignItems: "center",
    ...shorthands.gap("12px"),
    ...shorthands.padding("20px"),
  },
  card: {
    ...shorthands.padding("20px"),
  },
  dataRow: {
    display: "flex",
    justifyContent: "space-between",
    ...shorthands.padding("8px", "0"),
    ...shorthands.borderBottom("1px", "solid", tokens.colorNeutralStroke2),
  },
  dataLabel: {
    fontWeight: 600,
    color: tokens.colorNeutralForeground2,
  },
  dataValue: {
    color: tokens.colorNeutralForeground1,
  },
  successCard: {
    ...shorthands.padding("20px"),
    backgroundColor: tokens.colorPaletteGreenBackground2,
    ...shorthands.border("2px", "solid", tokens.colorPaletteGreenBorder2),
  },
  successHeader: {
    fontSize: "20px",
    fontWeight: 600,
    color: tokens.colorPaletteGreenForeground2,
    marginBottom: "16px",
  },
  errorMessage: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap("12px"),
    ...shorthands.padding("16px"),
    backgroundColor: tokens.colorPaletteRedBackground2,
    color: tokens.colorPaletteRedForeground2,
    ...shorthands.borderRadius("4px"),
  },
  errorText: {
    display: "flex",
    alignItems: "center",
    ...shorthands.gap("8px"),
  },
});

interface NuevoViajeProps {
  onBack: () => void;
  onNavigate: (screen: string) => void;
}

interface DatosViaje {
  num_viaje: string;
  fecha_inicio: string;
  fecha_fin: string;
  ceco: string;
}

export const NuevoViaje: React.FC<NuevoViajeProps> = ({ onBack, onNavigate }) => {
  const styles = useStyles();
  const [correoSAP, setCorreoSAP] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [datosExtraidos, setDatosExtraidos] = React.useState<DatosViaje | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleExtraerDatos = async () => {
    if (!correoSAP.trim()) {
      setError("Por favor, pega el contenido del correo SAP");
      return;
    }

    setIsLoading(true);
    setError(null);
    setDatosExtraidos(null);

    try {
      const response = await fetch(
        "https://cb2d3297d484eb42ae60646399e38f.fe.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/fc991d87225f41f884ec5199d9086f49/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=jFajGwiYtrLUVzhcnTK33__t_BICTR0CezxD6Uy2W5I",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            correoSAP: correoSAP,
            userEmail: "david.moreno-castillo@inetum.com",
          }),
        }
      );

      if (!response.ok) {
        const status = response.status;
        
        if (status === 400) {
          throw new Error("Datos del correo incorrectos o incompletos");
        } else if (status === 500 || status === 502) {
          throw new Error("Error en el servidor, inténtalo de nuevo en unos segundos");
        } else {
          throw new Error(`Error inesperado (código ${status})`);
        }
      }

      const data = await response.json();
      
      // Validar que la respuesta contiene los campos esperados
      if (!data.num_viaje || !data.fecha_inicio || !data.fecha_fin || !data.ceco) {
        throw new Error("La respuesta no contiene todos los datos esperados");
      }

      setDatosExtraidos(data);
    } catch (err) {
      console.error("Error al extraer datos:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error al procesar el correo SAP. Por favor, intenta de nuevo.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAñadirTicket = () => {
    onNavigate("añadir-ticket");
  };

  const handleReintentar = () => {
    setError(null);
  };

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
        <h1 className={styles.title}>Nuevo Viaje</h1>
      </div>

      <div className={styles.content}>
        {!datosExtraidos && (
          <>
            <Textarea
              className={styles.textarea}
              placeholder="Pega aquí el contenido del correo SAP con los datos del viaje..."
              value={correoSAP}
              onChange={(_e, data) => setCorreoSAP(data.value)}
              disabled={isLoading}
            />

            <div className={styles.buttonGroup}>
              <Button
                appearance="primary"
                onClick={handleExtraerDatos}
                disabled={isLoading || !correoSAP.trim()}
              >
                Extraer datos
              </Button>
            </div>
          </>
        )}

        {isLoading && (
          <div className={styles.spinnerContainer}>
            <Spinner size="small" />
            <span>Procesando correo SAP...</span>
          </div>
        )}

        {error && (
          <div className={styles.errorMessage}>
            <div className={styles.errorText}>
              <span style={{ fontSize: "20px" }}>⚠️</span>
              <strong>{error}</strong>
            </div>
            <Button
              appearance="secondary"
              onClick={handleReintentar}
            >
              Reintentar
            </Button>
          </div>
        )}

        {datosExtraidos && (
          <>
            <Card className={styles.successCard}>
              <div className={styles.successHeader}>
                ✅ Viaje creado correctamente
              </div>
              <div className={styles.dataRow}>
                <span className={styles.dataLabel}>Nº Viaje:</span>
                <span className={styles.dataValue}>{datosExtraidos.num_viaje}</span>
              </div>
              <div className={styles.dataRow}>
                <span className={styles.dataLabel}>Fecha inicio:</span>
                <span className={styles.dataValue}>{datosExtraidos.fecha_inicio}</span>
              </div>
              <div className={styles.dataRow}>
                <span className={styles.dataLabel}>Fecha fin:</span>
                <span className={styles.dataValue}>{datosExtraidos.fecha_fin}</span>
              </div>
              <div className={styles.dataRow}>
                <span className={styles.dataLabel}>CECO:</span>
                <span className={styles.dataValue}>{datosExtraidos.ceco}</span>
              </div>
            </Card>

            <div className={styles.buttonGroup}>
              <Button
                appearance="primary"
                onClick={handleAñadirTicket}
              >
                Añadir ticket
              </Button>
              <Button
                appearance="secondary"
                onClick={onBack}
              >
                Volver al inicio
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
