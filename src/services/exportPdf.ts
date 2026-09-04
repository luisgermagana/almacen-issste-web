import jsPDF from 'jspdf';
import { RegistroRecepcion, RegistroEnvio, ItemInventario } from '../types';

const cargarImagenParaPdf = (src: string): Promise<string> => {
  return new Promise((resolve) => {
    if (!src) {
      resolve('');
      return;
    }
    if (src.startsWith('data:image/')) {
      resolve(src);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width || 400;
        canvas.height = img.naturalHeight || img.height || 300;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
          return;
        }
      } catch (err) {
        console.warn('Error en canvas para PDF:', err);
      }
      resolve(src);
    };
    img.onerror = () => {
      resolve('');
    };
    img.src = src;
  });
};

export const exportarRecepcionPdf = async (registro: RegistroRecepcion) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 14;

  // Franja institucional superior (Guinda y Oro)
  doc.setFillColor(105, 28, 50); // #691C32
  doc.rect(0, 0, pageWidth, 12, 'F');
  doc.setFillColor(188, 149, 92); // #BC955C
  doc.rect(0, 12, pageWidth, 2.5, 'F');

  // Encabezado institucional
  y = 22;
  doc.setTextColor(105, 28, 50);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('ISSSTE - ALMACÉN GENERAL CENTRAL', pageWidth / 2, y, { align: 'center' });

  y += 5;
  doc.setTextColor(90, 90, 90);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('DIRECCIÓN DE ADMINISTRACIÓN Y FINANZAS | CONTROL OPERATIVO', pageWidth / 2, y, { align: 'center' });

  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);
  doc.text('COMPROBANTE OFICIAL DE RECEPCIÓN DE BIENES', pageWidth / 2, y, { align: 'center' });

  // Tarjeta de Folio y Fecha
  y += 6;
  doc.setFillColor(248, 249, 250);
  doc.setDrawColor(220, 220, 220);
  doc.roundedRect(14, y, pageWidth - 28, 14, 2, 2, 'FD');

  doc.setFontSize(9);
  doc.setTextColor(105, 28, 50);
  doc.setFont('helvetica', 'bold');
  doc.text(`FOLIO OFICIAL: ${registro.folio}`, 18, y + 6);

  doc.setTextColor(80, 80, 80);
  doc.setFont('helvetica', 'normal');
  const fechaStr = new Date(registro.fecha).toLocaleString('es-MX', {
    dateStyle: 'long',
    timeStyle: 'short',
  });
  doc.text(`FECHA Y HORA: ${fechaStr}`, 18, y + 11);

  // Datos principales
  y += 18;
  doc.setFillColor(243, 244, 246);
  doc.rect(14, y, pageWidth - 28, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(105, 28, 50);
  doc.text('INFORMACIÓN GENERAL DEL INGRESO', 18, y + 5);

  y += 11;
  const filasDatos = [
    ['Bien / Insumo Recibido:', registro.bien_nombre],
    ['Cantidad de Piezas:', `${registro.cantidad} pieza(s)`],
    ['Documento Soporte:', registro.tipo_documento === 'remision' ? 'Remisión de Entrega' : registro.tipo_documento === 'na' ? 'Acta Circunstanciada (Sin Remisión)' : 'Documento Soporte Oficial'],
    ['Número de Serie / Lote:', registro.numero_serie || 'N/A'],
    ['Recibido Por (Operador):', registro.recibido_por],
    ['Almacén Receptor:', registro.almacen || 'Almacén Central ISSSTE'],
    ['Observaciones:', registro.observaciones || 'Sin incidencias reportadas'],
  ];

  filasDatos.forEach(([campo, valor]) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(8.5);
    doc.text(campo, 18, y);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(20, 20, 20);
    doc.text(String(valor), 72, y);
    y += 5.5;
  });

  // Evidencias Fotográficas
  const todasFotos = [
    ...(registro.fotos_bien || []),
    ...(registro.fotos_documento || []),
    ...(registro.fotos_serie || []),
  ].slice(0, 4);

  if (todasFotos.length > 0) {
    y += 3;
    doc.setFillColor(243, 244, 246);
    doc.rect(14, y, pageWidth - 28, 6.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(105, 28, 50);
    doc.text('EVIDENCIA FOTOGRÁFICA Y DE SERIE', 18, y + 4.5);

    y += 9;
    const imgWidth = 40;
    const imgHeight = 30;
    let xOffset = 18;

    for (const f of todasFotos) {
      const dataUrl = await cargarImagenParaPdf(f);
      if (dataUrl) {
        try {
          doc.addImage(dataUrl, 'JPEG', xOffset, y, imgWidth, imgHeight);
          doc.setDrawColor(200, 200, 200);
          doc.rect(xOffset, y, imgWidth, imgHeight, 'D');
          xOffset += imgWidth + 5;
          if (xOffset + imgWidth > pageWidth - 14) break;
        } catch {}
      }
    }
    y += imgHeight + 6;
  } else {
    y += 8;
  }

  // Cuadros de firmas institucionales
  y = Math.max(y, 230);
  const anchoFirma = 50;
  const posFirma1 = 20;
  const posFirma2 = pageWidth / 2 - anchoFirma / 2;
  const posFirma3 = pageWidth - 20 - anchoFirma;

  doc.setDrawColor(120, 120, 120);
  doc.line(posFirma1, y + 15, posFirma1 + anchoFirma, y + 15);
  doc.line(posFirma2, y + 15, posFirma2 + anchoFirma, y + 15);
  doc.line(posFirma3, y + 15, posFirma3 + anchoFirma, y + 15);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(60, 60, 60);
  doc.text('RECIBIÓ EN ALMACÉN', posFirma1 + anchoFirma / 2, y + 19, { align: 'center' });
  doc.text('ENTREGÓ / PROVEEDOR', posFirma2 + anchoFirma / 2, y + 19, { align: 'center' });
  doc.text('SUPERVISOR DE CONTROL', posFirma3 + anchoFirma / 2, y + 19, { align: 'center' });

  // Franja inferior
  doc.setFillColor(105, 28, 50);
  doc.rect(0, 287, pageWidth, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Documento emitido electrónicamente por el Sistema de Almacén ISSSTE | Validez Oficial Institucional', pageWidth / 2, 292, { align: 'center' });

  doc.save(`${registro.folio}_ISSSTE.pdf`);
};

export const exportarEnvioPdf = async (registro: RegistroEnvio) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 14;

  // Franja institucional
  doc.setFillColor(105, 28, 50);
  doc.rect(0, 0, pageWidth, 12, 'F');
  doc.setFillColor(188, 149, 92);
  doc.rect(0, 12, pageWidth, 2.5, 'F');

  // Encabezado
  y = 22;
  doc.setTextColor(105, 28, 50);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('ISSSTE - ALMACÉN GENERAL CENTRAL', pageWidth / 2, y, { align: 'center' });

  y += 5;
  doc.setTextColor(90, 90, 90);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('DIRECCIÓN DE ADMINISTRACIÓN Y FINANZAS | LOGÍSTICA Y DISTRIBUCIÓN', pageWidth / 2, y, { align: 'center' });

  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);
  doc.text('VALE OFICIAL DE SALIDA Y DESPACHO DE BIENES', pageWidth / 2, y, { align: 'center' });

  // Tarjeta de Folio
  y += 6;
  doc.setFillColor(248, 249, 250);
  doc.setDrawColor(220, 220, 220);
  doc.roundedRect(14, y, pageWidth - 28, 14, 2, 2, 'FD');

  doc.setFontSize(9);
  doc.setTextColor(105, 28, 50);
  doc.setFont('helvetica', 'bold');
  doc.text(`FOLIO OFICIAL: ${registro.folio}`, 18, y + 6);

  doc.setTextColor(80, 80, 80);
  doc.setFont('helvetica', 'normal');
  const fechaStr = new Date(registro.fecha).toLocaleString('es-MX', {
    dateStyle: 'long',
    timeStyle: 'short',
  });
  doc.text(`FECHA Y HORA DE DESPACHO: ${fechaStr}`, 18, y + 11);

  // Datos
  y += 18;
  doc.setFillColor(243, 244, 246);
  doc.rect(14, y, pageWidth - 28, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(105, 28, 50);
  doc.text('DATOS DE LA SALIDA Y TRANSPORTE', 18, y + 5);

  y += 11;
  const filas = [
    ['Destino / Unidad Médica:', registro.destino],
    ['Bien Despachado:', registro.bien_nombre],
    ['Cantidad Despachada:', `${registro.cantidad} pieza(s)`],
    ['Tipo de Transporte:', registro.tipo_transporte === 'institucional' ? 'Vehículo Institucional ISSSTE' : 'Transporte Subrogado'],
    ['Número Económico / Placas:', registro.numero_economico],
    ['Operador / Chofer:', registro.operador],
    ['Despachado Por (Almacén):', registro.enviado_por],
    ['Observaciones:', registro.observaciones || 'Sin observaciones'],
  ];

  filas.forEach(([campo, valor]) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(8.5);
    doc.text(campo, 18, y);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(20, 20, 20);
    doc.text(String(valor), 72, y);
    y += 5.5;
  });

  // Fotos de camión
  if (registro.fotos_camion && registro.fotos_camion.length > 0) {
    y += 4;
    doc.setFillColor(243, 244, 246);
    doc.rect(14, y, pageWidth - 28, 6.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(105, 28, 50);
    doc.text('EVIDENCIA FOTOGRÁFICA DEL TRANSPORTE / CAMIÓN', 18, y + 4.5);

    y += 9;
    const imgWidth = 46;
    const imgHeight = 34;
    let xOffset = 18;

    for (const f of registro.fotos_camion.slice(0, 3)) {
      const dataUrl = await cargarImagenParaPdf(f);
      if (dataUrl) {
        try {
          doc.addImage(dataUrl, 'JPEG', xOffset, y, imgWidth, imgHeight);
          doc.setDrawColor(200, 200, 200);
          doc.rect(xOffset, y, imgWidth, imgHeight, 'D');
          xOffset += imgWidth + 6;
        } catch {}
      }
    }
    y += imgHeight + 8;
  } else {
    y += 10;
  }

  // Firmas
  y = Math.max(y, 230);
  const anchoFirma = 50;
  const posFirma1 = 20;
  const posFirma2 = pageWidth / 2 - anchoFirma / 2;
  const posFirma3 = pageWidth - 20 - anchoFirma;

  doc.setDrawColor(120, 120, 120);
  doc.line(posFirma1, y + 15, posFirma1 + anchoFirma, y + 15);
  doc.line(posFirma2, y + 15, posFirma2 + anchoFirma, y + 15);
  doc.line(posFirma3, y + 15, posFirma3 + anchoFirma, y + 15);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(60, 60, 60);
  doc.text('ENTREGÓ (ALMACÉN)', posFirma1 + anchoFirma / 2, y + 19, { align: 'center' });
  doc.text('CHOFER / OPERADOR', posFirma2 + anchoFirma / 2, y + 19, { align: 'center' });
  doc.text('RECIBE EN UNIDAD MÉDICA', posFirma3 + anchoFirma / 2, y + 19, { align: 'center' });

  // Franja inferior
  doc.setFillColor(105, 28, 50);
  doc.rect(0, 287, pageWidth, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Documento emitido electrónicamente por el Sistema de Almacén ISSSTE | Validez Oficial Institucional', pageWidth / 2, 292, { align: 'center' });

  doc.save(`${registro.folio}_ISSSTE.pdf`);
};

export const exportarReporteEjecutivoPdf = (inventario: ItemInventario[]) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 14;

  doc.setFillColor(105, 28, 50);
  doc.rect(0, 0, pageWidth, 12, 'F');
  doc.setFillColor(188, 149, 92);
  doc.rect(0, 12, pageWidth, 2.5, 'F');

  y = 22;
  doc.setTextColor(105, 28, 50);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('ISSSTE - CORTE EJECUTIVO DE INVENTARIO CENTRAL', pageWidth / 2, y, { align: 'center' });

  y += 5;
  doc.setTextColor(90, 90, 90);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('DIRECCIÓN DE ADMINISTRACIÓN | BALANCE Y EXISTENCIAS', pageWidth / 2, y, { align: 'center' });

  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(50, 50, 50);
  doc.text(`Fecha de Emisión: ${new Date().toLocaleString('es-MX')}`, 14, y);

  // Tabla
  y += 6;
  doc.setFillColor(105, 28, 50);
  doc.rect(14, y, pageWidth - 28, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('BIEN / INSUMO', 18, y + 5);
  doc.text('RECIBIDO', 105, y + 5);
  doc.text('ENVIADO', 128, y + 5);
  doc.text('DISPONIBLE', 152, y + 5);
  doc.text('ESTATUS', 178, y + 5);

  y += 8;
  inventario.forEach((item, i) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.setFillColor(i % 2 === 0 ? 255 : 248, i % 2 === 0 ? 255 : 249, i % 2 === 0 ? 255 : 250);
    doc.rect(14, y, pageWidth - 28, 7, 'F');

    doc.setTextColor(30, 30, 30);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(item.nombre.slice(0, 45), 18, y + 5);
    doc.text(String(item.totalRecibido), 110, y + 5, { align: 'right' });
    doc.text(String(item.totalEnviado), 135, y + 5, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    if (item.disponible > 0) {
      doc.setTextColor(13, 126, 70); // Verde
    } else {
      doc.setTextColor(197, 34, 31); // Rojo
    }
    doc.text(String(item.disponible), 162, y + 5, { align: 'right' });

    doc.setTextColor(80, 80, 80);
    doc.setFont('helvetica', 'normal');
    doc.text(item.estatus.toUpperCase(), 178, y + 5);

    y += 7;
  });

  const fechaHoy = new Date().toISOString().split('T')[0];
  doc.save(`Corte_Inventario_ISSSTE_${fechaHoy}.pdf`);
};
