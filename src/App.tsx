import React, { useState, useEffect, useCallback } from 'react';
import {
  VistaWeb,
  Producto,
  RegistroRecepcion,
  RegistroEnvio,
  ItemInventario,
  MovimientoUnificado,
  CeldaRack,
  UsuarioSesion,
} from './types';
import {
  fetchProductos,
  fetchRecepciones,
  fetchEnvios,
  calcularInventario,
  obtenerMovimientosUnificados,
  suscribirCambiosRealtime,
  buscarPorFolio,
} from './services/supabase';
import { Navbar } from './components/Navbar';
import { EvidenceModal } from './components/EvidenceModal';
import { RackEtiquetaModal } from './components/RackEtiquetaModal';
import { FolioModal } from './components/FolioModal';
import { DashboardView } from './views/DashboardView';
import { InventarioView } from './views/InventarioView';
import { RacksView } from './views/RacksView';
import { AuditoriaView } from './views/AuditoriaView';
import { VerificadorView } from './views/VerificadorView';
import { LoginView } from './views/LoginView';
import { Bell, CheckCircle, Building2, Shield } from 'lucide-react';

export function App() {
  // Estado de Sesión Institucional
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(() => {
    try {
      const sesionGuardada = localStorage.getItem('almacen_issste_session');
      return sesionGuardada ? JSON.parse(sesionGuardada) : null;
    } catch {
      return null;
    }
  });

  const handleLogin = (nuevoUsuario: UsuarioSesion) => {
    setUsuario(nuevoUsuario);
    try {
      localStorage.setItem('almacen_issste_session', JSON.stringify(nuevoUsuario));
    } catch (e) {
      console.error('Error guardando sesion:', e);
    }
  };

  const handleLogout = () => {
    setUsuario(null);
    try {
      localStorage.removeItem('almacen_issste_session');
    } catch (e) {
      console.error('Error cerrando sesion:', e);
    }
  };

  const [vistaActual, setVistaActual] = useState<VistaWeb>('dashboard');
  const [productos, setProductos] = useState<Producto[]>([]);
  const [recepciones, setRecepciones] = useState<RegistroRecepcion[]>([]);
  const [envios, setEnvios] = useState<RegistroEnvio[]>([]);
  const [inventario, setInventario] = useState<ItemInventario[]>([]);
  const [movimientos, setMovimientos] = useState<MovimientoUnificado[]>([]);
  const [cargando, setCargando] = useState(true);
  const [realtimeActivo, setRealtimeActivo] = useState(false);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date | null>(null);

  // Toast de notificación en vivo
  const [notificacionRealtime, setNotificacionRealtime] = useState<{
    mostrar: boolean;
    mensaje: string;
    folio?: string;
  }>({ mostrar: false, mensaje: '' });

  // Modales
  const [modalFotos, setModalFotos] = useState<{
    abierto: boolean;
    fotos: string[];
    titulo: string;
  }>({ abierto: false, fotos: [], titulo: '' });

  const [modalFolio, setModalFolio] = useState<{
    abierto: boolean;
    tipo: 'RECEPCION' | 'ENVIO';
    registro: RegistroRecepcion | RegistroEnvio | null;
  }>({ abierto: false, tipo: 'RECEPCION', registro: null });

  const [modalRackEtiqueta, setModalRackEtiqueta] = useState<{
    abierto: boolean;
    celda: CeldaRack | null;
  }>({ abierto: false, celda: null });

  // Carga de datos
  const cargarDatos = useCallback(async (silencioso: boolean = false) => {
    if (!silencioso) setCargando(true);
    try {
      const [prods, recs, envs] = await Promise.all([
        fetchProductos(),
        fetchRecepciones(),
        fetchEnvios(),
      ]);

      setProductos(prods);
      setRecepciones(recs);
      setEnvios(envs);

      const inv = calcularInventario(prods, recs, envs);
      setInventario(inv);

      const movs = obtenerMovimientosUnificados(recs, envs);
      setMovimientos(movs);

      setUltimaActualizacion(new Date());
    } catch (err) {
      console.error('Error cargando datos de almacén:', err);
    } finally {
      if (!silencioso) setCargando(false);
    }
  }, []);

  // Efecto inicial y suscripción Realtime
  useEffect(() => {
    cargarDatos();

    // Configurar canal de WebSockets con Supabase
    const channel = suscribirCambiosRealtime((tabla, payload) => {
      setRealtimeActivo(true);
      cargarDatos(true);

      const eventType = payload.eventType;
      const nuevoFolio = payload.new?.folio;

      if (tabla === 'recepciones') {
        setNotificacionRealtime({
          mostrar: true,
          mensaje: `Nueva recepción registrada desde la app móvil${nuevoFolio ? ` (Folio: ${nuevoFolio})` : ''}`,
          folio: nuevoFolio,
        });
      } else if (tabla === 'envios') {
        setNotificacionRealtime({
          mostrar: true,
          mensaje: `Nuevo despacho de salida registrado desde la app móvil${nuevoFolio ? ` (Folio: ${nuevoFolio})` : ''}`,
          folio: nuevoFolio,
        });
      }

      // Ocultar toast a los 6 segundos
      setTimeout(() => {
        setNotificacionRealtime((prev) => ({ ...prev, mostrar: false }));
      }, 6000);
    });

    if (channel) {
      setRealtimeActivo(true);
    }

    return () => {
      if (channel) channel.unsubscribe();
    };
  }, [cargarDatos]);

  // Handlers para abrir modales
  const handleVerFotos = (fotos: string[], titulo: string) => {
    setModalFotos({ abierto: true, fotos, titulo });
  };

  const handleVerMovimiento = (mov: MovimientoUnificado) => {
    setModalFolio({
      abierto: true,
      tipo: mov.tipo,
      registro: mov.datosOriginales,
    });
  };

  const handleVerFolioPorId = async (folio: string) => {
    const res = await buscarPorFolio(folio);
    if (res.encontrado && res.registro && res.tipo) {
      setModalFolio({
        abierto: true,
        tipo: res.tipo,
        registro: res.registro,
      });
    }
  };

  const handleSeleccionarCeldaRack = (celda: CeldaRack) => {
    setModalRackEtiqueta({ abierto: true, celda });
  };

  // Si no hay sesión activa, mostrar pantalla de inicio de sesión institucional
  if (!usuario) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-['Inter']">
      {/* Barra de Navegación Institucional */}
      <Navbar
        vistaActual={vistaActual}
        onCambiarVista={setVistaActual}
        realtimeActivo={realtimeActivo}
        cargando={cargando}
        onRefrescar={() => cargarDatos()}
        ultimaActualizacion={ultimaActualizacion}
        usuario={usuario}
        onLogout={handleLogout}
      />

      {/* Toast Flotante de Notificación en Vivo (Realtime) */}
      {notificacionRealtime.mostrar && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#691C32] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-[#BC955C] flex items-center space-x-3 animate-bounce">
          <div className="p-2 rounded-xl bg-white/15">
            <Bell className="w-5 h-5 text-[#DFC79B]" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#DFC79B] uppercase tracking-wider">
              ¡Actualización en Vivo de Almacén!
            </div>
            <div className="text-xs font-medium text-slate-100">{notificacionRealtime.mensaje}</div>
          </div>
          {notificacionRealtime.folio && (
            <button
              onClick={() => {
                handleVerFolioPorId(notificacionRealtime.folio!);
                setNotificacionRealtime((prev) => ({ ...prev, mostrar: false }));
              }}
              className="ml-2 px-3 py-1 bg-[#BC955C] text-slate-900 text-xs font-bold rounded-lg hover:bg-white transition-colors"
            >
              Ver
            </button>
          )}
        </div>
      )}

      {/* Contenedor Principal de Vistas Expandido */}
      <main className="flex-1 w-full max-w-[98%] 2xl:max-w-[1850px] mx-auto px-3 sm:px-6 lg:px-8 py-6">
        {cargando && recepciones.length === 0 ? (
          <div className="min-h-[450px] flex flex-col items-center justify-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#691C32] text-[#DFC79B] flex items-center justify-center shadow-lg animate-pulse">
              <Building2 className="w-8 h-8" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-[#691C32] font-['Montserrat']">
                Conectando con Servidores del ISSSTE...
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Sincronizando catálogo, recepciones y despachos en tiempo real
              </p>
            </div>
          </div>
        ) : (
          <>
            {vistaActual === 'dashboard' && (
              <DashboardView
                inventario={inventario}
                recepciones={recepciones}
                envios={envios}
                movimientos={movimientos}
                onVerFolio={handleVerMovimiento}
                onCambiarVista={setVistaActual}
              />
            )}

            {vistaActual === 'inventario' && (
              <InventarioView
                inventario={inventario}
                recepciones={recepciones}
                envios={envios}
                onVerFolioPorId={handleVerFolioPorId}
              />
            )}

            {vistaActual === 'racks' && (
              <RacksView
                productosCatalogo={productos}
                onSeleccionarCelda={handleSeleccionarCeldaRack}
              />
            )}

            {vistaActual === 'auditoria' && (
              <AuditoriaView
                recepciones={recepciones}
                envios={envios}
                movimientos={movimientos}
                inventario={inventario}
                onVerFolio={handleVerMovimiento}
                onVerFotos={handleVerFotos}
              />
            )}

            {vistaActual === 'verificador' && (
              <VerificadorView onVerFotos={handleVerFotos} />
            )}
          </>
        )}
      </main>

      {/* Pie de Página Institucional */}
      <footer className="bg-slate-900 text-white border-t-4 border-[#BC955C] mt-16 no-print">
        <div className="w-full max-w-[98%] 2xl:max-w-[1850px] mx-auto px-3 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-[#691C32] text-white flex items-center justify-center font-bold text-base border border-[#BC955C]">
                  <Building2 className="w-5 h-5 text-[#DFC79B]" />
                </div>
                <div>
                  <span className="text-sm font-black text-white font-['Montserrat'] tracking-tight">
                    SISTEMA DE CONTROL DE ALMACÉN CENTRAL
                  </span>
                  <span className="text-xs text-slate-400 block">
                    Instituto de Seguridad y Servicios Sociales de los Trabajadores del Estado
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-400 max-w-md leading-relaxed">
                Plataforma tecnológica de auditoría, trazabilidad y logística para el abastecimiento oportuno de mobiliario, equipo e insumos médicos a los hospitales de la República Mexicana.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-[#DFC79B] uppercase tracking-wider mb-3">
                Vínculos Rápidos
              </h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>
                  <button onClick={() => setVistaActual('dashboard')} className="hover:text-white transition-colors">
                    Torre de Control
                  </button>
                </li>
                <li>
                  <button onClick={() => setVistaActual('inventario')} className="hover:text-white transition-colors">
                    Inventario & Historial
                  </button>
                </li>
                <li>
                  <button onClick={() => setVistaActual('racks')} className="hover:text-white transition-colors">
                    Mapa de Racks & QR
                  </button>
                </li>
                <li>
                  <button onClick={() => setVistaActual('verificador')} className="hover:text-white transition-colors">
                    Verificador de Folios
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-[#DFC79B] uppercase tracking-wider mb-3">
                Seguridad & Soporte
              </h4>
              <div className="space-y-2 text-xs text-slate-400">
                <div className="flex items-center space-x-1.5 text-emerald-400">
                  <Shield className="w-3.5 h-3.5" />
                  <span className="font-semibold">Servidor Seguro Cifrado</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Almacén Central: Av. San Fernando #547, Col. Toriello Guerra, Alcaldía Tlalpan, C.P. 14050, Ciudad de México.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
            <span>© 2026 ISSSTE • Gobierno de México. Todos los derechos reservados.</span>
            <span>Versión 2.0 Web • Conectado a Base de Datos en Tiempo Real</span>
          </div>
        </div>
      </footer>

      {/* Modales Globales */}
      <EvidenceModal
        isOpen={modalFotos.abierto}
        onClose={() => setModalFotos((prev) => ({ ...prev, abierto: false }))}
        fotos={modalFotos.fotos}
        titulo={modalFotos.titulo}
      />

      <FolioModal
        isOpen={modalFolio.abierto}
        onClose={() => setModalFolio((prev) => ({ ...prev, abierto: false }))}
        tipo={modalFolio.tipo}
        registro={modalFolio.registro}
        onVerFotos={handleVerFotos}
      />

      <RackEtiquetaModal
        isOpen={modalRackEtiqueta.abierto}
        onClose={() => setModalRackEtiqueta((prev) => ({ ...prev, abierto: false }))}
        celda={modalRackEtiqueta.celda}
        productosCatalogo={productos}
        onCeldaActualizada={(celdaActualizada) => {
          setModalRackEtiqueta((prev) => ({ ...prev, celda: celdaActualizada }));
        }}
        onCeldaLiberada={(id) => {
          setModalRackEtiqueta({ abierto: false, celda: null });
        }}
      />
    </div>
  );
}

export default App;
