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
}

export const MetricCard: React.FC<MetricCardProps> = ({
  titulo,
  valor,
  subtitulo,
  icon,
  color = 'guinda',
  tendencia,
}) => {
  const colorMap = {
    guinda: {
      bgIcon: 'bg-[#FDF2F4] text-[#691C32]',
      borderHover: 'hover:border-[#691C32]/30',
      badge: 'text-[#691C32] bg-[#FDF2F4]',
    },
    dorado: {
      bgIcon: 'bg-[#FDF9F3] text-[#8F6B38]',
      borderHover: 'hover:border-[#BC955C]/40',
      badge: 'text-[#8F6B38] bg-[#FDF9F3]',
    },
    verde: {
      bgIcon: 'bg-emerald-50 text-emerald-700',
      borderHover: 'hover:border-emerald-300',
      badge: 'text-emerald-700 bg-emerald-50',
    },
    azul: {
      bgIcon: 'bg-blue-50 text-blue-700',
      borderHover: 'hover:border-blue-300',
      badge: 'text-blue-700 bg-blue-50',
    },
    rojo: {
      bgIcon: 'bg-rose-50 text-rose-700',
      borderHover: 'hover:border-rose-300',
      badge: 'text-rose-700 bg-rose-50',
    },
  };

  const scheme = colorMap[color];

  return (
    <div className={`bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm transition-all duration-200 ${scheme.borderHover} hover:shadow-md flex flex-col justify-between`}>
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {titulo}
          </span>
          <div className="mt-1 text-2xl lg:text-3xl font-extrabold text-slate-900 font-['Montserrat']">
            {valor}
          </div>
        </div>
        <div className={`p-3 rounded-xl ${scheme.bgIcon}`}>
          {icon}
        </div>
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
              className={`font-semibold px-2 py-0.5 rounded-full ${
                tendencia.positiva
                  ? 'text-emerald-700 bg-emerald-50'
                  : 'text-rose-700 bg-rose-50'
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
