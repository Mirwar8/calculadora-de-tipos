import basestatsData from './basestats.json';

export const getBaseStats = () => {
    return {
        discipline: basestatsData.discipline,
        resilience: basestatsData.resilience,
        intellect: basestatsData.intellect,
        strength: basestatsData.strength,
        mobility: basestatsData.mobility
    };
};

export const getBaseStat = (statName) => {
    const stats = getBaseStats();
    return stats[statName.toLowerCase()] || 0;
};

export default {
    getBaseStats,
    getBaseStat
};