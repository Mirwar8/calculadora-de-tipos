import { useState, useEffect } from 'react';
import { calculateCoverage } from '../utils/pokemonTypes';
import TypeBadge from './TypeBadge';

const TimelineSection = ({ type1, type2, typeChart }) => {
    const [filteredGames, setFilteredGames] = useState([]);
    const [expandedGame, setExpandedGame] = useState(null);

    // Sample data - replace with actual Pokémon data
    const allGames = [
        {
            id: 'rb',
            title: 'Red & Blue',
            year: '1996',
            pokemon: [
                {
                    name: 'Charizard',
                    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png',
                    types: ['fire', 'flying'],
                    info: 'Flame Pokémon',
                    height: '1.7m',
                    weight: '90.5kg'
                },
                {
                    name: 'Venusaur',
                    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/3.png',
                    types: ['grass', 'poison'],
                    info: 'Seed Pokémon',
                    height: '2.0m',
                    weight: '100.0kg'
                }
            ]
        },
        {
            id: 'gs',
            title: 'Gold & Silver',
            year: '1999',
            pokemon: [
                {
                    name: 'Typhlosion',
                    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/157.png',
                    types: ['fire'],
                    info: 'Volcano Pokémon',
                    height: '1.7m',
                    weight: '79.5kg'
                }
            ]
        },
        {
            id: 'rs',
            title: 'Ruby & Sapphire',
            year: '2002',
            pokemon: [
                {
                    name: 'Blaziken',
                    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/257.png',
                    types: ['fire', 'fighting'],
                    info: 'Blaze Pokémon',
                    height: '1.9m',
                    weight: '52.0kg'
                }
            ]
        },
        {
            id: 'dp',
            title: 'Diamond & Pearl',
            year: '2006',
            pokemon: [
                {
                    name: 'Infernape',
                    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/392.png',
                    types: ['fire', 'fighting'],
                    info: 'Flame Pokémon',
                    height: '1.2m',
                    weight: '55.0kg'
                }
            ]
        },
        {
            id: 'bw',
            title: 'Black & White',
            year: '2010',
            pokemon: [
                {
                    name: 'Emboar',
                    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/500.png',
                    types: ['fire', 'fighting'],
                    info: 'Big Fire Pig Pokémon',
                    height: '1.6m',
                    weight: '150.0kg'
                }
            ]
        },
        {
            id: 'xy',
            title: 'X & Y',
            year: '2013',
            pokemon: [
                {
                    name: 'Delphox',
                    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/655.png',
                    types: ['fire', 'psychic'],
                    info: 'Fox Pokémon',
                    height: '1.5m',
                    weight: '39.0kg'
                }
            ]
        },
        {
            id: 'sm',
            title: 'Sun & Moon',
            year: '2016',
            pokemon: [
                {
                    name: 'Incineroar',
                    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/727.png',
                    types: ['fire', 'dark'],
                    info: 'Heel Pokémon',
                    height: '1.8m',
                    weight: '83.0kg'
                }
            ]
        },
        {
            id: 'ss',
            title: 'Sword & Shield',
            year: '2019',
            pokemon: [
                {
                    name: 'Cinderace',
                    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/815.png',
                    types: ['fire'],
                    info: 'Striker Pokémon',
                    height: '1.4m',
                    weight: '33.0kg'
                }
            ]
        },
        {
            id: 'sv',
            title: 'Scarlet & Violet',
            year: '2022',
            pokemon: [
                {
                    name: 'Meowscarada',
                    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/908.png',
                    types: ['grass', 'dark'],
                    info: 'Magician Pokémon',
                    height: '1.5m',
                    weight: '31.2kg'
                }
            ]
        }
    ];

    useEffect(() => {
        // Filter games that have Pokémon matching the selected types
        const filtered = allGames.filter(game => {
            return game.pokemon.some(pokemon => {
                const pokemonTypes = [pokemon.types[0], pokemon.types[1] || 'none'];
                return (pokemonTypes[0] === type1 && pokemonTypes[1] === type2) ||
                       (pokemonTypes[0] === type2 && pokemonTypes[1] === type1) ||
                       (pokemonTypes[0] === type1 && pokemonTypes[1] === 'none' && type2 === 'none') ||
                       (pokemonTypes[1] === type1 && pokemonTypes[0] === 'none' && type2 === 'none');
            });
        });
        setFilteredGames(filtered);
    }, [type1, type2]);

    const toggleExpanded = (gameId) => {
        setExpandedGame(expandedGame === gameId ? null : gameId);
    };

    if (filteredGames.length === 0) {
        return null;
    }

    return (
        <section className="space-y-6">
            <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black dark:text-white">Evolution Timeline</h2>
                <div className="h-px flex-1 bg-slate-200 dark:bg-[#233648]"></div>
            </div>

            <div className="overflow-x-auto overflow-safe pb-4">
                <div className="inline-flex gap-6 min-w-max px-4">
                    {filteredGames.map((game, index) => (
                        <div key={game.id} className="relative">
                            {/* Timeline Connection */}
                            {index < filteredGames.length - 1 && (
                                <div className="absolute top-20 left-full w-6 h-0.5 bg-gradient-to-r from-primary to-transparent" 
                                     style={{ transform: 'translateY(-50%)' }}></div>
                            )}

                            {/* Timeline Node */}
                            <div className="relative">
                                <div className="size-12 bg-primary rounded-full flex items-center justify-center text-white font-black shadow-lg mb-4">
                                    {game.year.slice(-2)}
                                </div>
                                
                                {/* Game Card */}
                                <div className="bg-white dark:bg-[#1a2632] border border-slate-200 dark:border-[#233648] rounded-2xl p-4 min-w-[320px] shadow-sm">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-bold text-lg dark:text-white">{game.title}</h3>
                                        <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">{game.year}</span>
                                    </div>

                                    {/* Pokemon Cards */}
                                    <div className="space-y-3">
                                        {game.pokemon.map((pokemon, pIndex) => {
                                            const isExpanded = expandedGame === game.id;
                                            const hasMultipleTypes = pokemon.types.length > (type2 !== 'none' ? 1 : 1);
                                            const shouldShowAll = isExpanded || !hasMultipleTypes;

                                            return (
                                                <div key={`${game.id}-${pIndex}`} className="border border-slate-100 dark:border-[#233648] rounded-xl p-3">
                                                    <div className="flex items-center gap-4">
                                                        {/* Pokemon Image */}
                                                        <img 
                                                            src={pokemon.image} 
                                                            alt={pokemon.name}
                                                            className="w-16 h-16 object-contain pixelated"
                                                        />

                                                        {/* Types Column */}
                                                        <div className="flex-1">
                                                            <div className="flex flex-wrap gap-1.5 mb-2">
                                                                {pokemon.types.slice(0, shouldShowAll ? pokemon.types.length : 1).map(type => (
                                                                    <TypeBadge key={type} type={type} />
                                                                ))}
                                                                {!shouldShowAll && (
                                                                    <span className="text-xs text-slate-400 italic">+{pokemon.types.length - 1} more</span>
                                                                )}
                                                            </div>

                                                            {/* Info Column */}
                                                            <div className="text-sm">
                                                                <div className="font-bold text-slate-900 dark:text-white">{pokemon.name}</div>
                                                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                                                    {pokemon.info} • {pokemon.height} • {pokemon.weight}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Expand/Collapse Button */}
                                                        {hasMultipleTypes && (
                                                            <button
                                                                onClick={() => toggleExpanded(game.id)}
                                                                className="size-8 rounded-full bg-slate-100 dark:bg-[#233648] flex items-center justify-center text-slate-500 hover:text-primary transition-colors touch-target"
                                                            >
                                                                <span className="material-symbols-outlined text-lg">
                                                                    {isExpanded ? 'expand_less' : 'expand_more'}
                                                                </span>
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TimelineSection;