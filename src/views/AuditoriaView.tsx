import React, { useState } from 'react';
import {
  RegistroRecepcion,
  RegistroEnvio,
  MovimientoUnificado,
  ItemInventario,
} from '../types';
import {
  FileCheck2,
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  Camera,
  FileSpreadsheet,
  FileText,
  Eye,
  Calendar,
} from 'lucide-react';
import { exportarInventarioAExcel } from '../services/exportExcel';
import { exportarRecepcionPdf, exportarEnvioPdf } from '../services/exportPdf';

interface AuditoriaViewProps {
  recepciones: RegistroRecepcion[];
  envios: RegistroEnvio[];
  movimientos: MovimientoUnificado[];
  inventario: ItemInventario[];
  onVerFolio: (movimiento: MovimientoUnificado) => void;
  onVerFotos: (fotos: string[], titulo: string) => void;
}

export const AuditoriaView: React.FC<AuditoriaViewProps> = ({
  recepciones,
  envios,
  movimientos,
  inventario,
  onVerFolio,
  onVerFotos,
}) => {
  const [tabActual, setTabActual] = useState<'todos' | 'recepciones' | 'envios'>('todos');
  const [busqueda, setBusqueda] = useState('');

  // Filtrado
  const movimientosFiltrados = movimientos.filter((m) => {
    // Pestaña
    if (tabActual === 'recepciones' && m.tipo !== 'RECEPCION') return false;
    if (tabActual === 'envios' && m.tipo !== 'ENVIO') return false;

    // Búsqueda
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      const coincide =
        m.folio.toLowerCase().includes(q) ||
        m.bien_nombre.toLowerCase().includes(q) ||
        m.destinoOProveedor.toLowerCase().includes(q) ||
        m.responsable.toLowerCase().includes(q);
      if (!coincide) return false;
    }

    return true;
  });

  const handleDescargaPdfFila = async (e: React.MouseEvent, m: MovimientoUnificado) => {
    e.stopPropagation();
    if (m.tipo === 'RECEPCION') {
      await exportarRecepcionPdf(m.datosOriginales as RegistroRecepcion);
    } else {
      await exportarEnvioPdf(m.datosOriginales as RegistroEnvio);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <FileCheck2 className="w-6 h-6 text-[#691C32]" />
            <h1 className="text-xl font-extrabold text-slate-900 font-['Montserrat']">
              Auditoría & Expedientes Digitales
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Registro oficial y trazabilidad de todas las remisiones, vales de salida y transportes del ISSSTE.
          </p>
        </div>

        <button
          onClick={() => exportarInventarioAExcel(inventario, recepciones, envios)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-bold transition-colors shadow-sm"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>Exportar Todo a Excel (.xlsx)</span>
        </button>
      </div>

      {/* Pestañas y Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Selector de Pestañas */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setTabActual('todos')}
            className={`px-4 py-2 rounded-lg transition-all ${
              tabActual === 'todos'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todos ({movimientos.length})
          </button>
          <button
            onClick={() => setTabActual('recepciones')}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg transition-all ${
              tabActual === 'recepciones'
                ? 'bg-[#691C32] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
            <span>Recepciones ({recepciones.length})</span>
          </button>
          <button
            onClick={() => setTabActual('envios')}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg transition-all ${
              tabActual === 'envios'
                ? 'bg-[#BC955C] text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-blue-700" />
            <span>Envíos ({envios.length})</span>
          </button>
        </div>

        {/* Buscador */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por folio, insumo, operador o destino..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#691C32] bg-slate-50"
          />
        </div>
      </div>

      {/* Tabla de Registros */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                <th className="py-3 px-4">Tipo</th>
                <th className="py-3 px-4">Folio Oficial</th>
                <th className="py-3 px-4">Fecha y Hora</th>
                <th className="py-3 px-4">Bien / Equipo</th>
                <th className="py-3 px-4 text-center">Cantidad</th>
                <th className="py-3 px-4">Destino / Soporte</th>
                <th className="py-3 px-4">Responsable</th>
                <th className="py-3 px-4 text-center">Fotos</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {movimientosFiltrados.map((m) => {
                const esRec = m.tipo === 'RECEPCION';
                const fotos = esRec
                  ? [
                      ...((m.datosOriginales as RegistroRecepcion).fotos_bien || []),
                      ...((m.datosOriginales as RegistroRecepcion).fotos_documento || []),
                      ...((m.datosOriginales as RegistroRecepcion).fotos_serie || []),
                    ]
                  : (m.datosOriginales as RegistroEnvio).fotos_camion || [];

                return (
                  <tr
                    key={m.id}
                    onClick={() => onVerFolio(m)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-md font-extrabold text-[10px] ${
                          esRec
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-blue-50 text-blue-800 border border-blue-200'
                        }`}
                      >
                        {esRec ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                        <span>{esRec ? 'RECEPCIÓN' : 'ENVÍO'}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#691C32]">{m.folio}</td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(m.fecha).toLocaleString('es-MX', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{m.bien_nombre}</td>
                    <td className="py-3.5 px-4 text-center font-mono font-extrabold text-slate-800">
                      {m.cantidad} pza
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">{m.destinoOProveedor}</td>
                    <td className="py-3.5 px-4 text-slate-500">{m.responsable}</td>
                    <td className="py-3.5 px-4 text-center">
                      {fotos.length > 0 ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onVerFotos(fotos, `Evidencias • ${m.folio}`);
                          }}
                          className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-slate-100 hover:bg-[#FDF2F4] text-slate-700 hover:text-[#691C32] font-semibold text-[11px] transition-colors"
                        >
                          <Camera className="w-3 h-3 text-[#BC955C]" />
                          <span>{fotos.length}</span>
                        </button>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center space-x-1">
                        <button
                          onClick={(e) => handleDescargaPdfFila(e, m)}
                          className="p-1.5 text-slate-400 hover:text-[#691C32] hover:bg-slate-100 rounded-lg transition-colors"
                          title="Descargar PDF Oficial"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onVerFolio(m);
                          }}
                          className="p-1.5 text-slate-400 hover:text-[#691C32] hover:bg-slate-100 rounded-lg transition-colors"
                          title="Ver Expediente Completo"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {movimientosFiltrados.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No se encontraron registros de auditoría que coincidan con el filtro.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
