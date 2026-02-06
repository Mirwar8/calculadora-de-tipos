import React, { useState } from 'react';

const EmulatorControls = ({ emulatorCore, onPlayPause, isPlaying, isPaused }) => {
    const [pressedKeys, setPressedKeys] = useState(new Set());

    const handleControlPress = (key) => {
        if (!emulatorCore) return;

        setPressedKeys(prev => new Set(prev).add(key));
        emulatorCore.keyDown(key);

        // Visual feedback
        setTimeout(() => {
            setPressedKeys(prev => {
                const newSet = new Set(prev);
                newSet.delete(key);
                return newSet;
            });
            emulatorCore.keyUp(key);
        }, 100);
    };

    return (
        <div className="space-y-6">
            {/* D-Pad */}
            <div className="flex justify-center">
                <div className="relative w-32 h-32">
                    {/* Up Button */}
                    <button
                        onMouseDown={() => handleControlPress('UP')}
                        onTouchStart={() => handleControlPress('UP')}
                        className={`absolute left-1/2 top-0 -translate-x-1/2 w-10 h-10 bg-gray-600 rounded-t-lg shadow-lg transition-all ${
                            pressedKeys.has('UP') ? 'bg-gray-400 scale-95' : 'hover:bg-gray-500 active:scale-95'
                        }`}
                    >
                        <span className="material-symbols-outlined text-white text-sm">arrow_upward</span>
                    </button>

                    {/* Left Button */}
                    <button
                        onMouseDown={() => handleControlPress('LEFT')}
                        onTouchStart={() => handleControlPress('LEFT')}
                        className={`absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-gray-600 rounded-l-lg shadow-lg transition-all ${
                            pressedKeys.has('LEFT') ? 'bg-gray-400 scale-95' : 'hover:bg-gray-500 active:scale-95'
                        }`}
                    >
                        <span className="material-symbols-outlined text-white text-sm">arrow_back</span>
                    </button>

                    {/* Right Button */}
                    <button
                        onMouseDown={() => handleControlPress('RIGHT')}
                        onTouchStart={() => handleControlPress('RIGHT')}
                        className={`absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-gray-600 rounded-r-lg shadow-lg transition-all ${
                            pressedKeys.has('RIGHT') ? 'bg-gray-400 scale-95' : 'hover:bg-gray-500 active:scale-95'
                        }`}
                    >
                        <span className="material-symbols-outlined text-white text-sm">arrow_forward</span>
                    </button>

                    {/* Down Button */}
                    <button
                        onMouseDown={() => handleControlPress('DOWN')}
                        onTouchStart={() => handleControlPress('DOWN')}
                        className={`absolute left-1/2 bottom-0 -translate-x-1/2 w-10 h-10 bg-gray-600 rounded-b-lg shadow-lg transition-all ${
                            pressedKeys.has('DOWN') ? 'bg-gray-400 scale-95' : 'hover:bg-gray-500 active:scale-95'
                        }`}
                    >
                        <span className="material-symbols-outlined text-white text-sm">arrow_downward</span>
                    </button>

                    {/* Center Circle */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-gray-700 rounded-full border-2 border-gray-800"></div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-6">
                <button
                    onMouseDown={() => handleControlPress('B')}
                    onTouchStart={() => handleControlPress('B')}
                    className={`w-12 h-12 bg-red-600 rounded-full shadow-lg flex items-center justify-center transition-all ${
                        pressedKeys.has('B') ? 'bg-red-400 scale-95' : 'hover:bg-red-500 active:scale-95'
                    }`}
                >
                    <span className="text-white font-bold text-lg">B</span>
                </button>
                
                <button
                    onMouseDown={() => handleControlPress('A')}
                    onTouchStart={() => handleControlPress('A')}
                    className={`w-12 h-12 bg-green-600 rounded-full shadow-lg flex items-center justify-center transition-all ${
                        pressedKeys.has('A') ? 'bg-green-400 scale-95' : 'hover:bg-green-500 active:scale-95'
                    }`}
                >
                    <span className="text-white font-bold text-lg">A</span>
                </button>
            </div>

            {/* Shoulder Buttons */}
            <div className="flex justify-between">
                <button
                    onMouseDown={() => handleControlPress('L')}
                    onTouchStart={() => handleControlPress('L')}
                    className={`px-4 py-2 bg-blue-600 rounded-lg shadow-md transition-all ${
                        pressedKeys.has('L') ? 'bg-blue-400 scale-95' : 'hover:bg-blue-500 active:scale-95'
                    }`}
                >
                    <span className="text-white font-bold">L</span>
                </button>
                
                <button
                    onMouseDown={() => handleControlPress('R')}
                    onTouchStart={() => handleControlPress('R')}
                    className={`px-4 py-2 bg-blue-600 rounded-lg shadow-md transition-all ${
                        pressedKeys.has('R') ? 'bg-blue-400 scale-95' : 'hover:bg-blue-500 active:scale-95'
                    }`}
                >
                    <span className="text-white font-bold">R</span>
                </button>
            </div>

            {/* Start/Select Buttons */}
            <div className="flex justify-center gap-4">
                <button
                    onMouseDown={() => handleControlPress('SELECT')}
                    onTouchStart={() => handleControlPress('SELECT')}
                    className={`w-16 h-6 bg-gray-600 rounded-full shadow-md transition-all ${
                        pressedKeys.has('SELECT') ? 'bg-gray-400 scale-95' : 'hover:bg-gray-500 active:scale-95'
                    }`}
                >
                    <span className="text-white text-xs font-bold">SELECT</span>
                </button>
                
                <button
                    onMouseDown={() => handleControlPress('START')}
                    onTouchStart={() => handleControlPress('START')}
                    className={`w-16 h-6 bg-gray-600 rounded-full shadow-md transition-all ${
                        pressedKeys.has('START') ? 'bg-gray-400 scale-95' : 'hover:bg-gray-500 active:scale-95'
                    }`}
                >
                    <span className="text-white text-xs font-bold">START</span>
                </button>
            </div>

            {/* Play/Pause Control */}
            <div className="flex justify-center">
                <button
                    onClick={onPlayPause}
                    disabled={!isPlaying}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                        isPlaying && !isPaused
                            ? 'bg-orange-600 hover:bg-orange-700 text-white'
                            : isPlaying && isPaused
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    }`}
                >
                    <span className="material-symbols-outlined">
                        {isPlaying && !isPaused ? 'pause' : 'play_arrow'}
                    </span>
                    <span className="font-medium">
                        {isPlaying && !isPaused ? 'Pause' : 'Play'}
                    </span>
                </button>
            </div>
        </div>
    );
};

export default EmulatorControls;