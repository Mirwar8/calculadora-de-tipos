
import { useState, useEffect } from 'react';
import { searchPokemon } from '../services/pokeapi';
import { calculateCoverage, calculateOffensiveCoverage, TYPE_LIST, TYPES } from '../utils/pokemonTypes';
import { useNavigate } from 'react-router-dom';
import { useTeam } from '../hooks/useTeam';
import { useTypeData } from '../hooks/useTypeData';

const TeamBuilder = () => {
    // Hook Integration
    const { team, addToTeam, removeFromTeam, updateMember, resetTeam, setSlot } = useTeam();
    const { typeChart, loading: typesLoading } = useTypeData();
    const [analysis, setAnalysis] = useState(null);

    // Search State
    const [queries, setQueries] = useState(Array(6).fill(''));
    const [activeSearchSlot, setActiveSearchSlot] = useState(null);
    const [searchResults, setSearchResults] = useState([]);

    const navigate = useNavigate();

    // Sync input values with Team Names on Load/Change
    useEffect(() => {
        setQueries(team.map(m => m ? m.name : ''));
    }, [team]);

    // Search Debounce
    useEffect(() => {
        if (activeSearchSlot === null) {
            setSearchResults([]);
            return;
        }
        const query = queries[activeSearchSlot];
        const timer = setTimeout(async () => {
            if (query && query.length >= 2) {
                const results = await searchPokemon(query);
                setSearchResults(results || []);
            } else {
                setSearchResults([]);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [queries, activeSearchSlot]);

    // Analysis - Re-run when TEAM changes OR TypeChart loads
    useEffect(() => {
        if (!typesLoading) {
            calculateTeamAnalysis();
        }
    }, [team, typesLoading, typeChart]); // Added typeChart/typesLoading dep

    const handleInputChange = (index, value) => {
        const newQueries = [...queries];
        newQueries[index] = value;
        setQueries(newQueries);
        setActiveSearchSlot(index);
    };

    // Stability Fix: Handle click outside or blur
    const handleBlur = () => {
        setTimeout(() => {
            setActiveSearchSlot(null);
        }, 200);
    };

    const selectPokemon = (index, pokemon) => {
        setSlot(index, pokemon);
        const newQueries = [...queries];
        newQueries[index] = pokemon.name;
        setQueries(newQueries);
        setActiveSearchSlot(null);
        setSearchResults([]);
    };

    const handleUpdateAbility = (index, abilityName) => {
        updateMember(index, { selectedAbility: abilityName });
    };

    const handleRemove = (index) => {
        removeFromTeam(index);
        const newQueries = [...queries];
        newQueries[index] = '';
        setQueries(newQueries);
    };

    const calculateTeamAnalysis = () => {
        const activeMembers = team.filter(m => m !== null);
        if (activeMembers.length === 0) {
            setAnalysis(null);
            return;
        }

        // 1. Defensive Analysis (Vulnerabilities)
        const memberCoverages = activeMembers.map(member => {
            const t1 = member.types[0];
            const t2 = member.types[1] || null;
            // Use dynamically loaded typeChart here!
            const cov = calculateCoverage(t1, t2, typeChart, member.selectedAbility);

            // Group multipliers for the "Summary Table"
            const grouped = {
                x4: [], x2: [], x05: [], x025: [], x0: []
            };
            Object.entries(cov).forEach(([type, val]) => {
                if (val === 4) grouped.x4.push(type);
                if (val === 2) grouped.x2.push(type);
                if (val === 0.5) grouped.x05.push(type);
                if (val === 0.25) grouped.x025.push(type);
                if (val === 0) grouped.x0.push(type);
            });

            return { member, coverage: cov, grouped };
        });

        // 2. Offensive Analysis (Coverage)
        const memberOffensive = activeMembers.map(member => {
            const t1 = member.types[0];
            const t2 = member.types[1] || null;
            // Use dynamically loaded typeChart here!
            const offense = calculateOffensiveCoverage(t1, t2, typeChart);
            return { member, offense };
        });

        // Team Health Logic (for sidebar)
        const typeTotals = TYPE_LIST.map(type => {
            let weak = 0, resist = 0, immune = 0;

            memberCoverages.forEach(({ coverage }) => {
                const val = coverage[type];
                if (val > 1) weak++;
                if (val < 1 && val > 0) resist++;
                if (val === 0) immune++;
            });
            return { type, weak, resist, immune };
        });

        const criticalWeaknesses = typeTotals.filter(t => t.weak >= 3 && (t.resist + t.immune) === 0);
        const defensiveCores = typeTotals.filter(t => t.resist + t.immune >= 3);

        setAnalysis({
            memberCoverages, // Defensive
            memberOffensive, // Offensive
            typeTotals,
            criticalWeaknesses,
            defensiveCores
        });
    };

    const renderDefensiveCell = (value) => {
        if (value === 4) return <div className="matrix-cell bg-orange-600/30 text-orange-500 font-bold">4</div>;
        if (value === 2) return <div className="matrix-cell bg-red-600/30 text-red-500 font-bold">2</div>;
        if (value === 0.5) return <div className="matrix-cell text-green-500 font-bold bg-green-500/10">½</div>;
        if (value === 0.25) return <div className="matrix-cell text-green-500 font-bold bg-green-500/10">¼</div>;
        if (value === 0) return <div className="matrix-cell bg-primary/20 text-primary font-bold">0</div>;
        return <div className="matrix-cell text-slate-300 dark:text-slate-600">-</div>;
    };

    const renderOffensiveCell = (value) => {
        if (value === 4) return <div className="matrix-cell"><div className="offensive-badge-x4">x4</div></div>;
        if (value === 2) return <div className="matrix-cell"><div className="offensive-badge-x2">x2</div></div>;
        return <div className="matrix-cell text-slate-300 dark:text-slate-600">-</div>;
    };

    return (
        <div className="max-w-[1600px] mx-auto pb-20 px-4 md:px-8 space-y-10">
            {/* Header Section */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold dark:text-white">Team Composition</h2>
                    <p className="text-slate-500 dark:text-[#92adc9] text-sm">Gen 9 Analysis</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={resetTeam} className="bg-slate-200 dark:bg-[#233648] text-slate-700 dark:text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-100 hover:text-red-500 transition-colors">
                        Reset Team
                    </button>
                </div>
            </div>

            {/* Slots Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {team.map((member, index) => (
                    <div key={index} className={`bg-white dark:bg-[#1a2632] border ${member ? 'border-slate-200 dark:border-[#233648]' : 'border-dashed border-2 dark:border-[#233648]'} p-4 rounded-xl flex flex-col gap-4 relative transition-all`}>
                        {/* Search Input */}
                        <div className="relative z-20">
                            <input
                                className="w-full bg-slate-50 dark:bg-[#101922] border border-slate-200 dark:border-[#233648] rounded-lg px-3 py-2 text-sm dark:text-white focus:ring-1 focus:ring-primary outline-none"
                                placeholder={member ? member.name : "Add Pokémon..."}
                                value={queries[index]}
                                onChange={(e) => handleInputChange(index, e.target.value)}
                                onFocus={() => setActiveSearchSlot(index)}
                                onBlur={handleBlur}
                            />
                            {/* Autocomplete */}
                            {activeSearchSlot === index && searchResults.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1a2632] rounded-lg border border-slate-200 dark:border-[#233648] shadow-xl max-h-48 overflow-y-auto z-50">
                                    {searchResults.map(p => (
                                        <button
                                            key={p.id}
                                            onMouseDown={() => selectPokemon(index, p)}
                                            className="w-full text-left p-2 hover:bg-slate-50 dark:hover:bg-[#233648] flex items-center gap-2 border-b border-slate-100 dark:border-[#233648] last:border-0"
                                        >
                                            <img src={p.image} className="size-8 object-contain" />
                                            <span className="text-xs font-bold capitalize dark:text-white">{p.name}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Image / Empty State */}
                        <div className="w-full aspect-square bg-slate-100 dark:bg-[#101922] rounded-lg flex items-center justify-center relative overflow-hidden group">
                            {member ? (
                                <>
                                    <div className="absolute inset-0 bg-center bg-no-repeat bg-contain p-4 transition-transform group-hover:scale-110 duration-300" style={{ backgroundImage: `url("${member.image}")` }}></div>
                                    <div className="absolute top-2 right-2 flex flex-col gap-1">
                                        {member.types.map(t => (
                                            <span key={t} className={`type-badge ${TYPES[t].color}`}>{t.substring(0, 3)}</span>
                                        ))}
                                    </div>
                                    <div className="absolute bottom-2 left-2">
                                        <button onClick={() => handleRemove(index)} className="bg-black/50 hover:bg-red-500 text-white p-1 rounded backdrop-blur">
                                            <span className="material-symbols-outlined text-[14px]">close</span>
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="text-slate-400 flex flex-col items-center opacity-50">
                                    <span className="material-symbols-outlined text-4xl mb-2">add_circle</span>
                                    <span className="text-xs font-medium">Empty Slot</span>
                                </div>
                            )}
                        </div>

                        {/* Ability Selector */}
                        {member && member.abilities && member.abilities.length > 0 && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 dark:text-[#92adc9] uppercase tracking-widest">Ability</label>
                                <select
                                    value={member.selectedAbility || ''}
                                    onChange={(e) => handleUpdateAbility(index, e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-[#101922] border border-slate-200 dark:border-[#233648] rounded-lg px-3 py-2 text-xs dark:text-white focus:ring-1 focus:ring-primary outline-none capitalize"
                                >
                                    {member.abilities.map(ability => (
                                        <option key={ability.name} value={ability.name} className="capitalize">
                                            {ability.name.replace(/-/g, ' ')} {ability.is_hidden ? '(HA)' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Defensive Matrix */}
            <section className="bg-white dark:bg-[#1a2632] border border-slate-200 dark:border-[#233648] rounded-xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-200 dark:border-[#233648] bg-slate-50 dark:bg-[#1f2d3d]">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">Defensive Type Matrix</h3>
                    <p className="text-xs text-slate-500 dark:text-[#92adc9] mt-1 uppercase tracking-widest">Team Vulnerabilities & Immunities</p>
                </div>
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full border-collapse text-center zebra-table">
                        <thead>
                            <tr className="bg-slate-100 dark:bg-[#101922] border-b border-slate-200 dark:border-[#233648]">
                                <th className="p-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest sticky left-0 bg-slate-100 dark:bg-[#101922] z-10 border-r border-slate-200 dark:border-[#233648]">Member</th>
                                {TYPE_LIST.map(type => (
                                    <th key={type} className="matrix-header-cell">
                                        {/* Use Sprite if available (Gen 4 Style requested), otherwise fallback to CSS Badge */}
                                        {typeChart && typeChart[type] && typeChart[type].sprite ? (
                                            <div className="mx-auto flex items-center justify-center w-16 h-8">
                                                <img
                                                    src={typeChart[type].sprite}
                                                    alt={type}
                                                    className="w-full h-full object-contain"
                                                    title={type}
                                                />
                                            </div>
                                        ) : (
                                            <div className={`type-icon mx-auto ${TYPES[type].color}`}>{type.substring(0, 2)}</div>
                                        )}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-[#233648]/50">
                            {analysis && analysis.memberCoverages.map(({ member, coverage }, i) => (
                                <tr key={i}>
                                    <td className="p-4 text-left font-bold text-sm sticky left-0 bg-white dark:bg-[#1a2632] z-10 border-r border-slate-200 dark:border-[#233648] capitalize dark:text-slate-200">
                                        <div className="flex items-center gap-2">
                                            <img src={member.image} className="size-6 object-contain sm:hidden" alt={member.name} />
                                            <span className="hidden sm:block">{member.name}</span>
                                        </div>
                                    </td>
                                    {TYPE_LIST.map(type => (
                                        <td key={type}>
                                            {renderDefensiveCell(coverage[type])}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            {!analysis && <tr><td colSpan={19} className="p-8 text-center text-slate-500 italic">Add members to generate matrix.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Offensive Matrix */}
            <section className="bg-white dark:bg-[#1a2632] border border-slate-200 dark:border-[#233648] rounded-xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-200 dark:border-[#233648] bg-slate-50 dark:bg-[#1f2d3d]">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">Offensive Coverage Matrix</h3>
                    <p className="text-xs text-slate-500 dark:text-[#92adc9] mt-1 uppercase tracking-widest">Type-Effectiveness (STAB)</p>
                </div>
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full border-collapse text-center zebra-table">
                        <thead>
                            <tr className="bg-slate-100 dark:bg-[#101922] border-b border-slate-200 dark:border-[#233648]">
                                <th className="p-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest sticky left-0 bg-slate-100 dark:bg-[#101922] z-10 border-r border-slate-200 dark:border-[#233648]">Attacker</th>
                                {TYPE_LIST.map(type => (
                                    <th key={type} className="matrix-header-cell">
                                        {typeChart && typeChart[type] && typeChart[type].sprite ? (
                                            <div className="mx-auto flex items-center justify-center w-16 h-8">
                                                <img
                                                    src={typeChart[type].sprite}
                                                    alt={type}
                                                    className="w-full h-full object-contain"
                                                    title={type}
                                                />
                                            </div>
                                        ) : (
                                            <div className={`type-icon mx-auto ${TYPES[type].color}`}>{type.substring(0, 2)}</div>
                                        )}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-[#233648]/50">
                            {analysis && analysis.memberOffensive.map(({ member, offense }, i) => (
                                <tr key={i}>
                                    <td className="p-4 text-left font-bold text-sm sticky left-0 bg-white dark:bg-[#1a2632] z-10 border-r border-slate-200 dark:border-[#233648] capitalize dark:text-slate-200">
                                        <div className="flex items-center gap-2">
                                            <img src={member.image} className="size-6 object-contain sm:hidden" alt={member.name} />
                                            <span className="hidden sm:block">{member.name}</span>
                                        </div>
                                    </td>
                                    {TYPE_LIST.map(type => (
                                        <td key={type}>
                                            {renderOffensiveCell(offense[type])}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            {!analysis && <tr><td colSpan={19} className="p-8 text-center text-slate-500 italic">Add members to generate matrix.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Dashboard Bottom Section */}
            {analysis && (
                <section className="bg-white dark:bg-[#1a2632] border border-slate-200 dark:border-[#233648] rounded-xl p-8 shadow-sm">
                    <h3 className="text-xl font-bold dark:text-white mb-8 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">analytics</span>
                        Team Health Dashboard
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Liabilities (Weaknesses) */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-[11px] font-bold text-red-500 uppercase tracking-[0.2em]">Team Liabilities (2+ Weaknesses)</p>
                                <span className="text-[10px] text-slate-500 dark:text-[#92adc9] font-medium">Sorted by Vulnerability</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-3">
                                {analysis.typeTotals.filter(t => t.weak >= 2).map(t => (
                                    <div key={t.type} className="bg-red-500/5 border border-red-500/20 p-4 rounded-lg flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {typeChart && typeChart[t.type] && typeChart[t.type].sprite ? (
                                                <div className="flex items-center justify-center w-12 h-6">
                                                    <img src={typeChart[t.type].sprite} alt={t.type} className="w-full h-full object-contain" />
                                                </div>
                                            ) : (
                                                <div className={`type-icon ${TYPES[t.type].color}`}>{t.type.substring(0, 2)}</div>
                                            )}
                                            <div>
                                                <p className="text-sm font-bold text-slate-700 dark:text-white capitalize">{t.type}</p>
                                                <p className="text-[10px] text-slate-400">{t.weak} Members</p>
                                            </div>
                                        </div>
                                        {t.weak >= 3 ? (
                                            <span className="bg-red-600 px-2 py-1 rounded text-[10px] font-black text-white">CRIT</span>
                                        ) : (
                                            <span className="bg-red-900/40 text-red-400 border border-red-400/20 px-2 py-1 rounded text-[10px] font-black uppercase">STD</span>
                                        )}
                                    </div>
                                ))}
                                {analysis.typeTotals.filter(t => t.weak >= 2).length === 0 && (
                                    <p className="text-sm text-slate-400 italic col-span-2">No major shared weaknesses found.</p>
                                )}
                            </div>
                        </div>

                        {/* Resistances */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-[11px] font-bold text-green-500 uppercase tracking-[0.2em]">Team Resistances (2+ Members)</p>
                                <span className="text-[10px] text-slate-500 dark:text-[#92adc9] font-medium">Core Defensive Coverage</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-3">
                                {analysis.typeTotals.filter(t => (t.resist + t.immune) >= 2).map(t => (
                                    <div key={t.type} className="bg-green-500/5 border border-green-500/20 p-4 rounded-lg flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {typeChart && typeChart[t.type] && typeChart[t.type].sprite ? (
                                                <div className="flex items-center justify-center w-12 h-6">
                                                    <img src={typeChart[t.type].sprite} alt={t.type} className="w-full h-full object-contain" />
                                                </div>
                                            ) : (
                                                <div className={`type-icon ${TYPES[t.type].color}`}>{t.type.substring(0, 2)}</div>
                                            )}
                                            <div>
                                                <p className="text-sm font-bold text-slate-700 dark:text-white capitalize">{t.type}</p>
                                                <p className="text-[10px] text-slate-400">{t.resist + t.immune} Resists</p>
                                            </div>
                                        </div>
                                        <span className="text-green-500 font-black text-xs">x{t.resist + t.immune}</span>
                                    </div>
                                ))}
                                {analysis.typeTotals.filter(t => (t.resist + t.immune) >= 2).length === 0 && (
                                    <p className="text-sm text-slate-400 italic col-span-2">No major shared resistances.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
};

export default TeamBuilder;
