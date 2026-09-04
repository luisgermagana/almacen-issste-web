import React from 'react';
import {
  ItemInventario,
  RegistroRecepcion,
  RegistroEnvio,
  MovimientoUnificado,
  VistaWeb,
} from '../types';
import { MetricCard } from '../components/MetricCard';
import {
  Boxes,
  ArrowDownLeft,
  ArrowUpRight,
  Hospital,
  AlertTriangle,
  FileSpreadsheet,
  FileText,
  Clock,
  Eye,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { exportarInventarioAExcel } from '../services/exportExcel';
import { exportarReporteEjecutivoPdf } from '../services/exportPdf';

interface DashboardViewProps {
  inventario: ItemInventario[];
  recepciones: RegistroRecepcion[];
  envios: RegistroEnvio[];
  movimientos: MovimientoUnificado[];
  onVerFolio: (movimiento: MovimientoUnificado) => void;
  onCambiarVista: (vista: VistaWeb) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  inventario,
  recepciones,
  envios,
  movimientos,
  onVerFolio,
  onCambiarVista,
}) => {
  // Cálculos de métricas globales
  const totalRecibidoPiezas = recepciones.reduce((sum, r) => sum + (Number(r.cantidad) || 0), 0);
  const totalEnviadoPiezas = envios.reduce((sum, e) => sum + (Number(e.cantidad) || 0), 0);
  const totalDisponiblePiezas = Math.max(0, totalRecibidoPiezas - totalEnviadoPiezas);

  const destinosUnicos = Array.from(new Set(envios.map((e) => e.destino.trim()))).filter(Boolean);
  const itemsCriticos = inventario.filter((i) => i.estatus === 'bajo' || i.estatus === 'agotado');

  // Datos para gráfica de Top Hospitales Receptores
  const mapaHospitales: Record<string, number> = {};
  envios.forEach((e) => {
    const dest = e.destino.trim() || 'Sin Especificar';
    mapaHospitales[dest] = (mapaHospitales[dest] || 0) + (Number(e.cantidad) || 1);
  });

  const dataTopHospitales = Object.entries(mapaHospitales)
    .map(([nombre, piezas]) => ({ nombre: nombre.replace('HOSPITAL ', 'H. ').replace('CLINICA HOSPITAL ', 'CH '), piezas }))
    .sort((a, b) => b.piezas - a.piezas)
    .slice(0, 5);

  // Datos para gráfica de dona por Categoría
  const mapaCategorias: Record<string, number> = {};
  inventario.forEach((item) => {
    const cat = item.categoria || 'Otros';
    mapaCategorias[cat] = (mapaCategorias[cat] || 0) + item.disponible;
  });

  const dataCategorias = Object.entries(mapaCategorias).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS_PIE = ['#691C32', '#BC955C', '#10312B', '#1B4D7E', '#8F6B38'];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Banner de Bienvenida y Acciones de Exportación */}
      <div className="bg-gradient-to-r from-[#691C32] via-[#4C1021] to-[#10312B] rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        {/* Decoración dorada */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#BC955C]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-[#DFC79B] mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 realtime-live-dot" />
              <span>Sincronización en Tiempo Real con Almacenes</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-['Montserrat'] tracking-tight">
              Torre de Control Operativo
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Monitoreo ejecutivo de existencias, recepción de insumos médicos y despachos hacia unidades hospitalarias del ISSSTE a nivel nacional.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => exportarInventarioAExcel(inventario, recepciones, envios)}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold backdrop-blur-md transition-all shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Exportar Excel</span>
            </button>
            <button
              onClick={() => exportarReporteEjecutivoPdf(inventario)}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#BC955C] hover:bg-[#8F6B38] text-slate-900 text-xs font-bold transition-all shadow-md"
            >
              <FileText className="w-4 h-4 text-slate-900" />
              <span>Reporte PDF Oficial</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid de Métricas Clave */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          titulo="Existencias en Almacén"
          valor={`${totalDisponiblePiezas} pzas`}
          subtitulo={`${inventario.length} bienes catalogados`}
          icon={<Boxes className="w-6 h-6" />}
          color="guinda"
          tendencia={{ texto: 'Stock Central', positiva: true }}
        />
        <MetricCard
          titulo="Total Recepciones"
          valor={`${totalRecibidoPiezas} pzas`}
          subtitulo={`${recepciones.length} folios procesados`}
          icon={<ArrowDownLeft className="w-6 h-6" />}
          color="verde"
          tendencia={{ texto: 'Entradas registradas', positiva: true }}
        />
        <MetricCard
          titulo="Total Despachos"
          valor={`${totalEnviadoPiezas} pzas`}
          subtitulo={`${envios.length} salidas de transporte`}
          icon={<ArrowUpRight className="w-6 h-6" />}
          color="dorado"
          tendencia={{ texto: 'Envíos en tránsito', positiva: true }}
        />
        <MetricCard
          titulo="Hospitales Atendidos"
          valor={`${destinosUnicos.length} clínicas`}
          subtitulo="Destinos del ISSSTE"
          icon={<Hospital className="w-6 h-6" />}
          color="azul"
          tendencia={{ texto: 'Red Hospitalaria', positiva: true }}
        />
      </div>

      {/* Sección de Alertas de Stock Crítico (si las hay) */}
      {itemsCriticos.length > 0 && (
        <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900 font-['Montserrat']">
                Atención Operativa: {itemsCriticos.length} bien(es) con inventario bajo o agotado
              </h4>
              <p className="text-xs text-amber-700 mt-0.5">
                {itemsCriticos.map((i) => `${i.nombre} (${i.disponible} pza)`).slice(0, 3).join(' • ')}
                {itemsCriticos.length > 3 ? ` y ${itemsCriticos.length - 3} más` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={() => onCambiarVista('inventario')}
            className="px-4 py-2 bg-amber-700 text-white rounded-xl text-xs font-bold hover:bg-amber-800 transition-colors shrink-0"
          >
            Revisar Inventario
          </button>
        </div>
      )}

      {/* Gráficas Principales */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Gráfica de Top Hospitales Receptores */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-['Montserrat'] uppercase tracking-wider">
                  Top 5 Hospitales y Unidades Médicas Receptoras
                </h3>
                <p className="text-xs text-slate-500">Volumen de piezas suministradas por destino</p>
              </div>
              <span className="p-2 bg-slate-50 rounded-lg text-slate-400">
                <TrendingUp className="w-4 h-4 text-[#BC955C]" />
              </span>
            </div>

            <div className="h-64 w-full">
              {dataTopHospitales.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dataTopHospitales} layout="vertical" margin={{ left: 20, right: 30, top: 10, bottom: 10 }}>
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} />
                    <YAxis
                      dataKey="nombre"
                      type="category"
                      tick={{ fontSize: 11, fill: '#1E293B', fontWeight: 600 }}
                      width={120}
                    />
                    <Tooltip
                      formatter={(val) => [`${val} piezas despachadas`, 'Total']}
                      contentStyle={{ backgroundColor: '#0F172A', color: '#FFF', borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Bar dataKey="piezas" fill="#691C32" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No hay envíos registrados aún
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Gráfica de Categorías */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-['Montserrat'] uppercase tracking-wider">
                  Distribución de Stock Disponible
                </h3>
                <p className="text-xs text-slate-500">Por categoría de insumo</p>
              </div>
            </div>

            <div className="h-64 w-full flex items-center justify-center">
              {dataCategorias.length > 0 && totalDisponiblePiezas > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dataCategorias}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {dataCategorias.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS_PIE[index % COLORS_PIE.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val) => [`${val} piezas`, 'Disponible']}
                      contentStyle={{ backgroundColor: '#0F172A', color: '#FFF', borderRadius: '8px', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-xs text-slate-400">Sin existencias activas para graficar</div>
              )}
            </div>

            {/* Leyenda */}
            <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-slate-100">
              {dataCategorias.slice(0, 4).map((c, i) => (
                <div key={i} className="flex items-center space-x-1.5 text-xs text-slate-600">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: COLORS_PIE[i % COLORS_PIE.length] }}
                  />
                  <span className="truncate">{c.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Feed en Vivo de Últimos Movimientos */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-[#691C32]" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-['Montserrat'] uppercase tracking-wider">
                Movimientos Recientes en Bodega y Andenes
              </h3>
              <p className="text-xs text-slate-500">Últimos folios registrados desde la app móvil</p>
            </div>
          </div>
          <button
            onClick={() => onCambiarVista('auditoria')}
            className="text-xs font-bold text-[#691C32] hover:text-[#4C1021] transition-colors"
          >
            Ver todos los movimientos →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase">
                <th className="py-2.5 px-3">Tipo</th>
                <th className="py-2.5 px-3">Folio</th>
                <th className="py-2.5 px-3">Bien / Insumo</th>
                <th className="py-2.5 px-3">Cantidad</th>
                <th className="py-2.5 px-3">Destino / Origen</th>
                <th className="py-2.5 px-3">Operador</th>
                <th className="py-2.5 px-3">Fecha</th>
                <th className="py-2.5 px-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {movimientos.slice(0, 6).map((m) => {
                const esRec = m.tipo === 'RECEPCION';
                return (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md font-bold text-[10px] ${
                          esRec
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-blue-50 text-blue-800 border border-blue-200'
                        }`}
                      >
                        {esRec ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                        <span>{esRec ? 'RECEPCIÓN' : 'ENVÍO'}</span>
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-[#691C32]">{m.folio}</td>
                    <td className="py-3 px-3 font-semibold text-slate-800">{m.bien_nombre}</td>
                    <td className="py-3 px-3 font-bold text-slate-900">{m.cantidad} pza</td>
                    <td className="py-3 px-3 text-slate-600 truncate max-w-xs">{m.destinoOProveedor}</td>
                    <td className="py-3 px-3 text-slate-500">{m.responsable}</td>
                    <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                      {new Date(m.fecha).toLocaleDateString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onVerFolio(m)}
                        className="p-1.5 text-slate-500 hover:text-[#691C32] hover:bg-[#FDF2F4] rounded-lg transition-colors inline-flex items-center space-x-1"
                        title="Ver comprobante oficial"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-semibold">Ver</span>
                      </button>
                    </td>
                  </tr>
                );
              })}

              {movimientos.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No se han registrado recepciones ni envíos aún.
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
