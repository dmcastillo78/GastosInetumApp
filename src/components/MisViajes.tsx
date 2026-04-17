import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  Badge,
  Spinner,
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
  Folder20Regular,
  DocumentTable20Regular,
  DocumentText20Regular,
  Checkmark20Regular,
  Clock20Regular,
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
    flex: 1,
  },
  countBadge: {
    fontSize: "14px",
    ...shorthands.padding("6px", "12px"),
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    ...shorthands.padding("80px", "20px"),
    ...shorthands.gap("16px"),
  },
  emptyState: {
    textAlign: "center",
    ...shorthands.padding("60px", "20px"),
    color: tokens.colorNeutralForeground3,
  },
  viajesList: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap("16px"),
  },
  viajeCard: {
    ...shorthands.padding("16px"),
    ...shorthands.border("2px", "solid", "transparent"),
    transition: "all 0.2s ease",
  },
  viajeCardActive: {
    ...shorthands.border("2px", "solid", tokens.colorBrandBackground),
    backgroundColor: tokens.colorBrandBackground2Hover,
  },
  viajeContent: {
    display: "grid",
    gridTemplateColumns: "1fr 1.2fr 1fr 0.6fr auto",
    ...shorthands.gap("12px"),
    alignItems: "start",
    "@media (max-width: 768px)": {
      gridTemplateColumns: "1fr",
      ...shorthands.gap("12px"),
    },
  },
  viajeCol: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap("6px"),
  },
  viajeColAction: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap("6px"),
    alignSelf: "center",
  },
  colLabel: {
    fontSize: "11px",
    fontWeight: 600,
    color: tokens.colorNeutralForeground3,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  colValue: {
    fontSize: "14px",
    color: tokens.colorNeutralForeground1,
    fontWeight: 500,
  },
  viajeNumero: {
    fontSize: "18px",
    fontWeight: 700,
    color: tokens.colorBrandForeground1,
  },
  viajeCeco: {
    fontSize: "13px",
    color: tokens.colorNeutralForeground2,
    fontFamily: "monospace",
  },
  documentosCol: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap("6px"),
  },
  docItem: {
    display: "flex",
    alignItems: "center",
    ...shorthands.gap("6px"),
    fontSize: "12px",
  },
  docLink: {
    color: tokens.colorBrandForeground1,
    textDecoration: "none",
    fontSize: "12px",
    "&:hover": {
      textDecoration: "underline",
    },
  },
  activeBadge: {
    fontSize: "13px",
    ...shorthands.padding("6px", "12px"),
    minHeight: "32px",
    minWidth: "155px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  actionButton: {
    minWidth: "155px",
  },
});

// URL del flow para listar viajes
const LISTAR_VIAJES_URL = "https://cb2d3297d484eb42ae60646399e38f.fe.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/9cc1d95eaf0745d7bfcfc16f6d7c3217/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=-cQzDtoUJJe_q1ZlCk66hoBVdlvxtoSSJ8tHiRft42o";

// Base OneDrive para links a carpetas
const BASE_ONEDRIVE = "https://gfi1-my.sharepoint.com/:f:/r/personal/david_moreno-castillo_inetum_com/Documents";

// Interface para viajes del flow
interface ViajeFlow {
  cr468_viajeid: string;
  cr468_numviaje: string;
  cr468_fechainicio: string;
  cr468_fechafin: string;
  cr468_ceco: string;
  cr468_estado: string;
  cr468_sapsubido: boolean;
  cr468_excelgenerado?: string;
  cr468_useremail: string;
  cr468_urlsap?: string;
}

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

interface MisViajesProps {
  onBack: () => void;
}

