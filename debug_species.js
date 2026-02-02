
async function checkSpecies(name) {
    try {
        console.log(`Checking species: ${name}`);
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${name.toLowerCase()}`);
        if (!response.ok) {
            console.log('Species not found.');
            return;
        }
        const data = await response.json();
        console.log('Varieties found:', data.varieties.length);
        data.varieties.forEach(v => {
            console.log(`- ${v.pokemon.name} (Default: ${v.is_default})`);
        });
    } catch (e) {
        console.error(e);
    }
}

// Run sequentially
(async () => {
    await checkSpecies('meowstic');
    await checkSpecies('indeedee');
    await checkSpecies('pikachu');
})();
