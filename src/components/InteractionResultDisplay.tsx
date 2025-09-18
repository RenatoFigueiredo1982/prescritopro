import React from 'react';
import { ResultadoInteracao, InfoInteracao } from '../types';

interface InteractionResultDisplayProps {
    result: ResultadoInteracao[];
    onClose: () => void;
}

const classificationInfo: { [key: string]: { label: string; colors: string; icon: JSX.Element; } } = {
    X: {
        label: "Evitar Combinação",
        colors: "border-red-500 bg-red-900/40 text-red-200",
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
    },
    D: {
        label: "Considerar Modificação da Terapia",
        colors: "border-amber-500 bg-amber-900/40 text-amber-200",
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.636-1.21 2.864-1.21 3.5 0l5.416 10.332a2.25 2.25 0 01-1.75 3.319H4.584a2.25 2.25 0 01-1.75-3.32L8.257 3.1zM10 12a1 1 0 100-2 1 1 0 000 2zm1 3a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" /></svg>
    },
    C: {
        label: "Monitorar Terapia",
        colors: "border-yellow-500 bg-yellow-900/40 text-yellow-200",
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C3.732 4.943 9.522 3 10 3s6.268 1.943 9.542 7c-3.274 5.057-9.064 7-9.542 7S3.732 15.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
    },
    B: {
        label: "Nenhuma Ação Necessária",
        colors: "border-green-500 bg-green-900/40 text-green-200",
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
    },
    A: {
        label: "Nenhuma Interação Conhecida",
        colors: "border-gray-500 bg-gray-700/40 text-gray-200",
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
    },
    'N/A': {
        label: "Não Classificado",
        colors: "border-gray-500 bg-gray-700/40 text-gray-200",
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-1 1v1a1 1 0 102 0V8a1 1 0 00-1-1zm-1 4a1 1 0 100 2h.01a1 1 0 100-2H9zm2.707-2.293a1 1 0 00-1.414-1.414l-4 4a1 1 0 101.414 1.414l4-4z" clipRule="evenodd" /></svg>
    }
};

const InteractionCard: React.FC<{ interaction: InfoInteracao }> = ({ interaction }) => {
    const info = classificationInfo[interaction.classificacao] || classificationInfo['N/A'];

    return (
        <div className={`p-4 rounded-lg border-l-4 ${info.colors}`}>
            <div className="flex items-start sm:items-center space-x-3">
                 <div className={`flex-shrink-0 p-1.5 rounded-full ${info.colors}`}>
                    {info.icon}
                </div>
                <div className="flex-1">
                    <p className="font-semibold text-white">
                        Interação com {interaction.nomeMedicamento}
                    </p>
                    <p className="text-sm font-bold">{info.label}</p>
                </div>
                <span className={`hidden sm:inline-block text-lg font-black px-2 py-0.5 rounded-md ${info.colors}`}>
                    {interaction.classificacao}
                </span>
            </div>
            <div className="mt-3 pl-10">
                <p className="text-sm font-medium text-gray-200">
                    {interaction.resumo}
                </p>
                {interaction.textoInteracao && (
                    <p className="mt-2 text-sm text-gray-300 prose max-w-none">
                        {interaction.textoInteracao}
                    </p>
                )}
            </div>
        </div>
    );
};


const InteractionResultDisplay: React.FC<InteractionResultDisplayProps> = ({ result, onClose }) => {
    const foundDrugs = result.filter(r => r.encontrado);
    const totalInteractions = foundDrugs.reduce((acc, r) => acc + r.interacoes.length, 0);
    
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
                <h3 className="text-2xl font-bold text-amber-400">Resultado da Verificação</h3>
                <p className="text-md text-gray-300">
                    {totalInteractions > 0 
                        ? `${totalInteractions} interaç${totalInteractions === 1 ? 'ão' : 'ões'} potencial(is) encontrada(s).`
                        : "Nenhuma interação direta encontrada."
                    }
                </p>
                 <p className="text-xs text-gray-500 mt-2">Atenção: Esta é uma ferramenta de auxílio e não substitui o julgamento clínico.</p>
            </div>
            
            <div className="space-y-6">
                {result.map((drugResult, index) => (
                    <div key={index}>
                        <h4 className="font-bold text-lg text-white mb-3">
                           {drugResult.encontrado ? (
                                <>Análise de <span className="text-sky-400">{drugResult.medicamentoFonte}</span></>
                           ) : (
                                <>Medicamento: <span className="text-red-500">{drugResult.medicamentoFonte}</span></>
                           )}
                        </h4>

                        {!drugResult.encontrado ? (
                             <p className="text-sm text-red-300 p-3 bg-red-500/20 rounded-lg">
                                {drugResult.mensagemErro || 'Medicamento não encontrado ou não foi possível analisar.'}
                            </p>
                        ) : drugResult.interacoes.length > 0 ? (
                            <div className="space-y-3">
                                {drugResult.interacoes
                                  .sort((a,b) => a.classificacao.localeCompare(b.classificacao))
                                  .map((interaction, i) => (
                                    <InteractionCard key={i} interaction={interaction} />
                                ))}
                            </div>
                        ) : (
                             <p className="mt-2 text-sm text-gray-400 pl-4">
                                Nenhuma interação com os outros medicamentos da lista foi encontrada.
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default InteractionResultDisplay;