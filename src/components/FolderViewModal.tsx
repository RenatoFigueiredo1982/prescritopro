import React from 'react';
import { Folder, Prescription } from '../types';

interface FolderViewModalProps {
    folder: Folder;
    prescriptions: Prescription[];
    onClose: () => void;
    onViewPrescription: (prescription: Prescription) => void;
    onDeletePrescription: (prescriptionId: string) => void;
    onRemoveFromFolder: (prescriptionId: string) => void;
}

const FolderViewModal: React.FC<FolderViewModalProps> = ({ folder, prescriptions, onClose, onViewPrescription, onDeletePrescription, onRemoveFromFolder }) => {
    
    return (
        <div 
            className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center z-50 p-4 transition-opacity duration-300"
            onClick={onClose}
        >
            <div 
                className="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="p-4 border-b border-gray-600 flex justify-between items-center sticky top-0 bg-gray-800 z-10">
                    <div className="flex items-center space-x-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                        <h2 className="text-xl font-bold text-white">{folder.name}</h2>
                    </div>
                     <button 
                        onClick={onClose} 
                        className="p-1.5 rounded-full text-gray-300 hover:bg-gray-600"
                        aria-label="Fechar"
                    >
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </header>

                <div className="p-4 sm:p-6 overflow-y-auto">
                    {prescriptions.length === 0 ? (
                        <div className="text-center py-10">
                            <p className="text-gray-400">Esta pasta está vazia.</p>
                            <p className="text-sm text-gray-500 mt-1">Arraste e solte uma prescrição salva para organizá-la aqui.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {prescriptions.map(p => {
                                const firstMed = p.medicamentos && p.medicamentos.length > 0 ? p.medicamentos[0] : null;
                                return (
                                <div 
                                    key={p.id} 
                                    className="bg-gray-700/50 p-3 rounded-lg border border-gray-600 flex justify-between items-center group"
                                >
                                   <div className="flex-1 overflow-hidden cursor-pointer" onClick={() => onViewPrescription(p)}>
                                        <p className="font-semibold text-white truncate">
                                            {firstMed ? `${firstMed.medicamento} para ${p.nomePaciente}` : `Prescrição para ${p.nomePaciente}`}
                                        </p>
                                        <p className="text-sm text-gray-300 truncate">
                                            {firstMed ? `${firstMed.apresentacao} - ${firstMed.posologia}` : p.diagnostico}
                                        </p>
                                   </div>
                                   <div className="flex items-center space-x-2 pl-2">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onRemoveFromFolder(p.id!); }}
                                            className="text-gray-400 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Remover da Pasta"
                                        >
                                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M11 3a1 1 0 10-2 0v1H7a1 1 0 000 2h6a1 1 0 100-2h-2V3z" />
                                                <path fillRule="evenodd" d="M4.5 5.5A.5.5 0 015 5h10a.5.5 0 01.5.5v1a.5.5 0 01-.5.5H5a.5.5 0 01-.5-.5v-1zM6 9a1 1 0 00-1 1v3a1 1 0 001 1h8a1 1 0 001-1v-3a1 1 0 00-1-1H6z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onDeletePrescription(p.id!); }}
                                            className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Deletar Prescrição"
                                        >
                                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                   </div>
                                </div>
                            )})}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FolderViewModal;