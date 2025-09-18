import { GoogleGenAI, Type } from "@google/genai";
import { Prescription, DrugInfo, ResultadoInteracao } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const medicamentoSchema = {
    type: Type.OBJECT,
    properties: {
        medicamento: {
            type: Type.STRING,
            description: "O nome do medicamento recomendado, incluindo a dosagem (ex: 'Amoxicilina 500mg', 'Dipirona 1g')."
        },
        apresentacao: {
            type: Type.STRING,
            description: "A forma farmacêutica do medicamento. Ex: 'Comprimidos', 'Solução oral', 'Cápsulas'."
        },
        quantidade: {
            type: Type.STRING,
            description: "A quantidade total a ser dispensada. Ex: '1 caixa', '2 frascos', '21 comprimidos'."
        },
        posologia: {
            type: Type.STRING,
            description: "Instruções de uso combinando frequência e duração. Ex: 'Tomar 1 comprimido a cada 8 horas por 7 dias'."
        },
    },
    required: ["medicamento", "apresentacao", "quantidade", "posologia"]
};

const prescriptionSchema = {
    type: Type.OBJECT,
    properties: {
        nomePaciente: {
            type: Type.STRING,
            description: "Um placeholder para o nome do paciente, como '[Nome do Paciente]'."
        },
        diagnostico: {
            type: Type.STRING,
            description: "O diagnóstico médico fornecido no prompt."
        },
        medicamentos: {
            type: Type.ARRAY,
            description: "Uma lista de um ou mais medicamentos para a prescrição.",
            items: medicamentoSchema
        },
        observacoes: {
            type: Type.STRING,
            description: "Instruções adicionais (ex: 'Tomar após as refeições'). Se não houver, retorne uma string vazia."
        },
    },
    required: ["nomePaciente", "diagnostico", "medicamentos", "observacoes"]
};

export const generatePrescriptionTemplate = async (diagnosis: string, type: 'simples' | 'controle_especial'): Promise<Prescription> => {
    try {
        const prompt = `Gere um modelo de prescrição médica para o diagnóstico de "${diagnosis}". A prescrição deve conter um ou mais medicamentos que sejam apropriados para o diagnóstico. O tipo de receituário é "${type}". 
Siga estritamente o formato de resposta JSON com o schema fornecido.
A resposta deve estar em português do Brasil.

Para cada medicamento:
1. No campo 'medicamento', inclua o nome do fármaco e a dosagem (ex: "Amoxicilina 500mg").
2. A 'posologia' deve ser uma única string combinando a frequência e a duração do tratamento.
3. Para medicamentos com duração de tratamento definida (como antibióticos), calcule a quantidade total necessária (ex: número total de comprimidos) e preencha o campo 'quantidade' adequadamente (ex: "21 comprimidos" ou "1 caixa com 21 comprimidos").

O campo 'nomePaciente' deve ser um placeholder, como '[Nome do Paciente]'.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: prescriptionSchema,
                temperature: 0.5,
            },
        });
        
        const jsonText = response.text.trim();
        const prescriptionData: Omit<Prescription, 'tipo' | 'id'> = JSON.parse(jsonText);
        
        // Add unique IDs for React keys
        if (prescriptionData.medicamentos) {
            prescriptionData.medicamentos = prescriptionData.medicamentos.map((med, index) => ({
                ...med,
                id: `${Date.now()}-${index}`
            }));
        }

        return { ...prescriptionData, tipo: type };

    } catch (error) {
        console.error('Error generating prescription from Gemini:', error);
        throw new Error('Falha ao comunicar com o modelo de IA. Verifique sua chave de API e tente novamente.');
    }
};

const drugInfoSchema = {
    type: Type.OBJECT,
    properties: {
        nome_comercial: { type: Type.ARRAY, description: "Nomes comerciais do medicamento.", items: { type: Type.STRING } },
        nome_generico: { type: Type.ARRAY, description: "Nomes genéricos do medicamento.", items: { type: Type.STRING } },
        principio_ativo: { type: Type.ARRAY, description: "Princípios ativos do medicamento.", items: { type: Type.STRING } },
        indicacoes_e_uso: { type: Type.ARRAY, description: "Indicações e modo de uso do medicamento.", items: { type: Type.STRING } },
        dosagem_e_administracao: { type: Type.ARRAY, description: "Informações sobre dosagem e administração.", items: { type: Type.STRING } },
        avisos: { type: Type.ARRAY, description: "Avisos, precauções e contraindicações importantes.", items: { type: Type.STRING } },
    },
    required: ["nome_comercial", "nome_generico", "principio_ativo", "indicacoes_e_uso", "dosagem_e_administracao", "avisos"]
};


export const generateDrugInfo = async (drugName: string): Promise<DrugInfo> => {
    try {
        const prompt = `Forneça informações detalhadas sobre o medicamento: "${drugName}". O nome pode estar em português ou inglês. Quero informações que seriam úteis para um profissional de saúde no Brasil. Se o nome fornecido for uma marca, certifique-se de que os nomes genéricos e os ingredientes ativos sejam listados. Se for um nome genérico, liste algumas marcas comuns. Forneça respostas concisas e bem estruturadas em português do Brasil, usando o schema JSON. Se o medicamento não for reconhecido, retorne um objeto JSON com todos os campos como arrays contendo a string 'Não encontrado'.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: drugInfoSchema,
                temperature: 0.2,
            },
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText);

    } catch (error) {
        console.error(`Error generating drug info for ${drugName} from Gemini:`, error);
        throw new Error('Falha ao comunicar com o modelo de IA para obter informações sobre medicamentos.');
    }
};

