import React, { useState, useEffect, useRef } from "react";
import jsPDF from "jspdf";
import JSZip from "jszip";
import { generarExcelLiquidacion } from "../utils/generarExcelLiquidacion";
import {
  Button,
  Card,
  Badge,
  Spinner,
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
    ...shorthands.padding("24px", "28px"),
  },
  viajeGrid: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    ...shorthands.gap("24px"),
  },
  viajeField: {
    display: "flex",
    alignItems: "center",
    ...shorthands.gap("10px"),
  },
  fieldLabel: {
    fontSize: "14px",
    fontWeight: 600,
    color: tokens.colorNeutralForeground3,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  fieldValue: {
    fontSize: "18px",
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
  },
  fieldSeparator: {
    color: tokens.colorNeutralForeground4,
    fontSize: "20px",
    fontWeight: 300,
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
  carpetaLink: {
    display: "inline-flex",
    alignItems: "center",
    ...shorthands.gap("6px"),
    color: tokens.colorNeutralForeground2,
    fontSize: "14px",
    fontWeight: 500,
    textDecoration: "none",
    marginLeft: "auto",
    ":hover": {
      color: tokens.colorBrandForeground1,
      textDecoration: "underline",
    },
  },
});

// URL del flow para listar tickets
const LISTAR_TICKETS_URL = "https://cb2d3297d484eb42ae60646399e38f.fe.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/ce9954f641d44e12ae508220b16607a8/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=-hMs9zEU5JC-vzgfDqM_VwyQCrWO_ovCikiscJOw0iQ";

// URL base de OneDrive para construir URLs absolutas
const BASE_ONEDRIVE = "https://gfi1-my.sharepoint.com/:f:/r/personal/david_moreno-castillo_inetum_com/Documents";

// URL del flow para subir informe SAP
const SUBIR_SAP_URL = "https://cb2d3297d484eb42ae60646399e38f.fe.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/fa93b76da15344e5b8c5e28104bd8f1d/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=pbOtkgRRrtcuKcmn1Vel6a7a4Z60lPvgRF1llxxtw5M";

// URL del flow para actualizar estados del viaje
const ACTUALIZAR_VIAJE_URL = "https://cb2d3297d484eb42ae60646399e38f.fe.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/383a2b2b37f1422e98f5584a4c3efa1d/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=cStrn91smdzLnyxYN-8VJO9SHcDVrXOtyVFWJ2udNss";

// URL del flow para obtener imágenes en base64
const OBTENER_IMAGENES_BASE64_URL = "https://cb2d3297d484eb42ae60646399e38f.fe.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/3c47a28f01364415beec4d24109d9512/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=d61tMix-4mjsH6lK3U9wjLWcLmf0hUVAbUnsdgCitbc";

// URL del flow para subir Excel a OneDrive
const SUBIR_EXCEL_URL = "https://cb2d3297d484eb42ae60646399e38f.fe.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/37d5b72ed12045c6921181231bd289b8/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=LXLSC-jrQw5Mxi96VEGtnCOpkVQJ70l-SHK3PhOHQPM";

// Interface para tickets del flow
interface TicketFlow {
  cr468_ticketid: string;
  cr468_fecha: string;
  cr468_tipogasto: string;
  cr468_unidades?: number;
  cr468_precio?: number;
  cr468_importe: number;
  cr468_descripcion: string;
  cr468_imagenurl: string;
  cr468_imagenurlabs?: string;
  cr468_imagenbase64?: string; // Base64 de la imagen (REQUERIDO para generar ZIP)
  cr468_name: string;
}

