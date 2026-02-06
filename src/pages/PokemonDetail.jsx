
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchPokemonFullDetails } from '../services/pokeapi';
import TypeBadge from '../components/TypeBadge';
import { useTeam } from '../hooks/useTeam';

const EGG_GROUPS_MAP = {
    'monster': 'Monstruo',
    'bug': 'Bicho',
    'flying': 'Volador',
    'field': 'Campo',
    'fairy': 'Hada',
    'grass': 'Planta',
    'human-like': 'Humanoide',
    'water1': 'Agua 1',
    'water2': 'Agua 2',
    'water3': 'Agua 3',
    'mineral': 'Mineral',
    'indeterminate': 'Amorfo',
    'ditto': 'Ditto',
    'dragon': 'Dragón',
    'no-eggs': 'No descubierto'
};

const PokemonDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [pokemon, setPokemon] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedVersion, setSelectedVersion] = useState('');
    const [language, setLanguage] = useState('es');
    const { addToTeam } = useTeam();
    const [addFeedback, setAddFeedback] = useState(null);
    const [gender, setGender] = useState('male'); // 'male' or 'female'
    const [volume, setVolume] = useState(0.5); // Default 50%

    useEffect(() => {
        let isMounted = true;
        const loadPokemon = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await fetchPokemonFullDetails(id);
                if (!isMounted) return;

                if (data) {
                    setPokemon(data);
                    // Set initial version
                    const entries = data.speciesData?.flavor_text_entries || [];
                    const versions = entries
                        .filter(entry => entry.language?.name === 'es' || entry.language?.name === 'en')
                        .map(entry => entry.version?.name)
                        .filter(Boolean);

                    const uniqueVersions = [...new Set(versions)];
                    setSelectedVersion(uniqueVersions[0] || '');
                    setGender('male');
                } else {
                    setError('NOT_FOUND');
                }
            } catch (err) {
                console.error("Failed to load pokemon details:", err);
                if (isMounted) setError('FETCH_ERROR');
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        loadPokemon();
        return () => { isMounted = false; };
    }, [id]);

    const handleAddToTeam = () => {
        // Normalize pokemon data for the team builder
        const normalizedPokemon = {
            id: pokemon.id,
            name: pokemon.name,
            types: pokemon.types.map(t => t.type.name),
            abilities: pokemon.abilities.map(a => ({
                name: a.ability.name,
                is_hidden: a.is_hidden
            })),
            image: getSprite()
        };

        const success = addToTeam(normalizedPokemon);
        if (success) {
            setAddFeedback({ type: 'success', message: '¡Agregado al equipo!' });
        } else {
            setAddFeedback({ type: 'error', message: '¡Equipo lleno!' });
        }

        setTimeout(() => setAddFeedback(null), 3000);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="flex flex-col items-center gap-4">
                    <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xl font-bold text-slate-500">Accessing Data...</span>
                </div>
            </div>
        );
    }

    if (!pokemon && !loading) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-pokedex-blue-dark">
                <div className="bg-black/60 backdrop-blur-xl border-4 border-white/20 p-10 rounded-3xl text-center shadow-2xl max-w-md w-full">
                    <span className="material-symbols-outlined text-8xl text-red-500 mb-6 scale-125 block">error_outline</span>
                    <h2 className="text-4xl font-black text-white mb-4 uppercase tracking-[0.1em]">
                        {error === 'FETCH_ERROR' ? 'System Error' : 'Database Error'}
                    </h2>
                    <p className="text-cyan-400 text-xl font-bold mb-8 leading-relaxed">
                        {error === 'FETCH_ERROR'
                            ? 'Error contactando con la base de datos de la PokeAPI.'
                            : 'El espécimen solicitado no ha sido localizado en el índice.'}
                    </p>
                    <button
                        onClick={() => navigate('/pokedex')}
                        className="w-full bg-cyan-500 hover:bg-cyan-400 text-white py-4 rounded-xl font-black text-xl shadow-lg transform active:scale-95 transition-all border-b-4 border-cyan-700"
                    >
                        REGRESAR AL ÍNDICE
                    </button>
                </div>
            </div>
        );
    }

    // Clean flavor text
    const cleanFlavorText = (text) => {
        return text
            .replace(/\f/g, '\n')
            .replace(/\u00ad\n/g, '')
            .replace(/\u00ad/g, '')
            .replace(/ -\n/g, ' - ')
            .replace(/\-\n/g, '-')
            .replace(/\n\s+/g, ' ')
            .replace(/\n/g, ' ');
    };

    const getLocalizedCategory = () => {
        if (!pokemon?.speciesData?.genera) return '';
        const genusEntry = pokemon.speciesData.genera.find(g => g.language.name === language);
        return genusEntry ? genusEntry.genus : pokemon.speciesData.genera.find(g => g.language.name === 'en')?.genus || '';
    };

    const getLocalizedEggGroups = () => {
        if (!pokemon?.speciesData?.egg_groups) return '';
        return pokemon.speciesData.egg_groups.map(group => {
            const name = typeof group.name === 'string' ? group.name : '';
            if (!name) return '';
            return language === 'es' ? (EGG_GROUPS_MAP[name] || name) : name.charAt(0).toUpperCase() + name.slice(1);
        }).filter(Boolean).join(', ');
    };

    const formatHeight = () => {
        if (!pokemon) return '';
        const decimeters = pokemon.height;
        if (language === 'es') {
            return `${(decimeters / 10).toFixed(1)} m`;
        } else {
            const totalInches = decimeters * 3.937;
            const feet = Math.floor(totalInches / 12);
            const inches = Math.round(totalInches % 12);
            return `${feet}'${inches}"`;
        }
    };

    const formatWeight = () => {
        if (!pokemon) return '';
        const hectograms = pokemon.weight;
        if (language === 'es') {
            return `${(hectograms / 10).toFixed(1)} kg`;
        } else {
            const lbs = (hectograms * 0.220462).toFixed(1);
            return `${lbs} lbs`;
        }
    };

    const getGenderRatio = () => {
        if (!pokemon?.speciesData || pokemon.speciesData.gender_rate === -1) {
            return language === 'es' ? 'Sin género' : 'Genderless';
        }
        const femaleRate = pokemon.speciesData.gender_rate;
        const femalePercentage = (femaleRate / 8) * 100;
        const malePercentage = 100 - femalePercentage;

        return (
            <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-blue-400">♂ {malePercentage}%</span>
                <span className="flex items-center gap-1 text-pink-400">♀ {femalePercentage}%</span>
            </div>
        );
    };

    const playCry = () => {
        if (pokemon?.cries?.latest) {
            const audio = new Audio(pokemon.cries.latest);
            audio.volume = volume;
            audio.play().catch(e => console.error("Error playing cry:", e));
        }
    };

    const getDescriptionData = () => {
        const entries = pokemon.speciesData?.flavor_text_entries || [];
        const entry = entries.find(
            e => e.version.name === selectedVersion && e.language.name === language
        );

        if (entry) {
            return { text: cleanFlavorText(entry.flavor_text), isAvailable: true };
        }

        // Fallback to English
        const fallbackEntry = pokemon.speciesData.flavor_text_entries.find(
            e => e.version.name === selectedVersion && e.language.name === 'en'
        );

        return {
            text: fallbackEntry ? cleanFlavorText(fallbackEntry.flavor_text) : 'Desconocido / Unknown',
            isAvailable: false
        };
    };

    const getVersions = () => {
        const entries = pokemon.speciesData?.flavor_text_entries || [];
        const versions = entries
            .filter(entry => entry.language.name === 'es' || entry.language.name === 'en')
            .map(entry => entry.version.name);
        return [...new Set(versions)];
    };

    const getSprite = () => {
        if (!pokemon?.sprites) return '';
        const isFemale = gender === 'female';

        const genMap = {
            'red': { gen: 'generation-i', game: 'red-blue' },
            'blue': { gen: 'generation-i', game: 'red-blue' },
            'yellow': { gen: 'generation-i', game: 'yellow' },
            'gold': { gen: 'generation-ii', game: 'gold' },
            'silver': { gen: 'generation-ii', game: 'silver' },
            'crystal': { gen: 'generation-ii', game: 'crystal' },
            'ruby': { gen: 'generation-iii', game: 'ruby-sapphire' },
            'sapphire': { gen: 'generation-iii', game: 'ruby-sapphire' },
            'emerald': { gen: 'generation-iii', game: 'emerald' },
            'firered': { gen: 'generation-iii', game: 'firered-leafgreen' },
            'leafgreen': { gen: 'generation-iii', game: 'firered-leafgreen' },
            'diamond': { gen: 'generation-iv', game: 'diamond-pearl' },
            'pearl': { gen: 'generation-iv', game: 'diamond-pearl' },
            'platinum': { gen: 'generation-iv', game: 'platinum' },
            'heartgold': { gen: 'generation-iv', game: 'heartgold-soulsilver' },
            'soulsilver': { gen: 'generation-iv', game: 'heartgold-soulsilver' },
            'black': { gen: 'generation-v', game: 'black-white' },
            'white': { gen: 'generation-v', game: 'black-white' },
            'black-2': { gen: 'generation-v', game: 'black-2-white-2' },
            'white-2': { gen: 'generation-v', game: 'black-2-white-2' },
            'x': { gen: 'generation-vi', game: 'x-y' },
            'y': { gen: 'generation-vi', game: 'x-y' },
            'omega-ruby': { gen: 'generation-vi', game: 'omegaruby-alphasapphire' },
            'alpha-sapphire': { gen: 'generation-vi', game: 'omegaruby-alphasapphire' },
            'sun': { gen: 'generation-vii', game: 'sun-moon' },
            'moon': { gen: 'generation-vii', game: 'sun-moon' },
            'ultra-sun': { gen: 'generation-vii', game: 'ultra-sun-ultra-moon' },
            'ultra-moon': { gen: 'generation-vii', game: 'ultra-sun-ultra-moon' },
        };

        const config = genMap[selectedVersion];
        if (config) {
            const genSprites = pokemon.sprites.versions?.[config.gen];
            const gameSprites = genSprites?.[config.game];
            if (gameSprites) {
                const sprite = isFemale ? (gameSprites.front_female || gameSprites.front_default) : gameSprites.front_default;
                if (sprite) return sprite;
            }
        }

        // Home or Official Artwork
        const homeSprites = pokemon.sprites.other?.home;
        if (isFemale && (homeSprites?.front_female || pokemon.sprites.front_female)) {
            return homeSprites?.front_female || pokemon.sprites.front_female;
        }

        return pokemon.sprites.other?.['official-artwork']?.front_default
            || pokemon.sprites.other?.home?.front_default
            || pokemon.sprites.front_default
            || '';
    };

    const hasGenderDifference = pokemon.sprites.front_female || (pokemon.sprites.other?.home?.front_female);

    const statsMap = {
        'hp': { label: 'HP', color: 'bg-red-500' },
        'attack': { label: 'ATK', color: 'bg-orange-500' },
        'defense': { label: 'DEF', color: 'bg-yellow-500' },
        'special-attack': { label: 'SPA', color: 'bg-blue-500' },
        'special-defense': { label: 'SPD', color: 'bg-green-500' },
        'speed': { label: 'SPE', color: 'bg-pink-500' }
    };

    return (
        <div className="mx-auto p-1 sm:p-4 md:p-6 lg:p-8 font-sans overflow-safe" style={{ maxWidth: 'clamp(100vw, 95vw, 1400px)' }}>
            <main className="relative w-full mx-auto bg-pokedex-blue-dark rounded-2xl sm:rounded-3xl p-3 sm:p-6 md:p-8 lg:p-10 shadow-bevel border-4 border-black/20 overflow-safe" style={{ maxWidth: 'min(calc(100vw - 1rem), 1200px)' }}>
                {/* Top Sensor Array & Header */}
                <header className="flex items-start justify-between mb-4 sm:mb-8 relative z-10">
                    <div className="flex items-center space-fluid-3 sm:space-fluid-4">
                        <div className="size-12 sm:size-16 md:size-20 rounded-full bg-blue-400 border-2 sm:border-4 border-white/20 shadow-lg relative overflow-hidden lens-reflection animate-pulse">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-300 to-blue-600 opacity-80"></div>
                        </div>
                        <div className="flex gap-1.5 sm:gap-2 self-start mt-1">
                            <div className="size-2 sm:size-3 md:size-4 rounded-full bg-red-500 shadow-md border border-red-700"></div>
                            <div className="size-2 sm:size-3 md:size-4 rounded-full bg-yellow-400 shadow-md border border-yellow-600"></div>
                            <div className="size-2 sm:size-3 md:size-4 rounded-full bg-green-500 shadow-md border border-green-700"></div>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <button
                            onClick={() => navigate('/pokedex')}
                            className="flex items-center space-fluid-2 text-white/80 hover:text-white transition-colors group touch-target"
                        >
                            <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
                            <span className="text-fluid-base md:text-fluid-lg font-bold tracking-widest uppercase">Pokedex</span>
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                    {/* LEFT COLUMN */}
                    <div className="lg:col-span-7 flex flex-col space-fluid-6">
                        <div className="bg-white dark:bg-slate-300 p-4 sm:p-6 rounded-bl-[4rem] rounded-tl-xl rounded-tr-xl rounded-br-xl shadow-inner-heavy relative overflow-safe">
                            <div className="bg-dex-dark-screen rounded-lg p-1 shadow-lg ring-4 ring-gray-400/50">
                                <div className="bg-gray-900 rounded border-2 border-gray-700 relative overflow-hidden aspect-[4/3] flex items-center justify-center">
                                    <div className="absolute inset-0 scanlines opacity-20 pointer-events-none z-10"></div>
                                    <img
                                        src={getSprite()}
                                        alt={pokemon.name}
                                        className="w-3/4 h-3/4 object-contain transition-transform duration-500 hover:scale-110 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] pixelated aspect-sprite"
                                    />
                                    <div className="absolute top-4 left-4 z-20">
                                        <span className="bg-red-600 text-white text-fluid-xs font-bold px-2 py-0.5 rounded shadow">REC</span>
                                    </div>

                                    {/* Gender Toggle */}
                                    {hasGenderDifference && (
                                        <div className="absolute bottom-4 right-4 z-20 flex gap-2">
                                            <button
                                                onClick={() => setGender('male')}
                                                className={`size-8 sm:size-10 rounded-full flex items-center justify-center font-bold text-fluid-sm transition-all shadow-lg ${gender === 'male' ? 'bg-blue-500 text-white ring-2 ring-white' : 'bg-gray-800/80 text-blue-300 hover:bg-gray-700'}`}
                                            >
                                                ♂
                                            </button>
                                            <button
                                                onClick={() => setGender('female')}
                                                className={`size-8 sm:size-10 rounded-full flex items-center justify-center font-bold text-fluid-sm transition-all shadow-lg ${gender === 'female' ? 'bg-pink-500 text-white ring-2 ring-white' : 'bg-gray-800/80 text-pink-300 hover:bg-gray-700'}`}
                                            >
                                                ♀
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-4 px-2">
                                <div className="flex items-center space-fluid-3">
                                    <div className="size-6 md:size-8 rounded-full bg-red-600 shadow-md animate-pulse"></div>
                                    <div className="h-1 w-8 md:w-12 bg-gray-400 rounded-full"></div>
                                    <div className="h-1 w-8 md:w-12 bg-gray-400 rounded-full"></div>
                                </div>
                                <span className="material-symbols-outlined text-3xl md:text-4xl text-gray-800 rotate-90">menu</span>
                            </div>

                            {/* Vital Specs Panel */}
                            <div className="bg-black/60 backdrop-blur-xl rounded-xl p-5 sm:p-8 border-2 border-white/20 shadow-2xl overflow-safe mb-8">
                                <h3 className="text-white text-2xl font-black uppercase tracking-widest mb-6 flex items-center gap-3 border-b-2 border-white/10 pb-3">
                                    <span className="material-symbols-outlined text-3xl text-cyan-400">info</span> {language === 'es' ? 'Datos Biológicos' : 'Biological Data'}
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12">
                                    <div className="space-y-2">
                                        <p className="text-cyan-400 text-base sm:text-lg font-black uppercase tracking-[0.15em]">
                                            {language === 'es' ? 'Categoría' : 'Category'}
                                        </p>
                                        <p className="text-white text-2xl sm:text-3xl font-black capitalize leading-none tracking-tight">{getLocalizedCategory()}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-cyan-400 text-base sm:text-lg font-black uppercase tracking-[0.15em]">
                                            {language === 'es' ? 'Grupos Huevo' : 'Egg Groups'}
                                        </p>
                                        <p className="text-white text-2xl sm:text-3xl font-black leading-none tracking-tight">{getLocalizedEggGroups()}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-cyan-400 text-base sm:text-lg font-black uppercase tracking-[0.15em]">
                                            {language === 'es' ? 'Altura' : 'Height'}
                                        </p>
                                        <p className="text-yellow-300 text-3xl sm:text-4xl font-black leading-none">{formatHeight()}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-cyan-400 text-base sm:text-lg font-black uppercase tracking-[0.15em]">
                                            {language === 'es' ? 'Peso' : 'Weight'}
                                        </p>
                                        <p className="text-yellow-300 text-3xl sm:text-4xl font-black leading-none">{formatWeight()}</p>
                                    </div>
                                    <div className="space-y-3 sm:col-span-2 border-t-2 border-white/10 pt-6">
                                        <p className="text-cyan-400 text-base sm:text-lg font-black uppercase tracking-[0.15em]">
                                            {language === 'es' ? 'Género' : 'Gender'}
                                        </p>
                                        <div className="text-white text-2xl sm:text-3xl font-black">{getGenderRatio()}</div>
                                    </div>
                                    <div className="space-y-3 sm:col-span-2 border-t-2 border-white/10 pt-6">
                                        <p className="text-cyan-400 text-base sm:text-lg font-black uppercase tracking-[0.15em]">
                                            {language === 'es' ? 'Habilidades' : 'Abilities'}
                                        </p>
                                        <div className="flex flex-wrap gap-3">
                                            {(pokemon.abilities || []).map(a => (
                                                <span
                                                    key={a.ability.name}
                                                    className={`text-sm sm:text-base px-5 py-2 rounded-xl border-4 font-black capitalize ${a.is_hidden ? 'border-yellow-400 text-yellow-300 bg-yellow-400/20' : 'border-cyan-400 text-white bg-cyan-400/20'}`}
                                                >
                                                    {a.ability.name.replace(/-/g, ' ')}
                                                    {a.is_hidden && <span className="ml-2 text-xs uppercase text-yellow-400 underline underline-offset-4 decoration-2">({language === 'es' ? 'Oculta' : 'Hidden'})</span>}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-black/30 rounded-xl p-4 flex flex-wrap items-center justify-between border-2 border-white/10 shadow-bevel-pressed">
                            <div>
                                <h1 className="text-fluid-2xl md:text-fluid-4xl font-bold text-white tracking-tight capitalize">{pokemon.name}</h1>
                                <p className="text-blue-200 font-mono text-fluid-base md:text-fluid-lg tracking-widest">#{String(pokemon.id).padStart(3, '0')}</p>
                            </div>
                            <div className="flex gap-2">
                                {pokemon.types.map(t => (
                                    <TypeBadge key={t.type.name} type={t.type.name} />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="lg:col-span-5 flex flex-col space-fluid-6">
                        {/* LCD Panel */}
                        <div className="bg-black/40 rounded-xl p-1 shadow-bevel-pressed ring-1 ring-white/10 overflow-safe">
                            <div className="bg-[#101820] rounded-lg p-4 border border-gray-700 min-h-[160px] relative overflow-hidden">
                                <div className="absolute inset-0 scanlines opacity-10 pointer-events-none"></div>
                                <p className="text-green-400 font-mono text-fluid-sm md:text-fluid-base leading-relaxed">
                                    <span className="opacity-70 text-fluid-xs block mb-2 border-b border-green-900 pb-1 uppercase tracking-tighter flex justify-between items-center">
                                        <span>:: Pokedex Entry _{selectedVersion}</span>
                                        {!getDescriptionData().isAvailable && (
                                            <span className="text-fluid-xs bg-yellow-600/20 px-1 rounded animate-pulse text-yellow-500">
                                                [Language Unavailable - Fallback to English]
                                            </span>
                                        )}
                                    </span>
                                    {getDescriptionData().text}
                                </p>
                                <div className="absolute bottom-2 right-2 animate-pulse w-2 h-4 bg-green-500"></div>
                            </div>
                        </div>

                        {/* Stats Panel */}
                        <div className="bg-black/40 backdrop-blur-xl rounded-xl p-5 sm:p-8 border-2 border-white/20 shadow-2xl overflow-safe mb-8">
                            <h3 className="text-white text-2xl font-black uppercase tracking-widest mb-6 flex items-center gap-3 border-b-2 border-white/10 pb-3">
                                <span className="material-symbols-outlined text-3xl text-cyan-400">bar_chart</span> {language === 'es' ? 'Estadísticas Base' : 'Base Stats'}
                            </h3>
                            <div className="space-y-6">
                                {pokemon.stats.map(s => (
                                    <div key={s.stat.name} className="grid grid-cols-[4.5rem_1fr_3.5rem] gap-6 items-center">
                                        <span className="text-cyan-400 text-sm sm:text-base font-black uppercase tracking-widest">{statsMap[s.stat.name]?.label || s.stat.name}</span>
                                        <div className="h-5 bg-black/70 rounded-full overflow-hidden shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] border-2 border-white/10">
                                            <div
                                                className={`h-full ${statsMap[s.stat.name]?.color || 'bg-primary'} rounded-full shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all duration-1000`}
                                                style={{ width: `${Math.min(100, (s.base_stat / 255) * 100)}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-white text-xl sm:text-2xl text-right font-black">{s.base_stat}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Control Deck */}
                        <div className="grid grid-cols-2 gap-4 mt-auto">
                            <div className="bg-black/20 p-1.5 rounded-lg flex items-center gap-1 shadow-bevel-pressed overflow-safe">
                                <button
                                    onClick={() => setLanguage('en')}
                                    className={`flex-1 py-1.5 rounded text-fluid-xs font-bold transition-all touch-target ${language === 'en' ? 'bg-primary text-white shadow-md' : 'text-blue-300'}`}
                                >
                                    ENG
                                </button>
                                <button
                                    onClick={() => setLanguage('es')}
                                    className={`flex-1 py-1.5 rounded text-fluid-xs font-bold transition-all touch-target ${language === 'es' ? 'bg-primary text-white shadow-md' : 'text-blue-300'}`}
                                >
                                    ESP
                                </button>
                            </div>

                            <div className="relative overflow-safe">
                                <select
                                    value={selectedVersion}
                                    onChange={(e) => setSelectedVersion(e.target.value)}
                                    className="w-full appearance-none bg-black/40 border border-white/10 text-white text-fluid-xs font-bold py-2 px-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400 capitalize touch-target"
                                >
                                    {getVersions().map(v => (
                                        <option key={v} value={v} className="bg-pokedex-blue-dark">{v.replace(/-/g, ' ')}</option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                                    <span className="material-symbols-outlined text-sm">expand_more</span>
                                </div>
                            </div>
                        </div>

                        {/* Cry Player */}
                        {pokemon.cries?.latest && (
                            <div className="mt-4 bg-black/40 backdrop-blur-md rounded-xl p-3 border border-white/10 shadow-lg flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                                        <span className="material-symbols-outlined text-primary text-xl">volume_up</span>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-blue-300 font-bold uppercase tracking-tighter">
                                            {language === 'es' ? 'Grito del Pokémon' : "Pokémon Cry"}
                                        </p>
                                        <p className="text-white text-[10px] font-mono opacity-60">PokeAPI Digital Record</p>
                                    </div>
                                </div>
                                <button
                                    onClick={playCry}
                                    className="bg-primary hover:bg-blue-400 text-white size-10 rounded-lg shadow-lg flex items-center justify-center transform active:scale-90 transition-all group shrink-0"
                                    title={language === 'es' ? 'Reproducir Grito' : 'Play Cry'}
                                >
                                    <span className="material-symbols-outlined group-hover:scale-110 transition-transform">play_arrow</span>
                                </button>
                                <div className="flex-1 max-w-[100px] ml-4">
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        value={volume}
                                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                                        className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                                    />
                                    <div className="flex justify-between text-[8px] text-blue-300 font-bold mt-1 uppercase">
                                        <span>Vol</span>
                                        <span>{Math.round(volume * 100)}%</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Add to Team Button */}
                        <div className="mt-4">
                            <button
                                onClick={handleAddToTeam}
                                className={`w-full py-4 rounded-xl font-black text-fluid-sm tracking-[0.2em] uppercase shadow-lg transform active:scale-95 transition-all flex items-center justify-center gap-3 border-b-4 ${addFeedback?.type === 'success'
                                    ? 'bg-green-500 border-green-700 text-white'
                                    : addFeedback?.type === 'error'
                                        ? 'bg-red-500 border-red-700 text-white'
                                        : 'bg-primary border-blue-700 text-white hover:bg-blue-400'
                                    }`}
                            >
                                <span className="material-symbols-outlined">
                                    {addFeedback?.type === 'success' ? 'check_circle' : addFeedback?.type === 'error' ? 'error' : 'add_circle'}
                                </span>
                                {addFeedback ? addFeedback.message : 'Agregar al Equipo'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-6 sm:mt-8 flex justify-center space-fluid-3 opacity-30">
                    <div className="w-12 h-2 bg-black/50 rounded-full"></div>
                    <div className="w-12 h-2 bg-black/50 rounded-full"></div>
                    <div className="w-12 h-2 bg-black/50 rounded-full"></div>
                </div>
            </main>
        </div>
    );
};

export default PokemonDetail;
