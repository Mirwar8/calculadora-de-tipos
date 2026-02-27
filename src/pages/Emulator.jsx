import React, { useState, useCallback } from 'react';
import { useEmulator } from '../context/EmulatorContext';
import EmulatorScreen from '../components/emulator/EmulatorScreen';
import RomLoader from '../components/emulator/RomLoader';
import EmulatorSettings from '../components/emulator/EmulatorSettings';
import EmulatorStatusBar from '../components/emulator/EmulatorStatusBar';
import SettingsModal from '../components/emulator/SettingsModal';

const Emulator = () => {
    const { 
        romData, 
        isPlaying, 
        volume, 
        isPaused, 
        fastForward,
        setFastForward,
        emulatorInstance: emulatorCore,
        loadRom, 
        closeGame, 
        togglePause,
        setVolume,
        setEmulatorInstance
    } = useEmulator();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const handleRomLoad = useCallback((rom) => {
        loadRom(rom);
    }, [loadRom]);

    const handlePlayPause = useCallback(() => {
        togglePause();
    }, [togglePause]);

    const handleReset = useCallback(() => {
        if (emulatorCore) {
            emulatorCore.reset();
        }
    }, [emulatorCore]);

    const handleVolumeChange = useCallback((newVolume) => {
        setVolume(newVolume);
        if (emulatorCore) {
            emulatorCore.setVolume(newVolume);
        }
    }, [emulatorCore, setVolume]);

    const handleToggleFastForward = useCallback((active) => {
        setFastForward(active);
        if (emulatorCore && typeof emulatorCore.setFastForward === 'function') {
            emulatorCore.setFastForward(active);
        }
    }, [emulatorCore, setFastForward]);

    // Serialization Helpers for binary data in LocalStorage
    const arrayBufferToBase64 = (buffer) => {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    };

    const base64ToArrayBuffer = (base64) => {
        const binary_string = window.atob(base64);
        const len = binary_string.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes.buffer;
    };

    const handleSaveState = useCallback(() => {
        if (emulatorCore && emulatorCore.mmu && emulatorCore.mmu.cart) {
            try {
                const gameCode = emulatorCore.mmu.cart.code || 'GENERIC';
                
                if (typeof emulatorCore.saveStateCustom === 'function') {
                    emulatorCore.saveStateCustom((dataUrl) => {
                        localStorage.setItem(`gbaSaveFull_${gameCode}`, dataUrl);
                        console.log(`Saved FULL state for game: ${gameCode}`);
                    });
                } else {
                    // Legacy fallback
                    const rawState = emulatorCore.saveState();
                    const serializedState = {
                        ram: arrayBufferToBase64(rawState.ram),
                        iram: arrayBufferToBase64(rawState.iram)
                    };
                    localStorage.setItem(`gbaSave_${gameCode}`, JSON.stringify(serializedState));
                }
            } catch (error) {
                console.error('Failed to save state:', error);
            }
        }
    }, [emulatorCore]);

    const handleLoadState = useCallback(() => {
        if (emulatorCore && emulatorCore.mmu && emulatorCore.mmu.cart) {
            try {
                const gameCode = emulatorCore.mmu.cart.code || 'GENERIC';
                const fullSavedData = localStorage.getItem(`gbaSaveFull_${gameCode}`);
                const legacySavedData = localStorage.getItem(`gbaSave_${gameCode}`);

                if (fullSavedData && typeof emulatorCore.loadStateCustom === 'function') {
                    emulatorCore.loadStateCustom(fullSavedData, () => {
                        console.log(`Loaded FULL state for game: ${gameCode}`);
                    });
                } else if (legacySavedData) {
                    // Legacy load logic
                    const serializedState = JSON.parse(legacySavedData);
                    const rawState = {
                        ram: base64ToArrayBuffer(serializedState.ram),
                        iram: base64ToArrayBuffer(serializedState.iram)
                    };
                    emulatorCore.loadState(rawState);
                    console.log(`Loaded legacy partial state for game: ${gameCode}`);
                } else {
                    console.warn('No save state found for this game');
                }
            } catch (error) {
                console.error('Failed to load state:', error);
            }
        }
    }, [emulatorCore]);

    const handleCloseGame = useCallback(() => {
        closeGame();
        setIsSettingsOpen(false);
    }, [closeGame]);

    return (
        <div className="w-full h-[calc(100vh-12rem)] flex items-center justify-center overflow-hidden">
            <div className="w-full max-w-4xl px-4 flex flex-col items-center">

                {!romData ? (
                    <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8 max-w-2xl mx-auto">
                        <RomLoader onRomLoad={handleRomLoad} />
                    </div>
                ) : (
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
                            <EmulatorScreen
                                romData={romData}
                                isPlaying={isPlaying}
                                isPaused={isPaused}
                                volume={volume}
                                onEmulatorReady={setEmulatorInstance}
                                onPlayPause={handlePlayPause}
                                onOpenSettings={() => setIsSettingsOpen(true)}
                            />

                        </div>

                        <SettingsModal
                            isOpen={isSettingsOpen}
                            onClose={() => setIsSettingsOpen(false)}
                            title="Emulator Settings"
                        >
                            <EmulatorSettings
                                volume={volume}
                                onVolumeChange={handleVolumeChange}
                                fastForward={fastForward}
                                onToggleFastForward={handleToggleFastForward}
                                onSaveState={handleSaveState}
                                onLoadState={handleLoadState}
                                onReset={handleReset}
                                onCloseGame={handleCloseGame}
                            />
                        </SettingsModal>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Emulator;