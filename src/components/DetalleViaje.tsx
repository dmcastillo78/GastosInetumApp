import React, { useState } from "react";
import {
  Button,
  Card,
  Badge,
  makeStyles,
  shorthands,
  tokens,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHeader,
  TableHeaderCell,
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionPanel,
  Toast,
  ToastTitle,
  useToastController,
  Toaster,
  useId,
} from "@fluentui/react-components";
import {
  ArrowLeft20Regular,
  Add20Regular,
  TableArrowUp20Regular,
  ArrowUpload20Regular,
  FolderZip20Regular,
  Link20Regular,
  DocumentTable20Regular,
  DocumentText20Regular,
  Copy20Regular,
} from "@fluentui/react-icons";
import { useViaje } from "../context/ViajeContext";

const useStyles = makeStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.padding("20px"),
    paddingBottom: "120px",
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
    margin: 0,
  },
  section: {
    marginBottom: "24px",
  },
  emailSection: {
    marginBottom: "40px",
    marginTop: "24px",
    paddingTop: "24px",
    borderTop: `2px solid ${tokens.colorNeutralStroke2}`,
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
    marginBottom: "12px",
  },
  viajeCard: {
    ...shorthands.padding("20px"),
  },
  viajeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    ...shorthands.gap("16px"),
  },
  viajeField: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap("4px"),
  },
  fieldLabel: {
    fontSize: "12px",
    fontWeight: 600,
    color: tokens.colorNeutralForeground3,
    textTransform: "uppercase",
  },
  fieldValue: {
    fontSize: "16px",
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
  },
  tableContainer: {
    overflowX: "auto",
    marginBottom: "12px",
  },
  totalRow: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    ...shorthands.padding("12px"),
    ...shorthands.gap("12px"),
    fontWeight: 600,
    fontSize: "16px",
  },
  totalLabel: {
    color: tokens.colorNeutralForeground2,
  },
  totalValue: {
    color: tokens.colorBrandForeground1,
    fontSize: "18px",
  },
  actionButtons: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap("12px"),
  },
  actionButton: {
    minHeight: "56px",
    fontSize: "16px",
    fontWeight: 600,
    justifyContent: "flex-start",
  },
  documentList: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap("12px"),
  },
  documentItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    ...shorthands.gap("12px"),
    ...shorthands.padding("12px"),
    ...shorthands.borderRadius("6px"),
    backgroundColor: tokens.colorNeutralBackground3,
  },
  documentItemDisabled: {
    opacity: 0.5,
  },
  documentInfo: {
    display: "flex",
    alignItems: "center",
    ...shorthands.gap("8px"),
    flex: 1,
  },
  documentLink: {
    display: "flex",
    alignItems: "center",
    ...shorthands.gap("8px"),
    color: tokens.colorBrandForeground1,
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: 500,
    ":hover": {
      textDecoration: "underline",
    },
  },
  emailTemplate: {
    ...shorthands.padding("16px"),
    ...shorthands.borderRadius("6px"),
    backgroundColor: tokens.colorNeutralBackground3,
    marginBottom: "12px",
    fontFamily: "monospace",
    fontSize: "14px",
    whiteSpace: "pre-wrap",
    lineHeight: "1.6",
    maxHeight: "300px",
    overflowY: "auto",
  },
  templateSubject: {
    fontWeight: 600,
    marginBottom: "8px",
    color: tokens.colorNeutralForeground1,
  },
  templateBody: {
    color: tokens.colorNeutralForeground2,
  },
  copyButton: {
    width: "100%",
    minHeight: "56px",
    fontSize: "16px",
    fontWeight: 600,
    marginTop: "12px",
  },
  iconLink: {
    color: tokens.colorBrandForeground1,
    cursor: "pointer",
    ":hover": {
      color: tokens.colorBrandForeground2,
    },
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

// Datos dummy para desarrollo
const ticketsDummy = [
  { num: 1, fecha: "07/04/2026", tipo: "Dietas", descripcion: "Almuerzo cliente", importe: 45.5 },
  { num: 2, fecha: "07/04/2026", tipo: "Transporte", descripcion: "Taxi aeropuerto", importe: 32.0 },
  { num: 3, fecha: "08/04/2026", tipo: "Alojamiento", descripcion: "Hotel Madrid", importe: 120.0 },
  { num: 4, fecha: "09/04/2026", tipo: "Dietas", descripcion: "Cena equipo", importe: 67.8 },
];

interface DetalleViajeProps {
  onBack: () => void;
}

export const DetalleViaje: React.FC<DetalleViajeProps> = ({ onBack }) => {
  const styles = useStyles();
  const { viajeActivo } = useViaje();
  const toasterId = useId("toaster");
  const { dispatchToast } = useToastController(toasterId);

  // Estado de documentos generados (dummy - en producción vendrían del backend)
  const [documentosGenerados, setDocumentosGenerados] = useState({
    excel: false,
    informeSAP: false,
    zip: false,
  });

  // Calcular total de tickets
  const totalImporte = ticketsDummy.reduce((sum, ticket) => sum + ticket.importe, 0);

  // Handler para copiar texto al portapapeles
  const handleCopyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      dispatchToast(
        <Toast>
          <ToastTitle>¡Copiado al portapapeles!</ToastTitle>
        </Toast>,
        { intent: "success", timeout: 2000 }
      );
    } catch (error) {
      console.error("Error al copiar:", error);
      dispatchToast(
        <Toast>
          <ToastTitle>Error al copiar al portapapeles</ToastTitle>
        </Toast>,
        { intent: "error", timeout: 2000 }
      );
    }
  };

  // Plantillas de correo
  const emailSolicitudSAP = viajeActivo
    ? `Asunto: Solicitud liquidación viaje ${viajeActivo.numViaje}

Buenas,

Adjunto hoja de gastos del viaje ${viajeActivo.numViaje} 
realizado entre ${formatFecha(viajeActivo.fechaInicio)} y ${formatFecha(viajeActivo.fechaFin)}.

CECO: ${viajeActivo.ceco}

Por favor, generar hoja SAP de liquidación.

Gracias.`
    : "";

  const emailEnvioExpenses = viajeActivo
    ? `Asunto: ${viajeActivo.numViaje}
Para: expenses.es@inetum.com

Buenas,

Adjunto documentación para liquidación del viaje ${viajeActivo.numViaje}:
- Hoja de gastos Excel
- Informe SAP  
- Tickets numerados en PDF

Gracias.`
    : "";

  // Handler dummy para selector de archivos
  const handleUploadSAP = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.xlsx,.xls";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        console.log("Archivo seleccionado (dummy):", file.name);
        // Marcar informe SAP como disponible
        setDocumentosGenerados(prev => ({ ...prev, informeSAP: true }));
        dispatchToast(
          <Toast>
            <ToastTitle>✅ Informe SAP subido correctamente</ToastTitle>
          </Toast>,
          { intent: "success", timeout: 2000 }
        );
      }
    };
    input.click();
  };

  // Handler para generar Excel
  const handleGenerarExcel = () => {
    console.log("Generar Excel (dummy)");
    setDocumentosGenerados(prev => ({ ...prev, excel: true }));
    dispatchToast(
      <Toast>
        <ToastTitle>✅ Excel generado correctamente</ToastTitle>
      </Toast>,
      { intent: "success", timeout: 2000 }
    );
  };

  // Handler para generar ZIP
  const handleGenerarZIP = () => {
    console.log("Generar ZIP (dummy)");
    setDocumentosGenerados(prev => ({ ...prev, zip: true }));
    dispatchToast(
      <Toast>
        <ToastTitle>✅ ZIP generado correctamente</ToastTitle>
      </Toast>,
      { intent: "success", timeout: 2000 }
    );
  };

  // Si no hay viaje activo, mostrar mensaje
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
        </div>
        <Card>
          <p style={{ textAlign: "center", padding: "40px", color: tokens.colorNeutralForeground3 }}>
            No hay viaje activo seleccionado
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Toaster toasterId={toasterId} />
      
      {/* Header con botón volver */}
      <div className={styles.header}>
        <Button
          appearance="subtle"
          icon={<ArrowLeft20Regular />}
          onClick={onBack}
        >
          Volver
        </Button>
        <h1 className={styles.title}>Detalle Viaje</h1>
      </div>

      {/* Sección 1 — Cabecera del viaje */}
      <div className={styles.section}>
        <Card className={styles.viajeCard}>
          <div className={styles.viajeGrid}>
            <div className={styles.viajeField}>
              <span className={styles.fieldLabel}>Núm Viaje</span>
              <span className={styles.fieldValue}>{viajeActivo.numViaje}</span>
            </div>
            <div className={styles.viajeField}>
              <span className={styles.fieldLabel}>Fecha inicio</span>
              <span className={styles.fieldValue}>{formatFecha(viajeActivo.fechaInicio)}</span>
            </div>
            <div className={styles.viajeField}>
              <span className={styles.fieldLabel}>Fecha fin</span>
              <span className={styles.fieldValue}>{formatFecha(viajeActivo.fechaFin)}</span>
            </div>
            <div className={styles.viajeField}>
              <span className={styles.fieldLabel}>CECO</span>
              <span className={styles.fieldValue}>{viajeActivo.ceco}</span>
            </div>
            <div className={styles.viajeField}>
              <span className={styles.fieldLabel}>Estado</span>
              <Badge appearance="filled" color="success">Activo</Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Sección 2 — Tickets del viaje */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Tickets del viaje</h2>
        <Card>
          <div className={styles.tableContainer}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>Nº</TableHeaderCell>
                  <TableHeaderCell>Fecha</TableHeaderCell>
                  <TableHeaderCell>Tipo</TableHeaderCell>
                  <TableHeaderCell>Descripción</TableHeaderCell>
                  <TableHeaderCell style={{ textAlign: "right" }}>Importe</TableHeaderCell>
                  <TableHeaderCell style={{ textAlign: "center" }}>OneDrive</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ticketsDummy.map((ticket) => (
                  <TableRow key={ticket.num}>
                    <TableCell>{ticket.num}</TableCell>
                    <TableCell>{ticket.fecha}</TableCell>
                    <TableCell>{ticket.tipo}</TableCell>
                    <TableCell>{ticket.descripcion}</TableCell>
                    <TableCell style={{ textAlign: "right" }}>
                      {ticket.importe.toFixed(2)} €
                    </TableCell>
                    <TableCell style={{ textAlign: "center" }}>
                      <a href="#" className={styles.iconLink} title="Ver en OneDrive">
                        <Link20Regular />
                      </a>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className={styles.totalRow}>
            <span className={styles.totalLabel}>Total:</span>
            <span className={styles.totalValue}>{totalImporte.toFixed(2)} €</span>
          </div>
          <Button
            appearance="primary"
            icon={<Add20Regular />}
            onClick={() => console.log("Navegar a añadir-ticket (dummy)")}
            style={{ width: "100%", marginTop: "12px" }}
          >
            Añadir Ticket
          </Button>
        </Card>
      </div>

      {/* Sección 3 — Documentos generados */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Documentos generados</h2>
        <Card>
          <div className={styles.documentList}>
            <div className={`${styles.documentItem} ${!documentosGenerados.excel ? styles.documentItemDisabled : ""}`}>
              <div className={styles.documentInfo}>
                <DocumentTable20Regular />
                {documentosGenerados.excel ? (
                  <a href="#" className={styles.documentLink}>
                    Excel de liquidación
                  </a>
                ) : (
                  <span style={{ color: tokens.colorNeutralForeground3 }}>Excel de liquidación</span>
                )}
              </div>
              <Badge appearance="filled" color={documentosGenerados.excel ? "success" : "subtle"}>
                {documentosGenerados.excel ? "Disponible" : "Pendiente"}
              </Badge>
            </div>
            <div className={`${styles.documentItem} ${!documentosGenerados.informeSAP ? styles.documentItemDisabled : ""}`}>
              <div className={styles.documentInfo}>
                <DocumentText20Regular />
                {documentosGenerados.informeSAP ? (
                  <a href="#" className={styles.documentLink}>
                    Informe SAP
                  </a>
                ) : (
                  <span style={{ color: tokens.colorNeutralForeground3 }}>Informe SAP</span>
                )}
              </div>
              <Badge appearance="filled" color={documentosGenerados.informeSAP ? "success" : "subtle"}>
                {documentosGenerados.informeSAP ? "Disponible" : "Pendiente"}
              </Badge>
            </div>
            <div className={`${styles.documentItem} ${!documentosGenerados.zip ? styles.documentItemDisabled : ""}`}>
              <div className={styles.documentInfo}>
                <FolderZip20Regular />
                {documentosGenerados.zip ? (
                  <a href="#" className={styles.documentLink}>
                    ZIP con informes y tickets
                  </a>
                ) : (
                  <span style={{ color: tokens.colorNeutralForeground3 }}>ZIP con informes y tickets</span>
                )}
              </div>
              <Badge appearance="filled" color={documentosGenerados.zip ? "success" : "subtle"}>
                {documentosGenerados.zip ? "Disponible" : "Pendiente"}
              </Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Sección 4 — Acciones */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Acciones</h2>
        <Card>
          <div className={styles.actionButtons}>
            <Button
              appearance="primary"
              size="large"
              icon={<TableArrowUp20Regular />}
              className={styles.actionButton}
              onClick={handleGenerarExcel}
            >
              📊 Generar Excel de liquidación
            </Button>
            <Button
              appearance="primary"
              size="large"
              icon={<ArrowUpload20Regular />}
              className={styles.actionButton}
              onClick={handleUploadSAP}
            >
              📤 Subir informe SAP
            </Button>
            <Button
              appearance="primary"
              size="large"
              icon={<FolderZip20Regular />}
              className={styles.actionButton}
              onClick={handleGenerarZIP}
            >
              🗜️ Generar ZIP (PDFs + SAP)
            </Button>
          </div>
        </Card>
      </div>

      {/* Sección 5 — Plantillas de correo */}
      <div className={styles.emailSection}>
        <h2 className={styles.sectionTitle}>📧 Plantillas de correo</h2>
        <Card>
          <Accordion collapsible>
            <AccordionItem value="1">
              <AccordionHeader>Correo solicitud informe SAP</AccordionHeader>
              <AccordionPanel>
              <div className={styles.emailTemplate}>
                <div className={styles.templateSubject}>
                  Asunto: Solicitud liquidación viaje {viajeActivo.numViaje}
                </div>
                <div className={styles.templateBody}>{emailSolicitudSAP.split('\n').slice(2).join('\n')}</div>
              </div>
              <Button
                appearance="primary"
                size="large"
                icon={<Copy20Regular />}
                className={styles.copyButton}
                onClick={() => handleCopyToClipboard(emailSolicitudSAP)}
              >
                📋 Copiar para Outlook
              </Button>
            </AccordionPanel>
          </AccordionItem>

          <AccordionItem value="2">
            <AccordionHeader>Correo envío a Expenses</AccordionHeader>
            <AccordionPanel>
              <div className={styles.emailTemplate}>
                <div className={styles.templateSubject}>
                  Asunto: {viajeActivo.numViaje}
                </div>
                <div className={styles.templateBody}>
                  Para: expenses.es@inetum.com
                  {'\n\n'}
                  {emailEnvioExpenses.split('\n').slice(3).join('\n')}
                </div>
              </div>
              <Button
                appearance="primary"
                size="large"
                icon={<Copy20Regular />}
                className={styles.copyButton}
                onClick={() => handleCopyToClipboard(emailEnvioExpenses)}
              >
                📋 Copiar para Outlook
              </Button>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
        </Card>
      </div>
    </div>
  );
};
