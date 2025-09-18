import { DrugInfo, ResultadoInteracao, ProfileData } from '../types';
import { generateDrugInfo, generateDrugInteractions } from './geminiService';
import { anvisaSuggestions } from './anvisaData';

/**
 * Este serviço agora utiliza a API Gemini para buscar informações sobre medicamentos e interações,
 * em vez da API OpenFDA.
 */

export const searchDrug = async (drugName: string): Promise<DrugInfo> => {
    try {
        const data = await generateDrugInfo(drugName);
        return data;
    } catch (error: any) {
        console.error('Erro ao buscar dados do medicamento via Gemini:', error);
        throw new Error(error.message || 'Não foi possível obter as informações do medicamento.');
    }
};

export const searchInteractions = async (drugNames: string[]): Promise<ResultadoInteracao[]> => {
    const trimmedDrugNames = drugNames.map(name => name.trim()).filter(Boolean);
    try {
        const data = await generateDrugInteractions(trimmedDrugNames);
        return data;
    } catch (err: any) {
        console.error('Erro ao verificar interações via Gemini:', err);
        throw new Error(err.message || 'Falha ao verificar as interações medicamentosas.');
    }
};

/**
 * Fornece sugestões de autocompletar para nomes de medicamentos.
 * Utiliza a lista local expandida para sugestões mais rápidas e relevantes.
 * @param query O termo de busca inserido pelo usuário.
 * @returns Uma lista de nomes de medicamentos correspondentes.
 */
export const getDrugSuggestions = async (query: string): Promise<string[]> => {
    if (query.length < 2) {
        return [];
    }
    const lowerCaseQuery = query.toLowerCase().trim();

    // Filtra a lista local da ANVISA em vez de chamar a API
    const suggestions = anvisaSuggestions.filter(name =>
        name.toLowerCase().includes(lowerCaseQuery)
    );

    // Limita o número de sugestões e prioriza as que começam com a query
    return suggestions
        .sort((a, b) => {
            const aStartsWith = a.toLowerCase().startsWith(lowerCaseQuery);
            const bStartsWith = b.toLowerCase().startsWith(lowerCaseQuery);
            if (aStartsWith && !bStartsWith) return -1;
            if (!aStartsWith && bStartsWith) return 1;
            return a.localeCompare(b);
        })
        .slice(0, 10);
};

interface CnesEstablishment {
    codigo_cnes: number;
    nome_fantasia: string;
    endereco_estabelecimento: string;
    numero_estabelecimento: string;
    bairro_estabelecimento: string;
    codigo_uf: number;
    codigo_municipio: number;
    numero_telefone_estabelecimento: string | null;
}

interface IbgeUf {
    sigla: string;
}

interface IbgeMunicipio {
    nome: string;
}

/**
 * Busca dados de um estabelecimento de saúde na API do DataSUS pelo CNES.
 * Utiliza um proxy CORS para evitar erros de "Failed to fetch" no navegador e complementa com dados do IBGE.
 * @param cnes O número do CNES com 7 dígitos.
 * @returns Um objeto parcial com os dados do perfil para preenchimento.
 */
export const fetchCnesData = async (cnes: string): Promise<Partial<ProfileData>> => {
    const cleanedCnes = cnes.replace(/\D/g, ''); // Remove non-digits
    if (cleanedCnes.length !== 7) {
        throw new Error("CNES inválido. Deve conter 7 dígitos.");
    }
    
    // Use the direct lookup endpoint, which is more reliable for a single record.
    // e.g., https://apidadosabertos.saude.gov.br/cnes/estabelecimentos/0939145
    const targetUrl = `https://apidadosabertos.saude.gov.br/cnes/estabelecimentos/${cleanedCnes}`;
    
    // A CORS proxy is used to prevent potential cross-origin issues in the browser.
    const proxyUrl = 'https://corsproxy.io/?';
    const cnesUrl = `${proxyUrl}${encodeURIComponent(targetUrl)}`;

    try {
        const cnesResponse = await fetch(cnesUrl, {
            cache: 'no-store',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
            },
        });

        if (!cnesResponse.ok) {
             if (cnesResponse.status === 404) {
                throw new Error("Nenhum estabelecimento encontrado com o CNES informado.");
             }
            throw new Error(`Erro na API CNES: Código ${cnesResponse.status}`);
        }
        
        // This endpoint returns a single establishment object, not an array.
        const establishment: CnesEstablishment = await cnesResponse.json();
        
        if (establishment && establishment.codigo_cnes) {
            // The IBGE API is known to have proper CORS headers, so no proxy is needed.
            const [ufResponse, municipioResponse] = await Promise.all([
                fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${establishment.codigo_uf}`),
                fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/municipios/${establishment.codigo_municipio}`)
            ]);

            let ufData: IbgeUf | null = null;
            let municipioData: IbgeMunicipio | null = null;
            
            if (ufResponse.ok && municipioResponse.ok) {
                ufData = await ufResponse.json();
                municipioData = await municipioResponse.json();
            } else {
                 console.warn('Falha ao buscar dados de localização (UF/Município) do IBGE.');
            }

            const address = [establishment.endereco_estabelecimento, establishment.numero_estabelecimento].filter(Boolean).join(', ');

            const profileUpdate: Partial<ProfileData> = {
                clinicName: establishment.nome_fantasia,
                clinicAddress: address,
                clinicNeighborhood: establishment.bairro_estabelecimento,
                clinicCity: municipioData?.nome || '',
                clinicUf: ufData?.sigla || '',
                clinicPhone: establishment.numero_telefone_estabelecimento || '',
            };
            return profileUpdate;
        } else {
            throw new Error("Nenhum estabelecimento encontrado com o CNES informado.");
        }

    } catch (error: any) {
        console.error('Erro ao buscar dados do CNES:', error);
        if (error instanceof TypeError && error.message.toLowerCase().includes('failed to fetch')) {
            throw new Error('Não foi possível conectar à API do CNES. Verifique sua conexão ou tente novamente mais tarde.');
        }
        throw new Error(error.message || 'Não foi possível obter os dados do estabelecimento.');
    }
};