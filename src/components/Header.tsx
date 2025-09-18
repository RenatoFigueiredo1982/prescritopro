import React from 'react';

interface HeaderProps {
    onSettingsClick: () => void;
}

const Logo: React.FC = () => (
    <svg
        viewBox="0 0 24 24"
        className="h-10 w-10 text-sky-400"
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


const Header: React.FC<HeaderProps> = ({ onSettingsClick }) => {
    return (
        <header className="bg-black/20 backdrop-blur-sm no-print">
            <div className="max-w-screen-2xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <Logo />
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-white">
                           Prescrito Pro
                        </h1>
                         <p className="text-xs text-sky-200 hidden sm:block">Prescrições inteligentes, cuidado eficiente.</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                     <button
                        onClick={onSettingsClick}
                        className="p-2 rounded-full text-sky-200 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 focus:ring-offset-gray-900 transition-all duration-300"
                        aria-label="Configurações do Perfil"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;