// Interface para tickets mapeados
interface Ticket {
  id: string;
  num: string;
  fecha: string;
  tipo: string;
  descripcion: string;
  importe: number;
  imagenUrl: string;
  imagenBase64?: string; // Base64 de la imagen para evitar CORS en ZIP
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

interface DetalleViajeProps {
  onBack: () => void;
  onNavigate?: (screen: string) => void;
}

export const DetalleViaje: React.FC<DetalleViajeProps> = ({ onBack, onNavigate }) => {
  const styles = useStyles();
  const { viajeActivo, setViajeActivo } = useViaje();
  const toasterId = useId("toaster");
  const { dispatchToast } = useToastController(toasterId);
  
  // Ref para input file invisible
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estado de tickets
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(true);
  const [ticketsError, setTicketsError] = useState<string | null>(null);

  // Estado inicial basado en cr468_sapsubido y excelGenerado del viaje
  const sapSubidoInicial = viajeActivo?.cr468_sapsubido || viajeActivo?.sapSubido || false;
  const excelGeneradoInicial = !!viajeActivo?.excelGenerado; // true si hay URL
  const urlSAPInicial = sapSubidoInicial 
    ? `${BASE_ONEDRIVE}/TicketsGastos/${viajeActivo?.numViaje}/${viajeActivo?.numViaje}.pdf`
    : null;

  // Estado de documentos generados
  const [documentosGenerados, setDocumentosGenerados] = useState({
    excel: excelGeneradoInicial,
    informeSAP: sapSubidoInicial,
  });
  
  const [urlSAP, setUrlSAP] = useState<string | null>(urlSAPInicial);
  const [urlExcel, setUrlExcel] = useState<string | null>(viajeActivo?.excelGenerado || null);
  const [isUploadingSAP, setIsUploadingSAP] = useState(false);
  const [isGeneratingExcel, setIsGeneratingExcel] = useState(false);
  const [isGeneratingZIP, setIsGeneratingZIP] = useState(false);
  const [zipProgress, setZipProgress] = useState<string>("");

  // Cargar tickets del viaje al montar el componente
  useEffect(() => {
    const cargarTickets = async () => {
      if (!viajeActivo?.id) {
        setIsLoadingTickets(false);
        return;
      }

      setIsLoadingTickets(true);
      setTicketsError(null);

      try {
        const userEmail = localStorage.getItem("userEmail") || "david.moreno-castillo@inetum.com";
        
        const response = await fetch(LISTAR_TICKETS_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            viajeId: viajeActivo.id,
            userEmail: userEmail,
          }),
        });

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        console.log("Tickets recibidos del flow:", data);
        console.log("Primer ticket completo:", data.tickets?.[0]);
        
        // Mapear datos del flow a estructura local
        const ticketsMapeados: Ticket[] = (data.tickets || []).map((t: TicketFlow, index: number) => {
          // Formatear fecha
          let fechaFormateada = "";
          try {
            fechaFormateada = new Date(t.cr468_fecha).toLocaleDateString('es-ES');
          } catch (error) {
            console.error("Error al formatear fecha:", error);
            fechaFormateada = "Fecha inválida";
          }

          // Construir URL de imagen con prioridad a cr468_imagenurlabs
          let imagenUrl = "";
          if (t.cr468_imagenurlabs) {
            // Usar URL absoluta del flow si existe
            imagenUrl = t.cr468_imagenurlabs;
            console.log(`Ticket ${index + 1} - Usando cr468_imagenurlabs:`, imagenUrl);
          } else if (t.cr468_imagenurl) {
            // Fallback: construir URL concatenando BASE_ONEDRIVE
            imagenUrl = BASE_ONEDRIVE + t.cr468_imagenurl;
            console.log(`Ticket ${index + 1} - Usando cr468_imagenurl (fallback):`, imagenUrl);
          } else {
            console.log(`Ticket ${index + 1} - Sin URL de imagen`);
          }
          // Si ambos están vacíos, imagenUrl queda "" y se mostrará "—" en la tabla

          return {
            id: t.cr468_ticketid,
            num: `${index + 1}`,
            fecha: fechaFormateada,
            tipo: t.cr468_tipogasto || "Sin tipo",
            descripcion: t.cr468_descripcion || "",
            importe: t.cr468_importe || 0,
            imagenUrl: imagenUrl,
            imagenBase64: t.cr468_imagenbase64, // Opcional, ya no requerido (usamos flow separado)
          };
        });

        setTickets(ticketsMapeados);
        console.log(`✅ ${ticketsMapeados.length} tickets cargados correctamente`);
      } catch (err) {
        console.error("Error al cargar tickets:", err);
        setTicketsError(
          err instanceof Error
            ? err.message
            : "Error al cargar los tickets del viaje"
        );
      } finally {
        setIsLoadingTickets(false);
      }
    };

