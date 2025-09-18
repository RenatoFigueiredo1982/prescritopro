import React, { useState, useCallback } from 'react';
import AutocompleteInput from './AutocompleteInput';
import { getDrugSuggestions } from '../services/openFdaService';

interface DrugInteractionSearchProps {
    onSearch: (drugNames: string[]) => void;
    isLoading: boolean;
}

const DrugInteractionSearch: React.FC<DrugInteractionSearchProps> = ({ onSearch, isLoading }) => {
    const [drugs, setDrugs] = useState<string[]>(['', '']);

    const handleDrugChange = (index: number, value: string) => {
        const newDrugs = [...drugs];
        newDrugs[index] = value;
        setDrugs(newDrugs);
    };

    const addDrugInput = () => {
        setDrugs([...drugs, '']);
    };

    const removeDrugInput = (index: number) => {
        if (drugs.length <= 2) return;
        const newDrugs = drugs.filter((_, i) => i !== index);
        setDrugs(newDrugs);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(drugs);
    };
    
    const fetchSuggestions = useCallback(async (query: string) => {
        return await getDrugSuggestions(query);
    }, []);

    return (
        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4">Verificador de Interação Medicamentosa</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-3">
                    {drugs.map((drug, index) => (
                        <div key={index} className="flex items-center space-x-2">
                             <AutocompleteInput
                                id={`drug-interaction-${index}`}
                                value={drug}
                                onChange={(value) => handleDrugChange(index, value)}
                                getSuggestions={fetchSuggestions}
                                placeholder={`Medicamento ${index + 1}`}
                                disabled={isLoading}
                                className="w-full px-4 py-2 border rounded-lg bg-gray-800/50 text-white border-gray-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-150 ease-in-out"
                            />
                            {drugs.length > 2 && (
                                <button
                                    type="button"
                                    onClick={() => removeDrugInput(index)}
                                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded-full transition-colors"
                                    aria-label="Remover medicamento"
                                    disabled={isLoading}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                <button
                    type="button"
                    onClick={addDrugInput}
                    className="w-full text-sm text-sky-400 font-semibold py-2 px-4 rounded-lg hover:bg-sky-500/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition duration-150 ease-in-out"
                    disabled={isLoading}
                >
                    + Adicionar outro medicamento
                </button>

                <button
                    type="submit"
                    className="w-full bg-amber-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-150 ease-in-out flex items-center justify-center"
                    disabled={isLoading || drugs.filter(d => d.trim()).length < 2}
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Verificando...
                        </>
                    ) : (
                        'Verificar Interações'
                    )}
                </button>
            </form>
        </div>
    );
};

export default DrugInteractionSearch;