import React, { useState, useEffect, useRef, useCallback } from 'react';

interface AutocompleteInputProps {
    id: string;
    value: string;
    onChange: (value: string) => void;
    getSuggestions: (query: string) => Promise<string[]>;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
    id,
    value,
    onChange,
    getSuggestions,
    placeholder,
    disabled,
    className
}) => {
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [isSuggestionsVisible, setIsSuggestionsVisible] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    // FIX: Replaced NodeJS.Timeout with ReturnType<typeof setTimeout> for browser compatibility.
    const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const fetchSuggestions = useCallback((query: string) => {
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }
        if (query.length < 3) {
            setSuggestions([]);
            setIsSuggestionsVisible(false);
            return;
        }

        debounceTimeoutRef.current = setTimeout(async () => {
            setIsLoading(true);
            const result = await getSuggestions(query);
            setSuggestions(result);
            setIsLoading(false);
            setIsSuggestionsVisible(result.length > 0);
        }, 300); // 300ms debounce delay
    }, [getSuggestions]);

    useEffect(() => {
        fetchSuggestions(value);
    }, [value, fetchSuggestions]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsSuggestionsVisible(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, []);

    const handleSelect = (suggestion: string) => {
        onChange(suggestion);
        setSuggestions([]);
        setIsSuggestionsVisible(false);
        setActiveIndex(-1);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex((prevIndex) =>
                prevIndex < suggestions.length - 1 ? prevIndex + 1 : prevIndex
            );
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
        } else if (e.key === 'Enter') {
             if (activeIndex >= 0 && activeIndex < suggestions.length) {
                e.preventDefault();
                handleSelect(suggestions[activeIndex]);
            }
        } else if (e.key === 'Escape') {
            setIsSuggestionsVisible(false);
            setActiveIndex(-1);
        }
    };
    
    return (
        <div className="relative w-full" ref={containerRef}>
            <input
                id={id}
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                    if (suggestions.length > 0) {
                       setIsSuggestionsVisible(true)
                    }
                }}
                placeholder={placeholder}
                disabled={disabled}
                className={className}
                autoComplete="off"
                aria-autocomplete="list"
                aria-controls={`${id}-suggestions`}
                aria-activedescendant={activeIndex > -1 ? `${id}-suggestion-${activeIndex}` : undefined}
            />
            {isSuggestionsVisible && (
                <ul
                    id={`${id}-suggestions`}
                    role="listbox"
                    className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto"
                >
                    {isLoading ? (
                        <li className="px-4 py-2 text-gray-400">Buscando...</li>
                    ) : (
                        suggestions.map((suggestion, index) => (
                            <li
                                key={index}
                                id={`${id}-suggestion-${index}`}
                                role="option"
                                aria-selected={index === activeIndex}
                                className={`px-4 py-2 cursor-pointer text-gray-200 ${
                                    index === activeIndex
                                        ? 'bg-sky-500 text-white'
                                        : 'hover:bg-gray-700'
                                }`}
                                onMouseDown={(e) => {
                                    e.preventDefault(); // Prevent input blur
                                    handleSelect(suggestion);
                                }}
                            >
                                {suggestion}
                            </li>
                        ))
                    )}
                </ul>
            )}
        </div>
    );
};

export default AutocompleteInput;