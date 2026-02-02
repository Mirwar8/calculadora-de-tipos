
async function checkType(typeName) {
    try {
        console.log(`Checking type: ${typeName}`);
        const response = await fetch(`https://pokeapi.co/api/v2/type/${typeName}`);
        if (!response.ok) {
            console.log('Type not found.');
            return;
        }
        const data = await response.json();
        console.log(`Total pokemon count for ${typeName}:`, data.pokemon.length);
        
        // Check for specific known varieties
        const frillishParams = data.pokemon.filter(p => p.pokemon.name.includes('frillish'));
        const meowsticParams = data.pokemon.filter(p => p.pokemon.name.includes('meowstic'));
        const indeedeeParams = data.pokemon.filter(p => p.pokemon.name.includes('indeedee'));

        console.log('Frillish entries:', frillishParams.map(p => p.pokemon.name));
        console.log('Meowstic entries:', meowsticParams.map(p => p.pokemon.name));
        console.log('Indeedee entries:', indeedeeParams.map(p => p.pokemon.name));
        
    } catch (e) {
        console.error(e);
    }
}

// Run 
(async () => {
    await checkType('water');
    await checkType('ghost');
    await checkType('psychic');
})();
