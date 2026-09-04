import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { CeldaRack, Producto } from '../types';
import { racksService } from '../services/racksStorage';
import { exportarElementoAImagenJpg } from '../services/exportImage';
import { X, Printer, Download, Edit3, Check, Trash2, Building2, QrCode } from 'lucide-react';

interface RackEtiquetaModalProps {
  isOpen: boolean;
  onClose: () => void;
  celda: CeldaRack | null;
  productosCatalogo: Producto[];
  onCeldaActualizada: (celda: CeldaRack) => void;
  onCeldaLiberada: (celdaId: string) => void;
}

export const RackEtiquetaModal: React.FC<RackEtiquetaModalProps> = ({
  isOpen,
  onClose,
  celda,
  productosCatalogo,
  onCeldaActualizada,
  onCeldaLiberada,
}) => {
  const [modoEdicion, setModoEdicion] = useState(false);
  const [bienNombre, setBienNombre] = useState('');
  const [cantidad, setCantidad] = useState<number>(1);
  const [lote, setLote] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [descargandoImg, setDescargandoImg] = useState(false);

  React.useEffect(() => {
    if (celda) {
      setBienNombre(celda.bienNombre || '');
      setCantidad(celda.cantidad || 1);
      setLote(celda.lote || '');
      setObservaciones(celda.observaciones || '');
      setModoEdicion(false);
    }
  }, [celda]);

  if (!isOpen || !celda) return null;

  const payloadQR = racksService.generarPayloadQR({
    ...celda,
    bienNombre: bienNombre || celda.bienNombre,
    cantidad: cantidad || celda.cantidad,
    lote: lote || celda.lote,
  });

  const handleGuardarCambios = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bienNombre.trim()) return;

    setGuardando(true);
    const celdaActualizada: CeldaRack = {
      ...celda,
      bienNombre: bienNombre.trim(),
      cantidad: Number(cantidad) || 1,
      lote: lote.trim() || undefined,
      observaciones: observaciones.trim() || undefined,
      fechaActualizacion: new Date().toISOString(),
      actualizadoPor: 'Administrador Web ISSSTE',
    };

    racksService.guardarCelda(celdaActualizada);
    onCeldaActualizada(celdaActualizada);
    setGuardando(false);
    setModoEdicion(false);
  };

  const handleLiberar = () => {
    if (confirm(`¿Deseas desocupar el espacio "${celda.codigoUbicacion}"?`)) {
      racksService.liberarCelda(celda.id);
      onCeldaLiberada(celda.id);
      onClose();
    }
  };

  const handleImprimir = () => {
    window.print();
  };

  const handleDescargarJpg = async () => {
    setDescargandoImg(true);
    await exportarElementoAImagenJpg('marbete-rack-issste', `Marbete_${celda.codigoUbicacion}`);
    setDescargandoImg(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden my-6 border border-slate-200 animate-modal-enter">
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 no-print">
          <div className="flex items-center space-x-2">
            <QrCode className="w-5 h-5 text-[#691C32]" />
            <h3 className="text-base font-bold text-slate-800 font-['Montserrat']">
              Ubicación de Rack: {celda.codigoUbicacion}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6">
          {/* Botones de acción superiores */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100 no-print">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setModoEdicion(!modoEdicion)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  modoEdicion
                    ? 'bg-slate-200 text-slate-700'
                    : 'bg-[#FDF2F4] text-[#691C32] border border-[#F7D6DC] hover:bg-[#691C32] hover:text-white'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{modoEdicion ? 'Cancelar Edición' : 'Editar Espacio'}</span>
              </button>

              {celda.bienNombre && (
                <button
                  type="button"
                  onClick={handleLiberar}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Vaciar Espacio</span>
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleDescargarJpg}
                disabled={descargandoImg}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{descargandoImg ? 'Generando...' : 'Descargar JPG'}</span>
              </button>

              <button
                type="button"
                onClick={handleImprimir}
                className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#691C32] text-white hover:bg-[#4C1021] shadow-sm transition-all"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Marbete</span>
              </button>
            </div>
          </div>

          {/* Formulario de edición si modoEdicion está activo */}
          {modoEdicion && (
            <form onSubmit={handleGuardarCambios} className="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-200 no-print animate-fadeIn">
              <h4 className="text-xs font-bold text-[#691C32] uppercase tracking-wider mb-3">
                Asignar Bien al Espacio {celda.codigoUbicacion}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Bien / Insumo *
                  </label>
                  <input
                    type="text"
                    list="productos-sugeridos"
                    required
                    value={bienNombre}
                    onChange={(e) => setBienNombre(e.target.value)}
                    placeholder="Escribe o selecciona el nombre del bien"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#691C32] bg-white"
                  />
                  <datalist id="productos-sugeridos">
                    {productosCatalogo.map((p) => (
                      <option key={p.id} value={p.nombre} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Cantidad en este Espacio (Pzas) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={cantidad}
                    onChange={(e) => setCantidad(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#691C32] bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Lote / Serie
                  </label>
                  <input
                    type="text"
                    value={lote}
                    onChange={(e) => setLote(e.target.value)}
                    placeholder="Ej. LOT-2026-A"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#691C32] bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setModoEdicion(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="flex items-center space-x-1.5 px-4 py-1.5 bg-[#691C32] text-white rounded-lg text-xs font-semibold hover:bg-[#4C1021]"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Guardar Ubicación</span>
                </button>
              </div>
            </form>
          )}

          {/* ============================================================== */}
          {/* MARBETE IMPRIMIBLE OFICIAL DE RACK ISSSTE                      */}
          {/* ============================================================== */}
          <div
            id="marbete-rack-issste"
            className="printable-etiqueta-rack border-4 border-[#691C32] rounded-2xl p-6 bg-white shadow-sm flex flex-col justify-between"
            style={{ minHeight: '380px' }}
          >
            {/* Header del Marbete */}
            <div className="flex items-start justify-between border-b-2 border-[#BC955C] pb-3 mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-[#691C32] text-[#DFC79B] flex items-center justify-center font-black text-xl shadow-inner">
                  <Building2 className="w-7 h-7 text-[#DFC79B]" />
                </div>
                <div>
                  <span className="text-[11px] font-black text-[#691C32] tracking-wider uppercase block">
                    ISSSTE - ALMACÉN CENTRAL
                  </span>
                  <h2 className="text-base font-black text-slate-900 font-['Montserrat'] leading-tight">
                    MARBETE OFICIAL DE IDENTIFICACIÓN DE RACK
                  </h2>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    SUBDIRECCIÓN DE ALMACENES Y LOGÍSTICA HOSPITALARIA
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block px-2.5 py-1 bg-[#691C32] text-white text-[11px] font-extrabold rounded-md tracking-wider">
                  CÓDIGO OFICIAL
                </span>
                <div className="text-xl font-black text-[#691C32] font-mono mt-1">
                  {celda.codigoUbicacion}
                </div>
              </div>
            </div>

            {/* Cuerpo del Marbete: QR a la izquierda, detalles a la derecha */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center my-auto">
              {/* Código QR grande */}
              <div className="md:col-span-5 flex flex-col items-center justify-center p-3 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300">
                <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-200">
                  <QRCodeSVG
                    value={payloadQR}
                    size={160}
                    level="H"
                    includeMargin={false}
                    fgColor="#691C32"
                  />
                </div>
                <span className="text-[10px] font-bold text-[#BC955C] uppercase tracking-wider mt-2.5">
                  ESCANEAR CON APP MÓVIL
                </span>
                <span className="text-[9px] text-slate-400 font-mono">
                  {celda.codigoUbicacion}
                </span>
              </div>

              {/* Información del espacio y producto */}
              <div className="md:col-span-7 space-y-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    BIEN / EQUIPO ASIGNADO
                  </span>
                  <div className="text-base font-black text-slate-900 leading-tight mt-0.5 font-['Montserrat']">
                    {celda.bienNombre || 'ESPACIO VACÍO / DISPONIBLE'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl bg-[#FDF2F4] border border-[#F7D6DC]">
                    <span className="text-[10px] font-bold text-[#691C32] uppercase tracking-wider block">
                      CANTIDAD
                    </span>
                    <span className="text-2xl font-black text-[#691C32] font-mono">
                      {celda.cantidad || 0}
                    </span>
                    <span className="text-[10px] text-slate-600 font-medium ml-1">piezas</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#FDF9F3] border border-[#DFC79B]">
                    <span className="text-[10px] font-bold text-[#8F6B38] uppercase tracking-wider block">
                      LOTE / SERIE
                    </span>
                    <span className="text-sm font-black text-slate-800 font-mono block mt-1">
                      {celda.lote || 'SIN LOTE'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-400 font-bold block">RACK</span>
                    <span className="font-extrabold text-slate-800">{celda.rackId}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">NIVEL</span>
                    <span className="font-extrabold text-slate-800">{celda.nivel}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">POSICIÓN</span>
                    <span className="font-extrabold text-slate-800">{celda.posicion}</span>
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 font-medium">
                  <strong>Ubicación:</strong> {celda.pasillo}
                </div>
              </div>
            </div>

            {/* Pie del Marbete */}
            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
              <span>
                <strong>Fecha:</strong> {new Date().toLocaleDateString('es-MX')} | <strong>Control:</strong> ISSSTE-ALM-2026
              </span>
              <span className="font-mono text-slate-400 font-bold">
                || | |||| | ||||| || ||| ||||
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
