
export interface ProfileData {
    doctorName: string;
    crm: string;
    crmUf: string;
    clinicName: string;
    clinicAddress: string;
    clinicNeighborhood: string;
    clinicCity: string;
    clinicUf: string;
    clinicPhone: string;
    clinicCnes: string;
}

export interface DrugInfo {
    nome_comercial: string[];
    nome_generico: string[];
    indicacoes_e_uso: string[];
    avisos: string[];
    dosagem_e_administracao: string[];
    principio_ativo: string[];
}

export interface Medicamento {
    id: string;
    medicamento: string;
    apresentacao: string;
    quantidade: string;
    posologia: string;
}

export interface Prescription {
    id?: string;
    tipo: 'simples' | 'controle_especial';
    nomePaciente: string;
    idadePaciente?: number;
    diagnostico: string;
    medicamentos: Medicamento[];
    observacoes: string;
    folderId?: string;
}

export interface InfoInteracao {
    nomeMedicamento: string;
    classificacao: 'A' | 'B' | 'C' | 'D' | 'X' | 'N/A';
    resumo: string;
    textoInteracao: string | null;
}

export interface ResultadoInteracao {
    medicamentoFonte: string;
    interacoes: InfoInteracao[];
    encontrado: boolean;
    mensagemErro?: string;
}

export interface Folder {
    id: string;
    name: string;
}

// FIX: Added missing Theme type export for components/ThemeToggle.tsx
export type Theme = 'light' | 'dark' | 'system';
