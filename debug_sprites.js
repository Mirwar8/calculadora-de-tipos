
async function checkSprites() {
    try {
        const res = await fetch('https://pokeapi.co/api/v2/pokemon/frillish');
        const data = await res.json();
        
        console.log('Front Default:', data.sprites.front_default);
        console.log('Front Female:', data.sprites.front_female);
        console.log('Artwork Default:', data.sprites.other['official-artwork'].front_default);
        console.log('Artwork Female:', data.sprites.other['official-artwork'].front_female); // Check if this exists
        console.log('Home Default:', data.sprites.other['home'].front_default);
        console.log('Home Female:', data.sprites.other['home'].front_female);
        
    } catch (e) {
        console.error(e);
    }
}
checkSprites();
