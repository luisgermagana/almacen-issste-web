import React from 'react';
import { VistaWeb } from '../types';
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
  ultimaActualizacion,
}) => {
  const navItems: { id: VistaWeb; label: string; icon: React.ReactNode }[] = [
    {
      id: 'dashboard',
      label: 'Torre de Control',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'inventario',
      label: 'Inventario & Kardex',
      icon: <Boxes className="w-4 h-4" />,
    },
    {
      id: 'racks',
      label: 'Mapa de Racks & QR',
      icon: <Grid3X3 className="w-4 h-4" />,
    },
    {
      id: 'auditoria',
      label: 'Auditoría & Registros',
      icon: <FileCheck2 className="w-4 h-4" />,
    },
    {
      id: 'verificador',
      label: 'Verificador de Folios',
      icon: <Search className="w-4 h-4" />,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm no-print">
      {/* Barra superior de gobierno institucional */}
      <div className="bg-[#691C32] text-white px-4 lg:px-8 py-1.5 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-3">
          <span className="font-semibold tracking-wide uppercase text-slate-100">
            Gobierno de México
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-[#DFC79B] font-medium hidden sm:inline">
            Instituto de Seguridad y Servicios Sociales de los Trabajadores del Estado
          </span>
        </div>
        <div className="flex items-center space-x-3 text-[11px]">
          <span className="text-slate-200 hidden md:inline">
            Almacén Central y Centro de Distribución
          </span>
          <span className="px-2 py-0.5 rounded-full bg-[#8B1E3F] text-white font-medium">
            México
          </span>
        </div>
      </div>

      {/* Franja dorada de separación institucional */}
      <div className="h-1 bg-[#BC955C] w-full" />

      {/* Navegación Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo y Nombre del Sistema */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onCambiarVista('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-[#691C32] text-white flex items-center justify-center shadow-md border border-[#BC955C]">
              <Building2 className="w-5 h-5 text-[#DFC79B]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base tracking-tight text-[#691C32] font-['Montserrat']">
                  ALMACÉN ISSSTE
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-[#FDF2F4] text-[#691C32] border border-[#F7D6DC] rounded">
                  WEB CENTRAL
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Torre de Control & Monitoreo Operativo
              </p>
            </div>
          </div>

          {/* Menú de Vistas */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const activo = vistaActual === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onCambiarVista(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activo
                      ? 'bg-[#691C32] text-white shadow-sm'
                      : 'text-slate-600 hover:text-[#691C32] hover:bg-[#FDF2F4]'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Estado de Supabase Realtime y Refrescar */}
          <div className="flex items-center space-x-3">
            {/* Badge Realtime */}
            <div
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                realtimeActivo
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
              title={realtimeActivo ? 'Suscrito a cambios en vivo vía Supabase Realtime' : 'Modo estándar'}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  realtimeActivo ? 'bg-emerald-500 realtime-live-dot' : 'bg-amber-500'
                }`}
              />
              <span className="hidden sm:inline">
                {realtimeActivo ? 'En Vivo' : 'Desconectado'}
              </span>
            </div>

            {/* Botón Refrescar */}
            <button
              onClick={onRefrescar}
              disabled={cargando}
              className="p-2 text-slate-500 hover:text-[#691C32] hover:bg-slate-100 rounded-lg transition-colors"
              title="Actualizar datos ahora"
            >
              <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin text-[#691C32]' : ''}`} />
            </button>
          </div>
        </div>

        {/* Menú móvil */}
        <div className="flex md:hidden overflow-x-auto py-2 space-x-1 border-t border-slate-100">
          {navItems.map((item) => {
            const activo = vistaActual === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onCambiarVista(item.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                  activo
                    ? 'bg-[#691C32] text-white'
                    : 'text-slate-600 bg-slate-100'
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
