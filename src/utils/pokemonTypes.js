
// UI Configuration and initial state.
// Interaction data (weaknesses, resistances, immunities) is fetched from PokeAPI.
export const TYPES = {
  normal: {
    weaknesses: [],
    resistances: [],
    immunities: [],
    color: "bg-type-normal",
    icon: "circle"
  },
  fire: {
    weaknesses: [],
    resistances: [],
    immunities: [],
    color: "bg-type-fire",
    icon: "local_fire_department"
  },
  water: {
    weaknesses: [],
    resistances: [],
    immunities: [],
    color: "bg-type-water",
    icon: "water_drop"
  },
  grass: {
    weaknesses: [],
    resistances: [],
    immunities: [],
    color: "bg-type-grass",
    icon: "grass"
  },
  electric: {
    weaknesses: [],
    resistances: [],
    immunities: [],
    color: "bg-type-electric",
    icon: "bolt"
  },
  ice: {
    weaknesses: [],
    resistances: [],
    immunities: [],
    color: "bg-type-ice",
    icon: "ac_unit"
  },
  fighting: {
    weaknesses: [],
    resistances: [],
    immunities: [],
    color: "bg-type-fighting",
    icon: "sports_kabaddi"
  },
  poison: {
    weaknesses: [],
    resistances: [],
    immunities: [],
    color: "bg-type-poison",
    icon: "skull"
  },
  ground: {
    weaknesses: [],
    resistances: [],
    immunities: [],
    color: "bg-type-ground",
    icon: "landscape"
  },
  flying: {
    weaknesses: [],
    resistances: [],
    immunities: [],
    color: "bg-type-flying",
    icon: "air"
  },
  psychic: {
    weaknesses: [],
    resistances: [],
    immunities: [],
    color: "bg-type-psychic",
    icon: "auto_fix_high"
  },
  bug: {
    weaknesses: [],
    resistances: [],
    immunities: [],
    color: "bg-type-bug",
    icon: "pest_control"
  },
  rock: {
    weaknesses: [],
    resistances: [],
    immunities: [],
    color: "bg-type-rock",
    icon: "mountain_flag"
  },
  ghost: {
    weaknesses: [],
    resistances: [],
    immunities: [],
    color: "bg-type-ghost",
    icon: "psychology"
  },
  dragon: {
    weaknesses: [],
    resistances: [],
    immunities: [],
    color: "bg-type-dragon",
    icon: "rebase_edit"
  },
  dark: {
    weaknesses: [],
    resistances: [],
    immunities: [],
    color: "bg-type-dark",
    icon: "dark_mode"
  },
  steel: {
    weaknesses: [],
    resistances: [],
    immunities: [],
    color: "bg-type-steel",
    icon: "precision_manufacturing"
  },
  fairy: {
    weaknesses: [],
    resistances: [],
    immunities: [],
    color: "bg-type-fairy",
    icon: "star"
  }
};

export const TYPE_LIST = Object.keys(TYPES);

const getMultiplier = (attackingType, defendingType, typeChart) => {
  if (!defendingType || defendingType === "none") return 1;
  
  const typeData = typeChart[defendingType];
  if (!typeData) return 1;

  if (typeData.immunities.includes(attackingType)) return 0;
  if (typeData.weaknesses.includes(attackingType)) return 2;
  if (typeData.resistances.includes(attackingType)) return 0.5;
  
  return 1;
};

// Ability overrides map
// value: 0 (immunity), 0.5 (resistance), etc.
export const ABILITY_OVERRIDES = {
  // Immunities
  "levitate": { "ground": 0 },
  "water-absorb": { "water": 0 },
  "volt-absorb": { "electric": 0 },
  "flash-fire": { "fire": 0 },
  "sap-sipper": { "grass": 0 },
  "lightning-rod": { "electric": 0 },
  "motor-drive": { "electric": 0 },
  "storm-drain": { "water": 0 },
  "dry-skin": { "water": 0 }, // Weakness to fire handled elsewhere if needed, but immunity is key
  "earth-eater": { "ground": 0 },
  
  // Resistances / Reductions
  "thick-fat": { "fire": 0.5, "ice": 0.5 },
  "heatproof": { "fire": 0.5 },
  "water-bubble": { "fire": 0.5 },
  "purifying-salt": { "ghost": 0.5 },
};

export const getMultiplierWithAbility = (attackingType, defendingType, abilityName, typeChart) => {
    let multiplier = getMultiplier(attackingType, defendingType, typeChart);
    
    if (abilityName && ABILITY_OVERRIDES[abilityName]) {
        const override = ABILITY_OVERRIDES[abilityName][attackingType];
        if (override !== undefined) {
             // If override is 0, it's an immunity, so it overrides everything.
             // If it's a resistance (0.5), it should multiply? 
             // Standard abilities like Thick Fat ACTUALLY halve the damage.
             // Levitate makes it 0.
             if (override === 0) return 0;
             multiplier *= override;
        }
    }
    return multiplier;
};

export const calculateCoverage = (type1, type2, typeChart = TYPES, abilityName = null) => {
  const coverage = {};
  
  TYPE_LIST.forEach((attackingType) => {
    let multiplier = getMultiplierWithAbility(attackingType, type1, abilityName, typeChart);
    
    if (type2 && type2 !== "none" && type1 !== type2) {
      multiplier *= getMultiplierWithAbility(attackingType, type2, abilityName, typeChart);
    }
    
    // Some abilities apply AFTER both types (e.g. Levitate makes the whole mon immune)
    // My getMultiplierWithAbility handles it per type, which might be slightly wrong if 
    // Levitate is checked against Type1 then Type2.
    // Actually, Levitate gives immunity to Ground MOVES. So the final multiplier is 0.
    // If we apply it per type, 0 * anything = 0. So it works.
    // What about Thick Fat? It halves Fire/Ice.
    // Fire vs Grass/Ice (4x). Thick Fat -> 0.5 * 4 = 2x. Correct.
    
    // One edge case: Wonder Guard, but let's skip complex ones for now.
    
    coverage[attackingType] = multiplier;
  });
  
  return coverage;
};

export const groupCoverageByMultiplier = (coverage) => {
  const groups = {
    4: [],
    2: [],
    1: [],
    0.5: [],
    0.25: [],
    0: []
  };
  
  Object.entries(coverage).forEach(([type, multiplier]) => {
    if (groups[multiplier]) {
      groups[multiplier].push(type);
    }
  });
  
  return groups;
};

// Calculate Offensive Coverage (STAB types attacking all other types)
// Returns object with type -> maxMultiplier (e.g. { grass: 2, fire: 0.5, ... })
// We check if Type1 OR Type2 hits the defending type super effectively.
export const calculateOffensiveCoverage = (type1, type2, typeChart = TYPES) => {
    const coverage = {};
    
    // We want to know: "How hard does this pokemon hit [DefendingType]?"
    // Iterate over ALL types as Defending Types
    TYPE_LIST.forEach(defendingType => {
        let m1 = getMultiplier(type1, defendingType, typeChart);
        let m2 = 0;
        
        if (type2 && type2 !== 'none') {
            m2 = getMultiplier(type2, defendingType, typeChart);
        }

        // Custom Logic requested by User: 
        // If BOTH types are super effective (>= 2), show as x4 (Double STAB coverage).
        // Otherwise take the max.
        if (m1 >= 2 && m2 >= 2) {
            coverage[defendingType] = 4;
        } else {
            coverage[defendingType] = Math.max(m1, m2);
        }
    });
    
    return coverage;
};
