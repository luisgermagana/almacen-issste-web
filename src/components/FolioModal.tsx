import React, { useState } from 'react';
import { RegistroRecepcion, RegistroEnvio } from '../types';
import { exportarRecepcionPdf, exportarEnvioPdf } from '../services/exportPdf';
import { exportarElementoAImagenJpg } from '../services/exportImage';
import { X, FileText, Download, Building2, Eye, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface FolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  tipo: 'RECEPCION' | 'ENVIO';
  registro: RegistroRecepcion | RegistroEnvio | null;
  onVerFotos?: (fotos: string[], titulo: string) => void;
}

export const FolioModal: React.FC<FolioModalProps> = ({
  isOpen,
  onClose,
  tipo,
  registro,
  onVerFotos,
}) => {
  const [generandoPdf, setGenerandoPdf] = useState(false);
  const [generandoJpg, setGenerandoJpg] = useState(false);

  if (!isOpen || !registro) return null;

  const esRecepcion = tipo === 'RECEPCION';
  const rec = esRecepcion ? (registro as RegistroRecepcion) : null;
  const env = !esRecepcion ? (registro as RegistroEnvio) : null;

  const handleDescargarPdf = async () => {
    setGenerandoPdf(true);
    try {
      if (esRecepcion && rec) {
        await exportarRecepcionPdf(rec);
      } else if (env) {
        await exportarEnvioPdf(env);
      }
    } finally {
      setGenerandoPdf(false);
    }
  };

  const handleDescargarJpg = async () => {
    setGenerandoJpg(true);
    try {
      await exportarElementoAImagenJpg('comprobante-folio-imprimible', `Comprobante_${registro.folio}`);
    } finally {
      setGenerandoJpg(false);
    }
  };

  const fotos = esRecepcion && rec
    ? [...(rec.fotos_bien || []), ...(rec.fotos_documento || []), ...(rec.fotos_serie || [])]
    : env?.fotos_camion || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden my-8 border border-slate-200">
        {/* Barra superior */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-[#691C32]" />
            <h3 className="text-base font-bold text-slate-800 font-['Montserrat']">
              Expediente Digital Oficial • {registro.folio}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Acciones de Exportación */}
        <div className="flex items-center justify-between px-6 py-3 bg-slate-100/70 border-b border-slate-200 text-xs">
          <div className="flex items-center space-x-2 text-slate-600 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Registro verificado y sellado en base de datos Supabase</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDescargarJpg}
              disabled={generandoJpg}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 rounded-lg font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>{generandoJpg ? 'Generando JPG...' : 'Descargar JPG'}</span>
            </button>
            <button
              onClick={handleDescargarPdf}
              disabled={generandoPdf}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#691C32] text-white hover:bg-[#4C1021] rounded-lg font-semibold shadow-sm transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{generandoPdf ? 'Generando PDF...' : 'Descargar PDF Oficial'}</span>
            </button>
          </div>
        </div>

        {/* Hoja membretada oficial */}
        <div className="p-6 overflow-y-auto max-h-[75vh]">
          <div
            id="comprobante-folio-imprimible"
            className="border-2 border-slate-200 rounded-2xl p-6 bg-white shadow-sm"
          >
            {/* Header del Vale */}
            <div className="flex items-start justify-between border-b-2 border-[#BC955C] pb-4 mb-5">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-[#691C32] text-white flex items-center justify-center font-bold text-xl shadow-md">
                  <Building2 className="w-7 h-7 text-[#DFC79B]" />
                </div>
                <div>
                  <span className="text-[11px] font-extrabold text-[#691C32] tracking-wider uppercase block">
                    ISSSTE - ALMACÉN GENERAL CENTRAL
                  </span>
                  <h4 className="text-base font-extrabold text-slate-900 font-['Montserrat']">
                    {esRecepcion ? 'COMPROBANTE OFICIAL DE RECEPCIÓN' : 'VALE OFICIAL DE SALIDA Y DESPACHO'}
                  </h4>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Dirección de Administración y Finanzas | Control y Trazabilidad
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span
                  className={`inline-block px-3 py-1 rounded-md text-xs font-bold ${
                    esRecepcion
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-blue-50 text-blue-800 border border-blue-200'
                  }`}
                >
                  {esRecepcion ? 'ENTRADA DE BIEN' : 'DESPACHO DE BIEN'}
                </span>
                <div className="text-lg font-black text-[#691C32] font-mono mt-1">
                  {registro.folio}
                </div>
              </div>
            </div>

            {/* Grid de Datos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200 mb-5">
              <div>
                <span className="text-slate-400 font-bold block">FECHA Y HORA DE REGISTRO</span>
                <span className="font-semibold text-slate-800 text-sm">
                  {new Date(registro.fecha).toLocaleString('es-MX', { dateStyle: 'long', timeStyle: 'short' })}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block">BIEN / INSUMO</span>
                <span className="font-bold text-[#691C32] text-sm">
                  {registro.bien_nombre}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block">CANTIDAD DE PIEZAS</span>
                <span className="font-extrabold text-slate-900 text-base">
                  {registro.cantidad} pza(s)
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block">
                  {esRecepcion ? 'OPERADOR RECEPTOR' : 'DESPACHADO POR'}
                </span>
                <span className="font-semibold text-slate-800">
                  {esRecepcion ? rec?.recibido_por : env?.enviado_por}
                </span>
              </div>

              {esRecepcion && rec && (
                <>
                  <div>
                    <span className="text-slate-400 font-bold block">DOCUMENTO SOPORTE</span>
                    <span className="font-semibold text-slate-800 capitalize">
                      {rec.tipo_documento === 'remision'
                        ? 'Remisión'
                        : rec.tipo_documento === 'na'
                        ? 'Acta Circunstanciada (Sin Remisión)'
                        : 'Doc. Soporte'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">SERIE / PLACA METÁLICA</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {rec.numero_serie || 'N/A'}
                    </span>
                  </div>
                </>
              )}

              {!esRecepcion && env && (
                <>
                  <div>
                    <span className="text-slate-400 font-bold block">UNIDAD MÉDICA / DESTINO</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {env.destino}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">TRANSPORTE Y NO. ECONÓMICO</span>
                    <span className="font-semibold text-slate-800">
                      {env.tipo_transporte === 'institucional' ? 'Vehículo Institucional' : 'Subrogado'} (Eco: {env.numero_economico})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">CHOFER / OPERADOR</span>
                    <span className="font-semibold text-slate-800">
                      {env.operador}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Observaciones */}
            {registro.observaciones && (
              <div className="mb-5 p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs">
                <span className="font-bold text-amber-900 block mb-0.5">Observaciones:</span>
                <p className="text-amber-800">{registro.observaciones}</p>
              </div>
            )}

            {/* Galería de Evidencias */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#691C32] uppercase tracking-wider">
                  Evidencias Fotográficas Adjuntas ({fotos.length})
                </span>
                {fotos.length > 0 && onVerFotos && (
                  <button
                    onClick={() => onVerFotos(fotos, `Evidencias • ${registro.folio}`)}
                    className="flex items-center space-x-1 text-xs text-[#BC955C] hover:text-[#8F6B38] font-bold"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Ver a Pantalla Completa</span>
                  </button>
                )}
              </div>

              {fotos.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {fotos.map((f, idx) => (
                    <div
                      key={idx}
                      onClick={() => onVerFotos && onVerFotos(fotos, `Evidencias • ${registro.folio}`)}
                      className="aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer group relative"
                    >
                      <img
                        src={f}
                        alt={`Foto ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                        Ampliar
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No hay fotografías adjuntas en este folio.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
