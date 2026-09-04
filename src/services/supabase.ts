import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { RegistroRecepcion, RegistroEnvio, Producto, ItemInventario, MovimientoUnificado } from '../types';

let supabaseClient: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  if (supabaseClient) return supabaseClient;

  let envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  if (envUrl && envKey) {
    envUrl = envUrl.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
    try {
      supabaseClient = createClient(envUrl, envKey);
      return supabaseClient;
    } catch (e) {
      console.warn('Error inicializando Supabase Web:', e);
    }
  }
  return null;
};

// Cargar catálogo de productos
export const fetchProductos = async (): Promise<Producto[]> => {
  const client = getSupabaseClient();
  if (!client) return [];

  try {
    const { data, error } = await client
      .from('productos')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) {
      console.warn('Error al obtener productos:', error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error('Fallo de red en fetchProductos:', err);
    return [];
  }
};

// Cargar todas las recepciones
export const fetchRecepciones = async (): Promise<RegistroRecepcion[]> => {
  const client = getSupabaseClient();
  if (!client) return [];

  try {
    const { data, error } = await client
      .from('recepciones')
      .select('*')
      .order('fecha', { ascending: false });

    if (error) {
      console.warn('Error al obtener recepciones:', error);
      return [];
    }

    return (data || []).map((item) => ({
      id: item.id,
      folio: item.folio,
      fecha: item.fecha,
      bien_nombre: item.bien_nombre,
      tipo_documento: item.tipo_documento,
      fotos_documento: Array.isArray(item.fotos_documento) ? item.fotos_documento : [],
      fotos_bien: Array.isArray(item.fotos_bien) ? item.fotos_bien : [],
      cantidad: Number(item.cantidad) || 1,
      numero_serie: item.numero_serie || undefined,
      fotos_serie: Array.isArray(item.fotos_serie) ? item.fotos_serie : [],
      recibido_por: item.recibido_por,
      observaciones: item.observaciones || '',
      almacen: item.almacen || undefined,
      creado_en: item.creado_en,
    }));
  } catch (err) {
    console.error('Fallo de red en fetchRecepciones:', err);
    return [];
  }
};

// Cargar todos los envíos
export const fetchEnvios = async (): Promise<RegistroEnvio[]> => {
  const client = getSupabaseClient();
  if (!client) return [];

  try {
    const { data, error } = await client
      .from('envios')
      .select('*')
      .order('fecha', { ascending: false });

    if (error) {
      console.warn('Error al obtener envíos:', error);
      return [];
    }

    return (data || []).map((item) => ({
      id: item.id,
      folio: item.folio,
      fecha: item.fecha,
      tipo_transporte: item.tipo_transporte,
      numero_economico: item.numero_economico,
      operador: item.operador,
      destino: item.destino,
      bien_nombre: item.bien_nombre,
      cantidad: Number(item.cantidad) || 1,
      fotos_camion: Array.isArray(item.fotos_camion) ? item.fotos_camion : [],
      enviado_por: item.enviado_por,
      observaciones: item.observaciones || '',
      almacen: item.almacen || undefined,
      creado_en: item.creado_en,
    }));
  } catch (err) {
    console.error('Fallo de red en fetchEnvios:', err);
    return [];
  }
};

// Calcular balance de inventario agrupado por bien
export const calcularInventario = (
  productos: Producto[],
  recepciones: RegistroRecepcion[],
  envios: RegistroEnvio[]
): ItemInventario[] => {
  // Unir nombres de productos de catálogo con nombres que aparezcan en movimientos
  const nombresSet = new Set<string>();
  productos.forEach((p) => p.nombre && nombresSet.add(p.nombre.trim()));
  recepciones.forEach((r) => r.bien_nombre && nombresSet.add(r.bien_nombre.trim()));
  envios.forEach((e) => e.bien_nombre && nombresSet.add(e.bien_nombre.trim()));

  const inventario: ItemInventario[] = [];

  nombresSet.forEach((nombre) => {
    const nombreNorm = nombre.toLowerCase();

    // Sumar recepciones
    const recsItem = recepciones.filter((r) => r.bien_nombre.trim().toLowerCase() === nombreNorm);
    const totalRecibido = recsItem.reduce((acc, curr) => acc + (Number(curr.cantidad) || 0), 0);

    // Sumar envíos
    const envsItem = envios.filter((e) => e.bien_nombre.trim().toLowerCase() === nombreNorm);
    const totalEnviado = envsItem.reduce((acc, curr) => acc + (Number(curr.cantidad) || 0), 0);

    const disponible = Math.max(0, totalRecibido - totalEnviado);

    // Encontrar la categoría y última fecha de movimiento
    const prodRef = productos.find((p) => p.nombre.trim().toLowerCase() === nombreNorm);
    const categoria = prodRef?.categoria || 'Mobiliario y Equipo Médico';

    // Última fecha
    const fechas = [
      ...recsItem.map((r) => r.fecha),
      ...envsItem.map((e) => e.fecha),
    ].filter(Boolean);

    fechas.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    const ultimaFecha = fechas[0] || (prodRef?.creado_en ? prodRef.creado_en : new Date().toISOString());

    // Estatus
    let estatus: 'optimo' | 'bajo' | 'agotado' = 'optimo';
    if (disponible === 0 && totalRecibido > 0) {
      estatus = 'agotado';
    } else if (disponible > 0 && disponible <= 5) {
      estatus = 'bajo';
    } else if (disponible === 0 && totalRecibido === 0) {
      estatus = 'agotado';
    }

    const porcentajeSalida = totalRecibido > 0 
      ? Math.min(100, Math.round((totalEnviado / totalRecibido) * 100))
      : 0;

    // Solo incluir items que hayan tenido movimientos o estén en catálogo
    if (totalRecibido > 0 || totalEnviado > 0 || prodRef) {
      inventario.push({
        nombre,
        categoria,
        totalRecibido,
        totalEnviado,
        disponible,
        ultimaFecha,
        estatus,
        porcentajeSalida,
      });
    }
  });

  return inventario.sort((a, b) => b.disponible - a.disponible);
};

// Generar lista cronológica unificada de movimientos
export const obtenerMovimientosUnificados = (
  recepciones: RegistroRecepcion[],
  envios: RegistroEnvio[]
): MovimientoUnificado[] => {
  const lista: MovimientoUnificado[] = [];

  recepciones.forEach((r) => {
    const totalFotos = (r.fotos_bien?.length || 0) + (r.fotos_documento?.length || 0) + (r.fotos_serie?.length || 0);
    lista.push({
      id: r.id,
      folio: r.folio,
      tipo: 'RECEPCION',
      fecha: r.fecha,
      bien_nombre: r.bien_nombre,
      cantidad: r.cantidad,
      responsable: r.recibido_por,
      destinoOProveedor: r.tipo_documento === 'remision' ? 'Remisión de Proveedor' : r.tipo_documento === 'na' ? 'Acta Circunstanciada' : 'Doc. Soporte',
      fotosCount: totalFotos,
      datosOriginales: r,
    });
  });

  envios.forEach((e) => {
    lista.push({
      id: e.id,
      folio: e.folio,
      tipo: 'ENVIO',
      fecha: e.fecha,
      bien_nombre: e.bien_nombre,
      cantidad: e.cantidad,
      responsable: e.enviado_por,
      destinoOProveedor: `${e.destino} (${e.tipo_transporte === 'institucional' ? 'Inst.' : 'Subr.'} Eco: ${e.numero_economico})`,
      fotosCount: e.fotos_camion?.length || 0,
      datosOriginales: e,
    });
  });

  return lista.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
};

// Buscar un folio para el verificador
export const buscarPorFolio = async (folio: string): Promise<{
  encontrado: boolean;
  tipo?: 'RECEPCION' | 'ENVIO';
  registro?: RegistroRecepcion | RegistroEnvio;
}> => {
  const client = getSupabaseClient();
  if (!client) return { encontrado: false };

  const folioBuscado = folio.trim().toUpperCase();

  // Buscar en recepciones
  const { data: recData } = await client
    .from('recepciones')
    .select('*')
    .ilike('folio', folioBuscado)
    .maybeSingle();

  if (recData) {
    return {
      encontrado: true,
      tipo: 'RECEPCION',
      registro: {
        id: recData.id,
        folio: recData.folio,
        fecha: recData.fecha,
        bien_nombre: recData.bien_nombre,
        tipo_documento: recData.tipo_documento,
        fotos_documento: recData.fotos_documento || [],
        fotos_bien: recData.fotos_bien || [],
        cantidad: recData.cantidad || 1,
        numero_serie: recData.numero_serie,
        fotos_serie: recData.fotos_serie || [],
        recibido_por: recData.recibido_por,
        observaciones: recData.observaciones,
        almacen: recData.almacen,
        creado_en: recData.creado_en,
      },
    };
  }

  // Buscar en envíos
  const { data: envData } = await client
    .from('envios')
    .select('*')
    .ilike('folio', folioBuscado)
    .maybeSingle();

  if (envData) {
    return {
      encontrado: true,
      tipo: 'ENVIO',
      registro: {
        id: envData.id,
        folio: envData.folio,
        fecha: envData.fecha,
        tipo_transporte: envData.tipo_transporte,
        numero_economico: envData.numero_economico,
        operador: envData.operador,
        destino: envData.destino,
        bien_nombre: envData.bien_nombre,
        cantidad: envData.cantidad || 1,
        fotos_camion: envData.fotos_camion || [],
        enviado_por: envData.enviado_por,
        observaciones: envData.observaciones,
        almacen: envData.almacen,
        creado_en: envData.creado_en,
      },
    };
  }

  return { encontrado: false };
};

// Suscripción Realtime para avisar cambios en vivo
export const suscribirCambiosRealtime = (
  onCambio: (tipo: 'recepciones' | 'envios' | 'productos', payload: any) => void
): RealtimeChannel | null => {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const channel = client
      .channel('almacen-web-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'recepciones' },
        (payload) => onCambio('recepciones', payload)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'envios' },
        (payload) => onCambio('envios', payload)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'productos' },
        (payload) => onCambio('productos', payload)
      )
      .subscribe();

    return channel;
  } catch (err) {
    console.warn('No se pudo establecer suscripción Realtime:', err);
    return null;
  }
};
