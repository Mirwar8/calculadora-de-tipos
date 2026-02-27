import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import BloodTypeSelector from '../components/BloodTypeSelector';
import BloodCompatibilityReport from '../components/BloodCompatibilityReport';
import { useTheme } from '../hooks/useTheme';

const BloodTypeCalculator = () => {
    const [searchParams] = useSearchParams();
    const [bloodType, setBloodType] = useState('A+');
    const { isDark } = useTheme();

    useEffect(() => {
        const bt = searchParams.get('bloodType');
        if (bt) setBloodType(bt);
    }, [searchParams]);

    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    const getCompatibility = (type) => {
        const compatibility = {
            'A+': {
                canDonateTo: ['A+', 'AB+'],
                canReceiveFrom: ['A+', 'A-', 'O+', 'O-'],
                plasmaDonateTo: ['A+', 'A-', 'AB+', 'AB-'],
                plasmaReceiveFrom: ['A+', 'A-', 'O+', 'O-']
            },
            'A-': {
                canDonateTo: ['A+', 'A-', 'AB+', 'AB-'],
                canReceiveFrom: ['A-', 'O-'],
                plasmaDonateTo: ['A+', 'A-', 'AB+', 'AB-'],
                plasmaReceiveFrom: ['A-', 'O-']
            },
            'B+': {
                canDonateTo: ['B+', 'AB+'],
                canReceiveFrom: ['B+', 'B-', 'O+', 'O-'],
                plasmaDonateTo: ['B+', 'B-', 'AB+', 'AB-'],
                plasmaReceiveFrom: ['B+', 'B-', 'O+', 'O-']
            },
            'B-': {
                canDonateTo: ['B+', 'B-', 'AB+', 'AB-'],
                canReceiveFrom: ['B-', 'O-'],
                plasmaDonateTo: ['B+', 'B-', 'AB+', 'AB-'],
                plasmaReceiveFrom: ['B-', 'O-']
            },
            'AB+': {
                canDonateTo: ['AB+'],
                canReceiveFrom: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
                plasmaDonateTo: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
                plasmaReceiveFrom: ['AB+', 'AB-']
            },
            'AB-': {
                canDonateTo: ['AB+', 'AB-'],
                canReceiveFrom: ['A-', 'B-', 'AB-', 'O-'],
                plasmaDonateTo: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
                plasmaReceiveFrom: ['AB-']
            },
            'O+': {
                canDonateTo: ['A+', 'B+', 'O+', 'AB+'],
                canReceiveFrom: ['O+', 'O-'],
                plasmaDonateTo: ['O+', 'O-'],
                plasmaReceiveFrom: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']
            },
            'O-': {
                canDonateTo: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'],
                canReceiveFrom: ['O-'],
                plasmaDonateTo: ['O+', 'O-'],
                plasmaReceiveFrom: ['O-']
            }
        };

        return compatibility[type] || {
            canDonateTo: [],
            canReceiveFrom: [],
            plasmaDonateTo: [],
            plasmaReceiveFrom: []
        };
    };

    const compatibility = getCompatibility(bloodType);

    return (
        <div className="max-w-5xl mx-auto space-y-10">
            <div className="flex flex-col space-fluid-4">
                <h1 className="text-fluid-4xl font-black tracking-tight dark:text-white">Blood Type Compatibility Calculator</h1>
                <p className="text-slate-500 dark:text-[#92adc9] text-fluid-lg max-w-2xl">
                    Instantly check blood type compatibility for donations and transfusions.
                </p>
            </div>

            <BloodTypeSelector
                bloodType={bloodType}
                setBloodType={setBloodType}
                bloodTypes={bloodTypes}
            />

            <BloodCompatibilityReport
                compatibility={compatibility}
                bloodType={bloodType}
            />

            <section className="mt-8 sm:mt-10 lg:mt-12 mb-8 sm:mb-10">
                <div className="bg-slate-50 dark:bg-[#1a2632] border-2 border-dashed border-slate-200 dark:border-[#233648] rounded-[2.5rem] p-6 sm:p-8 lg:p-10 text-center overflow-safe">
                    <div className="max-w-xl mx-auto space-fluid-6">
                        <div className="flex justify-center">
                            <div className="size-16 bg-red-500/10 rounded-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-red-500 text-4xl">bloodtype</span>
                            </div>
                        </div>
                        <div className="space-fluid-4">
                            <h2 className="text-fluid-3xl font-black tracking-tight dark:text-white">Learn More About Blood Types</h2>
                            <p className="text-slate-500 dark:text-[#92adc9]">Understanding blood type compatibility is crucial for medical emergencies and blood donation. Learn about the science behind blood types.</p>
                        </div>
                        <Link
                            to="/"
                            className="group relative inline-flex items-center space-fluid-3 bg-white dark:bg-[#233648] text-slate-900 dark:text-white px-8 sm:px-10 py-4 sm:py-5 rounded-full font-black text-lg border-2 border-slate-200 dark:border-[#324d67] hover:border-red-500 dark:hover:border-red-500 transition-all shadow-lg hover:shadow-red-500/10 touch-target"
                        >
                            <span className="material-symbols-outlined text-red-500">home</span>
                            Back to Type Calculator
                            <span className="material-symbols-outlined text-red-500 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default BloodTypeCalculator;