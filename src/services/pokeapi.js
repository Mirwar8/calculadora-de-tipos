
const BASE_URL = 'https://pokeapi.co/api/v2';

// Cache for types to avoid redundant calls
let typeCache = null;

export const fetchTypes = async () => {
  if (typeCache) return typeCache;

  try {
    const listResponse = await fetch(`${BASE_URL}/type`);
    const listData = await listResponse.json();
    
    const typePromises = listData.results.map(async (type) => {
      // Filter out special types like 'stellar', 'unknown', 'shadow' if wanted, 
      // but strictly mainly we want the 18 main ones.
      // Gen 9 has 18 base types.
      const detailResponse = await fetch(type.url);
      return detailResponse.json();
    });

    const typesDetails = await Promise.all(typePromises);
    
    const formattedTypes = {};

    typesDetails.forEach((t) => {
       // Skip unknown or shadow for standard calculator usage if desired, 
       // but typically standard types are what we need.
       if (t.name === 'unknown' || t.name === 'shadow') return;

       // Extract sprite (Gen 6 X-Y preference)
       // Fairy type was introduced in Gen 6, so it should have an X-Y sprite.
       let spriteUrl = null;
       if (t.sprites) {
           if (t.sprites['generation-vi'] && t.sprites['generation-vi']['x-y']) {
               spriteUrl = t.sprites['generation-vi']['x-y']['name_icon'];
           }
           // Fallback for types missing in Gen 6 (if any)
           if (!spriteUrl && t.sprites['generation-viii'] && t.sprites['generation-viii']['sword-shield']) {
                spriteUrl = t.sprites['generation-viii']['sword-shield']['name_icon'];
           }
       }

       formattedTypes[t.name] = {
         weaknesses: t.damage_relations.double_damage_from.map(x => x.name),
         resistances: t.damage_relations.half_damage_from.map(x => x.name),
         immunities: t.damage_relations.no_damage_from.map(x => x.name),
         strengths: t.damage_relations.double_damage_to.map(x => x.name),
         sprite: spriteUrl
       };
    });

    typeCache = formattedTypes;
    return formattedTypes;
  } catch (error) {
    console.error("Error fetching types:", error);
    return null;
  }
};

