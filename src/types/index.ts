export type TipoDocumentoRecepcion = 'remision' | 'documento_soporte' | 'na';
export type TipoTransporteEnvio = 'institucional' | 'subrogado';

export interface Producto {
  id: string;
  nombre: string;
  categoria: string;
  es_personalizado?: boolean;
  creado_en?: string;
  activo?: boolean;
}

export interface RegistroRecepcion {
  id: string;
  folio: string;
  fecha: string;
  bien_nombre: string;
  tipo_documento: TipoDocumentoRecepcion;
  fotos_documento: string[];
  fotos_bien: string[];
  cantidad: number;
  numero_serie?: string;
  fotos_serie: string[];
  recibido_por: string;
  observaciones?: string;
  almacen?: string;
  creado_en?: string;
}

export interface RegistroEnvio {
  id: string;
  folio: string;
  fecha: string;
  tipo_transporte: TipoTransporteEnvio;
  numero_economico: string;
  operador: string;
  destino: string;
  bien_nombre: string;
  cantidad: number;
  fotos_camion: string[];
  enviado_por: string;
  observaciones?: string;
  almacen?: string;
  creado_en?: string;
}

export interface MovimientoUnificado {
  id: string;
  folio: string;
  tipo: 'RECEPCION' | 'ENVIO';
  fecha: string;
  bien_nombre: string;
  cantidad: number;
  responsable: string;
  destinoOProveedor: string;
  fotosCount: number;
  datosOriginales: RegistroRecepcion | RegistroEnvio;
}

export interface ItemInventario {
  nombre: string;
  categoria: string;
  totalRecibido: number;
  totalEnviado: number;
  disponible: number;
  ultimaFecha: string;
  estatus: 'optimo' | 'bajo' | 'agotado';
  porcentajeSalida: number;
}

// Modelado de Racks y Ubicaciones de Almacén
export interface CeldaRack {
  id: string; // ej. "A-2-3"
  codigoUbicacion: string; // ej. "RCK-A-N2-E03"
  rackId: string;
  rackNombre: string;
  pasillo: string;
  nivel: number; // 1 = abajo, 4 = arriba
  posicion: number; // 1 a 4
  bienNombre?: string;
  cantidad?: number;
  lote?: string;
  unidadMedida?: string;
  fechaActualizacion?: string;
  actualizadoPor?: string;
  observaciones?: string;
}

export interface RackEstanteria {
  id: string;
  nombre: string;
  pasillo: string;
  niveles: number;
  posicionesPorNivel: number;
export type VistaWeb = 'dashboard' | 'inventario' | 'racks' | 'auditoria' | 'verificador';

export interface UsuarioSesion {
  id: string;
  nombre: string;
  numEmpleado: string;
  rol: string;
  almacen: string;
  horaAcceso: string;
}
