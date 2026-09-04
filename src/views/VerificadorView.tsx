import React, { useState } from 'react';
import { buscarPorFolio } from '../services/supabase';
import { RegistroRecepcion, RegistroEnvio } from '../types';
import {
  Search,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Building2,
  Calendar,
  FileText,
  Download,
  Eye,
  ArrowRight,
} from 'lucide-react';
import { exportarRecepcionPdf, exportarEnvioPdf } from '../services/exportPdf';
import { exportarElementoAImagenJpg } from '../services/exportImage';

interface VerificadorViewProps {
  onVerFotos: (fotos: string[], titulo: string) => void;
}

export const VerificadorView: React.FC<VerificadorViewProps> = ({ onVerFotos }) => {
  const [folioInput, setFolioInput] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [resultado, setResultado] = useState<{
    buscado: boolean;
    encontrado: boolean;
    tipo?: 'RECEPCION' | 'ENVIO';
    registro?: RegistroRecepcion | RegistroEnvio;
  }>({ buscado: false, encontrado: false });

  const foliosSugeridos = ['ENV-2026-0004', 'ENV-2026-0003', 'REC-2026-0001'];

  const handleBuscar = async (e?: React.FormEvent, folioManual?: string) => {
    if (e) e.preventDefault();
    const f = (folioManual || folioInput).trim().toUpperCase();
    if (!f) return;

    setBuscando(true);
    try {
      const res = await buscarPorFolio(f);
      setResultado({
        buscado: true,
        encontrado: res.encontrado,
        tipo: res.tipo,
        registro: res.registro,
      });
    } finally {
      setBuscando(false);
    }
  };

  const rec = resultado.tipo === 'RECEPCION' ? (resultado.registro as RegistroRecepcion) : null;
  const env = resultado.tipo === 'ENVIO' ? (resultado.registro as RegistroEnvio) : null;

  const fotos = rec
    ? [...(rec.fotos_bien || []), ...(rec.fotos_documento || []), ...(rec.fotos_serie || [])]
    : env?.fotos_camion || [];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm text-center">
        <div className="w-12 h-12 rounded-2xl bg-[#FDF2F4] text-[#691C32] flex items-center justify-center mx-auto mb-3 shadow-inner">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-['Montserrat']">
          Verificador Oficial de Autenticidad de Folios
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-lg mx-auto">
          Consulta la validez institucional de cualquier Vale de Salida o Comprobante de Recepción emitido por el Almacén ISSSTE.
        </p>

        {/* Formulario de Búsqueda */}
        <form onSubmit={(e) => handleBuscar(e)} className="mt-6 max-w-lg mx-auto flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              required
              placeholder="Ingresa el folio (ej. ENV-2026-0004)..."
              value={folioInput}
              onChange={(e) => setFolioInput(e.target.value.toUpperCase())}
              className="w-full text-xs sm:text-sm font-mono pl-10 pr-4 py-3 border-2 border-slate-200 focus:border-[#691C32] rounded-xl focus:outline-none bg-slate-50 uppercase font-bold"
            />
          </div>
          <button
            type="submit"
            disabled={buscando}
            className="px-6 py-3 bg-[#691C32] hover:bg-[#4C1021] text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md shrink-0 flex items-center space-x-1.5"
          >
            <span>{buscando ? 'Consultando...' : 'Verificar'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Sugerencias rápidas */}
        <div className="mt-3 flex items-center justify-center space-x-2 text-xs text-slate-400">
          <span>Ejemplos reales:</span>
          {foliosSugeridos.map((f) => (
            <button
              key={f}
              onClick={() => {
                setFolioInput(f);
                handleBuscar(undefined, f);
              }}
              className="font-mono text-[11px] font-bold text-[#691C32] hover:underline"
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Resultados de la Verificación */}
      {resultado.buscado && (
        <>
          {resultado.encontrado && resultado.registro ? (
            <div className="bg-white rounded-3xl border-2 border-emerald-500/50 p-6 sm:p-8 shadow-xl space-y-6 animate-fadeIn">
              {/* Sello de Autenticidad */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                      FOLIO OFICIAL AUTÉNTICO Y VALIDADO
                    </span>
                    <h3 className="text-lg font-black text-slate-900 font-mono">
                      {resultado.registro.folio}
                    </h3>
                  </div>
                </div>
                <div className="text-left sm:text-right text-xs text-emerald-800 font-medium">
                  <div>Registrado en Servidor Central Supabase</div>
                  <div className="font-mono text-[11px]">
                    {new Date(resultado.registro.fecha).toLocaleString('es-MX')}
                  </div>
                </div>
              </div>

              {/* Contenedor del Comprobante para Captura */}
              <div
                id="certificado-verificado-issste"
                className="border-2 border-slate-200 rounded-2xl p-6 bg-white space-y-4 shadow-sm"
              >
                {/* Header Membretado */}
                <div className="flex items-start justify-between border-b-2 border-[#BC955C] pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-[#691C32] text-white flex items-center justify-center font-bold">
                      <Building2 className="w-5 h-5 text-[#DFC79B]" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-[#691C32] uppercase block">
                        ISSSTE • ALMACÉN CENTRAL
                      </span>
                      <h4 className="text-sm font-extrabold text-slate-900 font-['Montserrat']">
                        CERTIFICADO DE AUTENTICIDAD DE MOVIMIENTO
                      </h4>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-[#FDF2F4] text-[#691C32] font-mono text-xs font-black border border-[#F7D6DC]">
                    {resultado.tipo}
                  </span>
                </div>

                {/* Datos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-400 font-bold block">BIEN / INSUMO</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {resultado.registro.bien_nombre}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">CANTIDAD AMPARADA</span>
                    <span className="font-mono font-extrabold text-slate-900 text-sm">
                      {resultado.registro.cantidad} pieza(s)
                    </span>
                  </div>

                  {rec && (
                    <>
                      <div>
                        <span className="text-slate-400 font-bold block">DOCUMENTO SOPORTE</span>
                        <span className="font-semibold text-slate-800 capitalize">
                          {rec.tipo_documento}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold block">NO. SERIE</span>
                        <span className="font-mono font-semibold text-slate-800">
                          {rec.numero_serie || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold block">RECIBIDO POR</span>
                        <span className="font-semibold text-slate-800">{rec.recibido_por}</span>
                      </div>
                    </>
                  )}

                  {env && (
                    <>
                      <div>
                        <span className="text-slate-400 font-bold block">DESTINO / HOSPITAL</span>
                        <span className="font-bold text-slate-900">{env.destino}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold block">CHOFER Y TRANSPORTE</span>
                        <span className="font-semibold text-slate-800">
                          {env.operador} • Eco: {env.numero_economico} ({env.tipo_transporte})
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold block">DESPACHADO POR</span>
                        <span className="font-semibold text-slate-800">{env.enviado_por}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Evidencias */}
                {fotos.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-700">
                        Evidencias Registradas ({fotos.length} fotos oficiales)
                      </span>
                      <button
                        onClick={() => onVerFotos(fotos, `Evidencias • ${resultado.registro?.folio}`)}
                        className="text-xs font-bold text-[#691C32] hover:underline"
                      >
                        Ver todas
                      </button>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {fotos.slice(0, 4).map((f, i) => (
                        <div
                          key={i}
                          onClick={() => onVerFotos(fotos, `Evidencias • ${resultado.registro?.folio}`)}
                          className="aspect-square rounded-lg overflow-hidden border border-slate-200 cursor-pointer"
                        >
                          <img src={f} alt="Evidencia" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Botones de Descarga */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                <button
                  onClick={() =>
                    exportarElementoAImagenJpg(
                      'certificado-verificado-issste',
                      `Certificado_${resultado.registro?.folio}`
                    )
                  }
                  className="flex items-center space-x-1.5 px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-bold transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar JPG</span>
                </button>
                <button
                  onClick={async () => {
                    if (rec) await exportarRecepcionPdf(rec);
                    if (env) await exportarEnvioPdf(env);
                  }}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-[#691C32] text-white hover:bg-[#4C1021] rounded-xl text-xs font-bold transition-colors shadow-sm"
                >
                  <FileText className="w-4 h-4" />
                  <span>Descargar Vale Oficial en PDF</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border-2 border-rose-300 p-8 text-center space-y-3 shadow-sm animate-fadeIn">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <XCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-['Montserrat']">
                Folio No Encontrado o Inválido
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No se localizó ningún registro bajo el folio <strong>"{folioInput}"</strong> en los servidores del ISSSTE.
                Verifica que el número coincida exactamente con el impreso en el vale o comprobante.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
