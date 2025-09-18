import React, { useState } from 'react';

interface PrescriptionGeneratorProps {
    onGenerate: (diagnosis: string, type: 'simples' | 'controle_especial') => void;
    isLoading: boolean;
}

const PrescriptionGenerator: React.FC<PrescriptionGeneratorProps> = ({ onGenerate, isLoading }) => {
    const [diagnosis, setDiagnosis] = useState('');
    const [type, setType] = useState<'simples' | 'controle_especial'>('simples');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onGenerate(diagnosis, type);
    };

    return (
        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4">Gerador de Prescrição</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-sky-200 mb-2">
                        Tipo de Receituário
                    </label>
                    <div className="flex space-x-4">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="radio"
                                name="prescriptionType"
                                value="simples"
                                checked={type === 'simples'}
                                onChange={() => setType('simples')}
                                className="form-radio h-4 w-4 text-sky-600 transition duration-150 ease-in-out"
                                disabled={isLoading}
                            />
                            <span className="text-gray-200">Simples</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="radio"
                                name="prescriptionType"
                                value="controle_especial"
                                checked={type === 'controle_especial'}
                                onChange={() => setType('controle_especial')}
                                className="form-radio h-4 w-4 text-sky-600 transition duration-150 ease-in-out"
                                disabled={isLoading}
                            />
                            <span className="text-gray-200">Controle Especial</span>
                        </label>
                    </div>
                </div>

                <div>
                    <label htmlFor="diagnosis" className="block text-sm font-medium text-sky-200 mb-1">
                        Diagnóstico do Paciente
                    </label>
                    <textarea
                        id="diagnosis"
                        value={diagnosis}
                        onChange={(e) => setDiagnosis(e.target.value)}
                        placeholder="Ex: Sinusite bacteriana aguda"
                        rows={3}
                        className="w-full px-4 py-2 border rounded-lg bg-gray-800/50 text-white border-gray-600 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-150 ease-in-out"
                        disabled={isLoading}
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-sky-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-150 ease-in-out flex items-center justify-center"
                    disabled={isLoading || !diagnosis}
                >
                    {isLoading ? (
                         <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Gerando...
                        </>
                    ) : (
                        'Gerar Modelo'
                    )}
                </button>
            </form>
        </div>
    );
};

export default PrescriptionGenerator;