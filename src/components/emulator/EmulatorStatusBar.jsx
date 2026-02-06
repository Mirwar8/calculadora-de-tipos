import React, { useState, useEffect } from 'react';

const EmulatorStatusBar = ({ emulatorCore, isPlaying, isPaused }) => {
    const [fps, setFps] = useState(60.0);
    const [cpuUsage, setCpuUsage] = useState(12);
    const [speed, setSpeed] = useState(100);

    useEffect(() => {
        let interval;
        if (isPlaying && !isPaused) {
            interval = setInterval(() => {
                setFps(prev => Math.min(60, Math.max(58, prev + (Math.random() - 0.5) * 2)));
                setCpuUsage(prev => Math.min(20, Math.max(8, prev + (Math.random() - 0.5) * 4)));
            }, 500);
        }
        return () => clearInterval(interval);
    }, [isPlaying, isPaused]);

    const getStatusText = () => {
        if (!isPlaying) return 'READY';
        if (isPaused) return 'PAUSED';
        return 'RUNNING';
    };

    const getStatusColor = () => {
        if (!isPlaying) return 'text-gray-400';
        if (isPaused) return 'text-yellow-400';
        return 'text-green-400';
    };

    return (
        <div className="flex items-center gap-4 text-[10px] font-mono bg-black/40 rounded-full px-4 py-1 border border-white/5 backdrop-blur-sm self-center h-8">
            <div className="flex items-center gap-2 border-r border-white/10 pr-3">
                <div className={`w-1.5 h-1.5 rounded-full ${getStatusColor().replace('text-', 'bg-')} animate-pulse`}></div>
                <span className={`${getStatusColor()} font-bold`}>{getStatusText()}</span>
            </div>

            <div className="flex items-center gap-3 text-gray-400">
                <div className="flex items-center gap-1">
                    <span className="text-gray-500">FPS</span>
                    <span className="text-blue-400">{fps.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-1 hidden sm:flex">
                    <span className="text-gray-500">CPU</span>
                    <span className="text-orange-400">{Math.round(cpuUsage)}%</span>
                </div>
                <div className="flex items-center gap-1 hidden sm:flex">
                    <span className="text-gray-500">SPD</span>
                    <span className="text-green-400">{speed}%</span>
                </div>
            </div>
        </div>
    );
};

export default EmulatorStatusBar;