const interactionInfoSchema = {
    type: Type.OBJECT,
    properties: {
        nomeMedicamento: { type: Type.STRING, description: "O nome do medicamento com o qual há interação." },
        classificacao: { 
            type: Type.STRING, 
            description: "A classificação da gravidade da interação usando o modelo de risco (A, B, C, D, X) semelhante ao UpToDate. A: Nenhuma interação conhecida. B: Nenhuma ação necessária. C: Monitorar terapia. D: Considerar modificação da terapia. X: Evitar combinação. N/A: Se não houver classificação."
        },
        resumo: { type: Type.STRING, description: "Um resumo de uma frase sobre o efeito da interação." },
        textoInteracao: { type: Type.STRING, description: "Descrição detalhada da interação, incluindo o mecanismo, efeitos potenciais e recomendações de manejo clínico." }
    },
    required: ["nomeMedicamento", "classificacao", "resumo", "textoInteracao"]
};

const interactionResultSchema = {
    type: Type.OBJECT,
    properties: {
        medicamentoFonte: { type: Type.STRING, description: "O nome do medicamento sendo analisado para interações." },
        interacoes: {
            type: Type.ARRAY,
            items: interactionInfoSchema
        },
        encontrado: { type: Type.BOOLEAN, description: "Se o medicamento foi encontrado para análise de interação." },
        mensagemErro: { type: Type.STRING, description: "Mensagem de erro se o medicamento não for encontrado ou se não houver informações." }
    },
    required: ["medicamentoFonte", "interacoes", "encontrado"]
};

const fullInteractionSchema = {
    type: Type.ARRAY,
    items: interactionResultSchema
};

export const generateDrugInteractions = async (drugNames: string[]): Promise<ResultadoInteracao[]> => {
    try {
        const prompt = `Analise as interações medicamentosas potenciais entre os seguintes medicamentos: ${drugNames.join(', ')}. Para cada medicamento na lista, liste suas interações com CADA UM dos outros medicamentos da lista. 
Classifique cada interação de acordo com o seguinte modelo de risco:
- A: Nenhuma interação conhecida.
- B: Nenhuma ação necessária.
- C: Monitorar terapia.
- D: Considerar modificação da terapia.
- X: Evitar combinação.
- N/A: Se a interação não for classificável.

Se um medicamento não for encontrado ou não houver interações conhecidas com os outros, indique isso claramente. Formate a resposta como uma lista de objetos, um para cada medicamento de origem. Responda em português do Brasil e use o schema JSON fornecido. Forneça um resumo conciso e um texto detalhado para cada interação.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: fullInteractionSchema,
                temperature: 0.3,
            },
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText);

    } catch (error) {
        console.error('Error generating drug interactions from Gemini:', error);
        throw new Error('Falha ao comunicar com o modelo de IA para verificar interações.');
    }
};