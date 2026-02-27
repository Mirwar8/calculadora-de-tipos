import { useState } from 'react';
import { BLOOD_TYPES, BLOOD_TYPE_LIST } from '../utils/bloodTypes';

const BloodTypeSelector = ({ bloodType, setBloodType }) => {
    const [isOpen, setIsOpen] = useState(false);

    const getBloodTypeColor = (type) => {
        return BLOOD_TYPES[type]?.color || 'bg-gray-500';
    };

    const getBloodTypeBgColor = (type) => {
        const typeData = BLOOD_TYPES[type];
        if (!typeData) return 'bg-gray-50 dark:bg-gray-900/20';
        
        // Create lighter background colors
        const bgColors = {
            'bg-red-500': 'bg-red-50 dark:bg-red-900/20',
            'bg-red-400': 'bg-red-50 dark:bg-red-900/20',
            'bg-blue-500': 'bg-blue-50 dark:bg-blue-900/20',
            'bg-blue-400': 'bg-blue-50 dark:bg-blue-900/20',
            'bg-purple-500': 'bg-purple-50 dark:bg-purple-900/20',
            'bg-purple-400': 'bg-purple-50 dark:bg-purple-900/20',
            'bg-gray-500': 'bg-gray-50 dark:bg-gray-900/20',
            'bg-gray-400': 'bg-gray-50 dark:bg-gray-900/20'
        };
        return bgColors[typeData.color] || 'bg-gray-50 dark:bg-gray-900/20';
    };

    return (
        <div className="relative">
            <div className="flex flex-col space-y-4">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Select Blood Type
                </label>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`relative w-full px-6 py-4 rounded-2xl border-2 border-slate-200 dark:border-[#324d67] bg-white dark:bg-[#233648] text-left transition-all hover:border-primary dark:hover:border-primary touch-target ${getBloodTypeBgColor(bloodType)}`}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className={`w-12 h-12 ${getBloodTypeColor(bloodType)} rounded-full flex items-center justify-center text-white font-bold text-xl`}>
                                {bloodType}
                            </div>
                            <span className="text-lg font-semibold text-slate-900 dark:text-white">
                                Blood Type {bloodType}
                            </span>
                        </div>
                        <span 
                            className={`material-symbols-outlined text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        >
                            expand_more
                        </span>
                    </div>
                </button>

                {isOpen && (
                    <div className="absolute z-50 w-full mt-2 bg-white dark:bg-[#233648] border-2 border-slate-200 dark:border-[#324d67] rounded-2xl shadow-lg overflow-hidden">
                        <div className="max-h-64 overflow-y-auto">
                            {bloodTypes.map((type) => (
                                <button
                                    key={type}
                                    onClick={() => {
                                        setBloodType(type);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full px-6 py-3 text-left transition-all hover:bg-slate-50 dark:hover:bg-[#1a2632] flex items-center space-x-3 ${getBloodTypeBgColor(type)} ${bloodType === type ? 'bg-slate-100 dark:bg-[#1a2632]' : ''}`}
                                >
                                    <div className={`w-10 h-10 ${getBloodTypeColor(type)} rounded-full flex items-center justify-center text-white font-bold`}>
                                        {type}
                                    </div>
                                    <span className="font-medium text-slate-900 dark:text-white">
                                        Blood Type {type}
                                    </span>
                                    {bloodType === type && (
                                        <span className="material-symbols-outlined text-primary ml-auto">
                                            check
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {isOpen && (
                <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
};

export default BloodTypeSelector;