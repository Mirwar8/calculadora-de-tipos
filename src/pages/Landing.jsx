import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TypeSelector from '../components/TypeSelector';
import EffectivenessReport from '../components/EffectivenessReport';
import { useTypeData } from '../hooks/useTypeData';
import { useTheme } from '../hooks/useTheme';

const Landing = () => {
    const [demoType1, setDemoType1] = useState('fire');
    const [demoType2, setDemoType2] = useState('flying');
    const [activeFeature, setActiveFeature] = useState(0);
    const { typeChart, loading } = useTypeData();
    const { theme } = useTheme();

    const features = [
        {
            icon: 'shield',
            title: 'Defensive Analysis',
            description: 'See exactly how much damage your Pokémon takes from every attack type',
            color: 'bg-blue-500'
        },
        {
            icon: 'bolt',
            title: 'Offensive Coverage',
            description: 'Discover which types your attacks are super effective against',
            color: 'bg-red-500'
        },
        {
            icon: 'speed',
            title: 'Instant Results',
            description: 'Get real-time calculations as you select different type combinations',
            color: 'bg-green-500'
        }
    ];

    const stats = [
        { number: '18', label: 'Different Types' },
        { number: '324', label: 'Type Combinations' },
        { number: '1000+', label: 'Pokémon Analyzed' }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveFeature((prev) => (prev + 1) % features.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-white to-blue-500/10 dark:from-primary/20 dark:via-background-dark dark:to-blue-500/20 w-full">
                <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-800 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]"></div>
                <div className="relative w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32" style={{ maxWidth: 'min(95vw, 1400px)' }}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                        {/* Left Column - Text & CTAs */}
                        <div className="space-y-8 text-center lg:text-left">
                            <div className="space-y-4">
                                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                                    Master Pokémon
                                    <span className="block text-primary">Type Mechanics</span>
                                </h1>
                                <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                                    The ultimate tool for competitive trainers. Calculate type effectiveness, 
                                    analyze team coverage, and dominate every battle.
                                </p>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
                                <Link
                                    to="/calculator"
                                    className="group inline-flex items-center gap-3 bg-primary text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/30 touch-target"
                                >
                                    <span className="material-symbols-outlined">calculate</span>
                                    Start Calculating
                                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                </Link>
                                <Link
                                    to="/pokedex"
                                    className="group inline-flex items-center gap-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-8 py-4 rounded-full font-bold text-lg border-2 border-slate-200 dark:border-slate-600 hover:border-primary transition-all touch-target"
                                >
                                    <span className="material-symbols-outlined">menu_book</span>
                                    Browse Pokédex
                                </Link>
                            </div>
                        </div>

                        {/* Right Column - Stats & Visual */}
                        <div className="hidden lg:flex flex-col items-center gap-8">
                            <div className="grid grid-cols-3 gap-6 w-full max-w-md">
                                {stats.map((stat, index) => (
                                    <div key={index} className="text-center p-6 bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-white/10 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                                        <div className="text-3xl xl:text-4xl font-black text-primary mb-1">
                                            {stat.number}
                                        </div>
                                        <div className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                                            {stat.label}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                                <span className="material-symbols-outlined text-primary animate-pulse">verified</span>
                                <span className="font-semibold">Trusted by competitive players worldwide</span>
                            </div>
                        </div>

                        {/* Mobile Stats - visible only on small screens */}
                        <div className="lg:hidden grid grid-cols-3 gap-4">
                            {stats.map((stat, index) => (
                                <div key={index} className="text-center p-4 bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-white/10">
                                    <div className="text-2xl sm:text-3xl font-black text-primary">
                                        {stat.number}
                                    </div>
                                    <div className="text-[10px] sm:text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Interactive Demo Section */}
            <section className="py-20 bg-transparent">
                <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center space-y-4 mb-12">
                        <h2 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white">
                            Try It Now
                        </h2>
                        <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                            See the power of real-time type analysis. Select any combination and watch the calculations update instantly.
                        </p>
                    </div>

                    <div className="w-full max-w-6xl mx-auto bg-slate-50 dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-700">
                        <div className="space-y-8">
                            <TypeSelector
                                type1={demoType1}
                                type2={demoType2}
                                setType1={setDemoType1}
                                setType2={setDemoType2}
                            />
                            
                            {!loading && typeChart && (
                                <EffectivenessReport
                                    typeChart={typeChart}
                                    type1={demoType1}
                                    type2={demoType2}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-24 bg-transparent pt-32">
                <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center space-y-4 mb-20">
                        <h2 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white">
                            Everything You Need to Win
                        </h2>
                        <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                            Professional-grade tools used by competitive players worldwide.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 lg:gap-12 w-full max-w-7xl mx-auto">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className={`relative p-8 rounded-2xl bg-white dark:bg-slate-800 border-2 transition-all duration-300 ${
                                    activeFeature === index
                                        ? 'border-primary shadow-lg shadow-primary/20 scale-105'
                                        : 'border-slate-200 dark:border-slate-600 hover:border-primary/50'
                                }`}
                            >
                                <div className={`w-16 h-16 ${feature.color} rounded-xl flex items-center justify-center mb-6`}>
                                    <span className="material-symbols-outlined text-white text-3xl">
                                        {feature.icon}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-24 bg-transparent pt-32">
                <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center space-y-4 mb-20">
                        <h2 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white">
                            Trusted by the Community
                        </h2>
                        <p className="text-xl text-slate-600 dark:text-slate-300">
                            Join thousands of trainers who've improved their game
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-24 w-full max-w-6xl mx-auto items-center justify-items-center">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center space-y-2">
                                <div className="text-4xl sm:text-5xl font-black text-primary">
                                    {stat.number}
                                </div>
                                <div className="text-sm font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-32 bg-transparent relative overflow-hidden">
                {/* Subtle background glow */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/20 rounded-full blur-[100px]" />
                </div>
                <div className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-10 sm:p-14 text-center space-y-7 shadow-2xl">
                        <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 text-primary px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-widest">
                            <span className="material-symbols-outlined text-base">trophy</span>
                            For Competitive Players
                        </div>
                        <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight">
                            Ready to Champion<br className="hidden sm:block" /> Your Team?
                        </h2>
                        <p className="text-lg text-slate-300 max-w-xl mx-auto leading-relaxed">
                            Start building unbeatable teams with our advanced type analysis tools.
                            Free to use, powerful enough for pros.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                            <Link
                                to="/calculator"
                                className="inline-flex items-center justify-center gap-3 bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-primary/30 touch-target"
                            >
                                <span className="material-symbols-outlined">calculate</span>
                                Type Calculator
                            </Link>
                            <Link
                                to="/teamBuilder"
                                className="inline-flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-2xl font-bold text-lg border border-white/20 hover:border-white/40 transition-all touch-target"
                            >
                                <span className="material-symbols-outlined">group_work</span>
                                Team Builder
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Landing;