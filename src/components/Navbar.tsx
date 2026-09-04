import React from 'react';
import type { VistaWeb, UsuarioSesion } from '../types';
import {
  LayoutDashboard,
  Boxes,
  Grid3X3,
  FileCheck2,
  Search,
  RefreshCw,
  Building2,
  LogOut,
  User,
} from 'lucide-react';

interface NavbarProps {
  vistaActual: VistaWeb;
  onCambiarVista: (vista: VistaWeb) => void;
  realtimeActivo: boolean;
  cargando: boolean;
  onRefrescar: () => void;
  ultimaActualizacion: Date | null;
  usuario?: UsuarioSesion | null;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  vistaActual,
  onCambiarVista,
  realtimeActivo,
  cargando,
  onRefrescar,
  usuario,
  onLogout,
}) => {
  const navItems: { id: VistaWeb; label: string; icon: React.ReactNode }[] = [
    {
      id: 'dashboard',
      label: 'Torre de Control',
      icon: <LayoutDashboard className="w-3.5 h-3.5" />,
    },
    {
      id: 'inventario',
      label: 'Inventario & Historial',
      icon: <Boxes className="w-3.5 h-3.5" />,
    },
    {
      id: 'racks',
      label: 'Mapa de Racks & QR',
      icon: <Grid3X3 className="w-3.5 h-3.5" />,
    },
    {
      id: 'auditoria',
      label: 'Auditoría & Registros',
      icon: <FileCheck2 className="w-3.5 h-3.5" />,
    },
    {
      id: 'verificador',
      label: 'Verificador de Folios',
      icon: <Search className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] no-print">
      {/* Barra superior de gobierno institucional */}
      <div className="bg-[#691C32] text-white px-3 lg:px-6 py-1.5 border-b border-[#BC955C]/40">
        <div className="w-full max-w-[98%] 2xl:max-w-[1850px] mx-auto flex items-center justify-between text-xs">
          <div className="flex items-center space-x-3">
            <span className="font-extrabold tracking-wider uppercase text-[11px] text-slate-100">
              Gobierno de México
            </span>
            <span className="text-white/30">|</span>
            <span className="text-[#DFC79B] font-semibold text-[11px] hidden sm:inline tracking-tight">
              Instituto de Seguridad y Servicios Sociales de los Trabajadores del Estado
            </span>
          </div>
          <div className="flex items-center space-x-3 text-[11px]">
            <span className="text-slate-200 hidden md:inline font-medium">
              Almacén Central y Centro de Distribución Nacional
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#8B1E3F] text-white font-bold text-[10px] tracking-wider uppercase border border-white/15 shadow-sm">
              México
            </span>
          </div>
        </div>
      </div>

      {/* Navegación Principal Expandida */}
      <div className="w-full max-w-[98%] 2xl:max-w-[1850px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo y Nombre del Sistema */}
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => onCambiarVista('dashboard')}
          >
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#691C32] to-[#4C1021] text-white flex items-center justify-center shadow-[0_4px_12px_rgba(105,28,50,0.3)] border border-[#BC955C]/60 group-hover:scale-105 transition-transform duration-200">
              <Building2 className="w-5 h-5 text-[#DFC79B]" />
              <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-[15px] tracking-tight text-[#691C32] font-['Montserrat']">
                  ALMACÉN ISSSTE
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-black bg-[#FDF2F4] text-[#691C32] border border-[#F7D6DC] rounded-md tracking-wider">
                  CENTRAL
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Dpto. de Almacenaje y Distribución de Bienes de Inversión y Varios.
              </p>
            </div>
          </div>

          {/* Menú de Vistas: Contenedor Estilo Linear / Apple Pill */}
          <nav className="hidden lg:flex items-center p-1 bg-slate-100/80 backdrop-blur-md rounded-full border border-slate-200/80 shadow-inner">
            {navItems.map((item) => {
              const activo = vistaActual === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onCambiarVista(item.id)}
                  className={`relative flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs transition-all duration-200 ${activo
                      ? 'bg-[#691C32] text-white font-bold shadow-[0_2px_8px_rgba(105,28,50,0.35)]'
                      : 'text-slate-600 hover:text-slate-900 font-semibold hover:bg-white/60'
                    }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Estado de Supabase Realtime y Refrescar */}
          <div className="flex items-center space-x-2.5">
            {/* Badge Realtime Premium */}
            <div
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-bold border transition-colors ${realtimeActivo
                  ? 'bg-emerald-500/10 text-emerald-800 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-800 border-amber-500/30'
                }`}
              title={realtimeActivo ? 'Conectado a WebSockets de Supabase en vivo' : 'Modo estándar'}
            >
              <span
                className={`w-2 h-2 rounded-full ${realtimeActivo ? 'bg-emerald-500 realtime-live-dot' : 'bg-amber-500'
                  }`}
              />
              <span className="hidden sm:inline">
                {realtimeActivo ? 'En Vivo' : 'Offline'}
              </span>
            </div>

            {/* Botón Refrescar */}
            <button
              onClick={onRefrescar}
              disabled={cargando}
              className="p-2 text-slate-500 hover:text-[#691C32] hover:bg-slate-100/80 rounded-xl transition-all border border-slate-200/60 shadow-xs"
              title="Actualizar datos ahora"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${cargando ? 'animate-spin text-[#691C32]' : ''}`} />
            </button>

            {/* Perfil de Usuario y Cerrar Sesión */}
            {usuario && (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
                <div className="hidden md:flex items-center space-x-2 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200/80">
                  <div className="w-6 h-6 rounded-lg bg-[#691C32] text-[#DFC79B] flex items-center justify-center font-black text-[10px]">
                    {usuario.nombre
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase()}
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[120px]">
                      {usuario.nombre}
                    </div>
                    <div className="text-[9px] text-[#691C32] font-semibold leading-none truncate max-w-[120px]">
                      {usuario.rol}
                    </div>
                  </div>
                </div>

                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="flex items-center space-x-1 px-2.5 py-1.5 text-xs text-rose-700 bg-rose-50 hover:bg-rose-100/80 border border-rose-200 rounded-xl font-bold transition-all"
                    title="Cerrar sesión segura"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Salir</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Menú móvil */}
        <div className="flex lg:hidden overflow-x-auto py-2 space-x-1 border-t border-slate-100">
          {navItems.map((item) => {
            const activo = vistaActual === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onCambiarVista(item.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${activo
                    ? 'bg-[#691C32] text-white shadow-sm'
                    : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
                  }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
