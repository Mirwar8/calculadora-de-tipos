import React, { useState } from 'react';
import SettingsModal from '../components/emulator/SettingsModal';
import { useTheme } from '../hooks/useTheme';
import { useUser } from '../context/UserContext';

const Settings = () => {
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isEmulatorModalOpen, setIsEmulatorModalOpen] = useState(false);
    const [notifications, setNotifications] = useState({
        newPokemon: true,
        typeEffectiveness: false,
        teamUpdates: true,
        battleResults: false
    });
    const [preferences, setPreferences] = useState({
        language: 'es',
        autoSave: true,
        showAnimations: true,
        compactMode: false
    });
    
    const { theme, toggleTheme } = useTheme();
    const { userData } = useUser();

    const handleNotificationChange = (key) => {
        setNotifications(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handlePreferenceChange = (key, value) => {
        setPreferences(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const resetPreferences = () => {
        setPreferences({
            language: 'es',
            autoSave: true,
            showAnimations: true,
            compactMode: false
        });
    };

    const clearCache = () => {
        localStorage.clear();
        window.location.reload();
    };

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Configuración</h1>
                <p className="text-slate-600 dark:text-slate-400">
                    Personaliza tu experiencia en la calculadora de tipos
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Apariencia */}
                <div className="bg-white dark:bg-[#1a2632] rounded-2xl p-6 border border-slate-200 dark:border-[#233648]">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary">palette</span>
                        Apariencia
                    </h2>
                    
                    <div className="space-y-4">
                        {/* Theme Toggle */}
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#233648] rounded-xl">
                            <div>
                                <h3 className="font-semibold text-slate-900 dark:text-white">Tema</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    {theme === 'light' ? 'Claro' : 'Oscuro'}
                                </p>
                            </div>
                            <button
                                onClick={toggleTheme}
                                className="relative inline-flex h-8 w-14 items-center rounded-full bg-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-[#1a2632]"
                            >
                                <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-7' : 'translate-x-1'}`} />
                            </button>
                        </div>

                        {/* Compact Mode */}
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#233648] rounded-xl">
                            <div>
                                <h3 className="font-semibold text-slate-900 dark:text-white">Modo Compacto</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Reduce el espacio entre elementos
                                </p>
                            </div>
                            <button
                                onClick={() => handlePreferenceChange('compactMode', !preferences.compactMode)}
                                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-[#1a2632] ${
                                    preferences.compactMode ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'
                                }`}
                            >
                                <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${preferences.compactMode ? 'translate-x-7' : 'translate-x-1'}`} />
                            </button>
                        </div>

                        {/* Animations */}
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#233648] rounded-xl">
                            <div>
                                <h3 className="font-semibold text-slate-900 dark:text-white">Animaciones</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Mostrar animaciones y transiciones
                                </p>
                            </div>
                            <button
                                onClick={() => handlePreferenceChange('showAnimations', !preferences.showAnimations)}
                                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-[#1a2632] ${
                                    preferences.showAnimations ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'
                                }`}
                            >
                                <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${preferences.showAnimations ? 'translate-x-7' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Perfil de Usuario */}
                <div className="bg-white dark:bg-[#1a2632] rounded-2xl p-6 border border-slate-200 dark:border-[#233648]">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary">account_circle</span>
                        Perfil de Usuario
                    </h2>
                    
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-[#233648] rounded-xl">
                            <div className="bg-primary/20 rounded-full size-12 flex items-center justify-center overflow-hidden flex-shrink-0 border-2 border-primary/10">
                                {userData.avatar ? (
                                    <img src={userData.avatar} alt="User Avatar" className="size-full object-cover" />
                                ) : (
                                    <span className="material-symbols-outlined text-primary text-2xl">account_circle</span>
                                )}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-slate-900 dark:text-white">{userData.name}</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">{userData.rank}</p>
                            </div>
                        </div>
                        
                        <button
                            onClick={() => setIsProfileModalOpen(true)}
                            className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined">edit</span>
                            Editar Perfil
                        </button>
                    </div>
                </div>

                {/* Notificaciones */}
                <div className="bg-white dark:bg-[#1a2632] rounded-2xl p-6 border border-slate-200 dark:border-[#233648]">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary">notifications</span>
                        Notificaciones
                    </h2>
                    
                    <div className="space-y-4">
                        {Object.entries({
                            newPokemon: { label: 'Nuevos Pokémon', desc: 'Alertas de nuevos Pokémon en la Pokédex' },
                            typeEffectiveness: { label: 'Efectividad de Tipos', desc: 'Notificaciones de análisis de tipos' },
                            teamUpdates: { label: 'Actualizaciones de Equipo', desc: 'Cambios en tus equipos guardados' },
                            battleResults: { label: 'Resultados de Batalla', desc: 'Análisis post-batalla' }
                        }).map(([key, { label, desc }]) => (
                            <div key={key} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#233648] rounded-xl">
                                <div>
                                    <h3 className="font-semibold text-slate-900 dark:text-white">{label}</h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">{desc}</p>
                                </div>
                                <button
                                    onClick={() => handleNotificationChange(key)}
                                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-[#1a2632] ${
                                        notifications[key] ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'
                                    }`}
                                >
                                    <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${notifications[key] ? 'translate-x-7' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Preferencias de Idioma */}
                <div className="bg-white dark:bg-[#1a2632] rounded-2xl p-6 border border-slate-200 dark:border-[#233648]">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary">language</span>
                        Preferencias de Idioma
                    </h2>
                    
                    <div className="space-y-4">
                        <div className="p-4 bg-slate-50 dark:bg-[#233648] rounded-xl">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Idioma de la Interfaz
                            </label>
                            <select
                                value={preferences.language}
                                onChange={(e) => handlePreferenceChange('language', e.target.value)}
                                className="w-full px-4 py-2 bg-white dark:bg-[#1a2632] border border-slate-300 dark:border-[#233648] rounded-xl focus:ring-2 focus:ring-primary focus:border-primary dark:text-white"
                            >
                                <option value="es">Español</option>
                                <option value="en">English</option>
                                <option value="fr">Français</option>
                                <option value="de">Deutsch</option>
                                <option value="ja">日本語</option>
                            </select>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#233648] rounded-xl">
                            <div>
                                <h3 className="font-semibold text-slate-900 dark:text-white">Guardado Automático</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Guardar progreso automáticamente
                                </p>
                            </div>
                            <button
                                onClick={() => handlePreferenceChange('autoSave', !preferences.autoSave)}
                                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-[#1a2632] ${
                                    preferences.autoSave ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'
                                }`}
                            >
                                <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${preferences.autoSave ? 'translate-x-7' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Configuración de Emulador */}
                <div className="bg-white dark:bg-[#1a2632] rounded-2xl p-6 border border-slate-200 dark:border-[#233648] lg:col-span-2">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary">sports_esports</span>
                        Configuración del Emulador GBA
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 dark:bg-[#233648] rounded-xl">
                            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Controles</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                                Personalizar controles del teclado
                            </p>
                            <button
                                onClick={() => setIsEmulatorModalOpen(true)}
                                className="px-4 py-2 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200 rounded-lg transition-colors text-sm font-medium"
                            >
                                Configurar Controles
                            </button>
                        </div>
                        
                        <div className="p-4 bg-slate-50 dark:bg-[#233648] rounded-xl">
                            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Roms Guardadas</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                                Gestionar tus ROMs descargadas
                            </p>
                            <button className="px-4 py-2 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200 rounded-lg transition-colors text-sm font-medium">
                                Administrar ROMs
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sistema */}
                <div className="bg-white dark:bg-[#1a2632] rounded-2xl p-6 border border-slate-200 dark:border-[#233648] lg:col-span-2">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary">settings_suggest</span>
                        Sistema
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button
                            onClick={resetPreferences}
                            className="p-4 bg-slate-50 dark:bg-[#233648] hover:bg-slate-100 dark:hover:bg-[#2d3e50] rounded-xl transition-colors text-left"
                        >
                            <span className="material-symbols-outlined text-primary mb-2">refresh</span>
                            <h3 className="font-semibold text-slate-900 dark:text-white">Restablecer Preferencias</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Volver a la configuración predeterminada
                            </p>
                        </button>
                        
                        <button
                            onClick={clearCache}
                            className="p-4 bg-slate-50 dark:bg-[#233648] hover:bg-slate-100 dark:hover:bg-[#2d3e50] rounded-xl transition-colors text-left"
                        >
                            <span className="material-symbols-outlined text-primary mb-2">delete_sweep</span>
                            <h3 className="font-semibold text-slate-900 dark:text-white">Limpiar Caché</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Eliminar datos temporales
                            </p>
                        </button>
                        
                        <button className="p-4 bg-slate-50 dark:bg-[#233648] hover:bg-slate-100 dark:hover:bg-[#2d3e50] rounded-xl transition-colors text-left">
                            <span className="material-symbols-outlined text-primary mb-2">download</span>
                            <h3 className="font-semibold text-slate-900 dark:text-white">Exportar Datos</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Descargar tu información
                            </p>
                        </button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <SettingsModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                title="Editar Perfil"
            >
                <p className="text-slate-400 mb-4">
                    La funcionalidad de edición de perfil ya está implementada en el modal principal.
                </p>
                <button
                    onClick={() => setIsProfileModalOpen(false)}
                    className="w-full py-2 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-colors"
                >
                    Cerrar
                </button>
            </SettingsModal>

            <SettingsModal
                isOpen={isEmulatorModalOpen}
                onClose={() => setIsEmulatorModalOpen(false)}
                title="Configuración del Emulador"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Frame Skip</label>
                        <select className="w-full px-4 py-2 bg-[#1a1b26] border border-white/10 rounded-lg focus:ring-2 focus:ring-primary text-white">
                            <option>0</option>
                            <option>1</option>
                            <option>2</option>
                            <option>3</option>
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Volume</label>
                        <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            className="w-full"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Scale</label>
                        <select className="w-full px-4 py-2 bg-[#1a1b26] border border-white/10 rounded-lg focus:ring-2 focus:ring-primary text-white">
                            <option>1x</option>
                            <option>2x</option>
                            <option>3x</option>
                            <option>4x</option>
                        </select>
                    </div>
                </div>
            </SettingsModal>
        </div>
    );
};

export default Settings;