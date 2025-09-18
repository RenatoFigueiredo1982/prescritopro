
import React from 'react';

interface LandingPageProps {
  onEnter: () => void;
}

const Logo: React.FC<{ className?: string }> = ({ className }) => (
    <svg
        viewBox="0 0 24 24"
        className={className || "h-12 w-12 text-white"}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M8 21V3" />
        <path d="M8 3h4.5a4.5 4.5 0 1 1 0 9H8" />
        <path d="M14 15l6 6" />
        <path d="M20 15l-6 6" />
    </svg>
);

const FeatureCard: React.FC<{ icon: JSX.Element; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 shadow-lg transform hover:scale-105 transition-transform duration-300">
        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-sky-500 text-white mb-4">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-sky-100">{children}</p>
    </div>
);

// Icons for features
const PrescriptionIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);
const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);
const InteractionIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0 0h6m-6 0a1.5 1.5 0 01-3 0V7.5a1.5 1.5 0 013 0z" />
    </svg>
);
const FolderIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
);


const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans overflow-x-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-900 via-gray-900 to-teal-900 opacity-80"></div>
            <div className="relative isolate">
                <header className="p-4 sm:p-6 lg:p-8 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <Logo className="h-10 w-10 text-sky-400" />
                        <h1 className="text-2xl font-bold text-white">Prescrito Pro</h1>
                    </div>
                </header>
                
                <main>
                    {/* Hero Section */}
                    <section className="text-center py-20 px-4 sm:py-32">
                        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-teal-300 tracking-tight">
                            A prescrição do futuro, hoje.
                        </h2>
                        <p className="max-w-3xl mx-auto mt-6 text-lg text-sky-100">
                            Gere, consulte e gerencie prescrições com a agilidade e segurança que você precisa. Prescrito Pro é a ferramenta definitiva para o profissional de saúde moderno.
                        </p>
                        <button
                            onClick={onEnter}
                            className="mt-10 bg-sky-500 text-white font-bold py-3 px-8 rounded-full hover:bg-sky-400 focus:outline-none focus:ring-4 focus:ring-sky-300 focus:ring-opacity-50 transform hover:scale-110 transition-all duration-300 ease-in-out shadow-lg shadow-sky-500/30"
                        >
                            Confira a Aplicação
                        </button>
                    </section>
                    
                    {/* Features Section */}
                    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black/20">
                        <div className="max-w-screen-xl mx-auto">
                             <div className="text-center mb-12">
                                <h3 className="text-3xl font-bold text-white">Tudo que você precisa em um só lugar</h3>
                                <p className="text-sky-200 mt-2">Funcionalidades pensadas para otimizar sua rotina.</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                <FeatureCard title="Gerador Inteligente" icon={<PrescriptionIcon />}>
                                    Crie modelos de receituários baseados em diagnósticos, com sugestões de medicamentos e posologias geradas por IA.
                                </FeatureCard>
                                <FeatureCard title="Base de Dados Completa" icon={<SearchIcon />}>
                                    Acesse informações detalhadas sobre milhares de medicamentos, incluindo indicações, dosagens e avisos importantes.
                                </FeatureCard>
                                <FeatureCard title="Verificador de Interações" icon={<InteractionIcon />}>
                                    Garanta a segurança do paciente verificando potenciais interações medicamentosas entre múltiplos fármacos em segundos.
                                </FeatureCard>
                                <FeatureCard title="Organização Prática" icon={<FolderIcon />}>
                                    Salve suas prescrições, organize-as em pastas com um simples arrastar e soltar, e acesse seu histórico de qualquer lugar.
                                </FeatureCard>
                            </div>
                        </div>
                    </section>
                </main>

                <footer className="text-center p-8 text-gray-500">
                    <p>&copy; {new Date().getFullYear()} Prescrito Pro. Todos os direitos reservados.</p>
                </footer>
            </div>
        </div>
    );
};

export default LandingPage;