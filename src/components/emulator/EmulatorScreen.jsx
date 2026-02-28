import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useEmulator } from '../../context/EmulatorContext';
import MobileControls from './MobileControls';
import EmulatorStatusBar from './EmulatorStatusBar';
import mGBA from '@thenick775/mgba-wasm';

// Global lock to prevent double-initialization in Strict Mode
let globalMgbaPromise = null;
let globalMgbaInstance = null;

const EmulatorScreen = ({ romData, romName, isPlaying, isPaused, volume, onPlayPause, onOpenSettings }) => {
    const { 
        safeCore, 
        initEngine,
        isCoreReady,
        isCoreLoading,
        canvasElement
    } = useEmulator();
    
    const containerRef = useRef(null);
    const canvasContainerRef = useRef(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [loadError, setLoadError] = useState(null);
    const [isFocused, setIsFocused] = useState(false); // Start unfocused to avoid key hijacking
    const [isRomLoading, setIsRomLoading] = useState(false);

    // Initial Engine Start
    useEffect(() => {
        let isMounted = true;
        const init = async () => {
            try {
                // Add a small delay to ensure DOM is ready on mobile
                await new Promise(r => setTimeout(r, 500));
                if (!isMounted) return;
                
                await initEngine();
                
                // Final safety check: if we are not isolated, WASM workers will fail
                if (!window.crossOriginIsolated) {
                    console.warn('[Screen] Environment not Cross-Origin Isolated. WASM might fail.');
                    // Don't error out yet, some builds might work without it, but log it
                }
            } catch (err) {
                if (isMounted) {
                    console.error('Core init failed:', err);
                    setLoadError('Error al iniciar el motor: ' + err.message);
                }
            }
        };
        init();
        return () => { isMounted = false; };
    }, [initEngine]);

    // Mount persistent canvas
    useEffect(() => {
        if (canvasContainerRef.current && canvasElement) {
            // Clear container before appending
            canvasContainerRef.current.innerHTML = '';
            canvasContainerRef.current.appendChild(canvasElement);
        }
    }, [canvasElement]);

    // Update canvas size
    useEffect(() => {
        if (canvasElement && romName) {
            const isGBC = romName.toLowerCase().endsWith('.gbc') || romName.toLowerCase().endsWith('.gb');
            canvasElement.width = isGBC ? 160 : 240;
            canvasElement.height = isGBC ? 144 : 160;
        }
    }, [canvasElement, romName]);

    // ROM Load sync
    useEffect(() => {
        if (isCoreReady && romData && romName && !isRomLoading) {
            let isAborted = false;
            
            const performLoad = async () => {
                setIsRomLoading(true);
                setLoadError(null);
                
                try {
                    console.log(`[Screen] Loading ROM: ${romName}`);
                    const dataUint8 = new Uint8Array(romData);
                    const paths = safeCore.filePaths();
                    
                    if (!paths || !paths.gamePath) {
                        throw new Error('Emulator filesystem not ready (paths missing)');
                    }

                    const path = paths.gamePath + '/' + romName;
                    
                    safeCore.writeFile(path, dataUint8);
                    const success = safeCore.loadGame(path);
                    
                    if (isAborted) return;
                    if (!success) throw new Error('mGBA failed to load game data');
                    
                    console.log('[Screen] Game loaded success. Starting audio...');
                    
                    setTimeout(() => {
                        if (isAborted) return;
                        try {
                            safeCore.resume(); 
                            safeCore.resumeAudio();
                            safeCore.setVolume(parseFloat(volume));
                            console.log(`[Screen] Applied initial volume: ${volume}`);
                        } catch (e) {
                            console.warn('[Screen] Audio init failed:', e);
                        }
                    }, 150);
                    
                    console.log('[Screen] Game started.');
                } catch (err) {
                    if (!isAborted) {
                        console.error('[Screen] ROM load error:', err);
                        setLoadError('Error loading ROM: ' + err.message);
                    }
                } finally {
                    if (!isAborted) setIsRomLoading(false);
                }
            };

            performLoad();
            return () => { isAborted = true; };
        }
    }, [isCoreReady, romData, romName, safeCore]); // volume is not a dependency to avoid reloads

    // Pausing sync
    useEffect(() => {
        if (isCoreReady) {
            if (isPaused || !isFocused) {
                safeCore.pause();
            } else if (isPlaying) {
                safeCore.resume();
            }
        }
    }, [isPaused, isPlaying, isCoreReady, isFocused, safeCore]);

    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);
    
    const handleContainerClick = () => {
        if (!isFocused && containerRef.current) {
            containerRef.current.focus();
        }
    };

    const handleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const isGBC = romName && (romName.toLowerCase().endsWith('.gbc') || romName.toLowerCase().endsWith('.gb'));
    const aspectClass = isGBC ? 'aspect-[10/9]' : 'aspect-[3/2]';
    const dimensionsClass = isFullscreen ? `w-auto h-full ${aspectClass}` : (isGBC ? `w-[320px] h-[288px] max-w-[80vw] ${aspectClass}` : `w-[480px] h-[320px] max-w-[80vw] ${aspectClass}`);

    const getMobileControlsMap = (key) => {
        const mgbaKeyMap = {
            'RIGHT': 'Right', 'LEFT': 'Left', 'UP': 'Up', 'DOWN': 'Down',
            'A': 'A', 'B': 'B', 'SELECT': 'Select', 'START': 'Start',
            'L': 'L', 'R': 'R'
        };
        return mgbaKeyMap[key];
    };

    const keyMap = {
        'ArrowUp': 'Up',
        'ArrowDown': 'Down',
        'ArrowLeft': 'Left',
        'ArrowRight': 'Right',
        'z': 'A',
        'x': 'B',
        'Z': 'A',
        'X': 'B',
        'a': 'L',
        's': 'R',
        'A': 'L',
        'S': 'R',
        'Enter': 'Start',
        'Shift': 'Select'
    };

    const handleKeyDown = (e) => {
        if (!isCoreReady) return;
        
        // If the user is typing in an input, textarea or select, don't intercept
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
            return;
        }

        const btn = keyMap[e.key];
        if (btn) {
            if (e.cancelable) e.preventDefault();
            safeCore.buttonPress(btn);
        }
    };

    const handleKeyUp = (e) => {
        if (!isCoreReady) return;
        const btn = keyMap[e.key];
        if (btn) {
            safeCore.buttonUnpress(btn);
        }
    };

    return (
        <div className="space-y-4">
            {loadError && (
                <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-xl text-sm">
                    {loadError}
                </div>
            )}

            <div
                ref={containerRef}
                className="relative group outline-none select-none flex flex-col items-center"
                tabIndex="0"
                onFocus={handleFocus}
                onBlur={handleBlur}
                onClick={handleContainerClick}
                onKeyDown={handleKeyDown}
                onKeyUp={handleKeyUp}
            >
                <div className={`relative transition-all duration-500 ease-in-out ${isFullscreen
                    ? 'w-screen h-screen bg-black flex items-center justify-center p-0'
                    : 'bg-[#432371] p-6 pb-12 rounded-[2.5rem] shadow-2xl border-b-8 border-r-8 border-[#2d1b4e] flex flex-col items-center gap-2'
                    }`}>

                    {!isFullscreen && (
                        <div className="absolute top-4 w-full px-12 flex justify-between opacity-20 pointer-events-none">
                            <div className="h-1 w-24 bg-white rounded-full"></div>
                            <div className="h-1 w-24 bg-white rounded-full"></div>
                        </div>
                    )}

                    <div className={`relative bg-[#222] rounded-tl-xl rounded-tr-xl rounded-bl-[2rem] rounded-br-[2rem] shadow-inner overflow-hidden flex flex-col items-center ${isFullscreen ? 'w-full h-full' : 'p-8 pb-10'
                        }`}>

                        <div className={`relative bg-black transition-all ${isFullscreen ? 'w-full h-full flex items-center justify-center' : 'rounded-md shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] border-[12px] border-[#333]'
                            }`}>

                            <div className={`bg-black overflow-hidden relative flex justify-center items-center mx-auto ${dimensionsClass}`}>
                                <div 
                                    ref={canvasContainerRef}
                                    className="w-full h-full block flex justify-center items-center"
                                />

                                {(isCoreLoading || !isCoreReady || isRomLoading) && !loadError && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/60 backdrop-blur-sm z-30">
                                        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{isRomLoading ? 'Cargando Juego...' : 'Iniciando Motor...'}</p>
                                        {!window.crossOriginIsolated && !isRomLoading && (
                                            <p className="text-orange-400 text-[10px] mt-2 max-w-[200px] text-center leading-tight">
                                                Aislamiento COOP/COEP no detectado. Si estás en móvil, usa Chrome o Safari directamente (no desde apps como Instagram o WhatsApp).
                                            </p>
                                        )}
                                    </div>
                                )}

                                {isCoreReady && !romData && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-black">
                                        <div className="text-gray-500 mb-4 font-pixel text-4xl animate-bounce">mGBA</div>
                                        <p className="text-gray-400 text-xs tracking-widest uppercase">Select ROM</p>
                                    </div>
                                )}

                                {!isFocused && romData && !isFullscreen && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px] transition-opacity cursor-pointer">
                                        <div className="bg-black/80 text-white px-3 py-1 rounded text-xs font-mono animate-pulse border border-white/20">
                                            PAUSED (CLICK TO RESUME)
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {!isFullscreen && (
                            <div className="mt-1 flex items-center gap-1 opacity-60">
                                <span className="font-bold italic text-gray-400 text-sm">NOSTALGIA</span>
                                <span className="font-light italic text-gray-500 text-xs">ADVANCE</span>
                            </div>
                        )}

                        {!isFullscreen && (
                            <div className="absolute top-1/2 -translate-y-1/2 left-4 flex flex-col gap-1">
                                <div className={`w-2 h-2 rounded-full shadow-lg ${isCoreReady ? 'bg-green-500 shadow-green-500/50' : 'bg-red-900'}`}></div>
                            </div>
                        )}
                        {!isFullscreen && (
                            <div className="absolute top-[40%] right-4 flex flex-col items-center">
                                <div className="w-1 h-8 bg-gray-700/50 rounded-full"></div>
                                <div className="w-1 h-8 bg-gray-700/50 rounded-full ml-1 -mt-4"></div>
                            </div>
                        )}
 
                        {/* Mobile Controls Overlay */}
                        {isCoreReady && (
                            <MobileControls
                                onControlDown={(key) => {
                                    const mapped = getMobileControlsMap(key);
                                    if(mapped) safeCore.buttonPress(mapped);
                                }}
                                onControlUp={(key) => {
                                    const mapped = getMobileControlsMap(key);
                                    if(mapped) safeCore.buttonUnpress(mapped);
                                }}
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
                    isCoreReady={isCoreReady}
                    isPlaying={isPlaying}
                    isPaused={isPaused}
                />
            </div>

        </div>
    );
};

export default EmulatorScreen;
