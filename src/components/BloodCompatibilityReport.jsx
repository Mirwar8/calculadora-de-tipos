import { useState } from 'react';

const BloodCompatibilityReport = ({ compatibility, bloodType }) => {
    const [activeTab, setActiveTab] = useState('donate');

    const getBloodTypeColor = (type) => {
        const colors = {
            'A+': 'bg-red-500',
            'A-': 'bg-red-400',
            'B+': 'bg-blue-500',
            'B-': 'bg-blue-400',
            'AB+': 'bg-purple-500',
            'AB-': 'bg-purple-400',
            'O+': 'bg-green-500',
            'O-': 'bg-green-400'
        };
        return colors[type] || 'bg-gray-500';
    };

    const tabs = [
        { id: 'donate', label: 'Can Donate To', icon: 'arrow_upward' },
        { id: 'receive', label: 'Can Receive From', icon: 'arrow_downward' },
        { id: 'plasma-donate', label: 'Plasma Donate To', icon: 'water_drop' },
        { id: 'plasma-receive', label: 'Plasma Receive From', icon: 'water_drop' }
    ];

    const getCompatibilityList = () => {
        switch (activeTab) {
            case 'donate':
                return compatibility.canDonateTo;
            case 'receive':
                return compatibility.canReceiveFrom;
            case 'plasma-donate':
                return compatibility.plasmaDonateTo;
            case 'plasma-receive':
                return compatibility.plasmaReceiveFrom;
            default:
                return [];
        }
    };

    const getTabInfo = () => {
        const info = {
            'donate': {
                title: 'Red Blood Cell Donation',
                description: 'Your red blood cells can be transfused to these blood types',
                color: 'red'
            },
            'receive': {
                title: 'Red Blood Cell Reception',
                description: 'You can receive red blood cells from these blood types',
                color: 'blue'
            },
            'plasma-donate': {
                title: 'Plasma Donation',
                description: 'Your plasma can be transfused to these blood types',
                color: 'yellow'
            },
            'plasma-receive': {
                title: 'Plasma Reception',
                description: 'You can receive plasma from these blood types',
                color: 'green'
            }
        };
        return info[activeTab];
    };

    const currentTab = getTabInfo();
    const compatibilityList = getCompatibilityList();

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-[#233648] border-2 border-slate-200 dark:border-[#324d67] rounded-3xl p-6 sm:p-8">
                <div className="flex flex-col space-y-4 mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Compatibility Report
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400">
                        Blood type {bloodType} compatibility information
                    </p>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded-full font-medium transition-all touch-target ${
                                activeTab === tab.id
                                    ? 'bg-primary text-white'
                                    : 'bg-slate-100 dark:bg-[#1a2632] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#2a3642]'
                            }`}
                        >
                            <span className="material-symbols-outlined text-lg mr-2">
                                {tab.icon}
                            </span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="space-y-4">
                    <div className="bg-slate-50 dark:bg-[#1a2632] rounded-2xl p-4">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                            {currentTab.title}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">
                            {currentTab.description}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {compatibilityList.length > 0 ? (
                            compatibilityList.map((type) => (
                                <div
                                    key={type}
                                    className="bg-slate-50 dark:bg-[#1a2632] rounded-2xl p-4 flex flex-col items-center space-y-2"
                                >
                                    <div className={`w-12 h-12 ${getBloodTypeColor(type)} rounded-full flex items-center justify-center text-white font-bold text-lg`}>
                                        {type}
                                    </div>
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Type {type}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-8">
                                <span className="material-symbols-outlined text-4xl text-slate-400 mb-2">
                                    info
                                </span>
                                <p className="text-slate-500 dark:text-slate-400">
                                    No compatible blood types found
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-3xl p-6">
                <div className="flex items-start space-x-3">
                    <span className="material-symbols-outlined text-blue-500 text-2xl mt-1">
                        info
                    </span>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                            Important Medical Information
                        </h3>
                        <p className="text-blue-800 dark:text-blue-200 text-sm leading-relaxed">
                            This calculator provides general compatibility information. Always consult with healthcare professionals for medical decisions regarding blood transfusions and donations.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BloodCompatibilityReport;