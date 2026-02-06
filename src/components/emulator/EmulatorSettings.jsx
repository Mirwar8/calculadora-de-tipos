import React, { useState } from 'react';

const EmulatorSettings = ({ volume, onVolumeChange, onSaveState, onLoadState, onReset }) => {
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    const handleSaveState = async () => {
        setIsSaving(true);
        setSaveMessage('Saving...');

        try {
            await onSaveState();
            setSaveMessage('State saved!');
        } catch (error) {
            setSaveMessage('Save failed!');
        } finally {
            setIsSaving(false);
            setTimeout(() => setSaveMessage(''), 2000);
        }
    };

    const handleLoadState = async () => {
        setIsLoading(true);
        setSaveMessage('Loading...');

        try {
            await onLoadState();
            setSaveMessage('State loaded!');
        } catch (error) {
            setSaveMessage('Load failed!');
        } finally {
            setIsLoading(false);
            setTimeout(() => setSaveMessage(''), 2000);
        }
    };

    const handleReset = () => {
        if (window.confirm('Are you sure you want to reset the game? Any unsaved progress will be lost.')) {
            onReset();
        }
    };

    const handleVolumeChange = (e) => {
        const newVolume = parseInt(e.target.value) / 100;
        onVolumeChange(newVolume);
    };

    return (
        <div className="space-y-6">
            {/* Volume Control */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-400">volume_up</span>
                        <span className="text-white text-sm font-bold">Volume</span>
                    </div>
                    <span className="text-gray-400 text-sm">{Math.round(volume * 100)}%</span>
                </div>

                <div className="relative">
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={Math.round(volume * 100)}
                        onChange={handleVolumeChange}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                        style={{
                            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${volume * 100}%, #374151 ${volume * 100}%, #374151 100%)`
                        }}
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0</span>
                        <span>50</span>
                        <span>100</span>
                    </div>
                </div>
            </div>

            {/* Save States */}
            <div className="space-y-3">
                <h4 className="text-white text-sm font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-green-400">save</span>
                    Save States
                </h4>

                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={handleSaveState}
                        disabled={isSaving}
                        className="flex items-center justify-center gap-2 bg-green-600/20 hover:bg-green-600/40 text-green-400 border border-green-600/30 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? (
                            <div className="animate-spin w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full"></div>
                        ) : (
                            <span className="material-symbols-outlined text-sm">save</span>
                        )}
                        <span className="text-xs font-bold">SAVE</span>
                    </button>

                    <button
                        onClick={handleLoadState}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-2 bg-orange-600/20 hover:bg-orange-600/40 text-orange-400 border border-orange-600/30 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <div className="animate-spin w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full"></div>
                        ) : (
                            <span className="material-symbols-outlined text-sm">folder_open</span>
                        )}
                        <span className="text-xs font-bold">LOAD</span>
                    </button>
                </div>

                {saveMessage && (
                    <div className={`text-center text-xs font-bold ${saveMessage.includes('saved') ? 'text-green-400' :
                            saveMessage.includes('loaded') ? 'text-orange-400' : 'text-red-400'
                        }`}>
                        {saveMessage}
                    </div>
                )}

                {/* File Export/Import */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                    <button
                        className="flex items-center justify-center gap-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-600/30 py-2 rounded-lg transition-colors"
                        onClick={() => alert('Export Feature Coming Soon')}
                        title="Download .sav file"
                    >
                        <span className="material-symbols-outlined text-sm">download</span>
                        <span className="text-xs font-bold">EXPORT</span>
                    </button>

                    <button
                        className="flex items-center justify-center gap-2 bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 border border-purple-600/30 py-2 rounded-lg transition-colors"
                        onClick={() => alert('Import Feature Coming Soon')}
                        title="Upload .sav file"
                    >
                        <span className="material-symbols-outlined text-sm">upload</span>
                        <span className="text-xs font-bold">IMPORT</span>
                    </button>
                </div>
            </div>

            {/* System Controls */}
            <div className="space-y-3">
                <h4 className="text-white text-sm font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-red-400">settings</span>
                    System
                </h4>

                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={handleReset}
                        className="bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg border border-white/10 transition-colors"
                    >
                        <span className="material-symbols-outlined text-sm">restart_alt</span>
                        <span className="text-xs font-bold block mt-1">RESET</span>
                    </button>

                    <button className="bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg border border-white/10 transition-colors">
                        <span className="material-symbols-outlined text-sm">tune</span>
                        <span className="text-xs font-bold block mt-1">SETTINGS</span>
                    </button>
                </div>
            </div>

            {/* Display Options */}
            <div className="space-y-3">
                <h4 className="text-white text-sm font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-purple-400">display_settings</span>
                    Display
                </h4>

                <div className="space-y-2">
                    <label className="flex items-center justify-between">
                        <span className="text-gray-300 text-sm">Pixel Perfect</span>
                        <input
                            type="checkbox"
                            defaultChecked={true}
                            className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                        />
                    </label>

                    <label className="flex items-center justify-between">
                        <span className="text-gray-300 text-sm">Scanlines</span>
                        <input
                            type="checkbox"
                            className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                        />
                    </label>

                    <label className="flex items-center justify-between">
                        <span className="text-gray-300 text-sm">CRT Effect</span>
                        <input
                            type="checkbox"
                            className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                        />
                    </label>
                </div>
            </div>
        </div>
    );
};

export default EmulatorSettings;