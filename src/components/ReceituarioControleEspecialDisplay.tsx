import React, { useState, useEffect, useCallback } from 'react';
import { Prescription, ProfileData, Medicamento } from '../types';
import AutocompleteInput from './AutocompleteInput';
import { getDrugSuggestions } from '../services/openFdaService';

interface ReceituarioControleEspecialDisplayProps {
    prescription: Prescription;
    onSave: (prescription: Prescription) => void;
    isViewing?: boolean;
    profileData: ProfileData | null;
    onClose?: () => void;
}

const EditableField: React.FC<{
    value: string;
    onChange: (value: string) => void;
    isViewing: boolean;
    placeholder: string;
    className?: string;
    isTextArea?: boolean;
}> = ({ value, onChange, isViewing, placeholder, className, isTextArea = false }) => {
    const commonClasses = "w-full bg-transparent focus:outline-none focus:bg-gray-100 rounded p-1 transition-colors text-sm";
    const disabledClasses = "disabled:cursor-default";

    if (isTextArea) {
        return (
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={isViewing}
                placeholder={placeholder}
                className={`${commonClasses} ${disabledClasses} resize-none min-h-[40px] ${className}`}
                rows={2}
            />
        );
    }
    return (
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={isViewing}
            placeholder={placeholder}
            className={`${commonClasses} ${disabledClasses} ${className}`}
        />
    );
};


const Field: React.FC<{ label: string; value: string | React.ReactNode; className?: string, valueClassName?: string }> = ({ label, value, className, valueClassName }) => (
    <div className={`flex items-baseline ${className}`}>
        <span className="text-[10px] uppercase text-gray-700 font-sans font-semibold mr-1 shrink-0">{label}</span>
        {typeof value === 'string' ? (
            <div className="flex-1 border-b border-dotted border-gray-600 min-w-0">
                <span className={`text-xs font-medium text-gray-900 pl-1 break-words ${valueClassName || ''}`}>{value}</span>
            </div>
        ) : (
            <div className="flex-1 min-w-0">{value}</div>
        )}
    </div>
);

const Section: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="border-2 border-gray-600 p-2">
        <h3 className="text-center text-xs font-bold bg-white -mt-4 mx-auto px-2 w-fit mb-2">{title}</h3>
        <div className="space-y-2">{children}</div>
    </div>
);


