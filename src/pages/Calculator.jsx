
import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import TypeSelector from '../components/TypeSelector';
import EffectivenessReport from '../components/EffectivenessReport';
import OffensiveCoverage from '../components/OffensiveCoverage';
import { useTypeData } from '../hooks/useTypeData';

const Calculator = () => {
    const [searchParams] = useSearchParams();
    const [type1, setType1] = useState('fire');
    const [type2, setType2] = useState('none');
    const { typeChart, loading } = useTypeData();

    useEffect(() => {
        const t1 = searchParams.get('type1');
        const t2 = searchParams.get('type2');
        if (t1) setType1(t1);
        if (t2) setType2(t2);
    }, [searchParams]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto space-y-10">
            <div className="flex flex-col space-fluid-4">
                <h1 className="text-fluid-4xl font-black tracking-tight dark:text-white">Type Coverage Calculator</h1>
                <p className="text-slate-500 dark:text-[#92adc9] text-fluid-lg max-w-2xl">
                    Instantly analyze weaknesses, resistances, and immunities for any type combination.
                </p>
            </div>

            <TypeSelector
                type1={type1}
                type2={type2}
                setType1={setType1}
                setType2={setType2}
            />

            <EffectivenessReport
                typeChart={typeChart}
                type1={type1}
                type2={type2}
            />

            <OffensiveCoverage
                typeChart={typeChart}
                type1={type1}
                type2={type2}
            />

            <section className="mt-8 sm:mt-10 lg:mt-12 mb-8 sm:mb-10">
                <div className="bg-slate-50 dark:bg-[#1a2632] border-2 border-dashed border-slate-200 dark:border-[#233648] rounded-[2.5rem] p-6 sm:p-8 lg:p-10 text-center overflow-safe">
                    <div className="max-w-xl mx-auto space-fluid-6">
                        <div className="flex justify-center">
                            <div className="size-16 bg-primary/10 rounded-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary text-4xl">search_insights</span>
                            </div>
                        </div>
                        <div className="space-fluid-4">
                            <h2 className="text-fluid-3xl font-black tracking-tight dark:text-white">Discover Existing Pokémon</h2>
                            <p className="text-slate-500 dark:text-[#92adc9]">Interested in seeing which Pokémon actually possess this specific type combination? Explore our database for matches and detailed stats.</p>
                        </div>
                        <Link
                            to={`/pokedex?type1=${type1}&type2=${type2}`}
                            className="group relative inline-flex items-center space-fluid-3 bg-white dark:bg-[#233648] text-slate-900 dark:text-white px-8 sm:px-10 py-4 sm:py-5 rounded-full font-black text-lg border-2 border-slate-200 dark:border-[#324d67] hover:border-primary dark:hover:border-primary transition-all shadow-lg hover:shadow-primary/10 touch-target"
                        >
                            <span className="material-symbols-outlined text-primary">capture</span>
                            View Pokémon with this Type Combination
                            <span className="material-symbols-outlined text-primary group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Calculator;
