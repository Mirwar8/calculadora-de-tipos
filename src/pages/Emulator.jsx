import React, { useState, useCallback } from 'react';
import EmulatorScreen from '../components/emulator/EmulatorScreen';
import RomLoader from '../components/emulator/RomLoader';
import EmulatorSettings from '../components/emulator/EmulatorSettings';
import EmulatorStatusBar from '../components/emulator/EmulatorStatusBar';
import SettingsModal from '../components/emulator/SettingsModal';

const Emulator = () => {
    const [romData, setRomData] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.75);
    const [isPaused, setIsPaused] = useState(false);
    const [emulatorCore, setEmulatorCore] = useState(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const handleRomLoad = useCallback((rom) => {
        setRomData(rom);
        setIsPlaying(true);
        setIsPaused(false);
    }, []);

    const handlePlayPause = useCallback(() => {
        if (isPlaying && !isPaused) {
            setIsPaused(true);
        } else if (isPlaying && isPaused) {
            setIsPaused(false);
        }
    }, [isPlaying, isPaused]);

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
    }, [emulatorCore]);

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
                const rawState = emulatorCore.saveState();

                // Serialize buffers to Base64
                const serializedState = {
                    ram: arrayBufferToBase64(rawState.ram),
                    iram: arrayBufferToBase64(rawState.iram)
                };

                localStorage.setItem(`gbaSave_${gameCode}`, JSON.stringify(serializedState));
                console.log(`Saved state for game: ${gameCode}`);
            } catch (error) {
                console.error('Failed to save state:', error);
                throw error;
            }
        }
    }, [emulatorCore]);

    const handleLoadState = useCallback(() => {
        if (emulatorCore && emulatorCore.mmu && emulatorCore.mmu.cart) {
            try {
                const gameCode = emulatorCore.mmu.cart.code || 'GENERIC';
                const savedJson = localStorage.getItem(`gbaSave_${gameCode}`);

                if (savedJson) {
                    const serializedState = JSON.parse(savedJson);

                    // Deserialize Base64 back to buffers
                    const rawState = {
                        ram: base64ToArrayBuffer(serializedState.ram),
                        iram: base64ToArrayBuffer(serializedState.iram)
                    };

                    emulatorCore.loadState(rawState);
                    console.log(`Loaded state for game: ${gameCode}`);
                } else {
                    throw new Error('No save state found for this game');
                }
            } catch (error) {
                console.error('Failed to load state:', error);
                throw error;
            }
        }
    }, [emulatorCore]);

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
                                onEmulatorReady={setEmulatorCore}
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
                                onSaveState={handleSaveState}
                                onLoadState={handleLoadState}
                                onReset={handleReset}
                            />
                        </SettingsModal>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Emulator;