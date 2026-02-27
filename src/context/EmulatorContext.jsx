import React, { createContext, useContext, useState, useCallback } from 'react';

const EmulatorContext = createContext();

export const useEmulator = () => {
    const context = useContext(EmulatorContext);
    if (!context) {
        throw new Error('useEmulator must be used within an EmulatorProvider');
    }
    return context;
};

export const EmulatorProvider = ({ children }) => {
    const [romData, setRomData] = useState(null);
    const [emulatorInstance, setEmulatorInstance] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [volume, setVolume] = useState(0.75);

    const loadRom = useCallback((data) => {
        setRomData(data);
        setIsPlaying(true);
        setIsPaused(false);
    }, []);

    const closeGame = useCallback(() => {
        if (emulatorInstance) {
            emulatorInstance.pause();
        }
        setRomData(null);
        setEmulatorInstance(null);
        setIsPlaying(false);
        setIsPaused(false);
    }, [emulatorInstance]);

    const togglePause = useCallback(() => {
        setIsPaused(prev => !prev);
    }, []);

    const value = {
        romData,
        emulatorInstance,
        setEmulatorInstance,
        loadRom,
        closeGame,
        isPlaying,
        setIsPlaying,
        isPaused,
        setIsPaused,
        togglePause,
        volume,
        setVolume
    };

    return (
        <EmulatorContext.Provider value={value}>
            {children}
        </EmulatorContext.Provider>
    );
};
