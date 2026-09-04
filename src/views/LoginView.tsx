import React, { useState } from 'react';
import {
  ShieldCheck,
  Building2,
  Lock,
  User,
  BadgeCheck,
  ArrowRight,
  Sparkles,
  MapPin,
  CheckCircle2,
  Eye,
  EyeOff,
  Briefcase,
} from 'lucide-react';
import type { UsuarioSesion } from '../types';

interface LoginViewProps {
  onLogin: (usuario: UsuarioSesion) => void;
}

const ROLES_DISPONIBLES = [
  {
    id: 'Jefe de Almacén Central',
    titulo: 'Jefatura de Almacén Central',
    descripcion: 'Control integral directivo, autorizaciones y reportes ejecutivos',
    icono: Building2,
    badge: 'Administrador',
  },
  {
    id: 'Auditor OIC',
    titulo: 'Auditoría & Control Interno (OIC)',
    descripcion: 'Fiscalización, consulta de expedientes digitales y trazabilidad',
    icono: ShieldCheck,
    badge: 'Órgano de Control',
  },
  {
    id: 'Supervisor de Embarques',
    titulo: 'Supervisor Logístico y Distribución',
    descripcion: 'Control de salidas, camiones, choferes y destinos foráneos',
    icono: Briefcase,
    badge: 'Operativo',
  },
  {
    id: 'Operador de Racks',
    titulo: 'Operador de Racks y Piso',
    descripcion: 'Acomodo en estanterías, inventario físico y lectura de marbetes QR',
    icono: BadgeCheck,
    badge: 'Piso de Almacén',
  },
];

