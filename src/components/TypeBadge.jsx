import { TYPES } from '../utils/pokemonTypes';

const TypeBadge = ({ type }) => {
    const typeData = TYPES[type];
    if (!typeData) return null;

    const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

    return (
        <div className={`px-4 py-1.5 rounded-full ${typeData.color} text-white text-xs font-bold flex items-center gap-2 type-badge hover:scale-105 transition-transform duration-200 cursor-default`}>
            <span className="material-symbols-outlined text-[14px]">
                {typeData.icon}
            </span>
            {capitalize(type)}
        </div>
    );
};

export default TypeBadge;