export const MisViajes: React.FC<MisViajesProps> = ({ onBack }) => {
  const styles = useStyles();
  const { viajeActivo, setViajeActivo } = useViaje();
  const toasterId = useId("toaster");
  const { dispatchToast } = useToastController(toasterId);

  const [viajes, setViajes] = useState<ViajeFlow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar viajes al montar
  useEffect(() => {
    const cargarViajes = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const userEmail = localStorage.getItem("userEmail") || "david.moreno-castillo@inetum.com";

        const response = await fetch(LISTAR_VIAJES_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userEmail: userEmail,
          }),
        });

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Ordenar por fecha de inicio descendente (más reciente primero)
        const viajesOrdenados = (data.viajes || []).sort((a: ViajeFlow, b: ViajeFlow) => 
          new Date(b.cr468_fechainicio).getTime() - new Date(a.cr468_fechainicio).getTime()
        );

        setViajes(viajesOrdenados);
        console.log(`✅ ${viajesOrdenados.length} viajes cargados`);
      } catch (err) {
        console.error("Error al cargar viajes:", err);
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setIsLoading(false);
      }
    };

    cargarViajes();
  }, []);

  // Handler para establecer viaje como activo
  const handleEstablecerActivo = (viaje: ViajeFlow) => {
    const nuevoViajeActivo = {
      id: viaje.cr468_viajeid,
      numViaje: viaje.cr468_numviaje,
      fechaInicio: viaje.cr468_fechainicio,
      fechaFin: viaje.cr468_fechafin,
      ceco: viaje.cr468_ceco,
      sapSubido: viaje.cr468_sapsubido,
      excelGenerado: viaje.cr468_excelgenerado || undefined,
      cr468_sapsubido: viaje.cr468_sapsubido,
    };

    setViajeActivo(nuevoViajeActivo);

    dispatchToast(
      <Toast>
        <ToastTitle>✅ Viaje {viaje.cr468_numviaje} establecido como activo</ToastTitle>
      </Toast>,
      { intent: "success", timeout: 2000 }
    );
  };

  // Verificar si un viaje es el activo
  const esViajeActivo = (viajeId: string): boolean => {
    return viajeActivo?.id === viajeId;
  };

  if (isLoading) {
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
          <h1 className={styles.title}>Mis Viajes</h1>
        </div>
        <div className={styles.loadingContainer}>
          <Spinner size="large" />
          <p style={{ color: tokens.colorNeutralForeground2 }}>Cargando viajes...</p>
        </div>
      </div>
    );
  }

  if (error) {
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
          <h1 className={styles.title}>Mis Viajes</h1>
        </div>
        <div className={styles.emptyState}>
          <p style={{ color: tokens.colorPaletteRedForeground1, marginBottom: "8px" }}>
            ❌ Error al cargar viajes
          </p>
          <p style={{ fontSize: "13px" }}>{error}</p>
        </div>
      </div>
    );
  }

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
        <h1 className={styles.title}>Mis Viajes</h1>
        <Badge appearance="filled" color="brand" className={styles.countBadge}>
          {viajes.length}
        </Badge>
      </div>

      {viajes.length === 0 ? (
        <div className={styles.emptyState}>
          <p style={{ fontSize: "18px", marginBottom: "8px" }}>📋</p>
          <p>No tienes viajes registrados</p>
          <p style={{ fontSize: "13px", marginTop: "8px" }}>
            Comienza creando un nuevo viaje desde el menú principal
          </p>
        </div>
      ) : (
        <div className={styles.viajesList}>
          {viajes.map((viaje) => {
            const esActivo = esViajeActivo(viaje.cr468_viajeid);
            const carpetaUrl = `${BASE_ONEDRIVE}/TicketsGastos/${viaje.cr468_numviaje}`;
            const sapUrl = viaje.cr468_urlsap || `${BASE_ONEDRIVE}/TicketsGastos/${viaje.cr468_numviaje}/${viaje.cr468_numviaje}.pdf`;

            return (
              <Card
                key={viaje.cr468_viajeid}
                className={`${styles.viajeCard} ${esActivo ? styles.viajeCardActive : ""}`}
              >
                <div className={styles.viajeContent}>
                  {/* Columna 1: Viaje y CECO */}
                  <div className={styles.viajeCol}>
                    <span className={styles.colLabel}>Viaje</span>
                    <span className={styles.viajeNumero}>{viaje.cr468_numviaje}</span>
                    <span className={styles.viajeCeco}>CECO: {viaje.cr468_ceco}</span>
                  </div>

                  {/* Columna 2: Fechas */}
                  <div className={styles.viajeCol}>
                    <span className={styles.colLabel}>Periodo</span>
                    <span className={styles.colValue}>
                      {formatFecha(viaje.cr468_fechainicio)} → {formatFecha(viaje.cr468_fechafin)}
                    </span>
                  </div>

                  {/* Columna 3: Documentos */}
                  <div className={styles.viajeCol}>
                    <span className={styles.colLabel}>Documentos</span>
                    <div className={styles.documentosCol}>
                      {/* SAP */}
                      <div className={styles.docItem}>
                        <DocumentText20Regular />
                        {viaje.cr468_sapsubido ? (
                          <>
                            <Checkmark20Regular style={{ color: tokens.colorPaletteGreenForeground1 }} />
                            <a 
                              href={sapUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className={styles.docLink}
                            >
                              SAP
                            </a>
                          </>
                        ) : (
                          <>
                            <Clock20Regular style={{ color: tokens.colorNeutralForeground3 }} />
                            <span style={{ color: tokens.colorNeutralForeground3 }}>SAP</span>
                          </>
                        )}
                      </div>

                      {/* Excel */}
                      <div className={styles.docItem}>
                        <DocumentTable20Regular />
                        {viaje.cr468_excelgenerado ? (
                          <>
                            <Checkmark20Regular style={{ color: tokens.colorPaletteGreenForeground1 }} />
                            <a 
                              href={viaje.cr468_excelgenerado} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className={styles.docLink}
                            >
                              Excel
                            </a>
                          </>
                        ) : (
                          <>
                            <Clock20Regular style={{ color: tokens.colorNeutralForeground3 }} />
                            <span style={{ color: tokens.colorNeutralForeground3 }}>Excel</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Columna 4: OneDrive */}
                  <div className={styles.viajeCol}>
                    <span className={styles.colLabel}>Carpeta</span>
                    <a 
                      href={carpetaUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={styles.docLink}
                    >
                      📁 OneDrive
                    </a>
                  </div>

                  {/* Columna 5: Acción */}
                  <div className={styles.viajeColAction}>
                    {esActivo ? (
                      <Badge 
                        appearance="filled" 
                        color="success" 
                        className={styles.activeBadge}
                      >
                        🟢 Activo
                      </Badge>
                    ) : (
                      <Button
                        appearance="primary"
                        size="small"
                        onClick={() => handleEstablecerActivo(viaje)}
                        className={styles.actionButton}
                      >
                        Establecer activo
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
