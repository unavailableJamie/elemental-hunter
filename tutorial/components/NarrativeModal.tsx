import React from 'react';

export interface NarrativeModalData {
  id: string;
  title: string;
  body: string;
  icon?: string;
  variant?: 'info' | 'warning' | 'combo' | 'kick';
}

interface NarrativeModalProps {
  data: NarrativeModalData;
  onClose: () => void;
}

const VARIANT_STYLES: Record<string, { border: string; title: string; btn: string }> = {
  info:    { border: 'border-indigo-500/40',  title: 'text-indigo-300',  btn: 'bg-indigo-600 hover:bg-indigo-500' },
  warning: { border: 'border-amber-500/40',   title: 'text-amber-300',   btn: 'bg-amber-600 hover:bg-amber-500' },
  combo:   { border: 'border-orange-500/40',  title: 'text-orange-300',  btn: 'bg-orange-600 hover:bg-orange-500' },
  kick:    { border: 'border-red-500/40',     title: 'text-red-300',     btn: 'bg-red-700 hover:bg-red-600' },
};

export const NarrativeModal: React.FC<NarrativeModalProps> = ({ data, onClose }) => {
  const style = VARIANT_STYLES[data.variant ?? 'info'];

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className={`bg-gray-900 border ${style.border} rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl`}>
        {data.icon && (
          <div className="text-center text-4xl mb-3">{data.icon}</div>
        )}
        <h3 className={`text-lg font-black uppercase tracking-wider text-center mb-3 ${style.title}`}>
          {data.title}
        </h3>
        <p className="text-gray-300 text-sm leading-relaxed text-center mb-5">{data.body}</p>
        <button
          onClick={onClose}
          className={`w-full py-2.5 ${style.btn} text-white font-black rounded-xl uppercase tracking-wider transition-all text-sm`}
        >
          Đã hiểu!
        </button>
      </div>
    </div>
  );
};
