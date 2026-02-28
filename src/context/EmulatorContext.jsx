import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import mGBA from '@thenick775/mgba-wasm';

const EmulatorContext = createContext();

// Global promise to prevent multi-trigger
let mgbaPromise = null;

export const useEmulator = () => {
    const context = useContext(EmulatorContext);
    if (!context) {
        throw new Error('useEmulator must be used within an EmulatorProvider');
    }
    return context;
};


export const EmulatorProvider = ({ children }) => {
    const [romData, setRomData] = useState(null);
    const [romName, setRomName] = useState('');
    const emulatorInstanceRef = useRef(null);
    const [instanceUpdateToggle, setInstanceUpdateToggle] = useState(0); // Used to force updates if needed
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [volume, setVolume] = useState(0.75);
    const [fastForward, setFastForward] = useState(false);
    const [canvasElement] = useState(() => {
        const canvas = document.createElement('canvas');
        canvas.id = 'mgba-canvas';
        canvas.className = 'w-full h-full block';
        canvas.style.imageRendering = 'pixelated';
        canvas.style.objectFit = 'contain';
        canvas.tabIndex = -1; // Prevent canvas from grabbing focus
        return canvas;
    });

    const [isCoreLoading, setIsCoreLoading] = useState(false);
    const [isCoreReady, setIsCoreReady] = useState(false);

    const initEngine = useCallback(async () => {
        if (emulatorInstanceRef.current || mgbaPromise) return;

        setIsCoreLoading(true);
        mgbaPromise = (async () => {
            try {
                console.log('--- [Context] Starting mGBA Singleton Engine ---');
                const core = await mGBA({ 
                    canvas: canvasElement,
                    // Use a dummy element to absorb mGBA's internal keyboard listeners
                    keyboardListeningElement: document.createElement('div'), 
                    locateFile: (path) => {
                        if (path.endsWith('.wasm')) return '/mgba.wasm';
                        return path;
                    }
                });
                
                await core.FSInit();
                
                // Add helper methods
                core.setFastForward = (active) => {
                    core.setFastForwardMultiplier(active ? 3 : 1);
                };

                emulatorInstanceRef.current = core;
                
                // Disable internal keyboard/gamepad input to prevent hijacking
                if(core.toggleInput) core.toggleInput(false);
                
                setInstanceUpdateToggle(prev => prev + 1);
                setIsCoreReady(true);
                setIsCoreLoading(false);
                console.log('--- [Context] mGBA Ready ---');
                return core;
            } catch (err) {
                console.error('[Context] mGBA Singleton Error:', err);
                mgbaPromise = null;
                setIsCoreLoading(false);
                throw err;
            }
        })();
    }, [canvasElement]);

    const loadRom = useCallback((data, name) => {
        setRomData(data);
        setRomName(name || 'game.gba');
        setIsPlaying(true);
        setIsPaused(false);
        setFastForward(false);
    }, []);

    const closeGame = useCallback(() => {
        if (emulatorInstanceRef.current) {
            try {
                // Completely stop and reset the core instead of nullifying it
                if(emulatorInstanceRef.current.quitGame) {
                    emulatorInstanceRef.current.quitGame();
                } else {
                    emulatorInstanceRef.current.pauseGame();
                }
            } catch(e) {
                console.warn('[Context] Error during closeGame:', e);
            }
        }
        setRomData(null);
        setRomName('');
        setIsPlaying(false);
        setIsPaused(false);
    }, []);

    const togglePause = useCallback(() => {
        setIsPaused(prev => !prev);
    }, []);

    const setEmulatorInstance = useCallback((val) => {
        emulatorInstanceRef.current = val;
        setInstanceUpdateToggle(prev => prev + 1);
    }, []);

    const setVolumeCallback = useCallback((v) => {
        setVolume(v);
        if (emulatorInstanceRef.current) {
            try {
                console.log(`[Context] Setting Volume Multiplier: ${v}`);
                emulatorInstanceRef.current.setVolume(v);
                // Also ensure audio is resumed just in case
                if (emulatorInstanceRef.current.resumeAudio) {
                    emulatorInstanceRef.current.resumeAudio();
                }
            } catch (e) {
                console.warn('[Context] Failed to set volume:', e);
            }
        }
    }, []);

    const setFastForwardCallback = useCallback((active) => {
        setFastForward(active);
        if (emulatorInstanceRef.current) {
            try {
                console.log(`[Context] Setting Fast Forward: ${active}`);
                emulatorInstanceRef.current.setFastForward(active);
            } catch (e) {
                console.warn('[Context] Failed to set fast forward:', e);
            }
        }
    }, []);

    // Safe interface for core interactions - COMPLETELY STABLE
    const safeCore = React.useMemo(() => ({
        loadGame: (path) => emulatorInstanceRef.current?.loadGame(path),
        writeFile: (path, data) => emulatorInstanceRef.current?.FS.writeFile(path, data),
        filePaths: () => emulatorInstanceRef.current?.filePaths(),
        pause: () => emulatorInstanceRef.current?.pauseGame(),
        resume: () => emulatorInstanceRef.current?.resumeGame(),
        resumeAudio: () => emulatorInstanceRef.current?.resumeAudio(),
        setVolume: (v) => emulatorInstanceRef.current?.setVolume(v),
        reset: () => emulatorInstanceRef.current?.reset(),
        buttonPress: (name) => emulatorInstanceRef.current?.buttonPress(name),
        buttonUnpress: (name) => emulatorInstanceRef.current?.buttonUnpress(name),
        saveState: (slot) => emulatorInstanceRef.current?.saveState(slot),
        loadState: (slot) => emulatorInstanceRef.current?.loadState(slot),
        FSSync: () => emulatorInstanceRef.current?.FSSync(),
    }), []); // Empty dependency array makes this object constant for the provider's life

    const value = React.useMemo(() => ({
        romData,
        romName,
        canvasElement,
        initEngine,
        isCoreLoading,
        isCoreReady,
        loadRom,
        closeGame,
        isPlaying,
        setIsPlaying,
        isPaused,
        setIsPaused,
        togglePause,
        volume,
        setVolume: setVolumeCallback,
        fastForward,
        setFastForward: setFastForwardCallback,
        safeCore
    }), [
        romData, romName, instanceUpdateToggle, canvasElement, initEngine, 
        isCoreLoading, isCoreReady, loadRom, closeGame, isPlaying, 
        isPaused, togglePause, volume, fastForward, setVolumeCallback, 
        setFastForwardCallback, safeCore
    ]);

    return (
        <EmulatorContext.Provider value={value}>
            {children}
        </EmulatorContext.Provider>
    );
};
