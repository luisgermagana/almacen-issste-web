import { RackEstanteria, CeldaRack } from '../types';

const STORAGE_RACKS_KEY = 'issste_web_racks_estanterias';
const STORAGE_CELDAS_KEY = 'issste_web_racks_celdas';

export const RACKS_INICIALES: RackEstanteria[] = [
  {
    id: 'RACK-A',
    nombre: 'Rack A - Camas y Camillas',
    pasillo: 'Pasillo 1 - Entrada Principal',
    niveles: 4,
    posicionesPorNivel: 4,
    descripcion: 'Almacenamiento pesado de mobiliario hospitalario y camas rodables.',
  },
  {
    id: 'RACK-B',
    nombre: 'Rack B - Equipo Médico y Monitores',
    pasillo: 'Pasillo 2 - Área Quirúrgica / Terapia',
    niveles: 4,
    posicionesPorNivel: 4,
    descripcion: 'Equipos electrónicos, signos vitales y monitores.',
  },
  {
    id: 'RACK-C',
    nombre: 'Rack C - Mobiliario Clínico',
    pasillo: 'Pasillo 3 - Carros y Portasueros',
    niveles: 4,
    posicionesPorNivel: 4,
    descripcion: 'Carros de curaciones, mesas pasteur y portasueros rodables.',
  },
  {
    id: 'RACK-D',
    nombre: 'Rack D - Insumos Generales y Salidas',
    pasillo: 'Pasillo 4 - Bahía de Despacho',
    niveles: 4,
    posicionesPorNivel: 4,
    descripcion: 'Área de consolidación de carga y anaqueles de despacho.',
  },
];

export const inicializarCeldas = (racks: RackEstanteria[]): CeldaRack[] => {
  const celdas: CeldaRack[] = [];

  racks.forEach((rack) => {
    for (let niv = rack.niveles; niv >= 1; niv--) {
      for (let pos = 1; pos <= rack.posicionesPorNivel; pos++) {
        const id = `${rack.id}-N${niv}-P0${pos}`;
        const codigoUbicacion = `${rack.id}-N${niv}-E0${pos}`;

        // Cargar algunos datos demo predeterminados realistas del ISSSTE
        let bienNombre: string | undefined;
        let cantidad: number | undefined;
        let lote: string | undefined;

        if (rack.id === 'RACK-A' && niv === 1 && pos === 1) {
          bienNombre = 'Camas Hospitalarias Eléctricas';
          cantidad = 4;
          lote = 'LOTE-CHE-2026';
        } else if (rack.id === 'RACK-A' && niv === 2 && pos === 2) {
          bienNombre = 'Camas Hospitalarias Manuales';
          cantidad = 6;
          lote = 'LOTE-CHM-092';
        } else if (rack.id === 'RACK-A' && niv === 3 && pos === 1) {
          bienNombre = 'Camillas de Traslado';
          cantidad = 2;
          lote = 'LOTE-CT-441';
        } else if (rack.id === 'RACK-B' && niv === 2 && pos === 3) {
          bienNombre = 'Monitores de Signos Vitales';
          cantidad = 12;
          lote = 'LOTE-MSV-883';
        } else if (rack.id === 'RACK-C' && niv === 1 && pos === 2) {
          bienNombre = 'Portasuero Metálico Rodable';
          cantidad = 20;
          lote = 'LOTE-PSR-102';
        } else if (rack.id === 'RACK-C' && niv === 2 && pos === 1) {
          bienNombre = 'Carros de Curaciones';
          cantidad = 5;
          lote = 'LOTE-CC-03';
        }

        celdas.push({
          id,
          codigoUbicacion,
          rackId: rack.id,
          rackNombre: rack.nombre,
          pasillo: rack.pasillo,
          nivel: niv,
          posicion: pos,
          bienNombre,
          cantidad,
          lote,
          unidadMedida: 'Piezas',
          fechaActualizacion: bienNombre ? new Date().toISOString() : undefined,
          actualizadoPor: bienNombre ? 'Coordinador de Almacén' : undefined,
        });
      }
    }
  });

  return celdas;
};

export const racksService = {
  getRacks(): RackEstanteria[] {
    try {
      const data = localStorage.getItem(STORAGE_RACKS_KEY);
      if (data) return JSON.parse(data);
    } catch {}
    localStorage.setItem(STORAGE_RACKS_KEY, JSON.stringify(RACKS_INICIALES));
    return RACKS_INICIALES;
  },

  getCeldas(): CeldaRack[] {
    try {
      const data = localStorage.getItem(STORAGE_CELDAS_KEY);
      if (data) return JSON.parse(data);
    } catch {}
    const racks = this.getRacks();
    const iniciales = inicializarCeldas(racks);
    localStorage.setItem(STORAGE_CELDAS_KEY, JSON.stringify(iniciales));
    return iniciales;
  },

  guardarCelda(celdaActualizada: CeldaRack): void {
    const celdas = this.getCeldas();
    const idx = celdas.findIndex((c) => c.id === celdaActualizada.id);
    if (idx !== -1) {
      celdas[idx] = {
        ...celdaActualizada,
        fechaActualizacion: new Date().toISOString(),
      };
    } else {
      celdas.push(celdaActualizada);
    }
    localStorage.setItem(STORAGE_CELDAS_KEY, JSON.stringify(celdas));
  },

  liberarCelda(celdaId: string): void {
    const celdas = this.getCeldas();
    const idx = celdas.findIndex((c) => c.id === celdaId);
    if (idx !== -1) {
      celdas[idx] = {
        ...celdas[idx],
        bienNombre: undefined,
        cantidad: undefined,
        lote: undefined,
        observaciones: undefined,
        fechaActualizacion: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_CELDAS_KEY, JSON.stringify(celdas));
    }
  },

  // Genera el payload que se codifica dentro del código QR
  generarPayloadQR(celda: CeldaRack): string {
    return JSON.stringify({
      app: 'ISSSTE_ALMACEN_CENTRAL',
      tipo: 'UBICACION_RACK',
      v: '1.0',
      codigo: celda.codigoUbicacion,
      rack: celda.rackNombre,
      pasillo: celda.pasillo,
      nivel: celda.nivel,
      posicion: celda.posicion,
      bien: celda.bienNombre || 'ESPACIO_DISPONIBLE',
      cantidad: celda.cantidad || 0,
      lote: celda.lote || 'S/N',
      timestamp: celda.fechaActualizacion || new Date().toISOString(),
    });
  },
};