const ALMACENES_DISPONIBLES = [
  'Almacén Central General - Av. San Fernando 547, Tlalpan, CDMX',
  'Centro de Distribución Oriente (CEDIS) - Iztapalapa, CDMX',
  'Almacén Regional Centro - Toluca, Edo. de México',
  'Almacén Regional Norte - Monterrey, N.L.',
  'Almacén Regional Occidente - Guadalajara, Jal.',
];

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [nombre, setNombre] = useState('');
  const [almacen, setAlmacen] = useState(ALMACENES_DISPONIBLES[0]);
  const [rolSeleccionado, setRolSeleccionado] = useState(ROLES_DISPONIBLES[0].id);
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setError('Por favor ingresa tu nombre completo.');
      return;
    }

    setError(null);
    setCargando(true);

    setTimeout(() => {
      const sesion: UsuarioSesion = {
        id: 'usr_' + Date.now(),
        nombre: nombre.trim(),
        numEmpleado: 'ISSSTE-' + Math.floor(1000 + Math.random() * 9000),
        rol: rolSeleccionado,
        almacen,
        horaAcceso: new Date().toLocaleTimeString('es-MX', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      setCargando(false);
      onLogin(sesion);
    }, 350);
  };

  const handleAccesoDemo = (rolId: string, nombreDemo: string) => {
    setRolSeleccionado(rolId);
    setNombre(nombreDemo);
    setPassword('issste2026');

    setCargando(true);
    setTimeout(() => {
      const sesion: UsuarioSesion = {
        id: 'usr_demo_' + Date.now(),
        nombre: nombreDemo,
        numEmpleado: 'ISSSTE-' + Math.floor(1000 + Math.random() * 9000),
        rol: rolId,
        almacen,
        horaAcceso: new Date().toLocaleTimeString('es-MX', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      setCargando(false);
      onLogin(sesion);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-100 flex flex-col justify-between selection:bg-[#691C32] selection:text-white">
      {/* Barra superior de gobierno institucional */}
      <header className="bg-[#691C32] text-white px-4 lg:px-8 py-2 flex items-center justify-between text-xs border-b border-[#BC955C]/40 shadow-sm">
        <div className="flex items-center space-x-3">
          <span className="font-extrabold tracking-wider uppercase text-[11px] text-slate-100">
            Gobierno de México
          </span>
          <span className="text-white/30">|</span>
          <span className="text-[#DFC79B] font-semibold text-[11px] hidden sm:inline tracking-tight">
            Instituto de Seguridad y Servicios Sociales de los Trabajadores del Estado
          </span>
        </div>
        <div className="flex items-center space-x-2 text-[10px] text-slate-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono font-medium">Servidor Activo • SSL Seguro</span>
        </div>
      </header>

      {/* Contenedor Principal Centrado */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-2xl">
          {/* Card Principal con acabado tipo cristal / paspartú */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_16px_50px_rgba(0,0,0,0.08)] overflow-hidden">
            {/* Header del Card con Identidad ISSSTE */}
            <div className="relative bg-gradient-to-r from-[#691C32] to-[#4A1021] text-white p-6 sm:p-8 border-b-2 border-[#BC955C]">
              {/* Marca de agua de fondo */}
              <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 opacity-10 pointer-events-none">
                <Building2 className="w-52 h-52 text-white" />
              </div>

              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  {/* Escudo / Isotipo con insignia dorada */}
                  <div className="relative w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-[#BC955C]/80 flex items-center justify-center shadow-lg">
                    <Building2 className="w-7 h-7 text-[#DFC79B]" />
                    <div className="absolute -bottom-1 -right-1 bg-[#BC955C] text-[#691C32] p-1 rounded-full shadow-md">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <div>
                    <span className="inline-block px-2 py-0.5 rounded-md bg-[#BC955C]/25 text-[#DFC79B] text-[10px] font-black tracking-widest uppercase border border-[#BC955C]/40 mb-1">
                      Sistema Central de Abasto
                    </span>
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight font-['Montserrat']">
                      Almacén Central ISSSTE
                    </h1>
                    <p className="text-xs text-slate-200 font-medium">
                      Portal Ejecutivo & Control Operativo de Mercancías
                    </p>
                  </div>
                </div>

                <div className="hidden sm:block text-right">
                  <div className="text-[10px] uppercase font-bold text-[#DFC79B] tracking-wider">
                    Plataforma Web
                  </div>
                  <div className="text-xs text-white/80 font-mono">v2.4.0 (2026)</div>
                </div>
              </div>
            </div>

            {/* Cuerpo del Formulario */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Selector Visual de Rol EN FORMA DE LISTA */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5">
                  Selecciona tu Perfil / Función Institucional
                </label>
                <div className="flex flex-col space-y-2">
                  {ROLES_DISPONIBLES.map((rol) => {
                    const seleccionado = rolSeleccionado === rol.id;
                    const Icono = rol.icono;
                    return (
                      <button
                        key={rol.id}
                        type="button"
                        onClick={() => setRolSeleccionado(rol.id)}
                        className={`w-full text-left p-3.5 rounded-2xl border transition-all duration-150 flex items-center justify-between group ${
                          seleccionado
                            ? 'bg-[#FDF2F4] border-[#691C32] shadow-sm ring-1 ring-[#691C32]'
                            : 'bg-slate-50/70 hover:bg-slate-100/90 border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`p-2 rounded-xl transition-colors shrink-0 ${
                              seleccionado
                                ? 'bg-[#691C32] text-white shadow-sm'
                                : 'bg-slate-200 text-slate-600 group-hover:bg-slate-300'
                            }`}
                          >
                            <Icono className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-bold text-slate-900 font-['Montserrat']">
                                {rol.titulo}
                              </span>
                              <span
                                className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                  seleccionado
                                    ? 'bg-[#691C32] text-white'
                                    : 'bg-slate-200 text-slate-600'
                                }`}
                              >
                                {rol.badge}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {rol.descripcion}
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 ml-3">
                          {seleccionado ? (
                            <CheckCircle2 className="w-5 h-5 text-[#691C32]" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-slate-300 group-hover:border-slate-400" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mensaje de Error si aplica */}
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-semibold flex items-center space-x-2 animate-fadeIn">
                  <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Formulario de Acceso */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nombre Completo */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center space-x-1.5">
                    <User className="w-3.5 h-3.5 text-[#691C32]" />
                    <span>Nombre del Servidor Público</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ingresa tu nombre completo"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#691C32] focus:bg-white transition-all placeholder:text-slate-400"
                  />
                </div>

                {/* Sede / Almacén */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#691C32]" />
                    <span>Sede / Almacén Central Asignado</span>
                  </label>
                  <select
                    value={almacen}
                    onChange={(e) => setAlmacen(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#691C32] focus:bg-white transition-all"
                  >
                    {ALMACENES_DISPONIBLES.map((alm, idx) => (
                      <option key={idx} value={alm}>
                        {alm}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Contraseña / Clave de Acceso */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center space-x-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#691C32]" />
                    <span>PIN o Contraseña de Seguridad</span>
                  </label>
                  <div className="relative">
                    <input
                      type={mostrarPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Ingresa tu clave de acceso"
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#691C32] focus:bg-white transition-all pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarPassword(!mostrarPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {mostrarPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Ambiente operativo interno con autenticación segura.
                  </p>
                </div>

                {/* Botón Principal de Envío */}
                <button
                  type="submit"
                  disabled={cargando}
                  className="w-full mt-2 py-3 px-4 bg-[#691C32] hover:bg-[#521426] text-white rounded-xl font-bold text-xs shadow-[0_4px_16px_rgba(105,28,50,0.35)] flex items-center justify-center space-x-2 transition-all active:scale-[0.99] disabled:opacity-50"
                >
                  {cargando ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Ingresar a la Plataforma</span>
                      <ArrowRight className="w-4 h-4 text-[#DFC79B]" />
                    </>
                  )}
                </button>
              </form>

              {/* Separador */}
              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 absolute">
                  Acceso Rápido Directo
                </span>
              </div>

              {/* Botones de Acceso Rápido Demo con 1 Clic */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() =>
                    handleAccesoDemo(
                      'Jefe de Almacén Central',
                      'Ing. Luis Gerardo Magaña'
                    )
                  }
                  className="px-3.5 py-2.5 bg-slate-50 hover:bg-[#FDF2F4] text-slate-800 hover:text-[#691C32] border border-slate-200 hover:border-[#691C32]/40 rounded-xl text-xs font-bold transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-4 h-4 text-[#691C32]" />
                    <div className="text-left">
                      <div className="text-xs font-bold">Jefe de Almacén</div>
                      <div className="text-[10px] text-slate-400 font-normal">Acceso total directivo</div>
                    </div>
                  </div>
                  <Sparkles className="w-3.5 h-3.5 text-[#BC955C] group-hover:scale-110 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleAccesoDemo(
                      'Auditor OIC',
                      'Lic. Patricia Morales R.'
                    )
                  }
                  className="px-3.5 py-2.5 bg-slate-50 hover:bg-[#FDF2F4] text-slate-800 hover:text-[#691C32] border border-slate-200 hover:border-[#691C32]/40 rounded-xl text-xs font-bold transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-[#691C32]" />
                    <div className="text-left">
                      <div className="text-xs font-bold">Auditor OIC</div>
                      <div className="text-[10px] text-slate-400 font-normal">Fiscalización de folios</div>
                    </div>
                  </div>
                  <Sparkles className="w-3.5 h-3.5 text-[#BC955C] group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>

            {/* Footer Informativo Institucional */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left text-[11px] text-slate-500">
              <div className="flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Autenticación cifrada para el control de inventarios nacionales</span>
              </div>
              <div className="text-slate-400 text-[10px]">
                ISSSTE © 2026 • Almacén Central
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer global de la página de Login */}
      <footer className="text-center py-3 text-xs text-slate-500">
        <p className="font-semibold text-slate-600">
          Subdirección de Almacenes y Distribución de Insumos Médicos y Bienes
        </p>
        <p className="text-[11px] text-slate-400">
          Uso oficial restringido conforme a los lineamientos del Gobierno de México.
        </p>
      </footer>
    </div>
  );
};
