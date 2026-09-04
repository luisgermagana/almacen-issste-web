import React from 'react';
import type { VistaWeb } from '../types';
import {
  LayoutDashboard,
  Boxes,
  Grid3X3,
  FileCheck2,
  Search,
  RefreshCw,
  Building2,
} from 'lucide-react';

interface NavbarProps {
  vistaActual: VistaWeb;
  onCambiarVista: (vista: VistaWeb) => void;
  realtimeActivo: boolean;
  cargando: boolean;
  onRefrescar: () => void;
  ultimaActualizacion: Date | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  vistaActual,
  onCambiarVista,
  realtimeActivo,
  cargando,
  onRefrescar,
}) => {
  const navItems: { id: VistaWeb; label: string; icon: React.ReactNode }[] = [
    {
      id: 'dashboard',
      label: 'Torre de Control',
      icon: <LayoutDashboard className="w-3.5 h-3.5" />,
    },
    {
      id: 'inventario',
      label: 'Inventario & Kardex',
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
      <div className="bg-[#691C32] text-white px-4 lg:px-8 py-1.5 flex items-center justify-between text-xs border-b border-[#BC955C]/40">
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

      {/* Navegación Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                Torre de Control & Monitoreo Operativo
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
                  className={`relative flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs transition-all duration-200 ${
                    activo
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
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-bold border transition-colors ${
                realtimeActivo
                  ? 'bg-emerald-500/10 text-emerald-800 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-800 border-amber-500/30'
              }`}
              title={realtimeActivo ? 'Conectado a WebSockets de Supabase en vivo' : 'Modo estándar'}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  realtimeActivo ? 'bg-emerald-500 realtime-live-dot' : 'bg-amber-500'
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
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  activo
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
