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
        romName,
        isPlaying, 
        volume, 
        isPaused, 
        fastForward,
        setFastForward,
        safeCore,
        isCoreReady,
        loadRom, 
        closeGame, 
        togglePause,
        setVolume
    } = useEmulator();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const handleRomLoad = useCallback((rom, name) => {
        loadRom(rom, name);
    }, [loadRom]);

    const handlePlayPause = useCallback(() => {
        togglePause();
    }, [togglePause]);

    const handleReset = useCallback(() => {
        if (isCoreReady) {
            safeCore.reset();
        }
    }, [isCoreReady, safeCore]);

    const handleVolumeChange = useCallback((newVolume) => {
        setVolume(newVolume);
    }, [setVolume]);

    const handleToggleFastForward = useCallback((active) => {
        setFastForward(active);
    }, [setFastForward]);

    const handleSaveState = useCallback(async (slot = 0) => {
        if (isCoreReady) {
            try {
                const success = safeCore.saveState(slot);
                if(success) {
                    await safeCore.FSSync();
                } else {
                    throw new Error("Core rejected save state");
                }
            } catch (error) {
                console.error('Failed to save state:', error);
                throw error;
            }
        }
    }, [isCoreReady, safeCore]);

    const handleLoadState = useCallback((slot = 0) => {
        if (isCoreReady) {
            try {
                const success = safeCore.loadGame(safeCore.filePaths().gamePath + '/' + romName); // Ensure game is loaded
                const loadSuccess = safeCore.loadState(slot);
                if(!loadSuccess) {
                    throw new Error("No save state found");
                }
            } catch (error) {
                console.error('Failed to load state:', error);
                throw error;
            }
        }
    }, [isCoreReady, safeCore, romName]);

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
                                romName={romName}
                                isPlaying={isPlaying}
                                isPaused={isPaused}
                                volume={volume}
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