import React, { useState, useRef } from 'react';

const RomLoader = ({ onRomLoad }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    const handleFileSelect = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file extension
        if (!file.name.toLowerCase().endsWith('.gba')) {
            setError('Please select a valid GBA ROM file (.gba)');
            return;
        }

        // Validate file size (GBA ROMs are typically 1-32MB)
        if (file.size > 32 * 1024 * 1024) {
            setError('ROM file too large. Maximum size is 32MB.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const romData = await readFileAsArrayBuffer(file);
            onRomLoad(romData);
        } catch (err) {
            setError('Failed to load ROM file. Please try again.');
            console.error('ROM loading error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const readFileAsArrayBuffer = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('File reading failed'));
            reader.readAsArrayBuffer(file);
        });
    };

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleDrop = (event) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        if (file) {
            handleFileSelect({ target: { files: [file] } });
        }
    };

    const handleDragOver = (event) => {
        event.preventDefault();
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <div className="mb-8">
                    <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mb-6 shadow-2xl">
                        <span className="material-symbols-outlined text-white text-6xl">sports_esports</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Load Game</h2>
                    <p className="text-gray-400">Insert a GBA ROM cartridge to start playing</p>
                </div>

                <div
                    className="relative group cursor-pointer"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={handleButtonClick}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".gba"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                    <div className="border-2 border-dashed border-gray-600 hover:border-blue-500 rounded-2xl p-8 transition-all group-hover:border-blue-500 group-hover:bg-blue-500/5">
                        {isLoading ? (
                            <div className="flex flex-col items-center">
                                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
                                <p className="text-gray-400">Loading ROM...</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center">
                                <span className="material-symbols-outlined text-gray-400 text-5xl mb-4">upload_file</span>
                                <p className="text-white font-medium mb-2">Drop ROM file here or click to browse</p>
                                <p className="text-gray-500 text-sm">Supports .gba files up to 32MB</p>
                            </div>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl">
                        <div className="flex items-center">
                            <span className="material-symbols-outlined text-red-400 mr-2">error</span>
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="border-t border-gray-700 pt-6">
                <h3 className="text-white font-bold mb-3">Game Library</h3>
                <div className="space-y-2">
                    <button className="w-full text-left p-3 bg-gray-800/50 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
                        <div className="flex items-center">
                            <span className="material-symbols-outlined mr-3">history</span>
                            <div>
                                <p className="text-white font-medium">Recent Games</p>
                                <p className="text-sm opacity-70">Load recently played ROMs</p>
                            </div>
                        </div>
                    </button>
                </div>
            </div>

            <div className="text-center text-gray-500 text-sm">
                <p>Only use ROMs you legally own or have permission to use.</p>
            </div>
        </div>
    );
};

export default RomLoader;