import React, { useState, useCallback } from 'react';
import AutocompleteInput from './AutocompleteInput';
import { getDrugSuggestions } from '../services/openFdaService';

interface DrugSearchProps {
    onSearch: (drugName: string) => void;
    isLoading: boolean;
}

const DrugSearch: React.FC<DrugSearchProps> = ({ onSearch, isLoading }) => {
    const [drugName, setDrugName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(drugName);
    };

    const fetchSuggestions = useCallback(async (query: string) => {
        return await getDrugSuggestions(query);
    }, []);

    return (
        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4">Consulta de Medicamentos</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="drugName" className="block text-sm font-medium text-sky-200 mb-1">
                        Nome do Medicamento
                    </label>
                    <AutocompleteInput
                        id="drugName"
                        value={drugName}
                        onChange={setDrugName}
                        getSuggestions={fetchSuggestions}
                        placeholder="Ex: Dipirona"
                        disabled={isLoading}
                        className="w-full px-4 py-2 border rounded-lg bg-gray-800/50 text-white border-gray-600 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-150 ease-in-out"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-sky-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-150 ease-in-out flex items-center justify-center"
                    disabled={isLoading || !drugName}
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Buscando...
                        </>
                    ) : (
                        'Buscar Medicamento'
                    )}
                </button>
            </form>
        </div>
    );
};

export default DrugSearch;