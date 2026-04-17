import ExcelJS from 'exceljs';

// Interface para el viaje
interface ViajeData {
  numViaje: string;
  ceco: string;
  fechaInicio: string;
}

// Interface para tickets
interface TicketData {
  fecha: string;
  tipo: string;
  unidades?: number;
  precio?: number;
  descripcion: string;
}

// Meses en español
const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

/**
 * Genera un archivo Excel de liquidación a partir de la plantilla
 * @param viaje Datos del viaje
 * @param tickets Array de tickets ordenados por fecha
 * @param nombreEmpleado Nombre completo del empleado
 * @returns Promise con base64 y nombreArchivo
 */
export async function generarExcelLiquidacion(
  viaje: ViajeData,
  tickets: TicketData[],
  nombreEmpleado: string
): Promise<{ base64: string; nombreArchivo: string }> {
  
  console.log('📊 Iniciando generación de Excel de liquidación...');
  
  // 1. Cargar plantilla (usar BASE_URL de Vite para entorno correcto)
  const plantillaPath = `${import.meta.env.BASE_URL}plantillas/plantilla-gastos.xlsx`;
  console.log('📥 Cargando plantilla:', plantillaPath);
  
  const response = await fetch(plantillaPath);
  if (!response.ok) {
    throw new Error(`No se pudo cargar la plantilla: ${response.status}`);
  }
  
  const arrayBuffer = await response.arrayBuffer();
  console.log('✅ Plantilla cargada, tamaño:', arrayBuffer.byteLength);
  
  // 2. Cargar workbook con ExcelJS
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(arrayBuffer);
  console.log('✅ Workbook parseado');
  
  // 3. Obtener Hoja1
  const worksheet = workbook.getWorksheet(1);
  if (!worksheet) {
    throw new Error('No se encontró la Hoja1 en la plantilla');
  }
  console.log('✅ Hoja1 obtenida');
  
  // 4. Extraer año y mes de fechaInicio
  const fechaInicio = new Date(viaje.fechaInicio);
  const año = fechaInicio.getFullYear();
  const mes = MESES[fechaInicio.getMonth()];
  
  console.log(`📅 Fecha: ${mes} ${año}`);
  
  // 5. Rellenar cabecera (B1, B2, B3)
  worksheet.getCell('B1').value = nombreEmpleado;
  worksheet.getCell('B2').value = año;
  worksheet.getCell('B3').value = mes;
  
  console.log('✅ Cabecera rellenada');
  
  // 6. Ordenar tickets por fecha (ascendente)
  const ticketsOrdenados = [...tickets].sort((a, b) => 
    new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
  );
  
  console.log(`🎫 Procesando ${ticketsOrdenados.length} tickets`);
  
  // 7. Rellenar datos de tickets desde fila 9
  const filaInicio = 9;
  ticketsOrdenados.forEach((ticket, index) => {
    const fila = filaInicio + index;
    
    // Col A: fecha (Date object)
    const fechaTicket = new Date(ticket.fecha);
    worksheet.getCell(`A${fila}`).value = fechaTicket;
    
    // Col B: tipo de gasto
    worksheet.getCell(`B${fila}`).value = ticket.tipo || '';
    
    // Col C: unidades
    worksheet.getCell(`C${fila}`).value = ticket.unidades || 0;
    
    // Col D: precio
    worksheet.getCell(`D${fila}`).value = ticket.precio || 0;
    
    // Col E: NO tocar, tiene fórmula =Cn*Dn
    
    // Col F: CECO del viaje
    worksheet.getCell(`F${fila}`).value = viaje.ceco;
    
    // Col G: vacía
    worksheet.getCell(`G${fila}`).value = '';
    
    // Col H: descripción
    worksheet.getCell(`H${fila}`).value = ticket.descripcion || '';
    
    // Col I: "NO"
    worksheet.getCell(`I${fila}`).value = 'NO';
    
    console.log(`  Fila ${fila}: ${ticket.tipo} - ${ticket.descripcion}`);
  });
  
  // 8. Limpiar filas no usadas (desde fila 9+len(tickets) hasta fila 75)
  const filaUltimaTicket = filaInicio + ticketsOrdenados.length;
  const filaUltimaPlantilla = 75;
  
  if (filaUltimaTicket <= filaUltimaPlantilla) {
    console.log(`🧹 Limpiando filas ${filaUltimaTicket} a ${filaUltimaPlantilla}`);
    for (let fila = filaUltimaTicket; fila <= filaUltimaPlantilla; fila++) {
      worksheet.getCell(`A${fila}`).value = null;
      worksheet.getCell(`B${fila}`).value = null;
      worksheet.getCell(`C${fila}`).value = null;
      worksheet.getCell(`D${fila}`).value = null;
      // E tiene fórmula, no tocar
      worksheet.getCell(`F${fila}`).value = null;
      worksheet.getCell(`G${fila}`).value = null;
      worksheet.getCell(`H${fila}`).value = null;
      worksheet.getCell(`I${fila}`).value = null;
    }
  }
  
  // 9. Exportar a buffer
  console.log('💾 Generando archivo Excel...');
  const buffer = await workbook.xlsx.writeBuffer();
  console.log('✅ Excel generado, tamaño:', buffer.byteLength);
  
  // 10. Convertir ArrayBuffer a base64 (compatible con navegador)
  const uint8Array = new Uint8Array(buffer as ArrayBuffer);
  const chunkSize = 0x8000; // 32KB chunks para evitar límite de argumentos
  let binaryString = '';
  for (let i = 0; i < uint8Array.length; i += chunkSize) {
    const chunk = uint8Array.subarray(i, i + chunkSize);
    binaryString += String.fromCharCode(...chunk);
  }
  const base64 = btoa(binaryString);
  
  // 11. Generar nombre de archivo
  const nombreArchivo = `Hoja de Gastos - ${mes}-${año} - ${nombreEmpleado}.xlsx`;
  
  console.log('✅ Excel listo:', nombreArchivo);
  
  return {
    base64,
    nombreArchivo
  };
}
