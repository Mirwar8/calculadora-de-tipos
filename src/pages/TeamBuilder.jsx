
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
        <div className="mx-auto pb-20 px-3 sm:px-6 md:px-8 space-y-6 sm:space-y-10" style={{ maxWidth: 'clamp(100vw, 95vw, 1920px)' }}>
            {/* Header Section */}
            <div className="flex flex-wrap items-center justify-between space-fluid-4">
                <div>
                    <h2 className="text-fluid-2xl font-bold dark:text-white">Team Composition</h2>
                    <p className="text-slate-500 dark:text-[#92adc9] text-fluid-sm">Gen 9 Analysis</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={resetTeam} className="bg-slate-200 dark:bg-[#233648] text-slate-700 dark:text-white px-4 py-2 rounded-lg font-bold text-fluid-sm hover:bg-red-100 hover:text-red-500 transition-colors touch-target">
                        Reset Team
                    </button>
                </div>
            </div>

            {/* Slots Grid */}
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-3 sm:gap-4 overflow-safe">
                {team.map((member, index) => (
                    <div key={index} className={`bg-white dark:bg-[#1a2632] border ${member ? 'border-slate-200 dark:border-[#233648]' : 'border-dashed border-2 dark:border-[#233648]'} p-4 rounded-xl flex flex-col space-fluid-4 relative transition-all flex-zoom-safe`}>
                        {/* Search Input */}
                        <div className="relative z-20">
                            <input
                                className="w-full bg-slate-50 dark:bg-[#101922] border border-slate-200 dark:border-[#233648] rounded-lg px-3 py-2 text-fluid-sm dark:text-white focus:ring-1 focus:ring-primary outline-none"
                                placeholder={member ? member.name : "Add Pokémon..."}
                                value={queries[index]}
                                onChange={(e) => handleInputChange(index, e.target.value)}
                                onFocus={() => setActiveSearchSlot(index)}
                                onBlur={handleBlur}
                            />
                            {/* Autocomplete */}
                            {activeSearchSlot === index && searchResults.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1a2632] rounded-lg border border-slate-200 dark:border-[#233648] shadow-xl max-h-48 overflow-y-auto z-50 custom-scrollbar" style={{ maxWidth: 'min(300px, calc(100vw - 2rem))' }}>
                                    {searchResults.map(p => (
                                        <button
                                            key={p.id}
                                            onMouseDown={() => selectPokemon(index, p)}
                                            className="w-full text-left p-2 hover:bg-slate-50 dark:hover:bg-[#233648] flex items-center space-fluid-2 border-b border-slate-100 dark:border-[#233648] last:border-0 touch-target"
                                        >
                                            <img src={p.image} className="size-8 object-contain aspect-sprite" />
                                            <span className="text-fluid-xs font-bold capitalize dark:text-white">{p.name}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Image / Empty State */}
                        <div className="w-full aspect-pokemon bg-slate-100 dark:bg-[#101922] rounded-lg flex items-center justify-center relative overflow-hidden group">
                            {member ? (
                                <>
                                    <div className="absolute inset-0 bg-center bg-no-repeat bg-contain p-4 transition-transform group-hover:scale-110 duration-300" style={{ backgroundImage: `url("${member.image}")` }}></div>
                                    <div className="absolute bottom-2 left-2">
                                        <button onClick={() => handleRemove(index)} className="bg-black/50 hover:bg-red-500 text-white p-1 rounded backdrop-blur touch-target">
                                            <span className="material-symbols-outlined text-fluid-sm">close</span>
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="text-slate-400 flex flex-col items-center opacity-50">
                                    <span className="material-symbols-outlined text-fluid-4xl mb-2">add_circle</span>
                                    <span className="text-fluid-xs font-medium">Empty Slot</span>
                                </div>
                            )}
                        </div>

                        {/* Type Icons below image */}
                        {member && (
                            <div className="flex items-center justify-center gap-2 py-1">
                                {member.types.map(t => (
                                    <div key={t} className="relative group/type">
                                        {typeChart && typeChart[t] && typeChart[t].sprite ? (
                                            <img
                                                src={typeChart[t].sprite}
                                                alt={t}
                                                className="h-5 sm:h-6 object-contain drop-shadow-sm brightness-110"
                                                title={t}
                                            />
                                        ) : (
                                            <span className={`type-badge ${TYPES[t]?.color || 'bg-slate-400'}`}>{t.substring(0, 3)}</span>
                                        )}
                                        <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover/type:opacity-100 transition-opacity pointer-events-none capitalize whitespace-nowrap z-30">
                                            {t}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Ability Selector */}
                        {member && member.abilities && member.abilities.length > 0 && (
                            <div className="space-y-2">
                                <label className="text-fluid-xs font-bold text-slate-500 dark:text-[#92adc9] uppercase tracking-widest">Ability</label>
                                <select
                                    value={member.selectedAbility || ''}
                                    onChange={(e) => handleUpdateAbility(index, e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-[#101922] border border-slate-200 dark:border-[#233648] rounded-lg px-3 py-2 text-fluid-xs dark:text-white focus:ring-1 focus:ring-primary outline-none capitalize"
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
            <section className="bg-white dark:bg-[#1a2632] border border-slate-200 dark:border-[#233648] rounded-xl overflow-hidden shadow-sm overflow-safe">
                <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-[#233648] bg-slate-50 dark:bg-[#1f2d3d]">
                    <h3 className="text-fluid-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">Defensive Type Matrix</h3>
                    <p className="text-fluid-xs text-slate-500 dark:text-[#92adc9] mt-1 uppercase tracking-widest">Team Vulnerabilities & Immunities</p>
                </div>
                <div className="w-full overflow-x-auto custom-scrollbar">
                    <table className="w-full border-collapse text-center zebra-table">
                        <thead>
                            <tr className="bg-slate-100 dark:bg-[#101922] border-b border-slate-200 dark:border-[#233648]">
                                <th className="p-2 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider sticky left-0 bg-slate-100 dark:bg-[#101922] z-10 border-r border-slate-200 dark:border-[#233648]">Member</th>
                                {TYPE_LIST.map(type => (
                                    <th key={type} className="matrix-header-cell">
                                        {/* Use Sprite if available (Gen 4 Style requested), otherwise fallback to CSS Badge */}
                                        {typeChart && typeChart[type] && typeChart[type].sprite ? (
                                            <div className="mx-auto flex items-center justify-center w-12 h-6">
                                                <img
                                                    src={typeChart[type].sprite}
                                                    alt={type}
                                                    className="w-full h-full object-contain"
                                                    title={type}
                                                />
                                            </div>
                                        ) : (
                                            <div className={`type-icon mx-auto ${TYPES[type].color} text-[8px]`}>{type.substring(0, 2)}</div>
                                        )}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-[#233648]/50">
                            {analysis && analysis.memberCoverages.map(({ member, coverage }, i) => (
                                <tr key={i}>
                                    <td className="p-2 text-left font-bold text-xs sticky left-0 bg-white dark:bg-[#1a2632] z-10 border-r border-slate-200 dark:border-[#233648] capitalize dark:text-slate-200">
                                        <div className="flex items-center space-fluid-2">
                                            <img src={member.image} className="size-6 object-contain aspect-sprite sm:hidden" alt={member.name} />
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
            <section className="bg-white dark:bg-[#1a2632] border border-slate-200 dark:border-[#233648] rounded-xl overflow-hidden shadow-sm overflow-safe">
                <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-[#233648] bg-slate-50 dark:bg-[#1f2d3d]">
                    <h3 className="text-fluid-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">Offensive Coverage Matrix</h3>
                    <p className="text-fluid-xs text-slate-500 dark:text-[#92adc9] mt-1 uppercase tracking-widest">Type-Effectiveness (STAB)</p>
                </div>
                <div className="w-full overflow-x-auto custom-scrollbar">
                    <table className="w-full border-collapse text-center zebra-table">
                        <thead>
                            <tr className="bg-slate-100 dark:bg-[#101922] border-b border-slate-200 dark:border-[#233648]">
                                <th className="p-2 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider sticky left-0 bg-slate-100 dark:bg-[#101922] z-10 border-r border-slate-200 dark:border-[#233648]">Attacker</th>
                                {TYPE_LIST.map(type => (
                                    <th key={type} className="matrix-header-cell">
                                        {typeChart && typeChart[type] && typeChart[type].sprite ? (
                                            <div className="mx-auto flex items-center justify-center w-12 h-6">
                                                <img
                                                    src={typeChart[type].sprite}
                                                    alt={type}
                                                    className="w-full h-full object-contain"
                                                    title={type}
                                                />
                                            </div>
                                        ) : (
                                            <div className={`type-icon mx-auto ${TYPES[type].color} text-[8px]`}>{type.substring(0, 2)}</div>
                                        )}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-[#233648]/50">
                            {analysis && analysis.memberOffensive.map(({ member, offense }, i) => (
                                <tr key={i}>
                                    <td className="p-2 text-left font-bold text-xs sticky left-0 bg-white dark:bg-[#1a2632] z-10 border-r border-slate-200 dark:border-[#233648] capitalize dark:text-slate-200">
                                        <div className="flex items-center space-fluid-2">
                                            <img src={member.image} className="size-6 object-contain aspect-sprite sm:hidden" alt={member.name} />
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
                <section className="bg-white dark:bg-[#1a2632] border border-slate-200 dark:border-[#233648] rounded-xl p-6 sm:p-8 shadow-sm overflow-safe">
                    <h3 className="text-fluid-xl font-bold dark:text-white mb-8 flex items-center space-fluid-2">
                        <span className="material-symbols-outlined text-primary">analytics</span>
                        Team Health Dashboard
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        {/* Liabilities (Weaknesses) */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-fluid-xs font-bold text-red-500 uppercase tracking-[0.2em]">Team Liabilities (2+ Weaknesses)</p>
                                <span className="text-fluid-xs text-slate-500 dark:text-[#92adc9] font-medium">Sorted by Vulnerability</span>
                            </div>
                            <div className="grid grid-cols-[repeat(auto-fill,minmax(max(200px,100%),1fr))] sm:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
                                {analysis.typeTotals.filter(t => t.weak >= 2).map(t => (
                                    <div key={t.type} className="group relative bg-white dark:bg-slate-800/40 border border-red-500/20 dark:border-red-500/10 p-4 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md hover:border-red-500/40 transition-all duration-300 overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <div className="flex items-center space-fluid-3 relative z-10">
                                            {typeChart && typeChart[t.type] && typeChart[t.type].sprite ? (
                                                <div className="flex items-center justify-center w-14 h-7 filter drop-shadow-sm">
                                                    <img src={typeChart[t.type].sprite} alt={t.type} className="w-full h-full object-contain" />
                                                </div>
                                            ) : (
                                                <div className={`type-icon shadow-sm ${TYPES[t.type].color}`}>{t.type.substring(0, 2)}</div>
                                            )}
                                            <div className="ml-1">
                                                <p className="text-fluid-sm font-black text-slate-800 dark:text-white capitalize leading-none mb-1">{t.type}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{t.weak} Vulnerable</p>
                                            </div>
                                        </div>
                                        <div className="relative z-10">
                                            {t.weak >= 3 ? (
                                                <span className="bg-red-600 px-2.5 py-1 rounded-full text-[10px] font-black text-white shadow-sm ring-2 ring-red-500/20">CRIT</span>
                                            ) : (
                                                <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-full text-[10px] font-black uppercase">STD</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {analysis.typeTotals.filter(t => t.weak >= 2).length === 0 && (
                                    <div className="col-span-full border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl p-8 text-center">
                                        <p className="text-sm text-slate-400 font-medium italic">No major shared weaknesses found. Team coverage is balanced.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Resistances */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-fluid-xs font-bold text-green-500 uppercase tracking-[0.2em]">Team Resistances (2+ Members)</p>
                                <span className="text-fluid-xs text-slate-500 dark:text-[#92adc9] font-medium">Core Defensive Coverage</span>
                            </div>
                            <div className="grid grid-cols-[repeat(auto-fill,minmax(max(200px,100%),1fr))] sm:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
                                {analysis.typeTotals.filter(t => (t.resist + t.immune) >= 2).map(t => (
                                    <div key={t.type} className="group relative bg-white dark:bg-slate-800/40 border border-green-500/20 dark:border-green-500/10 p-4 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md hover:border-green-500/40 transition-all duration-300 overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <div className="flex items-center space-fluid-3 relative z-10">
                                            {typeChart && typeChart[t.type] && typeChart[t.type].sprite ? (
                                                <div className="flex items-center justify-center w-14 h-7 filter drop-shadow-sm">
                                                    <img src={typeChart[t.type].sprite} alt={t.type} className="w-full h-full object-contain" />
                                                </div>
                                            ) : (
                                                <div className={`type-icon shadow-sm ${TYPES[t.type].color}`}>{t.type.substring(0, 2)}</div>
                                            )}
                                            <div className="ml-1">
                                                <p className="text-fluid-sm font-black text-slate-800 dark:text-white capitalize leading-none mb-1">{t.type}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{t.resist + t.immune} Resistors</p>
                                            </div>
                                        </div>
                                        <div className="relative z-10">
                                            <span className="text-green-600 dark:text-green-400 font-black text-base drop-shadow-sm">x{t.resist + t.immune}</span>
                                        </div>
                                    </div>
                                ))}
                                {analysis.typeTotals.filter(t => (t.resist + t.immune) >= 2).length === 0 && (
                                    <div className="col-span-full border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl p-8 text-center">
                                        <p className="text-sm text-slate-400 font-medium italic">No major shared resistances found.</p>
                                    </div>
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
