import React, { useState } from 'react';
import { ItemInventario, RegistroRecepcion, RegistroEnvio, MovimientoUnificado } from '../types';
import {
  Boxes,
  Search,
  Filter,
  FileSpreadsheet,
  FileText,
  AlertCircle,
  CheckCircle2,
  XCircle,
  History,
  ArrowDownLeft,
  ArrowUpRight,
  Eye,
} from 'lucide-react';
import { exportarInventarioAExcel } from '../services/exportExcel';
import { exportarReporteEjecutivoPdf } from '../services/exportPdf';

interface InventarioViewProps {
  inventario: ItemInventario[];
  recepciones: RegistroRecepcion[];
  envios: RegistroEnvio[];
  onVerFolioPorId: (folio: string) => void;
}

export const InventarioView: React.FC<InventarioViewProps> = ({
  inventario,
  recepciones,
  envios,
  onVerFolioPorId,
}) => {
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstatus, setFiltroEstatus] = useState<'todos' | 'optimo' | 'bajo' | 'agotado'>('todos');
  const [bienSeleccionadoKardex, setBienSeleccionadoKardex] = useState<ItemInventario | null>(null);

  // Filtrado
  const inventarioFiltrado = inventario.filter((item) => {
    const coincideTexto =
      item.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.categoria.toLowerCase().includes(busqueda.toLowerCase());

    const coincideEstatus =
      filtroEstatus === 'todos' ? true : item.estatus === filtroEstatus;

    return coincideTexto && coincideEstatus;
  });

  // Movimientos de Kardex para el bien seleccionado
  const kardexMovimientos = bienSeleccionadoKardex
    ? [
        ...recepciones
          .filter((r) => r.bien_nombre.toLowerCase() === bienSeleccionadoKardex.nombre.toLowerCase())
          .map((r) => ({
            id: r.id,
            folio: r.folio,
            tipo: 'ENTRADA' as const,
            fecha: r.fecha,
            cantidad: r.cantidad,
            documento: r.tipo_documento,
            origenDestino: 'Proveedor / Fabricante',
            responsable: r.recibido_por,
          })),
        ...envios
          .filter((e) => e.bien_nombre.toLowerCase() === bienSeleccionadoKardex.nombre.toLowerCase())
          .map((e) => ({
            id: e.id,
            folio: e.folio,
            tipo: 'SALIDA' as const,
            fecha: e.fecha,
            cantidad: e.cantidad,
            documento: e.tipo_transporte,
            origenDestino: e.destino,
            responsable: e.enviado_por,
          })),
      ].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    : [];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header de Vista */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <Boxes className="w-6 h-6 text-[#691C32]" />
            <h1 className="text-xl font-extrabold text-slate-900 font-['Montserrat']">
              Control de Inventario & Kardex
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Existencias en tiempo real, balance de recepciones vs. despachos y trazabilidad por producto.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => exportarInventarioAExcel(inventario, recepciones, envios)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-bold transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Descargar Excel</span>
          </button>
          <button
            onClick={() => exportarReporteEjecutivoPdf(inventario)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#691C32] text-white hover:bg-[#4C1021] rounded-xl text-xs font-bold transition-colors shadow-sm"
          >
            <FileText className="w-4 h-4" />
            <span>Imprimir Informe PDF</span>
          </button>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por bien, equipo o categoría..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#691C32] bg-slate-50"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto text-xs">
          <span className="text-slate-400 font-medium flex items-center space-x-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Estatus:</span>
          </span>
          <button
            onClick={() => setFiltroEstatus('todos')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              filtroEstatus === 'todos'
                ? 'bg-[#691C32] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos ({inventario.length})
          </button>
          <button
            onClick={() => setFiltroEstatus('optimo')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              filtroEstatus === 'optimo'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Óptimo
          </button>
          <button
            onClick={() => setFiltroEstatus('bajo')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              filtroEstatus === 'bajo'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Bajo (≤ 5)
          </button>
          <button
            onClick={() => setFiltroEstatus('agotado')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              filtroEstatus === 'agotado'
                ? 'bg-rose-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Agotado (0)
          </button>
        </div>
      </div>

      {/* Grid Principal: Tabla de Inventario + Panel Lateral de Kardex si hay seleccionado */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Tabla de Inventario */}
        <div className={`${bienSeleccionadoKardex ? 'lg:col-span-7' : 'lg:col-span-12'} bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                  <th className="py-3 px-4">Bien / Insumo</th>
                  <th className="py-3 px-4 text-center">Recibido</th>
                  <th className="py-3 px-4 text-center">Enviado</th>
                  <th className="py-3 px-4 text-center">Disponible</th>
                  <th className="py-3 px-4">Estatus</th>
                  <th className="py-3 px-4 text-right">Kardex</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inventarioFiltrado.map((item, idx) => {
                  const estaSeleccionado = bienSeleccionadoKardex?.nombre === item.nombre;
                  return (
                    <tr
                      key={idx}
                      onClick={() => setBienSeleccionadoKardex(item)}
                      className={`cursor-pointer transition-colors ${
                        estaSeleccionado ? 'bg-[#FDF2F4] border-l-4 border-[#691C32]' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{item.nombre}</div>
                        <div className="text-[11px] text-slate-400">{item.categoria}</div>
                      </td>
                      <td className="py-3 px-4 text-center font-semibold text-slate-700">
                        {item.totalRecibido}
                      </td>
                      <td className="py-3 px-4 text-center font-semibold text-slate-700">
                        {item.totalEnviado}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg font-black font-mono text-xs ${
                            item.disponible > 5
                              ? 'bg-emerald-50 text-emerald-800'
                              : item.disponible > 0
                              ? 'bg-amber-50 text-amber-800'
                              : 'bg-rose-50 text-rose-800'
                          }`}
                        >
                          {item.disponible} pza(s)
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {item.estatus === 'optimo' && (
                          <span className="inline-flex items-center space-x-1 text-emerald-700 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Óptimo</span>
                          </span>
                        )}
                        {item.estatus === 'bajo' && (
                          <span className="inline-flex items-center space-x-1 text-amber-700 font-semibold">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Stock Bajo</span>
                          </span>
                        )}
                        {item.estatus === 'agotado' && (
                          <span className="inline-flex items-center space-x-1 text-rose-700 font-semibold">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Agotado</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setBienSeleccionadoKardex(item);
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-[#691C32] hover:text-white rounded-lg font-semibold text-[11px] transition-colors"
                        >
                          Kardex
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {inventarioFiltrado.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No se encontraron insumos que coincidan con la búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Panel Lateral de Kardex */}
        {bienSeleccionadoKardex && (
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 animate-fadeIn">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <History className="w-5 h-5 text-[#691C32]" />
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 font-['Montserrat']">
                    Kardex de Movimientos
                  </h3>
                  <p className="text-xs text-slate-500">{bienSeleccionadoKardex.nombre}</p>
                </div>
              </div>
              <button
                onClick={() => setBienSeleccionadoKardex(null)}
                className="text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                Cerrar
              </button>
            </div>

            {/* Resumen de Stock del Bien */}
            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Ingresadas</span>
                <span className="text-base font-black text-slate-800">{bienSeleccionadoKardex.totalRecibido}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Despachadas</span>
                <span className="text-base font-black text-slate-800">{bienSeleccionadoKardex.totalEnviado}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#691C32] uppercase block">En Bodega</span>
                <span className="text-base font-black text-[#691C32]">{bienSeleccionadoKardex.disponible}</span>
              </div>
            </div>

            {/* Timeline de Movimientos */}
            <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Historial Cronológico ({kardexMovimientos.length} eventos)
              </h4>

              {kardexMovimientos.map((mov, i) => {
                const esEntrada = mov.tipo === 'ENTRADA';
                return (
                  <div
                    key={i}
                    className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start space-x-2.5">
                      <div
                        className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                          esEntrada ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {esEntrada ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-slate-800 font-mono">{mov.folio}</span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                              esEntrada ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                            }`}
                          >
                            {mov.tipo}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {mov.origenDestino} • {mov.responsable}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(mov.fecha).toLocaleString('es-MX')}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className={`font-black font-mono text-sm ${esEntrada ? 'text-emerald-700' : 'text-blue-700'}`}>
                        {esEntrada ? `+${mov.cantidad}` : `-${mov.cantidad}`}
                      </div>
                      <button
                        onClick={() => onVerFolioPorId(mov.folio)}
                        className="text-[10px] text-[#691C32] hover:underline font-semibold"
                      >
                        Ver Vale
                      </button>
                    </div>
                  </div>
                );
              })}

              {kardexMovimientos.length === 0 && (
                <p className="text-xs text-slate-400 italic text-center py-4">
                  Sin movimientos registrados para este insumo.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
