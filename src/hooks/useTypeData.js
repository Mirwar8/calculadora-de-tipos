
import { useState, useEffect } from 'react';
import { fetchTypes } from '../services/pokeapi';
import { TYPES } from '../utils/pokemonTypes';

export const useTypeData = () => {
    const [typeChart, setTypeChart] = useState(TYPES); // Initialize with static fallback
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadTypes = async () => {
            const apiTypes = await fetchTypes();
            if (apiTypes) {
                // Merge API data (weaknesses/resistances) with Static UI data (colors/icons)
                const mergedResults = { ...TYPES };
                
                Object.keys(apiTypes).forEach(type => {
                    if (mergedResults[type]) {
                        mergedResults[type] = {
                            ...mergedResults[type],
                            ...apiTypes[type] // Overwrite interactions with API data
                        };
                    }
                });
                
                setTypeChart(mergedResults);
            }
            setLoading(false);
        };

        loadTypes();
    }, []);

    return { typeChart, loading };
};
