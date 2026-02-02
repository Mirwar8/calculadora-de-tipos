import { useState, useEffect } from 'react';

const STORAGE_KEY = 'pokemon_team_builder';

export const useTeam = () => {
    // Initialize from local storage or empty array
    const [team, setTeam] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : Array(6).fill(null);
        } catch (e) {
            console.error("Failed to load team", e);
            return Array(6).fill(null);
        }
    });

    // Save whenever team changes
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(team));
    }, [team]);

    const addToTeam = (pokemon) => {
        const firstEmptyIndex = team.findIndex(s => s === null);
        if (firstEmptyIndex !== -1) {
            const newTeam = [...team];
            // Default ability: First one (usually not hidden, or just the first)
            const defaultAbility = pokemon.abilities.length > 0 ? pokemon.abilities[0].name : null;
            
            newTeam[firstEmptyIndex] = {
                ...pokemon,
                selectedAbility: defaultAbility
            };
            setTeam(newTeam);
            return true;
        } else {
            return false; // Team is full
        }
    };

    const updateMember = (index, updates) => {
        const newTeam = [...team];
        if (newTeam[index]) {
            newTeam[index] = { ...newTeam[index], ...updates };
            setTeam(newTeam);
        }
    };

    const removeFromTeam = (index) => {
        const newTeam = [...team];
        newTeam[index] = null;
        setTeam(newTeam);
    };
    
    const resetTeam = () => {
        setTeam(Array(6).fill(null));
    };
    
    // Feature: Select specific slot (replace or add)
    const setSlot = (index, pokemon) => {
         const newTeam = [...team];
         const defaultAbility = pokemon.abilities.length > 0 ? pokemon.abilities[0].name : null;
         newTeam[index] = { ...pokemon, selectedAbility: defaultAbility };
         setTeam(newTeam);
    };

    return {
        team,
        addToTeam,
        removeFromTeam,
        updateMember,
        resetTeam,
        setSlot
    };
};
