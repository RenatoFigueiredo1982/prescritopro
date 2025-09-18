import React, { useState } from 'react';

interface CreateFolderModalProps {
    onClose: () => void;
    onCreate: (name: string) => void;
}

const CreateFolderModal: React.FC<CreateFolderModalProps> = ({ onClose, onCreate }) => {
    const [folderName, setFolderName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (folderName.trim()) {
            onCreate(folderName.trim());
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center z-50 p-4 transition-opacity duration-300"
            onClick={onClose}
        >
            <div 
                className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md relative p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-xl font-bold text-white mb-4">Criar Nova Pasta</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="folderName" className="block text-sm font-medium text-gray-300 mb-1">
                            Nome da Pasta
                        </label>
                        <input
                            type="text"
                            id="folderName"
                            value={folderName}
                            onChange={(e) => setFolderName(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-150 ease-in-out"
                            required
                            autoFocus
                        />
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="bg-gray-600 text-gray-200 font-semibold py-2 px-4 rounded-lg hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit"
                            className="bg-sky-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-gray-400 transition"
                            disabled={!folderName.trim()}
                        >
                            Criar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateFolderModal;