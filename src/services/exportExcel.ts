import * as XLSX from 'xlsx';
import { ItemInventario, RegistroRecepcion, RegistroEnvio } from '../types';

export const exportarInventarioAExcel = (
  inventario: ItemInventario[],
  recepciones: RegistroRecepcion[],
  envios: RegistroEnvio[]
) => {
  const wb = XLSX.utils.book_new();

  // 1. Hoja de Resumen de Inventario
  const dataInventario = inventario.map((item, idx) => ({
    '#': idx + 1,
    'Bien / Insumo': item.nombre,
    'Categoría': item.categoria,
    'Total Recibido (Pzas)': item.totalRecibido,
    'Total Enviado (Pzas)': item.totalEnviado,
    'Existencias Disponibles': item.disponible,
    'Estatus Operativo': item.estatus.toUpperCase(),
    '% Rotación / Salida': `${item.porcentajeSalida}%`,
    'Última Actividad': item.ultimaFecha ? new Date(item.ultimaFecha).toLocaleDateString('es-MX') : 'S/D',
  }));

  const wsInventario = XLSX.utils.json_to_sheet(dataInventario);
  XLSX.utils.book_append_sheet(wb, wsInventario, 'Inventario y Existencias');

  // 2. Hoja de Recepciones
  const dataRecepciones = recepciones.map((r, idx) => ({
    '#': idx + 1,
    'Folio Oficial': r.folio,
    'Fecha de Entrada': new Date(r.fecha).toLocaleString('es-MX'),
    'Bien Recibido': r.bien_nombre,
    'Cantidad (Pzas)': r.cantidad,
    'Tipo Documento': r.tipo_documento === 'remision' ? 'Remisión' : r.tipo_documento === 'na' ? 'Acta Circunstanciada' : 'Doc. Soporte',
    'No. de Serie': r.numero_serie || 'N/A',
    'Recibido Por': r.recibido_por,
    'Almacén': r.almacen || 'Almacén Central ISSSTE',
    'Observaciones': r.observaciones || '',
    'Evidencias Fotos Bien': (r.fotos_bien || []).join(' | '),
    'Evidencias Fotos Documento': (r.fotos_documento || []).join(' | '),
    'Evidencias Fotos Serie': (r.fotos_serie || []).join(' | '),
  }));

  const wsRecepciones = XLSX.utils.json_to_sheet(dataRecepciones);
  XLSX.utils.book_append_sheet(wb, wsRecepciones, 'Recepciones');

  // 3. Hoja de Envíos / Despachos
  const dataEnvios = envios.map((e, idx) => ({
    '#': idx + 1,
    'Folio Despacho': e.folio,
    'Fecha de Envío': new Date(e.fecha).toLocaleString('es-MX'),
    'Unidad Médica / Destino': e.destino,
    'Bien Despachado': e.bien_nombre,
    'Cantidad (Pzas)': e.cantidad,
    'Tipo Transporte': e.tipo_transporte === 'institucional' ? 'Institucional ISSSTE' : 'Subrogado',
    'No. Económico': e.numero_economico,
    'Chofer / Operador': e.operador,
    'Despachado Por': e.enviado_por,
    'Almacén Origen': e.almacen || 'Almacén Central ISSSTE',
    'Observaciones': e.observaciones || '',
    'Evidencias Fotos Camión': (e.fotos_camion || []).join(' | '),
  }));

  const wsEnvios = XLSX.utils.json_to_sheet(dataEnvios);
  XLSX.utils.book_append_sheet(wb, wsEnvios, 'Envíos y Despachos');

  // Generar nombre de archivo con fecha
  const fechaHoy = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `Reporte_Almacen_ISSSTE_${fechaHoy}.xlsx`);
};
