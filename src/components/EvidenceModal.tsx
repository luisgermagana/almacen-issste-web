import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, ExternalLink, Download } from 'lucide-react';

interface EvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  titulo: string;
  subtitulo?: string;
  fotos: string[];
}

export const EvidenceModal: React.FC<EvidenceModalProps> = ({
  isOpen,
  onClose,
  titulo,
  subtitulo,
  fotos,
}) => {
  const [indiceActual, setIndiceActual] = useState(0);

  if (!isOpen || fotos.length === 0) return null;

  const fotoActual = fotos[indiceActual] || fotos[0];

  const anterior = () => {
    setIndiceActual((prev) => (prev > 0 ? prev - 1 : fotos.length - 1));
  };

  const siguiente = () => {
    setIndiceActual((prev) => (prev < fotos.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl bg-slate-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-modal-enter">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 text-white">
          <div>
            <h3 className="text-base font-bold text-slate-100 font-['Montserrat']">
              {titulo}
            </h3>
            {subtitulo && (
              <p className="text-xs text-slate-400 mt-0.5">
                {subtitulo} • Foto {indiceActual + 1} de {fotos.length}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <a
              href={fotoActual}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors"
              title="Abrir en pestaña nueva"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Visor central */}
        <div className="relative flex-1 flex items-center justify-center bg-black/95 p-4 min-h-[360px] overflow-hidden">
          <img
            src={fotoActual}
            alt={`Evidencia ${indiceActual + 1}`}
            className="max-h-[65vh] max-w-full object-contain rounded-lg shadow-md transition-all duration-300"
          />

          {fotos.length > 1 && (
            <>
              <button
                onClick={anterior}
                className="absolute left-4 p-2.5 rounded-full bg-slate-800/80 text-white hover:bg-slate-700 backdrop-blur-sm transition-all"
                title="Foto anterior"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={siguiente}
                className="absolute right-4 p-2.5 rounded-full bg-slate-800/80 text-white hover:bg-slate-700 backdrop-blur-sm transition-all"
                title="Foto siguiente"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>

        {/* Miniaturas inferiores */}
        {fotos.length > 1 && (
          <div className="flex items-center justify-center space-x-2 p-3 bg-slate-900 border-t border-slate-800 overflow-x-auto">
            {fotos.map((f, idx) => (
              <button
                key={idx}
                onClick={() => setIndiceActual(idx)}
                className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                  idx === indiceActual
                    ? 'border-[#BC955C] scale-105'
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img src={f} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
