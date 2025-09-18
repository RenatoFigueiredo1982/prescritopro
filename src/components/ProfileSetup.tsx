import React, { useState } from 'react';
import { ProfileData } from '../types';
import { fetchCnesData } from '../services/openFdaService';

interface ProfileSetupProps {
    onSave: (data: ProfileData) => void;
    initialData?: ProfileData | null;
    onClose?: () => void;
}

const InputField: React.FC<{
    label: string;
    name: keyof ProfileData;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    className?: string;
    maxLength?: number;
}> = ({ label, name, value, onChange, placeholder, className, maxLength }) => (
    <div className={className}>
        <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">
            {label}
        </label>
        <input
            type="text"
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            maxLength={maxLength}
            className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-150 ease-in-out"
            required
        />
    </div>
);


const ProfileSetup: React.FC<ProfileSetupProps> = ({ onSave, initialData, onClose }) => {
    const [profile, setProfile] = useState<ProfileData>(initialData || {
        doctorName: '',
        crm: '',
        crmUf: '',
        clinicName: '',
        clinicAddress: '',
        clinicNeighborhood: '',
        clinicCity: '',
        clinicUf: '',
        clinicPhone: '',
        clinicCnes: '',
    });
    const [isCnesLoading, setIsCnesLoading] = useState(false);
    const [cnesError, setCnesError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
        if (name === 'clinicCnes') {
             setCnesError(null);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(profile);
    };
    
    const handleCnesSearch = async () => {
        if (!profile.clinicCnes) return;
        
        setIsCnesLoading(true);
        setCnesError(null);
        try {
            const cnesData = await fetchCnesData(profile.clinicCnes);
            setProfile(prev => ({ ...prev, ...cnesData, clinicCnes: prev.clinicCnes })); // Preserve the typed CNES
        } catch (error: any) {
            setCnesError(error.message);
        } finally {
            setIsCnesLoading(false);
        }
    };

    const isEditing = !!initialData;

    return (
        <div className={`w-full max-w-2xl mx-auto bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 my-8`}>
             <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white">{isEditing ? 'Editar Perfil' : 'Configuração de Perfil'}</h1>
                {isEditing && onClose && (
                    <button onClick={onClose} className="p-1.5 rounded-full text-gray-300 hover:bg-gray-600" aria-label="Fechar">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>
            {!isEditing && <p className="text-gray-300 mb-6">Antes de começar, precisamos de algumas informações que serão usadas para preencher suas prescrições.</p>}
            
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Professional Info Section */}
                <fieldset className="space-y-4 p-4 border border-gray-600 rounded-lg">
                    <legend className="text-lg font-semibold text-gray-200 px-2">Informações do Profissional</legend>
                    <InputField label="Nome Completo" name="doctorName" value={profile.doctorName} onChange={handleChange} placeholder="Dr. Nome Sobrenome" />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <InputField label="Nº do CRM" name="crm" value={profile.crm} onChange={handleChange} placeholder="123456" className="sm:col-span-2" />
                        <InputField label="UF" name="crmUf" value={profile.crmUf} onChange={handleChange} placeholder="SP" maxLength={2} />
                    </div>
                </fieldset>

                {/* Clinic Info Section */}
                <fieldset className="space-y-4 p-4 border border-gray-600 rounded-lg">
                    <legend className="text-lg font-semibold text-gray-200 px-2">Informações do Local de Atendimento</legend>
                    
                     <div>
                        <label htmlFor="clinicCnes" className="block text-sm font-medium text-gray-300 mb-1">
                           CNES (Busca Automática)
                        </label>
                        <div className="flex items-start space-x-2">
                            <input
                                type="text"
                                id="clinicCnes"
                                name="clinicCnes"
                                value={profile.clinicCnes}
                                onChange={handleChange}
                                placeholder="Digite os 7 dígitos do CNES"
                                maxLength={7}
                                className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-150 ease-in-out"
                            />
                            <button
                                type="button"
                                onClick={handleCnesSearch}
                                disabled={isCnesLoading || !profile.clinicCnes || profile.clinicCnes.length < 7}
                                className="px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-gray-400 transition flex-shrink-0 h-[42px] flex items-center"
                                aria-label="Buscar dados do CNES"
                            >
                                {isCnesLoading ? (
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    'Buscar'
                                )}
                            </button>
                        </div>
                        {cnesError && <p className="text-red-500 text-sm mt-1">{cnesError}</p>}
                    </div>

                    <InputField label="Nome do Estabelecimento" name="clinicName" value={profile.clinicName} onChange={handleChange} placeholder="Será preenchido pela busca" />
                    <InputField label="Endereço (Rua, Nº)" name="clinicAddress" value={profile.clinicAddress} onChange={handleChange} placeholder="Será preenchido pela busca" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InputField label="Bairro" name="clinicNeighborhood" value={profile.clinicNeighborhood} onChange={handleChange} placeholder="Será preenchido pela busca" />
                        <InputField label="Cidade" name="clinicCity" value={profile.clinicCity} onChange={handleChange} placeholder="Será preenchido pela busca" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InputField label="UF" name="clinicUf" value={profile.clinicUf} onChange={handleChange} placeholder="UF" maxLength={2} />
                        <InputField label="Telefone" name="clinicPhone" value={profile.clinicPhone} onChange={handleChange} placeholder="Será preenchido pela busca" />
                    </div>
                </fieldset>
                
                <button type="submit" className="w-full bg-sky-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-gray-400 transition duration-150 ease-in-out flex items-center justify-center">
                    Salvar Informações
                </button>
            </form>
        </div>
    );
};

export default ProfileSetup;