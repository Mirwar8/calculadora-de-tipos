
import TypeBadge from './TypeBadge';

const OffensiveCoverage = ({ type1, type2, typeChart }) => {
    // If data isn't loaded yet, return null or a loader (handled by parent usually)
    if (!typeChart || !typeChart[type1]) return null;

    const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

    // Get strengths for Type 1
    const strengths1 = typeChart[type1]?.strengths || [];

    // Get strengths for Type 2 (if exists)
    const strengths2 = (type2 && type2 !== 'none' && typeChart[type2])
        ? typeChart[type2].strengths || []
        : [];

    // Calculate unique combined coverage
    const uniqueCoverage = [...new Set([...strengths1, ...strengths2])];

    const renderTypeCard = (type, strengths) => (
        <div className={`bg-white dark:bg-[#1a2632] border border-slate-200 dark:border-[#233648] rounded-3xl p-6 flex flex-col gap-6 h-full ${typeChart[type]?.color.replace('bg-', 'border-').replace('text-', 'border-').split(' ')[0]}/20`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`size-10 rounded-2xl ${typeChart[type]?.color} flex items-center justify-center text-white`}>
                        <span className="material-symbols-outlined">{typeChart[type]?.icon}</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg leading-none dark:text-white">{capitalize(type)} Type</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 uppercase font-bold tracking-tighter">Strong Against (x2)</p>
                    </div>
                </div>
                <span className={`${typeChart[type]?.color.replace('bg-', 'text-')} bg-slate-100 dark:bg-[#233648] text-[10px] px-2 py-0.5 rounded-full font-bold border border-current opacity-75`}>STAB</span>
            </div>

            {strengths.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                    {strengths.map(t => (
                        <TypeBadge key={t} type={t} />
                    ))}
                </div>
            ) : (
                <p className="text-sm text-slate-400 italic">No super effective targets.</p>
            )}
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black dark:text-white">Offensive Coverage</h2>
                <div className="h-px flex-1 bg-slate-200 dark:bg-[#233648]"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Type 1 Card */}
                {renderTypeCard(type1, strengths1)}

                {/* Type 2 Card (only if exists) */}
                {type2 && type2 !== 'none' && renderTypeCard(type2, strengths2)}
            </div>

            {/* Combined Summary */}
            <div className="bg-white dark:bg-[#1a2632] border border-slate-200 dark:border-[#233648] rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <span className="material-symbols-outlined text-green-500">check_circle</span>
                    <h3 className="font-bold text-lg dark:text-white">Combined Offensive Summary</h3>
                </div>

                {uniqueCoverage.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                        {uniqueCoverage.map(t => (
                            <div key={t} className={`px-5 py-2.5 rounded-full bg-slate-100 dark:bg-[#233648] text-slate-700 dark:text-slate-300 text-sm font-bold flex items-center gap-3 border border-slate-200 dark:border-slate-700`}>
                                <div className={`size-2 rounded-full ${typeChart[t]?.color}`}></div>
                                {capitalize(t)}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-slate-400 italic">No types covered.</p>
                )}

                <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
                    This combination provides super-effective coverage against <span className="text-primary font-bold">{uniqueCoverage.length}</span> distinct types using STAB (Same Type Attack Bonus) moves.
                </p>
            </div>
        </div>
    );
};

export default OffensiveCoverage;