const ReceituarioControleEspecialDisplay: React.FC<ReceituarioControleEspecialDisplayProps> = ({ prescription, onSave, isViewing = false, profileData, onClose }) => {
    
    const [currentPrescription, setCurrentPrescription] = useState(prescription);

     useEffect(() => {
        const initialPrescription = { ...prescription };
        if (!initialPrescription.medicamentos) {
            initialPrescription.medicamentos = [];
        }
        initialPrescription.medicamentos = initialPrescription.medicamentos.map((med, index) => ({
            ...med,
            id: med.id || `${Date.now()}-${index}`
        }));
        setCurrentPrescription(initialPrescription);
    }, [prescription]);

    const handlePatientNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentPrescription(prev => ({ ...prev, nomePaciente: e.target.value }));
    };
    
    const handleMedicationChange = (index: number, field: keyof Omit<Medicamento, 'id'>, value: string) => {
        const updatedMeds = [...currentPrescription.medicamentos];
        updatedMeds[index] = { ...updatedMeds[index], [field]: value };
        setCurrentPrescription(prev => ({ ...prev, medicamentos: updatedMeds }));
    };

    const handleAddMedication = () => {
        const newMed: Medicamento = {
            id: `${Date.now()}-new`,
            medicamento: '',
            apresentacao: '',
            quantidade: '',
            posologia: ''
        };
        setCurrentPrescription(prev => ({ ...prev, medicamentos: [...(prev.medicamentos || []), newMed] }));
    };

    const handleRemoveMedication = (index: number) => {
        setCurrentPrescription(prev => ({
            ...prev,
            medicamentos: prev.medicamentos.filter((_, i) => i !== index)
        }));
    };

    const handleSaveClick = () => {
        onSave(currentPrescription);
    };
    
    const handlePrint = () => {
        window.print();
    };

    const generateShareableText = () => {
        const medsText = currentPrescription.medicamentos.map((med, index) => `
${index + 1}. ${med.medicamento} (${med.apresentacao}) ----- ${med.quantidade}
   Uso: ${med.posologia}.`).join('\n');
 
         return `
*RECEITUÁRIO DE CONTROLE ESPECIAL*
 
*Paciente:* ${currentPrescription.nomePaciente}
 
*Prescrição:*
${medsText}
${currentPrescription.observacoes ? `\nObservações: ${currentPrescription.observacoes}` : ''}
 
---
*Esta é uma pré-visualização gerada pelo Assistente de Prescrição Digital.*
        `.trim().replace(/(\n){3,}/g, '\n\n');
    };

    const handleShare = async () => {
        const textToShare = generateShareableText();
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Prescrição para ${currentPrescription.nomePaciente}`,
                    text: textToShare,
                });
            } catch (error) {
                console.error('Erro ao compartilhar:', error);
            }
        } else {
            alert('A função de compartilhar não é suportada neste navegador.');
        }
    };

    const handleShareWhatsApp = () => {
        const textToShare = generateShareableText();
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(textToShare)}`;
        window.open(whatsappUrl, '_blank');
    };
    
    const fetchSuggestions = useCallback(async (query: string) => {
        return await getDrugSuggestions(query);
    }, []);

    const today = new Date().toLocaleDateString('pt-BR');
    const fullAddress = [profileData?.clinicAddress, profileData?.clinicNeighborhood].filter(Boolean).join(', ');

    const WhatsAppIcon: React.FC<{ className?: string }> = ({ className }) => (
        <svg className={className || "h-5 w-5"} role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.888 9.884M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0z"/>
        </svg>
    );

    return (
        <div className="font-serif">
            <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 text-black printable-prescription">
                <header className="text-center mb-2">
                    <h2 className="text-lg font-bold">RECEITUÁRIO DE CONTROLE ESPECIAL</h2>
                    <p className="text-xs">(Válido em todo o Território Nacional)</p>
                </header>

                {/* EMITENTE */}
                <Section title="IDENTIFICAÇÃO DO EMITENTE">
                    <Field label="Nome do Estabelecimento:" value={profileData?.clinicName || ''} valueClassName="font-bold uppercase" />
                    <Field label="Nome Completo:" value={profileData?.doctorName || ''} />
                    <div className="grid grid-cols-2 gap-x-2">
                        <Field label="CRM:" value={profileData?.crm || ''} />
                        <Field label="UF:" value={profileData?.crmUf?.toUpperCase() || ''} />
                    </div>
                    <Field label="Endereço Completo:" value={fullAddress} />
                     <div className="grid grid-cols-2 gap-x-2">
                        <Field label="Cidade:" value={profileData?.clinicCity || ''} />
                        <Field label="UF:" value={profileData?.clinicUf?.toUpperCase() || ''} />
                    </div>
                     <div className="grid grid-cols-2 gap-x-2">
                        <Field label="Telefone:" value={profileData?.clinicPhone || ''} />
                        <Field label="Data:" value={today} />
                    </div>
                    {profileData?.clinicCnes && <Field label="CNES:" value={profileData.clinicCnes} />}
                    <div className="flex justify-end pt-4">
                        <div className="w-1/2 border-t border-gray-600 text-center mt-6">
                            <p className="text-xs uppercase mt-1">Assinatura e Carimbo</p>
                        </div>
                    </div>
                </Section>
                
                {/* PACIENTE E PRESCRIÇÃO */}
                <div className="mt-2 space-y-2">
                    <Field label="Paciente:" value={
                        <input 
                            type="text"
                            value={currentPrescription.nomePaciente}
                            onChange={handlePatientNameChange}
                            disabled={isViewing}
                            className="w-full text-xs font-medium text-gray-900 bg-transparent border-b border-dotted border-gray-600 focus:outline-none focus:border-solid"
                        />
                    }/>
                    <Field label="Endereço:" value="[Endereço do Paciente]" />
                    <div className="flex flex-col pt-2">
                        <span className="text-xs uppercase text-gray-700 font-sans font-semibold mb-1">Prescrição:</span>
                        <div className="border border-gray-600 min-h-[150px] p-2 space-y-3">
                            {currentPrescription.medicamentos?.map((med, index) => (
                                <div key={med.id} className="p-2 border border-gray-300 rounded-md relative group/med">
                                    {/* Line 1 */}
                                    <div className="flex justify-between items-start space-x-2">
                                        {/* Left part */}
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2">
                                                <span className="font-sans font-bold text-gray-600">{index + 1}.</span>
                                                <AutocompleteInput
                                                    id={`med-name-special-${med.id}`}
                                                    value={med.medicamento}
                                                    onChange={(value) => handleMedicationChange(index, 'medicamento', value)}
                                                    getSuggestions={fetchSuggestions}
                                                    disabled={isViewing}
                                                    placeholder="Nome do Medicamento e Dosagem"
                                                    className="w-full bg-transparent focus:outline-none focus:bg-gray-100 rounded p-1 font-semibold text-gray-900 text-sm"
                                                />
                                            </div>
                                            <div className="pl-5 mt-1">
                                                <EditableField value={med.apresentacao} onChange={(v) => handleMedicationChange(index, 'apresentacao', v)} isViewing={isViewing} placeholder="Apresentação" />
                                            </div>
                                        </div>
                                        {/* Right part */}
                                        <div className="w-1/3">
                                            <EditableField value={med.quantidade} onChange={(v) => handleMedicationChange(index, 'quantidade', v)} isViewing={isViewing} placeholder="Quantidade" className="text-right" />
                                        </div>
                                    </div>
                                    {/* Line 2 */}
                                    <div className="pl-5 mt-1">
                                        <EditableField value={med.posologia} onChange={(value) => handleMedicationChange(index, 'posologia', value)} isViewing={isViewing} placeholder="Posologia" isTextArea />
                                    </div>
                                    {!isViewing && (
                                        <button 
                                            onClick={() => handleRemoveMedication(index)}
                                            className="absolute top-0 right-0 p-1 text-gray-400 hover:text-red-500 rounded-full opacity-0 group-hover/med:opacity-100 transition-opacity"
                                            aria-label="Remover medicamento"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            ))}
                            {!isViewing && (
                                <button
                                    onClick={handleAddMedication}
                                    className="w-full text-xs font-sans text-sky-600 font-semibold py-1.5 px-3 rounded-lg hover:bg-sky-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition duration-150 ease-in-out mt-2"
                                >
                                    + Adicionar Medicamento
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                 {/* COMPRADOR E FORNECEDOR */}
                <div className="grid grid-cols-2 gap-x-2 mt-2 text-[10px]">
                    <Section title="IDENTIFICAÇÃO DO COMPRADOR">
                        <Field label="Nome:" value="" />
                        <Field label="Identidade:" value="" />
                        <Field label="Endereço:" value="" />
                        <Field label="Cidade:" value="" />
                        <Field label="Telefone:" value="" />
                         <div className="border-t border-gray-600 text-center mt-8 pt-1">
                            <p className="text-[10px] uppercase">Assinatura do Comprador</p>
                        </div>
                    </Section>
                     <Section title="IDENTIFICAÇÃO DO FORNECEDOR">
                        <Field label="Nome:" value="" />
                        <Field label="CRF:" value="" />
                        <Field label="Data:" value="" />
                         <div className="border-t border-gray-600 text-center mt-12 pt-1">
                            <p className="text-[10px] uppercase">Assinatura do Farmacêutico</p>
                        </div>
                    </Section>
                </div>

            </div>
            {!isViewing && (
                <div className="mt-4 flex flex-wrap gap-2 no-print">
                   <button onClick={handlePrint} className="flex-1 basis-full sm:basis-auto bg-sky-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition duration-150 ease-in-out font-sans flex items-center justify-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v3a2 2 0 002 2h6a2 2 0 002-2v-3h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" /></svg>
                        <span>Imprimir</span>
                    </button>
                    {typeof navigator.share !== 'undefined' && 
                        <button onClick={handleShare} className="flex-1 basis-1/2 sm:basis-auto bg-violet-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-violet-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition duration-150 ease-in-out font-sans flex items-center justify-center space-x-2">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg>
                            <span>Compartilhar</span>
                        </button>
                    }
                     <button onClick={handleShareWhatsApp} className="flex-1 basis-1/2 sm:basis-auto bg-emerald-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition duration-150 ease-in-out font-sans flex items-center justify-center space-x-2">
                        <WhatsAppIcon />
                        <span>WhatsApp</span>
                    </button>
                    <button onClick={handleSaveClick} className="flex-1 basis-full sm:basis-auto bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out font-sans flex items-center justify-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V4zm3 1h2a1 1 0 011 1v2a1 1 0 11-2 0V6H8a1 1 0 010-2zm-1 5a1 1 0 00-1 1v6h6v-6a1 1 0 10-2 0v4H8v-4a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                        <span>Salvar</span>
                    </button>
                    {onClose && (
                        <button onClick={onClose} className="flex-1 basis-full sm:basis-auto bg-gray-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-150 ease-in-out font-sans flex items-center justify-center space-x-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                            <span>Fechar</span>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default ReceituarioControleEspecialDisplay;