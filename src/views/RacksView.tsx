import React, { useState } from 'react';
import { RackEstanteria, CeldaRack, Producto } from '../types';
import { racksService } from '../services/racksStorage';
import {
  Grid3X3,
  QrCode,
  Search,
  Printer,
  Info,
  Layers,
  MapPin,
  CheckCircle2,
  PackageCheck,
  PlusCircle,
} from 'lucide-react';

interface RacksViewProps {
  productosCatalogo: Producto[];
  onSeleccionarCelda: (celda: CeldaRack) => void;
}

export const RacksView: React.FC<RacksViewProps> = ({
  productosCatalogo,
  onSeleccionarCelda,
}) => {
  const [racks] = useState<RackEstanteria[]>(racksService.getRacks());
  const [celdas, setCeldas] = useState<CeldaRack[]>(racksService.getCeldas());
  const [rackActivoId, setRackActivoId] = useState<string>('RACK-A');
  const [busqueda, setBusqueda] = useState<string>('');

  const rackActivo = racks.find((r) => r.id === rackActivoId) || racks[0];

  // Recargar celdas cuando se actualicen en el modal
  const refrescarCeldas = () => {
    setCeldas(racksService.getCeldas());
  };

  // Celdas pertenecientes al rack activo
  const celdasDelRack = celdas.filter((c) => c.rackId === rackActivo.id);

  // Estadísticas del rack
  const totalEspacios = celdasDelRack.length;
  const espaciosOcupados = celdasDelRack.filter((c) => !!c.bienNombre).length;
  const porcentajeOcupacion = totalEspacios > 0 ? Math.round((espaciosOcupados / totalEspacios) * 100) : 0;

  // Filtrado de búsqueda global de ubicaciones
  const celdasCoincidentes = busqueda.trim()
    ? celdas.filter(
        (c) =>
          (c.bienNombre && c.bienNombre.toLowerCase().includes(busqueda.toLowerCase())) ||
          c.codigoUbicacion.toLowerCase().includes(busqueda.toLowerCase()) ||
          (c.lote && c.lote.toLowerCase().includes(busqueda.toLowerCase()))
      )
    : [];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Institucional */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-[#FDF2F4] text-[#691C32]">
              <Grid3X3 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 font-['Montserrat']">
                Plano Visual de Racks & Marbetes QR
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Distribución física de estanterías en bodega central. Asigna bienes y genera etiquetas QR para escaneo móvil.
              </p>
            </div>
          </div>
        </div>

        {/* Buscador de ubicación por producto */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Localizar bien o código (ej. RCK-A)..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#691C32] bg-slate-50"
          />
        </div>
      </div>

      {/* Resultados de búsqueda si hay término ingresado */}
      {busqueda.trim() && (
        <div className="bg-white rounded-2xl p-5 border border-[#BC955C]/40 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#691C32] uppercase tracking-wider">
              Resultados de Ubicación ({celdasCoincidentes.length} encontrados)
            </h3>
            <button onClick={() => setBusqueda('')} className="text-xs text-slate-400 hover:text-slate-600 font-bold">
              Limpiar búsqueda
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {celdasCoincidentes.map((c) => (
              <div
                key={c.id}
                onClick={() => onSeleccionarCelda(c)}
                className="p-3 rounded-xl border border-slate-200 hover:border-[#691C32] hover:shadow-md cursor-pointer transition-all bg-slate-50/70"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono font-bold text-xs text-[#691C32] bg-[#FDF2F4] px-2 py-0.5 rounded border border-[#F7D6DC]">
                    {c.codigoUbicacion}
                  </span>
                  <QrCode className="w-4 h-4 text-[#BC955C]" />
                </div>
                <div className="font-bold text-xs text-slate-900 leading-tight">
                  {c.bienNombre || 'Espacio Vacío'}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {c.rackNombre} • Nivel {c.nivel} • Posición {c.posicion}
                </div>
                {c.cantidad && (
                  <div className="text-[11px] font-bold text-emerald-700 mt-0.5">
                    {c.cantidad} pzas en stock
                  </div>
                )}
              </div>
            ))}
            {celdasCoincidentes.length === 0 && (
              <p className="text-xs text-slate-400 py-2">No se encontraron ubicaciones para "{busqueda}".</p>
            )}
          </div>
        </div>
      )}

      {/* Selector de Racks */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        {racks.map((rack) => {
          const activo = rack.id === rackActivo.id;
          const celdasR = celdas.filter((c) => c.rackId === rack.id);
          const ocupadasR = celdasR.filter((c) => !!c.bienNombre).length;

          return (
            <button
              key={rack.id}
              onClick={() => setRackActivoId(rack.id)}
              className={`flex items-center space-x-3 px-5 py-3 rounded-2xl border text-xs font-bold transition-all shrink-0 ${
                activo
                  ? 'bg-[#691C32] text-white border-[#691C32] shadow-md scale-[1.01]'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-black ${
                  activo ? 'bg-white/20 text-[#DFC79B]' : 'bg-slate-100 text-[#691C32]'
                }`}
              >
                {rack.id.replace('RACK-', '')}
              </div>
              <div className="text-left">
                <div className="font-extrabold">{rack.nombre}</div>
                <div className={`text-[10px] font-medium ${activo ? 'text-slate-200' : 'text-slate-400'}`}>
                  {ocupadasR} / {celdasR.length} espacios ocupados
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Información del Rack Seleccionado y Barra de Ocupación */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs font-bold text-[#691C32] bg-[#FDF2F4] px-2 py-0.5 rounded border border-[#F7D6DC]">
              {rackActivo.id}
            </span>
            <h2 className="text-base font-extrabold text-slate-900 font-['Montserrat']">
              {rackActivo.nombre}
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            <strong>Ubicación en Bodega:</strong> {rackActivo.pasillo} • {rackActivo.descripcion}
          </p>
        </div>

        {/* Barra de Porcentaje */}
        <div className="flex items-center space-x-4 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 shrink-0">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">Capacidad Utilizada</div>
            <div className="text-sm font-extrabold text-slate-900 font-mono">
              {espaciosOcupados} de {totalEspacios} posiciones ({porcentajeOcupacion}%)
            </div>
          </div>
          <div className="w-24 h-2.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#691C32] rounded-full transition-all duration-500"
              style={{ width: `${porcentajeOcupacion}%` }}
            />
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* VISTA Y DIBUJO ESTRUCTURAL 2D DEL RACK                         */}
      {/* ============================================================== */}
      <div className="bg-gradient-to-b from-slate-100 to-slate-200 rounded-3xl p-6 sm:p-8 border-2 border-slate-300 shadow-inner relative">
        {/* Guía instructiva superior */}
        <div className="mb-6 flex items-center justify-between text-xs text-slate-600 bg-white/80 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-300/80 shadow-sm">
          <div className="flex items-center space-x-2">
            <Info className="w-4 h-4 text-[#BC955C]" />
            <span>
              Haz clic en cualquier espacio para <strong>asignar bienes</strong> o <strong>imprimir su Marbete con Código QR</strong>.
            </span>
          </div>
          <div className="flex items-center space-x-4 text-[11px] font-medium hidden sm:flex">
            <span className="flex items-center space-x-1">
              <span className="w-3 h-3 rounded bg-[#691C32]" />
              <span>Ocupado</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-3 h-3 rounded bg-white border border-dashed border-slate-400" />
              <span>Disponible</span>
            </span>
          </div>
        </div>

        {/* Estructura del Rack con Vigas Metálicas */}
        <div className="relative max-w-5xl mx-auto">
          {/* Postes laterales industriales (simulación gráfica) */}
          <div className="absolute -left-2 top-0 bottom-0 w-3 bg-slate-700 rounded-sm shadow-md border-r border-slate-500 z-10" />
          <div className="absolute -right-2 top-0 bottom-0 w-3 bg-slate-700 rounded-sm shadow-md border-l border-slate-500 z-10" />

          {/* Niveles del Rack (del nivel más alto N4 al más bajo N1) */}
          <div className="space-y-4 relative z-0">
            {Array.from({ length: rackActivo.niveles }, (_, i) => rackActivo.niveles - i).map((nivelNum) => {
              const celdasNivel = celdasDelRack.filter((c) => c.nivel === nivelNum);

              return (
                <div key={nivelNum} className="space-y-1.5">
                  {/* Etiqueta de Nivel */}
                  <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-600 uppercase px-2">
                    <span className="flex items-center space-x-1.5">
                      <Layers className="w-3.5 h-3.5 text-slate-500" />
                      <span>NIVEL {nivelNum} ({nivelNum === 4 ? 'Superior' : nivelNum === 1 ? 'Piso / Carga Pesada' : 'Intermedio'})</span>
                    </span>
                    <span className="text-slate-400 font-mono">
                      {celdasNivel.filter((c) => !!c.bienNombre).length} / {celdasNivel.length} ocupados
                    </span>
                  </div>

                  {/* Fila de Espacios / Celdas */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {celdasNivel.map((celda) => {
                      const ocupado = !!celda.bienNombre;

                      return (
                        <div
                          key={celda.id}
                          onClick={() => onSeleccionarCelda(celda)}
                          className={`relative rounded-2xl p-4 transition-all duration-200 cursor-pointer shadow-sm flex flex-col justify-between min-h-[140px] group ${
                            ocupado
                              ? 'bg-white border-2 border-[#691C32]/30 hover:border-[#691C32] hover:shadow-lg scale-[1.0]'
                              : 'bg-white/60 border-2 border-dashed border-slate-300 hover:bg-white hover:border-[#BC955C]'
                          }`}
                        >
                          {/* Cabecera de la Celda */}
                          <div className="flex items-start justify-between">
                            <span className="font-mono text-[10px] font-extrabold px-2 py-0.5 rounded bg-slate-100 text-slate-700 group-hover:bg-[#691C32] group-hover:text-white transition-colors">
                              {celda.codigoUbicacion}
                            </span>
                            <div className="p-1.5 rounded-lg bg-slate-50 text-slate-400 group-hover:text-[#691C32] group-hover:bg-[#FDF2F4] transition-colors">
                              <QrCode className="w-4 h-4" />
                            </div>
                          </div>

                          {/* Cuerpo de la Celda */}
                          <div className="my-2">
                            {ocupado ? (
                              <>
                                <div className="font-extrabold text-xs text-slate-900 line-clamp-2 leading-snug font-['Montserrat']">
                                  {celda.bienNombre}
                                </div>
                                <div className="mt-1 flex items-center space-x-2 text-[11px]">
                                  <span className="font-black text-[#691C32] font-mono">
                                    {celda.cantidad} pzas
                                  </span>
                                  {celda.lote && (
                                    <span className="text-slate-400 font-mono text-[10px] truncate">
                                      • {celda.lote}
                                    </span>
                                  )}
                                </div>
                              </>
                            ) : (
                              <div className="flex flex-col items-center justify-center py-2 text-center text-slate-400 group-hover:text-[#BC955C] transition-colors">
                                <PlusCircle className="w-5 h-5 mb-1" />
                                <span className="text-[11px] font-semibold">Espacio Libre</span>
                                <span className="text-[9px] text-slate-400">Clic para asignar</span>
                              </div>
                            )}
                          </div>

                          {/* Pie de la Celda: Acción rápida */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                            <span>Posición {celda.posicion}</span>
                            <span className="font-bold text-[#BC955C] group-hover:text-[#8F6B38] transition-colors">
                              {ocupado ? 'Ver Marbete' : 'Ocupar'} →
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Viga de Soporte de Acero Horizontal */}
                  <div className="h-2.5 bg-gradient-to-r from-slate-600 via-slate-500 to-slate-600 rounded-sm shadow-sm border-t border-slate-400" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
