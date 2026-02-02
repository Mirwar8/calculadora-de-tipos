
import { calculateCoverage, groupCoverageByMultiplier } from '../utils/pokemonTypes';
import TypeBadge from './TypeBadge';

const EffectivenessSection = ({ title, multiplier, types, bgColor, borderColor, textColor, badgeColor }) => {
    const isExtreme = multiplier === 4;
    const isHigh = multiplier === 2;
    const isImmunity = multiplier === 0;
    const isBulky = multiplier === 0.25;
    const isResistant = multiplier === 0.5;

    let badgeText = "";
    if (isExtreme) badgeText = "EXTREME";
    else if (isHigh) badgeText = "HIGH";
    else if (isImmunity) badgeText = "NONE";
    else if (isBulky) badgeText = "BULKY";
    else if (isResistant) badgeText = "RESISTANT";

    if (types.length === 0) {
        return (
            <div className={`${bgColor} border ${borderColor} rounded-3xl p-6 flex flex-col gap-4`}>
                <div className="flex items-center justify-between">
                    <h3 className={`${textColor} font-black text-lg`}>{title}</h3>
                    {badgeText && <span className={`${badgeColor} text-white text-[10px] px-2 py-0.5 rounded-full font-bold`}>{badgeText}</span>}
                </div>
                <p className="text-slate-400 text-sm italic">No types found.</p>
            </div>
        )
    }

    return (
        <div className={`${bgColor} border ${borderColor} rounded-3xl p-6 flex flex-col gap-4 ${types.length > 8 ? 'xl:col-span-2' : ''}`}>
            <div className="flex items-center justify-between">
                <h3 className={`${textColor} font-black text-lg`}>{title}</h3>
                {badgeText && <span className={`${badgeColor} text-white text-[10px] px-2 py-0.5 rounded-full font-bold`}>{badgeText}</span>}
            </div>
            <div className="flex flex-wrap gap-2">
                {types.map(type => (
                    <TypeBadge key={type} type={type} />
                ))}
            </div>
        </div>
    );
};

const EffectivenessReport = ({ type1, type2, typeChart }) => {
    const coverage = calculateCoverage(type1, type2, typeChart);
    const groups = groupCoverageByMultiplier(coverage);

    const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-black dark:text-white">
                Effectiveness Report: {capitalize(type1)} {type2 !== "none" && `/ ${capitalize(type2)}`}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

                {/* 4x Weakness */}
                <EffectivenessSection
                    title="4x Weakness"
                    multiplier={4}
                    types={groups[4]}
                    bgColor="bg-red-500/5"
                    borderColor="border-red-500/20"
                    textColor="text-red-500"
                    badgeColor="bg-red-500"
                />

                {/* 2x Weakness */}
                <EffectivenessSection
                    title="2x Weakness"
                    multiplier={2}
                    types={groups[2]}
                    bgColor="bg-orange-500/5"
                    borderColor="border-orange-500/20"
                    textColor="text-orange-500"
                    badgeColor="bg-orange-500"
                />

                {/* Immunity */}
                <EffectivenessSection
                    title="Immunity (0x)"
                    multiplier={0}
                    types={groups[0]}
                    bgColor="bg-slate-500/5"
                    borderColor="border-slate-500/20"
                    textColor="text-slate-500 dark:text-slate-300"
                    badgeColor="bg-slate-500"
                />

                {/* 0.25x Resistance */}
                <EffectivenessSection
                    title="0.25x Resistance"
                    multiplier={0.25}
                    types={groups[0.25]}
                    bgColor="bg-emerald-500/10"
                    borderColor="border-emerald-500/20"
                    textColor="text-emerald-500"
                    badgeColor="bg-emerald-500"
                />

                {/* 0.5x Resistance */}
                <EffectivenessSection
                    title="0.5x Resistance"
                    multiplier={0.5}
                    types={groups[0.5]}
                    bgColor="bg-green-500/5"
                    borderColor="border-green-500/20"
                    textColor="text-green-500"
                    badgeColor="bg-green-500"
                />

            </div>
        </div>
    );
};

export default EffectivenessReport;
