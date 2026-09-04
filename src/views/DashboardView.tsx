import React from 'react';
import type {
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
  Activity,
  ArrowRight,
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

  const porcentajeDisponible = totalRecibidoPiezas > 0
    ? Math.round((totalDisponiblePiezas / totalRecibidoPiezas) * 100)
    : 0;

  const porcentajeDespachado = totalRecibidoPiezas > 0
    ? Math.round((totalEnviadoPiezas / totalRecibidoPiezas) * 100)
    : 0;

  const destinosUnicos = Array.from(new Set(envios.map((e) => e.destino.trim()))).filter(Boolean);
  const itemsCriticos = inventario.filter((i) => i.estatus === 'bajo' || i.estatus === 'agotado');

  // Datos para gráfica de Top Hospitales Receptores
  const mapaHospitales: Record<string, number> = {};
  envios.forEach((e) => {
    const dest = e.destino.trim() || 'Sin Especificar';
    mapaHospitales[dest] = (mapaHospitales[dest] || 0) + (Number(e.cantidad) || 1);
  });

  const dataTopHospitales = Object.entries(mapaHospitales)
    .map(([nombre, piezas]) => ({
      nombre: nombre.replace('HOSPITAL ', 'H. ').replace('CLINICA HOSPITAL ', 'CH '),
      piezas,
    }))
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
      {/* ============================================================== */}
      {/* HERO BANNER: ESTILO EXECUTIVE COMMAND CENTER (Taste Skill)      */}
      {/* ============================================================== */}
      <div className="relative bg-gradient-to-br from-[#120509] via-[#2A0B14] to-[#0A1412] rounded-3xl p-6 sm:p-8 text-white shadow-[0_24px_50px_-12px_rgba(105,28,50,0.35)] border border-[#BC955C]/30 overflow-hidden">
        {/* Luces de ambiente sutiles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#BC955C]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-[#691C32]/30 rounded-full blur-3xl pointer-events-none" />
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            {/* Status Chip con respiración verde */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-[#DFC79B]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 realtime-live-dot" />
              <span className="font-mono text-[11px] tracking-wide">SISTEMA EN VIVO • SUPABASE REALTIME</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black font-['Montserrat'] tracking-tight text-white leading-tight">
              Torre de Control Operativo
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Monitoreo ejecutivo de existencias, recepción de insumos médicos y despachos hacia unidades hospitalarias del ISSSTE a nivel nacional.
            </p>
          </div>

          {/* Botones con Sheen Bevel de Emil Kowalski */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => exportarInventarioAExcel(inventario, recepciones, envios)}
              className="sheen-button flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/25 text-white text-xs font-bold backdrop-blur-md transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Exportar Excel</span>
            </button>
            <button
              onClick={() => exportarReporteEjecutivoPdf(inventario)}
              className="sheen-button flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#BC955C] to-[#DFC79B] text-slate-950 text-xs font-black transition-all shadow-[0_10px_25px_-5px_rgba(188,149,92,0.4),inset_0_1px_0_rgba(255,255,255,0.4)]"
            >
              <FileText className="w-4 h-4 text-slate-950" />
              <span>Reporte PDF Oficial</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* GRID DE MÉTRICAS EJECUTIVAS (Bento Cards de Taste Skill)        */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          titulo="Existencias en Almacén"
          valor={`${totalDisponiblePiezas} pzas`}
          subtitulo={`${inventario.length} bienes en catálogo`}
          icon={<Boxes className="w-5 h-5" />}
          color="guinda"
          tendencia={{ texto: `${porcentajeDisponible}% disponible`, positiva: true }}
          porcentaje={porcentajeDisponible}
        />
        <MetricCard
          titulo="Total Recepciones"
          valor={`${totalRecibidoPiezas} pzas`}
          subtitulo={`${recepciones.length} folios procesados`}
          icon={<ArrowDownLeft className="w-5 h-5" />}
          color="verde"
          tendencia={{ texto: 'Entradas registradas', positiva: true }}
          porcentaje={100}
        />
        <MetricCard
          titulo="Total Despachos"
          valor={`${totalEnviadoPiezas} pzas`}
          subtitulo={`${envios.length} salidas de transporte`}
          icon={<ArrowUpRight className="w-5 h-5" />}
          color="dorado"
          tendencia={{ texto: `${porcentajeDespachado}% distribuido`, positiva: true }}
          porcentaje={porcentajeDespachado}
        />
        <MetricCard
          titulo="Hospitales Atendidos"
          valor={`${destinosUnicos.length} clínicas`}
          subtitulo="Destinos activos del ISSSTE"
          icon={<Hospital className="w-5 h-5" />}
          color="azul"
          tendencia={{ texto: 'Red Hospitalaria', positiva: true }}
        />
      </div>

      {/* ============================================================== */}
      {/* ALERTA OPERATIVA (Alerta refinada con borde y chip)            */}
      {/* ============================================================== */}
      {itemsCriticos.length > 0 && (
        <div className="relative bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-white rounded-2xl p-4 sm:p-5 border-l-4 border-l-amber-600 border border-amber-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded-full bg-amber-200/60 text-amber-900 font-black text-[10px] uppercase font-mono tracking-wider">
                  Alerta de Suministro
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {itemsCriticos.length} insumos en nivel crítico
                </span>
              </div>
              <h4 className="text-sm font-black text-slate-900 font-['Montserrat'] mt-1">
                Atención Operativa: {itemsCriticos.length} bien(es) con inventario bajo o en cero
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                {itemsCriticos
                  .map((i) => `${i.nombre} (${i.disponible} pza)`)
                  .slice(0, 3)
                  .join(' • ')}
                {itemsCriticos.length > 3 ? ` y ${itemsCriticos.length - 3} más` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={() => onCambiarVista('inventario')}
            className="flex items-center space-x-1.5 px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm shrink-0"
          >
            <span>Revisar en Inventario</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* GRÁFICAS PRINCIPALES (Bento Panels de Recharts)                */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Gráfica de Top Hospitales Receptores */}
        <div className="lg:col-span-7 glass-card rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                  LOGÍSTICA REGIONAL
                </span>
                <h3 className="text-base font-extrabold text-slate-900 font-['Montserrat']">
                  Top Hospitales y Unidades Médicas Receptoras
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Volumen total de piezas despachadas</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-100 text-slate-600">
                <TrendingUp className="w-4 h-4 text-[#BC955C]" />
              </div>
            </div>

            <div className="h-64 w-full">
              {dataTopHospitales.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dataTopHospitales}
                    layout="vertical"
                    margin={{ left: 10, right: 30, top: 10, bottom: 10 }}
                  >
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} />
                    <YAxis
                      dataKey="nombre"
                      type="category"
                      tick={{ fontSize: 11, fill: '#1E293B', fontWeight: 700 }}
                      width={130}
                    />
                    <Tooltip
                      formatter={(val) => [`${val} piezas despachadas`, 'Volumen']}
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        color: '#FFF',
                        borderRadius: '12px',
                        fontSize: '12px',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}
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
        <div className="lg:col-span-5 glass-card rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                  COMPOSICIÓN DE STOCK
                </span>
                <h3 className="text-base font-extrabold text-slate-900 font-['Montserrat']">
                  Distribución Disponible
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Por categoría de insumo médico</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-100 text-slate-600">
                <Activity className="w-4 h-4 text-[#691C32]" />
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
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {dataCategorias.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS_PIE[index % COLORS_PIE.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val) => [`${val} piezas`, 'Disponible']}
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        color: '#FFF',
                        borderRadius: '12px',
                        fontSize: '12px',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}
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
                <div key={i} className="flex items-center space-x-2 text-xs text-slate-600">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: COLORS_PIE[i % COLORS_PIE.length] }}
                  />
                  <span className="truncate font-medium">{c.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* FEED DE ÚLTIMOS MOVIMIENTOS EN VIVO                             */}
      {/* ============================================================== */}
      <div className="glass-card rounded-3xl p-6 border border-slate-200/90 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-[#FDF2F4] text-[#691C32] border border-[#F7D6DC]">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 font-['Montserrat']">
                Movimientos Recientes en Bodega y Andenes
              </h3>
              <p className="text-xs text-slate-500">Últimos folios sincronizados desde la app móvil</p>
            </div>
          </div>
          <button
            onClick={() => onCambiarVista('auditoria')}
            className="flex items-center space-x-1.5 text-xs font-bold text-[#691C32] hover:text-[#4C1021] transition-colors"
          >
            <span>Ver todo el historial</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3">Tipo</th>
                <th className="py-3 px-3">Folio Oficial</th>
                <th className="py-3 px-3">Bien / Insumo</th>
                <th className="py-3 px-3 text-center">Cantidad</th>
                <th className="py-3 px-3">Destino / Soporte</th>
                <th className="py-3 px-3">Operador</th>
                <th className="py-3 px-3">Fecha y Hora</th>
                <th className="py-3 px-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {movimientos.slice(0, 6).map((m) => {
                const esRec = m.tipo === 'RECEPCION';
                return (
                  <tr
                    key={m.id}
                    onClick={() => onVerFolio(m)}
                    className="hover:bg-slate-50/90 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-md font-black font-mono text-[10px] tracking-wider ${
                          esRec
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-blue-50 text-blue-800 border border-blue-200'
                        }`}
                      >
                        {esRec ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                        <span>{esRec ? 'RECEPCIÓN' : 'ENVÍO'}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-[#691C32] group-hover:underline">
                      {m.folio}
                    </td>
                    <td className="py-3.5 px-3 font-bold text-slate-900">{m.bien_nombre}</td>
                    <td className="py-3.5 px-3 text-center font-mono font-black text-slate-800 tabular-nums">
                      {m.cantidad} pza
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 truncate max-w-xs font-medium">
                      {m.destinoOProveedor}
                    </td>
                    <td className="py-3.5 px-3 text-slate-500">{m.responsable}</td>
                    <td className="py-3.5 px-3 text-slate-400 whitespace-nowrap font-mono text-[11px]">
                      {new Date(m.fecha).toLocaleDateString('es-MX', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onVerFolio(m);
                        }}
                        className="px-3 py-1 bg-slate-100 group-hover:bg-[#691C32] group-hover:text-white rounded-lg text-[11px] font-bold transition-all shadow-2xs"
                      >
                        Ver Vale
                      </button>
                    </td>
                  </tr>
                );
              })}

              {movimientos.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400 italic">
                    No se han registrado recepciones ni envíos aún en la base de datos.
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
