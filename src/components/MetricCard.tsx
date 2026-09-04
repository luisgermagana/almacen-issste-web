import React from 'react';

interface MetricCardProps {
  titulo: string;
  valor: string | number;
  subtitulo?: string;
  icon: React.ReactNode;
  color?: 'guinda' | 'dorado' | 'verde' | 'azul' | 'rojo';
  tendencia?: {
    texto: string;
    positiva: boolean;
  };
  porcentaje?: number;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  titulo,
  valor,
  subtitulo,
  icon,
  color = 'guinda',
  tendencia,
  porcentaje,
}) => {
  const colorMap = {
    guinda: {
      bgIcon: 'bg-gradient-to-br from-[#FDF2F4] to-[#FCE8EC] text-[#691C32] border-[#F7D6DC]',
      bar: 'bg-[#691C32]',
      borderHover: 'hover:border-[#691C32]/40',
      glow: 'group-hover:shadow-[0_12px_28px_-6px_rgba(105,28,50,0.18)]',
    },
    dorado: {
      bgIcon: 'bg-gradient-to-br from-[#FDF9F3] to-[#F9EED9] text-[#8F6B38] border-[#DFC79B]',
      bar: 'bg-[#BC955C]',
      borderHover: 'hover:border-[#BC955C]/50',
      glow: 'group-hover:shadow-[0_12px_28px_-6px_rgba(188,149,92,0.22)]',
    },
    verde: {
      bgIcon: 'bg-gradient-to-br from-emerald-50 to-emerald-100/60 text-emerald-700 border-emerald-200',
      bar: 'bg-emerald-600',
      borderHover: 'hover:border-emerald-400',
      glow: 'group-hover:shadow-[0_12px_28px_-6px_rgba(16,185,129,0.18)]',
    },
    azul: {
      bgIcon: 'bg-gradient-to-br from-blue-50 to-blue-100/60 text-blue-700 border-blue-200',
      bar: 'bg-blue-600',
      borderHover: 'hover:border-blue-400',
      glow: 'group-hover:shadow-[0_12px_28px_-6px_rgba(59,130,246,0.18)]',
    },
    rojo: {
      bgIcon: 'bg-gradient-to-br from-rose-50 to-rose-100/60 text-rose-700 border-rose-200',
      bar: 'bg-rose-600',
      borderHover: 'hover:border-rose-400',
      glow: 'group-hover:shadow-[0_12px_28px_-6px_rgba(244,63,94,0.18)]',
    },
  };

  const scheme = colorMap[color];

  return (
    <div
      className={`group relative bg-white/95 backdrop-blur-sm rounded-2xl p-5 border border-slate-200/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_3px_rgba(0,0,0,0.03),0_8px_20px_-8px_rgba(0,0,0,0.05)] transition-all duration-200 hover:-translate-y-1 ${scheme.borderHover} ${scheme.glow} flex flex-col justify-between overflow-hidden`}
    >
      {/* Luz ambiental sutil en hover */}
      <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full bg-gradient-to-br from-slate-100 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div>
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-['Inter']">
              {titulo}
            </span>
            <div className="mt-1 text-3xl font-black font-mono tabular-nums tracking-tight text-slate-900 font-['Montserrat']">
              {valor}
            </div>
          </div>
          <div
            className={`p-2.5 rounded-xl border shadow-xs transition-transform duration-200 group-hover:scale-105 ${scheme.bgIcon}`}
          >
            {icon}
          </div>
        </div>

        {/* Micro barra de progreso si aplica */}
        {typeof porcentaje === 'number' && (
          <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${scheme.bar}`}
              style={{ width: `${Math.min(100, Math.max(0, porcentaje))}%` }}
            />
          </div>
        )}
      </div>

      {(subtitulo || tendencia) && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          {subtitulo && (
            <span className="text-slate-500 font-medium truncate">
              {subtitulo}
            </span>
          )}
          {tendencia && (
            <span
              className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                tendencia.positiva
                  ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                  : 'text-rose-700 bg-rose-50 border-rose-200'
              }`}
            >
              {tendencia.texto}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
