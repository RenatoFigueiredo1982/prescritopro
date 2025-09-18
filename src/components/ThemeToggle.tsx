import React, { useState, useEffect, useRef, Fragment } from 'react';
import { Theme } from '../types';

const SunIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const MoonIcon: React.FC<{ className?: string }> = ({ className }) => (
     <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
);

const SystemIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

interface ThemeToggleProps {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const themeOptions: { name: Theme; icon: JSX.Element, label: string }[] = [
    { name: 'light', icon: <SunIcon />, label: 'Claro' },
    { name: 'dark', icon: <MoonIcon />, label: 'Escuro' },
    { name: 'system', icon: <SystemIcon />, label: 'Sistema' }
];

const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, setTheme }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const activeIcon = themeOptions.find(opt => opt.name === theme)?.icon;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 transition-all duration-300"
                aria-label="Selecionar tema"
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                {React.cloneElement(activeIcon || <SystemIcon />, { className: 'h-6 w-6' })}
            </button>
            
            {isOpen && (
                <div 
                    className="absolute right-0 mt-2 w-36 origin-top-right bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none transition ease-out duration-100"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="menu-button"
                >
                    <div className="py-1" role="none">
                        {themeOptions.map(option => (
                            <button
                                key={option.name}
                                onClick={() => {
                                    setTheme(option.name);
                                    setIsOpen(false);
                                }}
                                className={`w-full text-left flex items-center space-x-3 px-4 py-2 text-sm ${
                                    theme === option.name 
                                        ? 'bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white' 
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                                role="menuitem"
                            >
                                {option.icon}
                                <span>{option.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ThemeToggle;