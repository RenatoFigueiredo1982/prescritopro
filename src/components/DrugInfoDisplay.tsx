import React from 'react';
import { DrugInfo } from '../types';

interface DrugInfoDisplayProps {
    drugInfo: DrugInfo;
    onClose: () => void;
}

const InfoSection: React.FC<{ title: string; content?: string[] }> = ({ title, content }) => {
    if (!content || content.length === 0 || content[0] === 'Não disponível') return null;

    return (
        <div className="py-4 border-b border-white/20 last:border-b-0">
            <h4 className="text-md font-semibold text-sky-200 mb-2">{title}</h4>
            <div className="text-sm text-gray-100 space-y-1 prose max-w-none">
                {content.map((item, index) => (
                    <p key={index}>{item}</p>
                ))}
            </div>
        </div>
    );
};

const DrugInfoDisplay: React.FC<DrugInfoDisplayProps> = ({ drugInfo, onClose }) => {
    return (
        <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/20 relative">
             <button 
                onClick={onClose} 
                className="absolute top-3 right-3 p-1.5 rounded-full text-gray-300 hover:bg-white/10 z-10"
                aria-label="Fechar"
            >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
            <div className="border-b border-white/20 pb-4 mb-4">
                <h3 className="text-2xl font-bold text-sky-400">{drugInfo.nome_comercial[0]}</h3>
                <p className="text-md text-gray-300">{drugInfo.nome_generico.join(', ')}</p>
            </div>
            <div className="space-y-2">
                <InfoSection title="Princípio(s) Ativo(s)" content={drugInfo.principio_ativo} />
                <InfoSection title="Indicações e Uso" content={drugInfo.indicacoes_e_uso} />
                <InfoSection title="Dosagem e Administração" content={drugInfo.dosagem_e_administracao} />
                <InfoSection title="Avisos" content={drugInfo.avisos} />
            </div>
        </div>
    );
};

export default DrugInfoDisplay;