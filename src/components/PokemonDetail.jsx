import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchPokemonFullDetails } from '../services/pokeapi';
import TypeSelector from './TypeSelector';
import EffectivenessReport from './EffectivenessReport';
import OffensiveCoverage from './OffensiveCoverage';
import TypeBadge from './TypeBadge';
import { useTypeData } from '../hooks/useTypeData';
import { calculateCoverage, ABILITY_OVERRIDES } from '../utils/pokemonTypes';

const PokemonDetail = () => {
    const [searchParams] = useSearchParams();
    const pokemonName = searchParams.get('pokemon');
    const [pokemon, setPokemon] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedAbility, setSelectedAbility] = useState('');
    const { typeChart, loading: typeLoading } = useTypeData();

    useEffect(() => {
        if (!pokemonName) {
            setLoading(false);
            return;
        }

        const loadPokemon = async () => {
            try {
                const data = await fetchPokemonFullDetails(pokemonName);
                if (data) {
                    setPokemon(data);
                    // Select first non-hidden ability by default
                    const firstAbility = data.abilities.find(a => !a.is_hidden);
                    setSelectedAbility(firstAbility ? firstAbility.name : '');
                }
            } catch (error) {
                console.error('Error loading Pokemon:', error);
            } finally {
                setLoading(false);
            }
        };

        loadPokemon();
    }, [pokemonName]);

    if (loading || typeLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!pokemon || !typeChart) {
        return (
            <div className="max-w-5xl mx-auto text-center py-12">
                <p className="text-slate-500 dark:text-slate-400">Pokemon not found or data not available.</p>
            </div>
        );
    }

    const types = pokemon.types;
    const type1 = types[0];
    const type2 = types[1] || 'none';
    const abilityOverride = selectedAbility && ABILITY_OVERRIDES[selectedAbility.toLowerCase()] ? selectedAbility.toLowerCase() : null;

    return (
        <div className="max-w-5xl mx-auto space-y-10">
            {/* Pokemon Header */}
            <div className="bg-white dark:bg-[#1a2632] rounded-3xl border border-slate-200 dark:border-[#233648] p-8">
                <div className="flex items-center gap-6">
                    <img
                        src={pokemon.image}
                        alt={pokemon.name}
                        className="w-24 h-24 object-contain"
                    />
                    <div className="flex-1">
                        <h1 className="text-3xl font-black dark:text-white capitalize mb-2">
                            {pokemon.name}
                        </h1>
                        <div className="flex items-center gap-3 mb-4">
                            {types.map(type => (
                                <TypeBadge key={type} type={type} />
                            ))}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                            #{String(pokemon.id).padStart(3, '0')}
                        </div>
                    </div>
                </div>

                {/* Ability Selector */}
                {pokemon.abilities.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-slate-200 dark:border-[#233648]">
                        <label className="text-sm font-bold text-slate-500 dark:text-slate-400 ml-1 uppercase tracking-widest block mb-3">
                            Ability
                        </label>
                        <div className="flex flex-wrap gap-3">
                            {pokemon.abilities.map(ability => (
                                <button
                                    key={ability.name}
                                    onClick={() => setSelectedAbility(ability.name)}
                                    className={`px-4 py-2 rounded-full font-medium transition-all ${
                                        selectedAbility === ability.name
                                            ? 'bg-primary text-white'
                                            : 'bg-slate-100 dark:bg-[#233648] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#2d3e4f]'
                                    }`}
                                >
                                    {ability.name.replace('-', ' ')}
                                    {ability.is_hidden && ' (Hidden)'}
                                </button>
                            ))}
                        </div>
                        {abilityOverride && (
                            <div className="mt-3 text-sm text-primary">
                                <span className="font-medium">Note:</span> This ability modifies type effectiveness.
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Type Selector (for comparison) */}
            <section className="bg-white dark:bg-[#1a2632] p-8 rounded-3xl border border-slate-200 dark:border-[#233648] shadow-sm">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">compare</span>
                    Compare with Different Types
                </h2>
                <TypeSelector
                    type1={type1}
                    type2={type2}
                    setType1={() => {}}
                    setType2={() => {}}
                    disabled={true}
                />
            </section>

            {/* Effectiveness Report */}
            <EffectivenessReport
                typeChart={typeChart}
                type1={type1}
                type2={type2}
                abilityOverride={abilityOverride}
            />

            {/* Offensive Coverage */}
            <OffensiveCoverage
                typeChart={typeChart}
                type1={type1}
                type2={type2}
            />
        </div>
    );
};

export default PokemonDetail;