import React, { useState, useCallback, useEffect, useRef } from 'react';

// Types
import { DrugInfo, Prescription, ResultadoInteracao, ProfileData, Folder } from './types';

// Services
import { searchDrug, searchInteractions } from './services/openFdaService';
import { generatePrescriptionTemplate } from './services/geminiService';

// Components
import Header from './components/Header';
import DrugSearch from './components/DrugSearch';
import PrescriptionGenerator from './components/PrescriptionGenerator';
import DrugInteractionSearch from './components/DrugInteractionSearch';
import DrugInfoDisplay from './components/DrugInfoDisplay';
import InteractionResultDisplay from './components/InteractionResultDisplay';
import Loader from './components/Loader';
import ErrorMessage from './components/ErrorMessage';
import ReceituarioSimplesDisplay from './components/ReceituarioSimplesDisplay';
import ReceituarioControleEspecialDisplay from './components/ReceituarioControleEspecialDisplay';
import ProfileSetup from './components/ProfileSetup';
import CreateFolderModal from './components/CreateFolderModal';
import FolderViewModal from './components/FolderViewModal';
import LandingPage from './components/LandingPage';

const App: React.FC = () => {
    // Landing page state
    const [showLanding, setShowLanding] = useState(true);
    
    // Profile State
    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [isProfileSetupVisible, setIsProfileSetupVisible] = useState(false);

    // App State
    const [drugInfo, setDrugInfo] = useState<DrugInfo | null>(null);
    const [prescription, setPrescription] = useState<Prescription | null>(null);
    const [interactionResult, setInteractionResult] = useState<ResultadoInteracao[] | null>(null);
    const [viewingPrescription, setViewingPrescription] = useState<Prescription | null>(null);
    
    // Loading and Error State
    const [isLoading, setIsLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Check if landing has been seen on initial render
    useEffect(() => {
        try {
            const hasSeen = window.localStorage.getItem('hasSeenLanding');
            if (hasSeen) {
                setShowLanding(false);
            }
        } catch (error) {
            console.error("Erro ao verificar localStorage para landing page", error);
            // If there's an error, just proceed to the app
            setShowLanding(false);
        }
    }, []);

    // Load profile on initial render
    useEffect(() => {
        // This effect runs after the landing page check.
        // It's safe to load the profile here.
        if (showLanding) return; // Don't load profile if landing page is visible

        try {
            const storedProfile = window.localStorage.getItem('profileData');
            if (storedProfile) {
                setProfileData(JSON.parse(storedProfile));
            } else {
                setIsProfileSetupVisible(true); // Show setup if no profile
            }
        } catch (error) {
            console.error("Erro ao carregar perfil do localStorage", error);
            window.localStorage.removeItem('profileData');
            setIsProfileSetupVisible(true);
        }
    }, [showLanding]); // Re-run when landing page is dismissed


    // Saved Prescriptions State
    const [savedPrescriptions, setSavedPrescriptions] = useState<Prescription[]>(() => {
        try {
            const items = window.localStorage.getItem('savedPrescriptions');
            return items ? JSON.parse(items) : [];
        } catch (error) {
            console.error("Erro ao ler do localStorage", error);
            return [];
        }
    });

    // Folder State
    const [folders, setFolders] = useState<Folder[]>(() => {
        try {
            const items = window.localStorage.getItem('folders');
            return items ? JSON.parse(items) : [];
        } catch (error) {
            console.error("Erro ao ler pastas do localStorage", error);
            return [];
        }
    });
    const [isCreateFolderModalVisible, setIsCreateFolderModalVisible] = useState(false);
    const [viewingFolder, setViewingFolder] = useState<Folder | null>(null);
    
    const clearResults = () => {
        setDrugInfo(null);
        setPrescription(null);
        setInteractionResult(null);
    }
    
    const handleEnterApp = () => {
        try {
            window.localStorage.setItem('hasSeenLanding', 'true');
        } catch (error) {
            console.error("Erro ao salvar no localStorage", error);
        }
        setShowLanding(false);
    };

    const handleSaveProfile = (data: ProfileData) => {
        try {
            window.localStorage.setItem('profileData', JSON.stringify(data));
            setProfileData(data);
            setIsProfileSetupVisible(false);
        } catch (error) {
            console.error("Erro ao salvar perfil no localStorage", error);
            setError("Não foi possível salvar as informações do perfil.");
        }
    };
    
    const handleDrugSearch = useCallback(async (drugName: string) => {
        if (!drugName) {
            setError('Por favor, insira o nome de um medicamento.');
            return;
        }
        setIsLoading('drug');
        setError(null);
        clearResults();
        try {
            const data = await searchDrug(drugName);
            setDrugInfo(data);
        } catch (err: any) {
            setError(err.message || 'Falha ao buscar informações do medicamento.');
        } finally {
            setIsLoading(null);
        }
    }, []);

    const handleGeneratePrescription = useCallback(async (diagnosis: string, type: 'simples' | 'controle_especial') => {
        if (!diagnosis) {
            setError('Por favor, insira um diagnóstico.');
            return;
        }
        setIsLoading('prescription');
        setError(null);
        clearResults();
        try {
            const data = await generatePrescriptionTemplate(diagnosis, type);
            setPrescription(data);
        } catch (err: any) {
            setError(err.message || 'Falha ao gerar o modelo de prescrição.');
        } finally {
            setIsLoading(null);
        }
    }, []);

    const handleInteractionSearch = useCallback(async (drugNames: string[]) => {
        const validDrugs = drugNames.filter(name => name.trim() !== '');
        if (validDrugs.length < 2) {
            setError('Por favor, insira pelo menos dois medicamentos para verificar interações.');
            return;
        }
        setIsLoading('interaction');
        setError(null);
        clearResults();
        try {
            const data = await searchInteractions(validDrugs);
            setInteractionResult(data);
        } catch (err: any) {
            setError(err.message || 'Falha ao verificar as interações medicamentosas.');
        } finally {
            setIsLoading(null);
        }
    }, []);

    const handleSavePrescription = useCallback((prescriptionToSave: Prescription) => {
        setSavedPrescriptions(prev => {
            const updatedPrescriptions = [...prev, { ...prescriptionToSave, id: Date.now().toString() }];
            try {
                window.localStorage.setItem('savedPrescriptions', JSON.stringify(updatedPrescriptions));
            } catch (err) {
                console.error("Erro ao salvar no localStorage", err);
                setError("Não foi possível salvar a prescrição. O armazenamento local pode estar cheio ou desabilitado.");
            }
            return updatedPrescriptions;
        });
        // Clear the current prescription after saving
        setPrescription(null);
    }, []);

    const handleDeletePrescription = useCallback((idToDelete: string) => {
        setSavedPrescriptions(prev => {
            const updatedPrescriptions = prev.filter(p => p.id !== idToDelete);
            try {
                window.localStorage.setItem('savedPrescriptions', JSON.stringify(updatedPrescriptions));
            } catch (err) {
                console.error("Erro ao deletar do localStorage", err);
                setError("Não foi possível deletar a prescrição.");
            }
            return updatedPrescriptions;
        });
    }, []);

    // Folder Management
    const handleCreateFolder = (name: string) => {
        const newFolder: Folder = { id: Date.now().toString(), name };
        setFolders(prev => {
            const updatedFolders = [...prev, newFolder];
            window.localStorage.setItem('folders', JSON.stringify(updatedFolders));
            return updatedFolders;
        });
        setIsCreateFolderModalVisible(false);
    };

    const handleDeleteFolder = (folderId: string) => {
        if (window.confirm("Tem certeza que deseja deletar esta pasta? As prescrições dentro dela não serão deletadas, mas ficarão sem pasta.")) {
            setFolders(prev => {
                const updatedFolders = prev.filter(f => f.id !== folderId);
                window.localStorage.setItem('folders', JSON.stringify(updatedFolders));
                return updatedFolders;
            });
            // Un-assign prescriptions from the deleted folder
            setSavedPrescriptions(prev => {
                const updatedPrescriptions = prev.map(p => p.folderId === folderId ? { ...p, folderId: undefined } : p);
                window.localStorage.setItem('savedPrescriptions', JSON.stringify(updatedPrescriptions));
                return updatedPrescriptions;
            });
        }
    };

    const handleRemovePrescriptionFromFolder = (prescriptionId: string) => {
        setSavedPrescriptions(prev => {
            const updatedPrescriptions = prev.map(p =>
                p.id === prescriptionId ? { ...p, folderId: undefined } : p
            );
            window.localStorage.setItem('savedPrescriptions', JSON.stringify(updatedPrescriptions));
            return updatedPrescriptions;
        });
    };

    // Drag and Drop
    const [draggedPrescriptionId, setDraggedPrescriptionId] = useState<string | null>(null);
    const [dropTargetFolderId, setDropTargetFolderId] = useState<string | null>(null);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, prescriptionId: string) => {
        setDraggedPrescriptionId(prescriptionId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, folderId: string) => {
        e.preventDefault();
        setDropTargetFolderId(folderId);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, folderId: string) => {
        e.preventDefault();
        if (draggedPrescriptionId) {
            setSavedPrescriptions(prev => {
                const updated = prev.map(p =>
                    p.id === draggedPrescriptionId ? { ...p, folderId: folderId } : p
                );
                window.localStorage.setItem('savedPrescriptions', JSON.stringify(updated));
                return updated;
            });
        }
    };

    const handleDragEnd = () => {
        setDraggedPrescriptionId(null);
        setDropTargetFolderId(null);
    };


    const renderResults = () => {
        if (isLoading) {
            const messages: { [key: string]: string } = {
                drug: "Buscando informações do medicamento...",
                prescription: "Gerando o modelo de prescrição...",
                interaction: "Verificando interações medicamentosas...",
            };
            return <div className="p-6 bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg border border-white/20"><Loader message={messages[isLoading] || 'Carregando...'} /></div>;
        }

        if (drugInfo) return <DrugInfoDisplay drugInfo={drugInfo} onClose={clearResults} />;
        if (prescription) {
            if (prescription.tipo === 'simples') {
                return <ReceituarioSimplesDisplay prescription={prescription} onSave={handleSavePrescription} profileData={profileData} onClose={clearResults}/>;
            } else { // 'controle_especial'
                return <ReceituarioControleEspecialDisplay prescription={prescription} onSave={handleSavePrescription} profileData={profileData} onClose={clearResults} />;
            }
        }
        if (interactionResult) return <InteractionResultDisplay result={interactionResult} onClose={clearResults} />;
        
        return (
            <div className="flex flex-col items-center justify-center p-10 bg-white/5 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 h-full min-h-[400px]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-sky-200/50 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-semibold text-sky-100">Seus resultados aparecerão aqui</h3>
                <p className="text-sm text-sky-200 text-center mt-1">Utilize os formulários ao lado para iniciar uma busca ou gerar uma prescrição.</p>
            </div>
        );
    };
    
    if (showLanding) {
        return <LandingPage onEnter={handleEnterApp} />;
    }

    if (isProfileSetupVisible && !profileData) {
        return <ProfileSetup onSave={handleSaveProfile} />;
    }

    const prescriptionsWithoutFolder = savedPrescriptions.filter(p => !p.folderId);

    return (
        <div className="min-h-screen text-white font-sans relative isolate">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-900 via-gray-900 to-teal-900 opacity-80 -z-10" />
            <Header onSettingsClick={() => setIsProfileSetupVisible(true)} />
            <main className="p-4 sm:p-6 lg:p-8">
                {error && <ErrorMessage message={error} onClose={() => setError(null)} />}
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start max-w-screen-2xl mx-auto">
                    <div className="lg:col-span-1 space-y-8 lg:sticky lg:top-8">
                        <DrugSearch onSearch={handleDrugSearch} isLoading={isLoading === 'drug'} />
                        <PrescriptionGenerator onGenerate={handleGeneratePrescription} isLoading={isLoading === 'prescription'} />
                        <DrugInteractionSearch onSearch={handleInteractionSearch} isLoading={isLoading === 'interaction'} />
                    </div>

                    <div className="lg:col-span-2 space-y-8">
                            {renderResults()}
                    </div>
                </div>

                {/* FOLDERS SECTION */}
                {(folders.length > 0 || savedPrescriptions.length > 0) && (
                    <div className="mt-16 max-w-screen-2xl mx-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-white">Pastas</h2>
                            <button
                                onClick={() => setIsCreateFolderModalVisible(true)}
                                className="bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all duration-150 ease-in-out flex items-center space-x-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                </svg>
                                <span>Criar Nova Pasta</span>
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {folders.map(folder => {
                                const prescriptionCount = savedPrescriptions.filter(p => p.folderId === folder.id).length;
                                const isDropTarget = dropTargetFolderId === folder.id;
                                return (
                                    <div
                                        key={folder.id}
                                        className={`p-4 rounded-lg shadow-sm border flex flex-col justify-between group cursor-pointer transition-all duration-200 ${isDropTarget ? 'bg-sky-900/50 border-sky-400 scale-105 shadow-lg' : 'bg-white/10 backdrop-blur-sm border-white/20 hover:border-sky-400'}`}
                                        onClick={() => setViewingFolder(folder)}
                                        onDragOver={(e) => handleDragOver(e, folder.id)}
                                        onDragLeave={() => setDropTargetFolderId(null)}
                                        onDrop={(e) => handleDrop(e, folder.id)}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                                            <p className="font-semibold text-white truncate flex-1">{folder.name}</p>
                                        </div>
                                        <div className="flex justify-between items-center mt-3">
                                            <span className="text-sm text-sky-200">{prescriptionCount} prescriç{prescriptionCount === 1 ? 'ão' : 'ões'}</span>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder.id); }}
                                                className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                                aria-label="Deletar pasta"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
                
                {prescriptionsWithoutFolder.length > 0 && (
                    <div className="mt-12 max-w-screen-2xl mx-auto">
                        <h2 className="text-2xl font-bold text-white mb-4">Prescrições Salvas (sem pasta)</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {prescriptionsWithoutFolder.map(p => {
                                const firstMed = p.medicamentos && p.medicamentos.length > 0 ? p.medicamentos[0] : null;
                                return (
                                <div 
                                    key={p.id} 
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, p.id!)}
                                    onDragEnd={handleDragEnd}
                                    className={`bg-white/10 backdrop-blur-sm p-4 rounded-lg border flex justify-between items-center group cursor-grab active:cursor-grabbing transition-all ${
                                        draggedPrescriptionId === p.id 
                                        ? 'opacity-40 border-dashed border-sky-400' 
                                        : 'border-white/20 hover:border-sky-400'
                                    }`}
                                >
                                    <div className="flex-1 overflow-hidden" onClick={() => setViewingPrescription(p)}>
                                        <p className="font-semibold text-white truncate">
                                            {firstMed ? `${firstMed.medicamento} para ${p.nomePaciente}` : `Prescrição para ${p.nomePaciente}`}
                                        </p>
                                        <p className="text-sm text-sky-200 truncate">
                                            {firstMed ? `${firstMed.apresentacao} - ${firstMed.posologia}` : p.diagnostico}
                                        </p>
                                   </div>
                                    <div className="flex items-center space-x-2">
                                         <span className={`text-xs font-semibold px-2 py-1 rounded-full ${p.tipo === 'simples' ? 'bg-sky-200/20 text-sky-200' : 'bg-amber-200/20 text-amber-200'}`}>
                                             {p.tipo === 'simples' ? 'Simples' : 'Especial'}
                                         </span>
                                         <button 
                                             onClick={(e) => {
                                                 e.stopPropagation();
                                                 handleDeletePrescription(p.id!);
                                             }}
                                             className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                             aria-label="Deletar prescrição"
                                         >
                                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                 <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                             </svg>
                                         </button>
                                    </div>
                                </div>
                            )})}
                        </div>
                    </div>
                )}
            </main>
            
            <footer className="text-center p-8 text-gray-500">
                <p>&copy; {new Date().getFullYear()} Prescrito Pro. Todos os direitos reservados.</p>
            </footer>

            {isProfileSetupVisible && (
                    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-start z-50 p-4 overflow-y-auto">
                        <ProfileSetup 
                            initialData={profileData} 
                            onSave={handleSaveProfile} 
                            onClose={() => profileData && setIsProfileSetupVisible(false)} // Only allow close if profile already exists
                          />
                    </div>
            )}

            {viewingPrescription && (
                <div 
                    className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center z-50 p-4 transition-opacity duration-300"
                    onClick={() => setViewingPrescription(null)}
                >
                    <div 
                        className="bg-transparent rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button 
                            onClick={() => setViewingPrescription(null)} 
                            className="absolute top-3 right-3 p-1.5 rounded-full text-gray-300 bg-black/30 hover:bg-black/50 z-10 no-print"
                            aria-label="Fechar"
                        >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                        </button>
                        <div className="p-4 sm:p-6 lg:p-8">
                            {viewingPrescription.tipo === 'simples' ? (
                                <ReceituarioSimplesDisplay prescription={viewingPrescription} onSave={() => {}} isViewing={true} profileData={profileData} />
                            ) : (
                                <ReceituarioControleEspecialDisplay prescription={viewingPrescription} onSave={() => {}} isViewing={true} profileData={profileData} />
                            )}
                        </div>
                    </div>
                </div>
            )}

            {isCreateFolderModalVisible && (
                <CreateFolderModal 
                    onClose={() => setIsCreateFolderModalVisible(false)} 
                    onCreate={handleCreateFolder} 
                />
            )}

            {viewingFolder && (
                <FolderViewModal 
                    folder={viewingFolder}
                    prescriptions={savedPrescriptions.filter(p => p.folderId === viewingFolder.id)}
                    onClose={() => setViewingFolder(null)}
                    onViewPrescription={setViewingPrescription}
                    onDeletePrescription={handleDeletePrescription}
                    onRemoveFromFolder={handleRemovePrescriptionFromFolder}
                />
            )}
        </div>
    );
};

export default App;