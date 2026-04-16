import React, { useState } from "react";
import {
  Button,
  Input,
  Dropdown,
  Option,
  Spinner,
  Card,
  makeStyles,
  shorthands,
  tokens,
} from "@fluentui/react-components";
import { ArrowLeft20Regular, Camera20Regular } from "@fluentui/react-icons";
import { useViaje } from "../context/ViajeContext";

const NUEVO_TICKET_URL = "https://cb2d3297d484eb42ae60646399e38f.fe.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/7edc6b71d4be4664a060f80f5cf8851c/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=NMHIIN9B1e3o0FpOUhsIWplXRGiimCFrKoCO-Dnk7HY";
const ACTUALIZAR_TICKET_URL = "https://cb2d3297d484eb42ae60646399e38f.fe.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/6fb9ea620fd44f258283ca13cb7e3cdb/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=0B_B_Yh_miKGgHB_EWFLus9xBdzLUGe8KluNzLjtz5U";

const useStyles = makeStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.padding("20px"),
    minHeight: "100vh",
    backgroundColor: tokens.colorNeutralBackground1,
    width: "100%",
    maxWidth: "800px",
    margin: "0 auto",
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
  viajeBanner: {
    ...shorthands.padding("12px", "20px"),
    ...shorthands.borderRadius("8px"),
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorNeutralForeground1,
    marginBottom: "24px",
    fontSize: "14px",
    textAlign: "center",
  },
  content: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap("20px"),
    width: "100%",
  },
  uploadArea: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    ...shorthands.gap("16px"),
    ...shorthands.padding("32px"),
    ...shorthands.border("2px", "dashed", tokens.colorNeutralStroke1),
    ...shorthands.borderRadius("8px"),
    backgroundColor: tokens.colorNeutralBackground2,
  },
  imagePreview: {
    width: "100%",
    maxHeight: "400px",
    objectFit: "contain",
    ...shorthands.borderRadius("8px"),
    ...shorthands.border("1px", "solid", tokens.colorNeutralStroke1),
    backgroundColor: tokens.colorNeutralBackground3,
  },
  buttonGroup: {
    display: "flex",
    ...shorthands.gap("12px"),
    flexWrap: "wrap",
  },
  primaryButton: {
    minHeight: "56px",
    fontSize: "16px",
    fontWeight: 600,
  },
  secondaryButton: {
    minHeight: "56px",
    fontSize: "16px",
  },
  spinnerContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    ...shorthands.gap("12px"),
    ...shorthands.padding("40px"),
  },
  formField: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap("8px"),
  },
  label: {
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
    fontSize: "16px",
  },
  largeInput: {
    minHeight: "56px",
    fontSize: "16px",
    "& input": {
      fontSize: "16px",
    },
  },
  largeDropdown: {
    minHeight: "56px",
    fontSize: "16px",
  },
  errorMessage: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    ...shorthands.gap("12px"),
    ...shorthands.padding("24px"),
    backgroundColor: tokens.colorPaletteRedBackground2,
    color: tokens.colorPaletteRedForeground2,
    ...shorthands.borderRadius("8px"),
    textAlign: "center",
  },
  successCard: {
    ...shorthands.padding("20px"),
    backgroundColor: tokens.colorPaletteGreenBackground2,
    ...shorthands.border("2px", "solid", tokens.colorPaletteGreenBorder2),
  },
  hiddenInput: {
    display: "none",
  },
});

// Helper para formatear fechas de DD/MM/YYYY a display
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

// Helper para convertir fecha a formato YYYY-MM-DD para input type="date"
const convertToDateInputFormat = (fechaString: string): string => {
  if (!fechaString) return "";
  
  try {
    // Si ya está en formato YYYY-MM-DD, devolverla tal cual
    if (/^\d{4}-\d{2}-\d{2}$/.test(fechaString)) {
      return fechaString;
    }
    
    // Si está en formato DD/MM/YYYY
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(fechaString)) {
      const [day, month, year] = fechaString.split("/");
      return `${year}-${month}-${day}`;
    }
    
    // Si es formato ISO o cualquier otro que Date pueda parsear
    const date = new Date(fechaString);
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
    
    return "";
  } catch (error) {
    console.error("Error al convertir fecha:", error);
    return "";
  }
};

interface AnadirTicketProps {
  onBack: () => void;
}

interface DatosTicket {
  fecha: string;
  tipo_gasto: string;
  importe: string;
  descripcion: string;
}

export const AnadirTicket: React.FC<AnadirTicketProps> = ({ onBack }) => {
  const styles = useStyles();
  const { viajeActivo } = useViaje();
  
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [tipoGasto, setTipoGasto] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [datosTicket, setDatosTicket] = useState<DatosTicket | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ticketId, setTicketId] = React.useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>("Analizando ticket...");
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setError(null);
      
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Remover el prefijo data:image/...;base64,
        const base64Data = base64String.split(",")[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleExtraerDatos = async () => {
    if (!selectedImage) {
      setError("Por favor, selecciona una imagen primero");
      return;
    }

    if (!viajeActivo) {
      setError("No hay un viaje activo. Crea un viaje primero.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const base64Image = await convertImageToBase64(selectedImage);

      const response = await fetch(NUEVO_TICKET_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imagenBase64: base64Image,
          viajeId: viajeActivo.id,
          numViaje: viajeActivo.numViaje,
          userEmail: "david.moreno-castillo@inetum.com",
          tipoGasto: tipoGasto,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Guardar ticketId e imagenUrl si existen
      if (data.ticketId) {
        setTicketId(data.ticketId);
      }
      if (data.imagenUrl) {
        setImagePreview(data.imagenUrl);
      }
      
      // Guardar los datos extraídos
      setDatosTicket({
        fecha: convertToDateInputFormat(data.fecha || ""),
        tipo_gasto: tipoGasto, // Pre-rellenado con el tipo seleccionado
        importe: data.importe || "",
        descripcion: data.descripcion || "",
      });
    } catch (err) {
      console.error("Error al extraer datos:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Error al procesar la imagen. Por favor, intenta de nuevo."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleActualizarTicket = async () => {
    if (!datosTicket || !ticketId) return;

    setIsLoading(true);
    setLoadingMessage("Guardando cambios...");
    setError(null);
    setUpdateSuccess(false);

    try {
      const response = await fetch(ACTUALIZAR_TICKET_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticketId: ticketId,
          fecha: datosTicket.fecha,
          tipoGasto: datosTicket.tipo_gasto,
          importe: parseFloat(datosTicket.importe),
          descripcion: datosTicket.descripcion,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      setUpdateSuccess(true);
    } catch (err) {
      console.error("Error al guardar ticket:", err);
      setError(
        err instanceof Error
          ? `⚠️ ${err.message}`
          : "⚠️ Error al guardar el ticket. Por favor, intenta de nuevo."
      );
    } finally {
      setIsLoading(false);
      setLoadingMessage("Analizando ticket...");
    }
  };

  const handleRepetir = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setTipoGasto("");
    setDatosTicket(null);
    setError(null);
    setUpdateSuccess(false);
    setTicketId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleReintentar = () => {
    setError(null);
  };

  if (!viajeActivo) {
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
          <h1 className={styles.title}>Añadir Ticket</h1>
        </div>
        <div className={styles.errorMessage}>
          <span style={{ fontSize: "20px" }}>⚠️</span>
          <strong>No hay viaje activo</strong>
          <p>Debes crear un viaje primero antes de añadir tickets.</p>
          <Button appearance="primary" className={styles.primaryButton} onClick={onBack}>
            Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

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
        <h1 className={styles.title}>Añadir Ticket</h1>
      </div>
Viaje:
      <div className={styles.viajeBanner}>
        <span className={styles.viajeInfo}>Viaje activo:</span> {viajeActivo.numViaje} | {formatFecha(viajeActivo.fechaInicio)} → {formatFecha(viajeActivo.fechaFin)}
      </div>

      <div className={styles.content}>
        {/* FASE 1: Captura de imagen */}
        {!datosTicket && !isLoading && (
          <>
            <div className={styles.uploadArea}>
              <Camera20Regular style={{ fontSize: "48px", color: tokens.colorNeutralForeground3 }} />
              <p>Haz una foto del ticket o sube una imagen</p>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageSelect}
                className={styles.hiddenInput}
              />
              
              <Button
                appearance="primary"
                className={styles.primaryButton}
                icon={<Camera20Regular />}
                onClick={() => fileInputRef.current?.click()}
              >
                Hacer foto / Subir imagen
              </Button>
            </div>

            {imagePreview && (
              <>
                <img src={imagePreview} alt="Preview" className={styles.imagePreview} />
                
                <div className={styles.formField}>
                  <label className={styles.label}>Tipo de gasto *</label>
                  <Dropdown
                    className={styles.largeDropdown}
                    placeholder="Selecciona un tipo"
                    value={tipoGasto}
                    selectedOptions={tipoGasto ? [tipoGasto] : []}
                    onOptionSelect={(_e, data) => setTipoGasto(data.optionValue || "")}
                  >
                    <Option value="Hotel">Hotel</Option>
                    <Option value="Vuelo">Vuelo</Option>
                    <Option value="Taxi">Taxi</Option>
                    <Option value="Comida">Comida</Option>
                    <Option value="Parking">Parking</Option>
                    <Option value="Otros">Otros</Option>
                  </Dropdown>
                </div>

                <div className={styles.buttonGroup}>
                  <Button
                    appearance="primary"
                    className={styles.primaryButton}
                    onClick={handleExtraerDatos}
                    disabled={!tipoGasto}
                  >
                    Añadir Ticket
                  </Button>
                  <Button
                    appearance="secondary"
                    className={styles.secondaryButton}
                    onClick={handleRepetir}
                  >
                    Cambiar imagen
                  </Button>
                  <Button
                    appearance="secondary"
                    className={styles.secondaryButton}
                    onClick={onBack}
                  >
                    Cancelar
                  </Button>
                </div>
              </>
            )}
          </>
        )}

        {/* Spinner mientras procesa */}
        {isLoading && (
          <div className={styles.spinnerContainer}>
            <Spinner size="large" />
            <p>{loadingMessage}</p>
          </div>
        )}

        {/* FASE 3: Error */}
        {error && (
          <div className={styles.errorMessage}>
            <span style={{ fontSize: "24px" }}>⚠️</span>
            <strong>{error}</strong>
            <Button appearance="secondary" className={styles.secondaryButton} onClick={handleReintentar}>
              Reintentar
            </Button>
          </div>
        )}

        {/* FASE 2: Confirmación con formulario editable */}
        {datosTicket && !isLoading && (
          <>
            {imagePreview && (
              <img src={imagePreview} alt="Ticket" className={styles.imagePreview} />
            )}

            {updateSuccess ? (
              <Card className={styles.successCard}>
                <h3 style={{ marginTop: 0 }}>✅ Ticket guardado correctamente</h3>
              </Card>
            ) : (
              <Card className={styles.successCard}>
                <h3 style={{ marginTop: 0 }}>✅ Datos extraídos - revisa y confirma</h3>
              </Card>
            )}

            <div className={styles.formField}>
              <label className={styles.label}>Fecha</label>
              <Input
                className={styles.largeInput}
                type="date"
                value={datosTicket.fecha}
                onChange={(_e, data) => setDatosTicket({ ...datosTicket, fecha: data.value })}
              />
            </div>

            <div className={styles.formField}>
              <label className={styles.label}>Tipo de gasto *</label>
              <Dropdown
                className={styles.largeDropdown}
                placeholder="Selecciona un tipo"
                value={datosTicket.tipo_gasto}
                selectedOptions={datosTicket.tipo_gasto ? [datosTicket.tipo_gasto] : []}
                onOptionSelect={(_e, data) => 
                  setDatosTicket({ ...datosTicket, tipo_gasto: data.optionValue || "" })
                }
              >
                <Option value="Hotel">Hotel</Option>
                <Option value="Vuelo">Vuelo</Option>
                <Option value="Taxi">Taxi</Option>
                <Option value="Comida">Comida</Option>
                <Option value="Parking">Parking</Option>
                <Option value="Otros">Otros</Option>
              </Dropdown>
            </div>

            <div className={styles.formField}>
              <label className={styles.label}>Importe (€)</label>
              <Input
                className={styles.largeInput}
                type="number"
                step="0.01"
                value={datosTicket.importe}
                onChange={(_e, data) => setDatosTicket({ ...datosTicket, importe: data.value })}
              />
            </div>

            <div className={styles.formField}>
              <label className={styles.label}>Descripción</label>
              <Input
                className={styles.largeInput}
                value={datosTicket.descripcion}
                onChange={(_e, data) => setDatosTicket({ ...datosTicket, descripcion: data.value })}
              />
            </div>

            <div className={styles.buttonGroup}>
              <Button
                appearance="primary"
                className={styles.primaryButton}
                onClick={handleActualizarTicket}
                disabled={!ticketId || !datosTicket.tipo_gasto}
              >
                {updateSuccess ? "Actualizar de nuevo" : "Actualizar los datos"}
              </Button>
              <Button
                appearance="secondary"
                className={styles.secondaryButton}
                onClick={onBack}
              >
                Volver
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
