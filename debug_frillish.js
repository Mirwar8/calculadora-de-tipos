
async function checkFrillish() {
    try {
        // 1. Check Species
        console.log('--- Species: frillish ---');
        const sRes = await fetch('https://pokeapi.co/api/v2/pokemon-species/frillish');
        const sData = await sRes.json();
        console.log('Varieties:', sData.varieties.map(v => v.pokemon.name));

        // 2. Check Pokemon Resource for female
        const fName = 'frillish-female';
        console.log(`--- Pokemon: ${fName} ---`);
        const pRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${fName}`);
        if(pRes.ok) {
            const pData = await pRes.json();
            console.log('Types:', pData.types.map(t => t.type.name));
        } else {
            console.log('Pokemon resource not found.');
        }

    } catch (e) {
        console.error(e);
    }
}

checkFrillish();