    cargarTickets();
  }, [viajeActivo?.id]);

  // Sincronizar estado de SAP y Excel con viajeActivo
  useEffect(() => {
    if (viajeActivo) {
      const sapSubido = viajeActivo.cr468_sapsubido || viajeActivo.sapSubido || false;
      const excelGenerado = !!viajeActivo.excelGenerado; // Convertir a boolean
      
      setDocumentosGenerados(prev => ({
        ...prev,
        informeSAP: sapSubido,
        excel: excelGenerado,
      }));
      
      if (sapSubido) {
        const url = viajeActivo.urlSAP || `${BASE_ONEDRIVE}/TicketsGastos/${viajeActivo.numViaje}/${viajeActivo.numViaje}.pdf`;
        setUrlSAP(url);
      } else {
        setUrlSAP(null);
      }
      
      if (viajeActivo.excelGenerado) {
        setUrlExcel(viajeActivo.excelGenerado);
      } else {
        setUrlExcel(null);
      }
    }
  }, [viajeActivo?.cr468_sapsubido, viajeActivo?.sapSubido, viajeActivo?.excelGenerado, viajeActivo?.urlSAP, viajeActivo?.numViaje]);

  // Calcular total de tickets
  const totalImporte = tickets.reduce((sum, ticket) => sum + ticket.importe, 0);

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
Para: gestion.sol.con.tech.es@inetum.com

Buenas,

Adjunto hoja de gastos Excel del viaje ${viajeActivo.numViaje} 
realizado entre ${formatFecha(viajeActivo.fechaInicio)} y ${formatFecha(viajeActivo.fechaFin)}.

También adjunto los tickets de gastos numerados.

Por favor, generar hoja SAP de liquidación para enviar a expenses.es@inetum.com.

Gracias.`
    : "";

  const emailEnvioExpenses = viajeActivo
    ? `Asunto: ${viajeActivo.numViaje}
Para: expenses.es@inetum.com

Buenas,

Adjunto archivo ZIP en el formato adecuado para liquidar el viaje ${viajeActivo.numViaje}.

