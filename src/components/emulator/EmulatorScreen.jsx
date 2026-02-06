import React, { useRef, useEffect, useState, useCallback } from 'react';
import MobileControls from './MobileControls';
import EmulatorStatusBar from './EmulatorStatusBar';

const GBA_SCRIPTS = [
    '/emulator/js/util.js',
    '/emulator/js/core.js',
    '/emulator/js/arm.js',
    '/emulator/js/thumb.js',
    '/emulator/js/mmu.js',
    '/emulator/js/io.js',
    '/emulator/js/audio.js',
    '/emulator/js/video.js',
    '/emulator/js/video/proxy.js',
    '/emulator/js/video/software.js',
    '/emulator/js/irq.js',
    '/emulator/js/keypad.js',
    '/emulator/js/sio.js',
    '/emulator/js/savedata.js',
    '/emulator/js/gpio.js',
    '/emulator/js/gba.js'
];

const EmulatorScreen = ({ romData, isPlaying, isPaused, volume, onEmulatorReady, onPlayPause, onOpenSettings }) => {
    const canvasRef = useRef(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [emulatorInstance, setEmulatorInstance] = useState(null);
    const [scriptsLoaded, setScriptsLoaded] = useState(false);
    const [loadError, setLoadError] = useState(null);

    // Helper to load multiple scripts sequentially
    useEffect(() => {
        // PERFORMANCE FIX: Use requestAnimationFrame for smoother emulation
        window.queueFrame = (f) => {
            window.requestAnimationFrame(f);
        };

        let mounted = true;
        const loadScripts = async () => {
            try {
                for (const src of GBA_SCRIPTS) {
                    if (!mounted) return;
                    await new Promise((resolve, reject) => {
                        // Check if script already exists
                        if (document.querySelector(`script[src="${src}"]`)) {
                            resolve();
                            return;
                        }
                        const script = document.createElement('script');
                        script.src = src;
                        script.async = false; // Important: load in order
                        script.onload = resolve;
                        script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
                        document.head.appendChild(script);
                    });
                }
                if (mounted) setScriptsLoaded(true);
            } catch (err) {
                console.error('Error loading GBA scripts:', err);
                if (mounted) setLoadError(err.message);
            }
        };

        loadScripts();
        return () => { mounted = false; };
    }, []);

    // Initialize Emulator when scripts and canvas are ready
    useEffect(() => {
        if (scriptsLoaded && canvasRef.current && !emulatorInstance && window.GameBoyAdvance) {
            try {
                console.log('Initializing GBA Emulator...');
                const gba = new window.GameBoyAdvance();

                // Configure GBA
                gba.setCanvas(canvasRef.current);
                gba.logLevel = gba.LOG_ERROR;

                // Add logger to catch crashes
                gba.setLogger((level, error) => {
                    console.error('GBA Emulator Error:', error);
                    gba.pause();

                    let errorMessage = 'Unknown Error';
                    if (typeof error === 'string') {
                        errorMessage = error;
                    } else if (error && error.message) {
                        errorMessage = error.message;
                    } else if (error) {
                        try {
                            errorMessage = JSON.stringify(error);
                        } catch (e) {
                            errorMessage = '' + error;
                        }
                    }
                    setLoadError(`Emulator Crashed: ${errorMessage}`);
                });

                // Monkey-patch ERROR and logStackTrace
                gba.ERROR = function (error) {
                    this.log(this.LOG_ERROR, error);
                };

                gba.logStackTrace = function (stack) {
                    console.error('Stack Trace:', stack);
                };

                // Monkey-patch Save/Load State Functionality (Raw Buffers for LocalStorage)
                gba.saveState = function () {
                    return {
                        ram: this.mmu.memory[this.mmu.REGION_WORKING_RAM].buffer.slice(0),
                        iram: this.mmu.memory[this.mmu.REGION_WORKING_IRAM].buffer.slice(0)
                    };
                };

                gba.loadState = function (state) {
                    this.mmu.memory[this.mmu.REGION_WORKING_RAM].replaceData(state.ram);
                    this.mmu.memory[this.mmu.REGION_WORKING_IRAM].replaceData(state.iram);
                };

                // Monkey-patch setCanvas to strictly use our offscreen canvas logic
                // We don't want GBA.js touching the DOM or scaling logic at all.
                gba.setCanvas = function (canvas) {
                    this.context = canvas.getContext('2d');
                    this.video.setBacking(this.context);
                };

                // Compulsory BIOS loading handling
                const loadBiosAndInit = async () => {
                    try {
                        const res = await fetch('/emulator/resources/bios.bin');
                        if (!res.ok) throw new Error('BIOS not found');
                        const bios = await res.arrayBuffer();
                        gba.setBios(bios);
                        console.log('GBA BIOS loaded successfully');
                    } catch (err) {
                        console.warn('GBA BIOS warning:', err);
                    }

                    // Create an isolated offscreen buffer for the GBA to draw into.
                    // This guarantees strict 240x160 rendering regardless of standard canvas nonsense.
                    const offscreenCanvas = document.createElement('canvas');
                    offscreenCanvas.width = 240;
                    offscreenCanvas.height = 160;
                    gba.setCanvas(offscreenCanvas);

                    // Hook into the video draw callback to paint our visible canvas
                    gba.video.drawCallback = () => {
                        if (canvasRef.current) {
                            const ctx = canvasRef.current.getContext('2d', { alpha: false });
                            // Draw 1:1. CSS handles the visual scaling ("zooming").
                            ctx.drawImage(offscreenCanvas, 0, 0);
                        }
                    };

                    setEmulatorInstance(gba);
                    onEmulatorReady(gba);
                };

                loadBiosAndInit();

                return () => {
                    if (gba && typeof gba.pause === 'function') {
                        gba.pause();
                    }
                };
            } catch (err) {
                console.error('General error in Emulator initialization:', err);
                setLoadError('Initialization failed: ' + err.message);
            }
        }
    }, [scriptsLoaded, onEmulatorReady, emulatorInstance]);

    // Handle ROM loading
    useEffect(() => {
        if (emulatorInstance && romData) {
            console.log('Loading ROM...', romData);

            try {
                // If romData is an ArrayBuffer (from RomLoader), load it directly
                if (romData instanceof ArrayBuffer) {
                    console.log('Loading from ArrayBuffer directly');
                    const success = emulatorInstance.setRom(romData);
                    if (success) {
                        console.log('setRom returned success');
                        setTimeout(() => {
                            try {
                                console.log('Starting execution...');
                                emulatorInstance.runStable();
                            } catch (e) {
                                console.error('Error starting emulator:', e);
                                setLoadError('Failed to start emulation: ' + e.message);
                            }
                        }, 100);
                    } else {
                        console.error('setRom failed');
                        setLoadError('Failed to load ROM data (invalid format?)');
                    }
                }
                // Fallback for Blob/File (if passed differently in future)
                else {
                    console.log('Loading from File/Blob');
                    emulatorInstance.loadRomFromFile(romData, (success) => {
                        if (success) {
                            console.log('ROM loaded successfully');
                            setTimeout(() => {
                                try {
                                    emulatorInstance.runStable();
                                } catch (e) {
                                    console.error('Error starting emulator:', e);
                                    setLoadError('Failed to start emulation: ' + e.message);
                                }
                            }, 100);
                        } else {
                            console.error('Failed to load ROM');
                            setLoadError('Failed to load ROM file.');
                        }
                    });
                }
            } catch (err) {
                console.error('Error loading ROM:', err);
                setLoadError('ROM Loading Error: ' + err.message);
            }
        }
    }, [emulatorInstance, romData]);

    // Sync Play/Pause state
    useEffect(() => {
        if (emulatorInstance) {
            if (isPlaying && !isPaused) {
                if (emulatorInstance.paused) {
                    emulatorInstance.runStable();
                }
            } else {
                if (!emulatorInstance.paused) {
                    emulatorInstance.pause();
                }
            }
        }
    }, [isPlaying, isPaused, emulatorInstance]);

    // Sync Volume state
    useEffect(() => {
        if (emulatorInstance && emulatorInstance.audio) {
            // masterVolume is 0.0 to 1.0
            emulatorInstance.audio.masterVolume = volume;
        }
    }, [volume, emulatorInstance]);

    // Focus management using Ref for immediate access in event listeners
    const [isFocused, setIsFocused] = useState(false);
    const isFocusedRef = useRef(false);
    const containerRef = useRef(null);

    const setFocus = useCallback((focused) => {
        setIsFocused(focused);
        isFocusedRef.current = focused;
    }, []);

    const handleFocus = useCallback(() => setFocus(true), [setFocus]);
    const handleBlur = useCallback(() => setFocus(false), [setFocus]);

    // Explicitly focus the DOM element on click
    const handleContainerClick = useCallback(() => {
        if (containerRef.current) {
            containerRef.current.focus();
            setFocus(true);
        }
    }, [setFocus]);

    // Canvas scaling helper
    const updateCanvasScaling = useCallback((canvas) => {
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        if (ctx) {
            ctx.imageSmoothingEnabled = false;
            ctx.webkitImageSmoothingEnabled = false;
            ctx.mozImageSmoothingEnabled = false;
            ctx.msImageSmoothingEnabled = false;
        }
    }, []);

    const handleFullscreen = useCallback(() => {
        if (!isFullscreen) {
            containerRef.current?.requestFullscreen?.();
        } else {
            document.exitFullscreen?.();
        }
        setIsFullscreen(!isFullscreen);
    }, [isFullscreen]);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
            // Re-apply scaling on fullscreen change
            if (canvasRef.current) {
                updateCanvasScaling(canvasRef.current);
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, [updateCanvasScaling]);

    // Lock body scroll when emulator is mounted to prevent browser scrolling
    useEffect(() => {
        // Save original value
        const originalOverflow = document.body.style.overflow;
        // Lock scroll
        document.body.style.overflow = 'hidden';

        return () => {
            // Restore original value
            document.body.style.overflow = originalOverflow;
        };
    }, []);

    // Aggressive Global Input Handling
    useEffect(() => {
        const handleGlobalKeyDown = (event) => {
            if (!emulatorInstance || !emulatorInstance.keypad || !isFocusedRef.current) return;

            const keyMap = {
                'ArrowUp': emulatorInstance.keypad.UP,
                'ArrowDown': emulatorInstance.keypad.DOWN,
                'ArrowLeft': emulatorInstance.keypad.LEFT,
                'ArrowRight': emulatorInstance.keypad.RIGHT,
                'z': emulatorInstance.keypad.A,
                'x': emulatorInstance.keypad.B,
                'a': emulatorInstance.keypad.L,
                's': emulatorInstance.keypad.R,
                'Enter': emulatorInstance.keypad.START,
                'Shift': emulatorInstance.keypad.SELECT
            };

            const gbaKey = keyMap[event.key.toLowerCase()] || keyMap[event.key];

            if (gbaKey !== undefined) {
                emulatorInstance.keypad.keydown(gbaKey);
                // CRITICAL: Prevent default browser scrolling/navigation
                event.preventDefault();
                event.stopPropagation();
            }
        };

        const handleGlobalKeyUp = (event) => {
            if (!emulatorInstance || !emulatorInstance.keypad || !isFocusedRef.current) return;

            const keyMap = {
                'ArrowUp': emulatorInstance.keypad.UP,
                'ArrowDown': emulatorInstance.keypad.DOWN,
                'ArrowLeft': emulatorInstance.keypad.LEFT,
                'ArrowRight': emulatorInstance.keypad.RIGHT,
                'z': emulatorInstance.keypad.A,
                'x': emulatorInstance.keypad.B,
                'a': emulatorInstance.keypad.L,
                's': emulatorInstance.keypad.R,
                'Enter': emulatorInstance.keypad.START,
                'Shift': emulatorInstance.keypad.SELECT
            };

            const gbaKey = keyMap[event.key.toLowerCase()] || keyMap[event.key];

            if (gbaKey !== undefined) {
                emulatorInstance.keypad.keyup(gbaKey);
                event.preventDefault();
                event.stopPropagation();
            }
        };

        // Attach to window with capture to ensure we get it first
        window.addEventListener('keydown', handleGlobalKeyDown, { capture: true });
        window.addEventListener('keyup', handleGlobalKeyUp, { capture: true });

        return () => {
            window.removeEventListener('keydown', handleGlobalKeyDown, { capture: true });
            window.removeEventListener('keyup', handleGlobalKeyUp, { capture: true });
        };
    }, [emulatorInstance]); // Re-attach if emulator instance changes

    // Ensure scaling is applied when emulator starts
    useEffect(() => {
        if (emulatorInstance && canvasRef.current) {
            updateCanvasScaling(canvasRef.current);
        }
    }, [emulatorInstance, updateCanvasScaling]);

    return (
        <div className="space-y-4">
            {loadError && (
                <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-xl text-sm">
                    {loadError}
                </div>
            )}

            {/* Game Screen Container */}
            {/* Game Screen Container - GBA Shell Style */}
            <div
                ref={containerRef}
                className="relative group outline-none select-none flex flex-col items-center"
                tabIndex="0"
                onFocus={handleFocus}
                onBlur={handleBlur}
                onClick={handleContainerClick}
            >
                {/* GBA Shell Body */}
                <div className={`relative transition-all duration-500 ease-in-out ${isFullscreen
                    ? 'w-screen h-screen bg-black flex items-center justify-center p-0'
                    : 'bg-[#432371] p-6 pb-12 rounded-[2.5rem] shadow-2xl border-b-8 border-r-8 border-[#2d1b4e] flex flex-col items-center gap-2'
                    }`}>

                    {/* Top Decor Lines (only visible in shell mode) */}
                    {!isFullscreen && (
                        <div className="absolute top-4 w-full px-12 flex justify-between opacity-20 pointer-events-none">
                            <div className="h-1 w-24 bg-white rounded-full"></div>
                            <div className="h-1 w-24 bg-white rounded-full"></div>
                        </div>
                    )}

                    {/* Screen Bezel (Gray/Black border around screen) */}
                    <div className={`relative bg-[#222] rounded-tl-xl rounded-tr-xl rounded-bl-[2rem] rounded-br-[2rem] shadow-inner overflow-hidden flex flex-col items-center ${isFullscreen ? 'w-full h-full' : 'p-8 pb-10'
                        }`}>

                        {/* Screen Lens (The glass part) */}
                        <div className={`relative bg-black transition-all ${isFullscreen ? 'w-full h-full flex items-center justify-center' : 'rounded-md shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] border-[12px] border-[#333]'
                            }`}>

                            {/* Actual Screen Canvas */}
                            <div className={`bg-black overflow-hidden relative ${isFullscreen ? 'w-auto h-full aspect-[3/2]' : 'w-[480px] h-[320px] max-w-[80vw] aspect-[3/2]'
                                }`}>
                                <canvas
                                    ref={canvasRef}
                                    width={240}
                                    height={160}
                                    className="w-full h-full block"
                                    style={{
                                        imageRendering: 'pixelated',
                                        objectFit: 'contain'
                                    }}
                                />

                                {!scriptsLoaded && !loadError && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900">
                                        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                        <p className="text-gray-400 text-sm">Loading Emulator Core...</p>
                                    </div>
                                )}

                                {scriptsLoaded && !romData && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-black">
                                        <div className="text-gray-500 mb-4 font-pixel text-4xl animate-bounce">GAME BOY</div>
                                        <p className="text-gray-400 text-xs tracking-widest uppercase">Select ROM</p>
                                    </div>
                                )}

                                {/* Overlay to indicate Focus is needed */}
                                {!isFocused && romData && !isFullscreen && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px] transition-opacity cursor-pointer">
                                        <div className="bg-black/80 text-white px-3 py-1 rounded text-xs font-mono animate-pulse border border-white/20">
                                            PAUSED (CLICK TO RESUME)
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Branding Text on Lens */}
                        {!isFullscreen && (
                            <div className="mt-1 flex items-center gap-1 opacity-60">
                                <span className="font-bold italic text-gray-400 text-sm">GAME BOY</span>
                                <span className="font-light italic text-gray-500 text-xs">ADVANCE</span>
                            </div>
                        )}

                        {/* Power LED */}
                        {!isFullscreen && (
                            <div className="absolute top-1/2 -translate-y-1/2 left-4 flex flex-col gap-1">
                                <span className="text-[8px] text-gray-500 font-bold uppercase -ml-1">Battery</span>
                                <div className={`w-2 h-2 rounded-full shadow-lg ${emulatorInstance ? 'bg-green-500 shadow-green-500/50' : 'bg-red-900'}`}></div>
                            </div>
                        )}
                        {!isFullscreen && (
                            <div className="absolute top-[40%] right-4 flex flex-col items-center">
                                <div className="w-1 h-8 bg-gray-700/50 rounded-full"></div>
                                <div className="w-1 h-8 bg-gray-700/50 rounded-full ml-1 -mt-4"></div>
                            </div>
                        )}

                        {/* Mobile Controls Overlay */}
                        {emulatorInstance && (
                            <MobileControls
                                onControlDown={(key) => emulatorInstance.keypad.keydown(emulatorInstance.keypad[key])}
                                onControlUp={(key) => emulatorInstance.keypad.keyup(emulatorInstance.keypad[key])}
                            />
                        )}
                    </div>
                </div>

                <button
                    onClick={handleFullscreen}
                    className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-auto"
                >
                    <span className="material-symbols-outlined">
                        {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
                    </span>
                </button>
            </div>

            {/* Play/Pause Button (Desktop Centered) */}
            {/* Play/Pause Button & Status Bar */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-6">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onPlayPause}
                        disabled={!romData}
                        className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold shadow-lg transition-all transform active:scale-95 ${isPlaying && !isPaused
                            ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-orange-900/20'
                            : 'bg-green-600 hover:bg-green-700 text-white shadow-green-900/20'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        <span className="material-symbols-outlined">
                            {isPlaying && !isPaused ? 'pause' : 'play_arrow'}
                        </span>
                        <span>
                            {isPlaying && !isPaused ? 'Pause' : 'Play'}
                        </span>
                    </button>

                    <button
                        onClick={onOpenSettings}
                        disabled={!romData}
                        className="flex items-center justify-center w-10 h-10 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-full font-bold shadow-lg border border-white/10 transition-all active:scale-95"
                        title="Settings"
                    >
                        <span className="material-symbols-outlined">tune</span>
                    </button>
                </div>

                <EmulatorStatusBar
                    emulatorCore={emulatorInstance}
                    isPlaying={isPlaying}
                    isPaused={isPaused}
                />
            </div>

        </div >
    );
};

export default EmulatorScreen;