export const fetchPokemonList = async (limit = 20, offset = 0) => {
  try {
    const response = await fetch(`${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching pokemon list:", error);
    return null;
  }
};

export const fetchPokemonDetails = async (url) => {
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    // Normalize data for UI
    return {
      id: data.id,
      name: data.name,
      types: data.types.map(t => t.type.name),
      abilities: data.abilities.map(a => ({ name: a.ability.name, is_hidden: a.is_hidden })),
      // Prefer Official Artwork -> Home -> Default
      image: data.sprites.other['official-artwork'].front_default || data.sprites.other['home'].front_default || data.sprites.front_default,
      // Female sprite (Artwork doesn't usually have it, Home does)
      femaleImage: data.sprites.other['home'].front_female || data.sprites.front_female
    };
  } catch (error) {
    console.error("Error fetching pokemon details:", error);
    return null;
  }
};

export const fetchPokemonSpecies = async (idOrName) => {
  if (!idOrName) return null;
  try {
    const response = await fetch(`${BASE_URL}/pokemon-species/${idOrName}`);
    if (!response.ok) {
        console.warn(`Pokemon species ${idOrName} not found (Status: ${response.status})`);
        return null;
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching pokemon species:", error);
    return null;
  }
};

export const fetchPokemonFullDetails = async (idOrName) => {
  if (!idOrName) return null;
  try {
    const pokemonResponse = await fetch(`${BASE_URL}/pokemon/${idOrName}`);
    
    if (!pokemonResponse.ok) {
        console.error(`Pokemon ${idOrName} not found in primary database.`);
        return null;
    }

    const pokemon = await pokemonResponse.json();
    
    // Species data is optional but highly recommended. 
    // We don't want to crash if species fails but pokemon succeeds.
    let species = null;
    try {
        species = await fetchPokemonSpecies(idOrName);
    } catch (e) {
        console.warn(`Species data fetch failed for ${idOrName}, continuing with partial data.`);
    }

    return {
      ...pokemon,
      speciesData: species
    };
  } catch (error) {
    console.error("Critical error in fetchPokemonFullDetails:", error);
    return null;
  }
};


export const searchPokemon = async (query) => {
    // 1. Try searching by Species first to get all varieties (gender differences, forms)
    const lowerQuery = query.toLowerCase();
    try {
        const response = await fetch(`${BASE_URL}/pokemon-species/${lowerQuery}`);
        
        if (response.ok) {
            const speciesData = await response.json();
            // Fetch details for ALL varieties
            const varietiesPromises = speciesData.varieties.map(v => fetchPokemonDetails(v.pokemon.url));
            const varietiesDetails = await Promise.all(varietiesPromises);
            return varietiesDetails; // Returns ARRAY of pokemon details
        }
    } catch (e) {
        // Fallback or continue if 404
        console.log(`Species search failed for ${lowerQuery}, trying direct pokemon lookup.`);
    }

    // 2. Fallback: Direct lookup (e.g. if user typed a specific form name or ID)
    try {
        const response = await fetch(`${BASE_URL}/pokemon/${lowerQuery}`);
        if (!response.ok) return null;
        
        // Use existing detail logic but wrapped in a single fetch
        // We can reuse fetchPokemonDetails if we have the URL, or construct data manually logic.
        // Let's use fetchPokemonDetails with the response data if we could, but that fn takes URL.
        // We can just parse the response directly here.
        const data = await response.json();
        const detail = {
            id: data.id,
            name: data.name,
            types: data.types.map(t => t.type.name),
            abilities: data.abilities.map(a => ({ name: a.ability.name, is_hidden: a.is_hidden })),
            image: data.sprites.other['official-artwork'].front_default || data.sprites.front_default
        };
        return [detail]; // Return ARRAY
    } catch (error) {
        return null;
    }
}


export const fetchPokemonByType = async (type) => {
    try {
        const response = await fetch(`${BASE_URL}/type/${type}`);
        const data = await response.json();
        // The API returns a structure like { pokemon: [ { pokemon: { name, url } }, ... ] }
        return data.pokemon.map(p => p.pokemon);
    } catch (error) {
        console.error(`Error fetching pokemon by type ${type}:`, error);
        return [];
    }
};

// --- New Global Search Logic ---

let allPokemonCache = null;

export const fetchAllPokemonSimple = async () => {
    if (allPokemonCache) return allPokemonCache;
    
    try {
        // Fetch a large list to get ID and Name. Limit 2000 covers up to Gen 9.
        const response = await fetch(`${BASE_URL}/pokemon?limit=2000&offset=0`);
        const data = await response.json();
        
        // Map to a simple structure: { name, id, image }
        // URL format: https://pokeapi.co/api/v2/pokemon/1/
        allPokemonCache = data.results.map(p => {
             const parts = p.url.split('/');
             const id = parts[parts.length - 2];
             return {
                 name: p.name,
                 id: parseInt(id),
                 // Construct sprite URL directly to avoid fetching details for every search result
                 image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
             };
        });
        return allPokemonCache;
    } catch (error) {
        console.error("Error fetching global pokemon list:", error);
        return [];
    }
};

export const searchPokemonLocal = async (query) => {
    const all = await fetchAllPokemonSimple();
    
    // If no query, return all Pokemon (for filtering purposes)
    if (!query) {
        return all;
    }
    
    const lowerQ = query.toLowerCase();
    
    // Filter by Name (contains) or ID (starts with or exact match effectively "contains" string)
    // The user said: "12 debe mostrar todos los que tienen un 12 como inicio ... o que tengan este numero dentro"
    // So both name.includes() and id.toString().includes()
    
    const matches = all.filter(p => 
        p.name.includes(lowerQ) || p.id.toString().includes(lowerQ)
    );
    
    return matches.slice(0, 10); // Limit to top 10 results for performance/UI
};