Gracias.`
    : "";

  // Handler para subir informe SAP
  const handleUploadSAP = async () => {
    // Activar el input file invisible
    fileInputRef.current?.click();
  };
  
  // Handler cuando se selecciona un archivo
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      dispatchToast(
        <Toast>
          <ToastTitle>⚠️ Solo se permiten archivos PDF</ToastTitle>
        </Toast>,
        { intent: "warning", timeout: 3000 }
      );
      return;
    }

    setIsUploadingSAP(true);

    try {
      // Convertir archivo a base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const result = reader.result as string;
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);
      const archivoBase64 = await base64Promise;

      const userEmail = localStorage.getItem("userEmail") || "david.moreno-castillo@inetum.com";

      // Llamar al flow
      const response = await fetch(SUBIR_SAP_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          numViaje: viajeActivo.numViaje,
          viajeId: viajeActivo.id,
          userEmail: userEmail,
          archivoBase64: archivoBase64,
          nombreArchivo: `${viajeActivo.numViaje}.pdf`,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        const urlSAPFinal = data.urlSAP || `${BASE_ONEDRIVE}/TicketsGastos/${viajeActivo.numViaje}/${viajeActivo.numViaje}.pdf`;
        
        setDocumentosGenerados(prev => ({ ...prev, informeSAP: true }));
        setUrlSAP(urlSAPFinal);
        
        // Actualizar ViajeContext con sapSubido = true y guardar base64
        if (viajeActivo) {
          setViajeActivo({
            ...viajeActivo,
            sapSubido: true,
            cr468_sapsubido: true,
            urlSAP: urlSAPFinal,
            sapBase64: archivoBase64, // Guardar base64 para generar ZIP
          });
        }

        // Persistir estado en Dataverse
        await actualizarEstadoViaje(
          true,
          !!viajeActivo?.excelGenerado // Convertir a boolean
        );
        
        dispatchToast(
          <Toast>
            <ToastTitle>✅ Informe SAP subido correctamente</ToastTitle>
          </Toast>,
          { intent: "success", timeout: 2000 }
        );
      } else {
        throw new Error("El flow no devolvió success: true");
      }
    } catch (err) {
      console.error("Error al subir informe SAP:", err);
      dispatchToast(
        <Toast>
          <ToastTitle>❌ Error al subir el informe SAP</ToastTitle>
        </Toast>,
        { intent: "error", timeout: 3000 }
      );
    } finally {
      setIsUploadingSAP(false);
      // Limpiar el input para permitir subir el mismo archivo de nuevo
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Helper para actualizar estado del viaje en Dataverse
  const actualizarEstadoViaje = async (sapSubido: boolean, excelGenerado: boolean) => {
    if (!viajeActivo) return;
    
    try {
      console.log("📡 Actualizando estado viaje...", { sapSubido, excelGenerado });
      const response = await fetch(ACTUALIZAR_VIAJE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          viajeId: viajeActivo.id,
          sapSubido,
          excelGenerado,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("✅ Estado viaje actualizado:", data);
    } catch (error) {
      console.error("❌ Error al actualizar estado viaje:", error);
      // No mostramos toast de error porque esto es secundario
    }
  };

  // Handler para generar Excel
  const handleGenerarExcel = async () => {
    if (!viajeActivo) return;

    setIsGeneratingExcel(true);
    console.log("📊 Iniciando generación de Excel de liquidación...");

    try {
      // 1. Preparar datos del viaje
      const viajeData = {
        numViaje: viajeActivo.numViaje,
        ceco: viajeActivo.ceco,
        fechaInicio: viajeActivo.fechaInicio,
      };

      // 2. Preparar datos de tickets (mapear a formato esperado)
      const ticketsData = tickets.map(ticket => ({
        fecha: ticket.fecha,
        tipo: ticket.tipo,
        unidades: ticket.importe ? 1 : 0,
        precio: ticket.importe,
        descripcion: ticket.descripcion,
      }));

      // 3. Nombre del empleado (hardcodeado por ahora)
      // TODO: obtener de MSAL account.name cuando esté activo
      const nombreEmpleado = "David Moreno Castillo";
      const userEmail = localStorage.getItem("userEmail") || "david.moreno-castillo@inetum.com";

      // 4. Generar Excel usando la plantilla
      console.log("📊 Generando Excel con plantilla...");
      const { base64, nombreArchivo } = await generarExcelLiquidacion(
        viajeData,
        ticketsData,
        nombreEmpleado
      );

      console.log("✅ Excel generado:", nombreArchivo);

      // 5. Subir Excel a OneDrive usando el flow específico
      console.log("📤 Subiendo Excel a OneDrive...");

      const responseSubir = await fetch(SUBIR_EXCEL_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          numViaje: viajeActivo.numViaje,
          viajeId: viajeActivo.id,
          userEmail: userEmail,
          archivoBase64: base64,
          nombreArchivo: nombreArchivo,
        }),
      });

      if (!responseSubir.ok) {
        throw new Error(`Error al subir Excel: ${responseSubir.status}`);
      }

      const dataSubir = await responseSubir.json();
      console.log("✅ Excel subido a OneDrive", dataSubir);

      if (!dataSubir.success) {
        throw new Error("El flow no pudo subir el Excel");
      }

      const urlExcelFinal = dataSubir.urlExcel;

      // 6. Actualizar estado local
      setUrlExcel(urlExcelFinal);
      setDocumentosGenerados(prev => ({ ...prev, excel: true }));

      // 7. Actualizar ViajeContext con la URL
      setViajeActivo({
        ...viajeActivo,
        excelGenerado: urlExcelFinal,
      });

      // 8. Persistir estado en Dataverse ya no es necesario aquí
      // El flow SubirExcel ya actualiza cr468_excelgenerado en Dataverse

      console.log("✅ Excel generado y URL guardada:", urlExcelFinal);

      dispatchToast(
        <Toast>
          <ToastTitle>✅ Excel generado y subido a OneDrive</ToastTitle>
        </Toast>,
        { intent: "success", timeout: 2000 }
      );
    } catch (err) {
      console.error("❌ Error al generar Excel:", err);
      const errorMessage = err instanceof Error ? err.message : "Error desconocido";
      dispatchToast(
        <Toast>
          <ToastTitle>❌ Error al subir el Excel</ToastTitle>
          <p style={{ marginTop: '8px', fontSize: '13px' }}>
            {errorMessage}
          </p>
        </Toast>,
        { intent: "error", timeout: 5000 }
      );
    } finally {
      setIsGeneratingExcel(false);
    }
  };

  // Handler para generar ZIP
  const handleGenerarZIP = async () => {
    console.log("🗜️ Iniciando generación de ZIP...");

    // Validaciones previas
    if (!viajeActivo?.cr468_sapsubido && !viajeActivo?.sapSubido) {
      console.error("❌ SAP no subido");
      dispatchToast(
        <Toast>
          <ToastTitle>❌ Debes subir el informe SAP antes de generar el ZIP</ToastTitle>
        </Toast>,
        { intent: "error", timeout: 3000 }
      );
      return;
    }

    if (!tickets || tickets.length === 0) {
      console.error("❌ No hay tickets");
      dispatchToast(
        <Toast>
          <ToastTitle>❌ No hay tickets para incluir</ToastTitle>
        </Toast>,
        { intent: "error", timeout: 3000 }
      );
      return;
    }

    setIsGeneratingZIP(true);
    setZipProgress("Generando ZIP...");

    try {
      const zip = new JSZip();
      const numViaje = viajeActivo.numViaje;
      console.log(`📦 Creando ZIP para viaje ${numViaje}`);

      // 1. Obtener imágenes de tickets Y SAP en base64 desde el flow
      setZipProgress("Obteniendo documentos desde Power Automate...");
      console.log("📡 Llamando al flow ObtenerImagenesBase64...");
      
      const responseImagenes = await fetch(OBTENER_IMAGENES_BASE64_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          viajeId: viajeActivo.id,
          numViaje: viajeActivo.numViaje,
        }),
      });

      if (!responseImagenes.ok) {
        throw new Error(`Error ${responseImagenes.status}: ${responseImagenes.statusText}`);
      }

      const dataImagenes = await responseImagenes.json();
      console.log("✅ Respuesta del flow:", dataImagenes);
      
      const imagenes = dataImagenes.imagenes || [];
      const sapBase64 = dataImagenes.sapBase64 || viajeActivo.sapBase64;
      
      // 2. Procesar SAP
      setZipProgress("Procesando informe SAP...");
      console.log("📥 Procesando SAP...");
      
      let bufferSAP: ArrayBuffer;
      
      if (sapBase64) {
        console.log("✅ SAP obtenido del flow o de memoria");
        const base64Data = sapBase64.split(',')[1] || sapBase64;
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        bufferSAP = bytes.buffer;
        console.log("✅ SAP convertido desde base64, tamaño:", bufferSAP.byteLength);
      } else {
        console.error("❌ No se pudo obtener el SAP");
        throw new Error(
          "No se pudo obtener el informe SAP. " +
          "El flow debe devolver el campo 'sapBase64' con el contenido del archivo. " +
          "Por favor, actualiza el flow GastosInetum_ObtenerImagenesBase64."
        );
      }

      zip.file(`${numViaje}.pdf`, bufferSAP);
      
      // 3. Validar imágenes
      if (imagenes.length === 0) {
        console.warn("⚠️ El flow no devolvió imágenes");
        throw new Error("No se obtuvieron imágenes del flow. Verifica que los tickets tengan imágenes asociadas.");
      }

      console.log(`🎫 Procesando ${imagenes.length} imágenes...`);
      console.log("Estructura primera imagen:", imagenes[0]);

      // 3. Procesar cada imagen (convertir a PDF)
      for (let i = 0; i < imagenes.length; i++) {
        const imagen = imagenes[i];
        setZipProgress(`Procesando imagen ${i + 1} de ${imagenes.length}...`);
        console.log(`Procesando imagen ${i + 1}/${imagenes.length}`);
        console.log("Objeto imagen completo:", imagen);

        // El flow puede devolver los campos con nombres diferentes
        const imagenBase64 = imagen.base64 || imagen.imagenBase64 || imagen.Base64 || imagen.ImagenBase64;

        if (!imagenBase64) {
          console.warn(`⚠️ Imagen ${i + 1} sin base64, omitiendo`);
          console.warn("Campos disponibles:", Object.keys(imagen));
          continue;
        }

        try {
          console.log(`📄 Convirtiendo imagen ${i + 1} a PDF...`);
          
          // Convertir imagen a PDF con jsPDF
          const pdf = new jsPDF({ 
            orientation: 'portrait', 
            unit: 'mm', 
            format: 'a4' 
          });

          const imgProps = pdf.getImageProperties(imagenBase64);
          console.log(`Propiedades imagen ${i + 1}:`, imgProps);
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
          
          // Si la imagen es más alta que la página, ajustar
          const maxHeight = pdf.internal.pageSize.getHeight();
          if (pdfHeight > maxHeight) {
            const ratio = maxHeight / pdfHeight;
            pdf.addImage(imagenBase64, 'JPEG', 0, 0, pdfWidth * ratio, maxHeight);
          } else {
            pdf.addImage(imagenBase64, 'JPEG', 0, 0, pdfWidth, pdfHeight);
          }

          const pdfBuffer = pdf.output('arraybuffer');
          console.log(`✅ PDF imagen ${i + 1} generado, tamaño:`, pdfBuffer.byteLength);
          zip.file(`${numViaje} (${i + 1}).pdf`, pdfBuffer);
        } catch (err) {
          console.error(`❌ Error procesando imagen ${i + 1}:`, err);
          // Continuar con la siguiente imagen
        }
      }

      // 4. Generar y descargar ZIP
      setZipProgress("Generando archivo ZIP...");
      console.log("📦 Generando archivo ZIP final...");
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      console.log("✅ ZIP generado, tamaño:", zipBlob.size);
      
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ZIP_${numViaje}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      console.log("✅ Descarga iniciada");

      dispatchToast(
        <Toast>
          <ToastTitle>✅ ZIP generado correctamente</ToastTitle>
        </Toast>,
        { intent: "success", timeout: 2000 }
      );
    } catch (err) {
      console.error("❌ Error al generar el ZIP:", err);
      const errorMessage = err instanceof Error ? err.message : "Error desconocido";
      dispatchToast(
        <Toast>
          <ToastTitle>❌ Error al generar el ZIP</ToastTitle>
          <p style={{ marginTop: '8px', fontSize: '13px' }}>
            {errorMessage}
          </p>
        </Toast>,
        { intent: "error", timeout: 5000 }
      );
    } finally {
      setIsGeneratingZIP(false);
      setZipProgress("");
      console.log("🏁 Proceso ZIP finalizado");
    }
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
      
      {/* Input file invisible para subir SAP */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />
      
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
              <span className={styles.fieldLabel}>Viaje</span>
              <span className={styles.fieldValue}>{viajeActivo.numViaje}</span>
            </div>
            <span className={styles.fieldSeparator}>|</span>
            <div className={styles.viajeField}>
              <span className={styles.fieldValue}>{formatFecha(viajeActivo.fechaInicio)}</span>
              <span className={styles.fieldLabel}>→</span>
              <span className={styles.fieldValue}>{formatFecha(viajeActivo.fechaFin)}</span>
            </div>
            <span className={styles.fieldSeparator}>|</span>
            <div className={styles.viajeField}>
              <span className={styles.fieldLabel}>CECO</span>
              <span className={styles.fieldValue}>{viajeActivo.ceco}</span>
            </div>
            <span className={styles.fieldSeparator}>|</span>
            <Badge appearance="filled" color="success">Activo</Badge>
            <a 
              href={`${BASE_ONEDRIVE}/TicketsGastos/${viajeActivo.numViaje}`}
              className={styles.carpetaLink}
              target="_blank"
              rel="noopener noreferrer"
              title="Abrir carpeta del viaje en OneDrive"
            >
              📁 Ver carpeta en OneDrive
            </a>
          </div>
        </Card>
      </div>

      {/* Sección 2 — Tickets del viaje */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Tickets del viaje</h2>
        <Card>
          {isLoadingTickets ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <Spinner size="medium" />
              <p style={{ marginTop: "16px", color: tokens.colorNeutralForeground2 }}>
                Cargando tickets...
              </p>
            </div>
          ) : ticketsError ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <p style={{ color: tokens.colorPaletteRedForeground2, marginBottom: "16px" }}>
                ⚠️ {ticketsError}
              </p>
            </div>
          ) : tickets.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <p style={{ color: tokens.colorNeutralForeground3 }}>
                No hay tickets registrados para este viaje
              </p>
            </div>
          ) : (
            <>
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
                    {tickets.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell>{ticket.num}</TableCell>
                        <TableCell>{ticket.fecha}</TableCell>
                        <TableCell>{ticket.tipo}</TableCell>
                        <TableCell>{ticket.descripcion}</TableCell>
                        <TableCell style={{ textAlign: "right" }}>
                          {ticket.importe.toFixed(2)} €
                        </TableCell>
                        <TableCell style={{ textAlign: "center" }}>
                          {ticket.imagenUrl ? (
                            <a 
                              href={ticket.imagenUrl} 
                              className={styles.iconLink} 
                              title="Ver en OneDrive"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Link20Regular />
                            </a>
                          ) : (
                            <span style={{ color: tokens.colorNeutralForeground4 }}>—</span>
                          )}
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
            </>
          )}
          <Button
            appearance="primary"
            icon={<Add20Regular />}
            onClick={() => onNavigate?.("añadir-ticket")}
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
                {documentosGenerados.excel && urlExcel ? (
                  <a 
                    href={urlExcel} 
                    className={styles.documentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
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
                {documentosGenerados.informeSAP && urlSAP ? (
                  <a 
                    href={urlSAP} 
                    className={styles.documentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
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
          </div>
        </Card>
      </div>

      {/* Sección 4 — Acciones */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Acciones</h2>
        <Card>
          <div className={styles.actionButtons}>
            <Button
              appearance={documentosGenerados.excel ? "secondary" : "primary"}
              size="large"
              icon={isGeneratingExcel ? <Spinner size="tiny" /> : <TableArrowUp20Regular />}
              className={styles.actionButton}
              onClick={handleGenerarExcel}
              disabled={isGeneratingExcel || tickets.length === 0}
            >
              {isGeneratingExcel 
                ? "Generando Excel..." 
                : documentosGenerados.excel 
                  ? "✅ Excel generado - Regenerar" 
                  : "📊 Generar Excel de liquidación"}
            </Button>
            <Button
              appearance="primary"
              size="large"
              icon={documentosGenerados.informeSAP ? <ArrowUpload20Regular /> : <ArrowUpload20Regular />}
              className={styles.actionButton}
              onClick={handleUploadSAP}
              disabled={isUploadingSAP}
            >
              {isUploadingSAP ? (
                <>
                  <Spinner size="tiny" /> Subiendo...
                </>
              ) : documentosGenerados.informeSAP ? (
                "✅ SAP subido - Reemplazar"
              ) : (
                "📤 Subir informe SAP"
              )}
            </Button>
            <Button
              appearance="primary"
              size="large"
              icon={isGeneratingZIP ? <Spinner size="tiny" /> : <FolderZip20Regular />}
              className={styles.actionButton}
              onClick={handleGenerarZIP}
              disabled={isGeneratingZIP}
            >
              {isGeneratingZIP
                ? zipProgress || "Generando ZIP..."
                : "🗜️ Generar ZIP (PDFs + SAP)"}
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
                <div className={styles.templateSubject}>
                  Para: gestion.sol.con.tech.es@inetum.com
                </div>
                <div className={styles.templateBody}>{emailSolicitudSAP.split('\n').slice(3).join('\n')}</div>
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
                <div className={styles.templateSubject}>
                  Para: expenses.es@inetum.com
                </div>
                <div className={styles.templateBody}>
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
