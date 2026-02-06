import React, { useState } from 'react';

const MobileControls = ({ onControlDown, onControlUp }) => {
    // Helper for touch/mouse handlers
    const handleStart = (key) => (e) => {
        // Prevent default to stop scrolling/selection
        if (e.cancelable) e.preventDefault();
        e.stopPropagation();
        onControlDown(key);
    };

    const handleEnd = (key) => (e) => {
        if (e.cancelable) e.preventDefault();
        e.stopPropagation();
        onControlUp(key);
    };

    // Button style helper
    const buttonClass = "active:scale-95 transition-transform select-none touch-none";

    return (
        <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-end pb-8 px-4 lg:hidden">
            {/* Controls Container - pointer-events-auto for children */}
            <div className="flex justify-between items-end gap-4 pointer-events-auto">

                {/* D-Pad */}
                <div className="relative w-40 h-40 bg-black/10 rounded-full backdrop-blur-[2px]">
                    <div className="absolute inset-0 flex items-center justify-center">
                        {/* UP */}
                        <div
                            className={`absolute top-0 w-12 h-14 bg-gray-500/50 rounded-t-lg active:bg-gray-400/80 ${buttonClass}`}
                            onTouchStart={handleStart('UP')}
                            onTouchEnd={handleEnd('UP')}
                            onMouseDown={handleStart('UP')}
                            onMouseUp={handleEnd('UP')}
                        />
                        {/* DOWN */}
                        <div
                            className={`absolute bottom-0 w-12 h-14 bg-gray-500/50 rounded-b-lg active:bg-gray-400/80 ${buttonClass}`}
                            onTouchStart={handleStart('DOWN')}
                            onTouchEnd={handleEnd('DOWN')}
                            onMouseDown={handleStart('DOWN')}
                            onMouseUp={handleEnd('DOWN')}
                        />
                        {/* LEFT */}
                        <div
                            className={`absolute left-0 w-14 h-12 bg-gray-500/50 rounded-l-lg active:bg-gray-400/80 ${buttonClass}`}
                            onTouchStart={handleStart('LEFT')}
                            onTouchEnd={handleEnd('LEFT')}
                            onMouseDown={handleStart('LEFT')}
                            onMouseUp={handleEnd('LEFT')}
                        />
                        {/* RIGHT */}
                        <div
                            className={`absolute right-0 w-14 h-12 bg-gray-500/50 rounded-r-lg active:bg-gray-400/80 ${buttonClass}`}
                            onTouchStart={handleStart('RIGHT')}
                            onTouchEnd={handleEnd('RIGHT')}
                            onMouseDown={handleStart('RIGHT')}
                            onMouseUp={handleEnd('RIGHT')}
                        />
                        {/* Center */}
                        <div className="w-12 h-12 bg-gray-600/50" />
                    </div>
                </div>

                {/* A/B Buttons */}
                <div className="flex gap-4 mb-4">
                    <div
                        className={`w-16 h-16 rounded-full bg-red-500/40 border-2 border-red-400/50 flex items-center justify-center backdrop-blur-sm active:bg-red-500/70 ${buttonClass}`}
                        onTouchStart={handleStart('B')}
                        onTouchEnd={handleEnd('B')}
                        onMouseDown={handleStart('B')}
                        onMouseUp={handleEnd('B')}
                    >
                        <span className="text-white/80 font-bold">B</span>
                    </div>
                    <div
                        className={`w-16 h-16 rounded-full bg-green-500/40 border-2 border-green-400/50 flex items-center justify-center backdrop-blur-sm active:bg-green-500/70 mt-8 ${buttonClass}`}
                        onTouchStart={handleStart('A')}
                        onTouchEnd={handleEnd('A')}
                        onMouseDown={handleStart('A')}
                        onMouseUp={handleEnd('A')}
                    >
                        <span className="text-white/80 font-bold">A</span>
                    </div>
                </div>
            </div>

            {/* Start/Select/L/R Row at Top */}
            <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-auto">
                <div
                    className={`px-6 py-3 bg-gray-700/40 rounded-full border border-white/10 active:bg-gray-600/60 backdrop-blur-sm ${buttonClass}`}
                    onTouchStart={handleStart('L')}
                    onTouchEnd={handleEnd('L')}
                    onMouseDown={handleStart('L')}
                    onMouseUp={handleEnd('L')}
                >
                    <span className="text-white/70 text-xs font-bold">L</span>
                </div>
                <div
                    className={`px-6 py-3 bg-gray-700/40 rounded-full border border-white/10 active:bg-gray-600/60 backdrop-blur-sm ${buttonClass}`}
                    onTouchStart={handleStart('R')}
                    onTouchEnd={handleEnd('R')}
                    onMouseDown={handleStart('R')}
                    onMouseUp={handleEnd('R')}
                >
                    <span className="text-white/70 text-xs font-bold">R</span>
                </div>
            </div>

            {/* Menu Buttons Bottom Center */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 pointer-events-auto">
                <div
                    className={`px-4 py-1 bg-gray-700/40 rounded-full border border-white/10 active:bg-gray-600/60 backdrop-blur-sm transform rotate-12 ${buttonClass}`}
                    onTouchStart={handleStart('SELECT')}
                    onTouchEnd={handleEnd('SELECT')}
                    onMouseDown={handleStart('SELECT')}
                    onMouseUp={handleEnd('SELECT')}
                >
                    <span className="text-white/70 text-[10px] uppercase font-bold">Select</span>
                </div>
                <div
                    className={`px-4 py-1 bg-gray-700/40 rounded-full border border-white/10 active:bg-gray-600/60 backdrop-blur-sm transform rotate-12 ${buttonClass}`}
                    onTouchStart={handleStart('START')}
                    onTouchEnd={handleEnd('START')}
                    onMouseDown={handleStart('START')}
                    onMouseUp={handleEnd('START')}
                >
                    <span className="text-white/70 text-[10px] uppercase font-bold">Start</span>
                </div>
            </div>
        </div>
    );
};

export default MobileControls;
