
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { fetchPokemonList, fetchPokemonDetails, searchPokemon, searchPokemonLocal, fetchPokemonByType } from '../services/pokeapi';
import TypeBadge from '../components/TypeBadge';
import { useTeam } from '../hooks/useTeam';
import { TYPE_LIST, TYPES } from '../utils/pokemonTypes';

const expandWithGenderVariations = (list) => {
    return list.flatMap(p => {
        const expanded = [p];
        if (p.femaleImage) {
            expanded.push({ ...p, id: `${p.id}-f`, name: `${p.name} ♀`, image: p.femaleImage, isFemale: true });
            expanded[0].name = `${p.name} ♂`;
        }
        return expanded;
    });
};

// Generation ID ranges
const GENERATION_RANGES = {
    1: { start: 1, end: 151 },
    2: { start: 152, end: 251 },
    3: { start: 252, end: 386 },
    4: { start: 387, end: 493 },
    5: { start: 494, end: 649 },
    6: { start: 650, end: 721 },
    7: { start: 722, end: 809 },
    8: { start: 810, end: 905 },
    9: { start: 906, end: 1025 }
};

const Pokedex = () => {
    const [pokemonList, setPokemonList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [offset, setOffset] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [hasMore, setHasMore] = useState(true);

    // Pagination control
    const [pageSize, setPageSize] = useState(25); // Default 25 Pokemon per page
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [activeGen, setActiveGen] = useState(null);
    const [scrollPercent, setScrollPercent] = useState(0);
    const [isScrubbing, setIsScrubbing] = useState(false);
    const scrubberRef = useRef(null);
    const scrubbingTimeout = useRef(null);

    // Advanced filters
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filters, setFilters] = useState({
        generation: null,
        types: [],
        sortBy: 'pokedex',
        showSpecial: false
    });

    const [addFeedbacks, setAddFeedbacks] = useState({}); // { id: 'success' | 'error' | null }

    // For type filtering
    const [searchParams] = useSearchParams();
    const type1Filter = searchParams.get('type1');
    const type2Filter = searchParams.get('type2');
    const isFiltering = !!(type1Filter || type2Filter);

    // Store full filtered list locally to handle client-side pagination for filters
    const [filteredPool, setFilteredPool] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        if (isFiltering) {
            loadFilteredPokemon();
        } else {
            loadInitialPokemon();
        }
    }, [type1Filter, type2Filter, pageSize]);

    // Debounced search effect for instant partial matching
    useEffect(() => {
        // Check if any filters are active
        const hasActiveFilters = filters.generation || filters.types.length > 0 || filters.showSpecial || filters.sortBy !== 'pokedex';

        if (!searchTerm && !hasActiveFilters) {
            // If no search and no filters, restore normal view
            if (!isFiltering) {
                loadInitialPokemon();
            }
            return;
        }

        const timer = setTimeout(async () => {
            setLoading(true);

            // If there's a search term, use search results
            // Otherwise, get all Pokemon for filtering
            let results = await searchPokemonLocal(searchTerm || '');

            // Apply generation filter
            if (filters.generation) {
                const range = GENERATION_RANGES[filters.generation];
                results = results.filter(p => {
                    const id = typeof p.id === 'string' ? parseInt(p.id) : p.id;
                    return id >= range.start && id <= range.end;
                });
            }

            if (results && results.length > 0) {
                // Fetch full details for each result (limit for performance)
                const detailsPromises = results.slice(0, 200).map(p =>
                    fetchPokemonDetails(`https://pokeapi.co/api/v2/pokemon/${p.id}/`)
                );
                let details = await Promise.all(detailsPromises);

                // Apply type filter
                if (filters.types.length > 0) {
                    details = details.filter(p =>
                        filters.types.some(type => p.types.includes(type))
                    );
                }

                // Apply special forms filter
                if (filters.showSpecial) {
                    details = details.filter(p =>
                        p.name.includes('mega') ||
                        p.name.includes('gmax') ||
                        p.name.includes('alola') ||
                        p.name.includes('galar') ||
                        p.name.includes('hisui') ||
                        p.name.includes('paldea')
                    );
                }

                // Apply sorting
                if (filters.sortBy === 'alphabetical') {
                    details.sort((a, b) => a.name.localeCompare(b.name));
                } else {
                    details.sort((a, b) => a.id - b.id);
                }

                const expanded = expandWithGenderVariations(details);
                setPokemonList(expanded);
                setHasMore(false); // Disable pagination when searching/filtering
            } else {
                setPokemonList([]);
                setHasMore(false);
            }
            setLoading(false);
        }, 300); // 300ms debounce

        return () => clearTimeout(timer);
    }, [searchTerm, filters]);

    // Scroll listener for "Back to Top" and active generation detection
    useEffect(() => {
        let ticking = false;

        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const scrollY = window.scrollY;
                    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
                    const percent = Math.min(Math.max((scrollY / docHeight) * 100, 0), 100);

                    setScrollPercent(percent);
                    setShowScrollTop(scrollY > 400);

                    // Only detect active generation periodically or if height is small
                    const gens = Object.keys(GENERATION_RANGES);
                    for (const gen of gens.reverse()) {
                        const element = document.getElementById(`gen-${gen}`);
                        if (element && element.getBoundingClientRect().top < 200) {
                            setActiveGen(parseInt(gen));
                            break;
                        }
                    }
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (scrubbingTimeout.current) clearTimeout(scrubbingTimeout.current);
        };
    }, []);

    const handleScrubStart = (e) => {
        setIsScrubbing(true);
        if (scrubbingTimeout.current) clearTimeout(scrubbingTimeout.current);
        handleScrub(e);
    };

    const handleScrubEnd = () => {
        // Delay resetting isScrubbing to prevent flash of content during fast deceleration
        scrubbingTimeout.current = setTimeout(() => {
            setIsScrubbing(false);
        }, 150);
    };

    const handleScrub = (e) => {
        if (!scrubberRef.current) return;

        const rect = scrubberRef.current.getBoundingClientRect();
        const touchY = e.touches ? e.touches[0].clientY : e.clientY;
        const relativeY = touchY - rect.top;
        const percent = Math.min(Math.max((relativeY / rect.height) * 100, 0), 100);

        // Use requestAnimationFrame for smooth scrolling
        window.requestAnimationFrame(() => {
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            window.scrollTo({
                top: (percent / 100) * docHeight,
                behavior: 'auto' // Use 'auto' for instant response while scrubbing
            });
        });
    };

    const scrollToId = (id) => {
        const element = document.getElementById(id);
        if (element) {
            const offset = 100; // Header height
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = element.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    const loadInitialPokemon = async () => {
        setLoading(true);
        setPokemonList([]);
        setFilteredPool([]);
        setOffset(0);
        setHasMore(true);

        await fetchMoreStandard();
        setLoading(false);
    };

    const fetchMoreStandard = async () => {
        const data = await fetchPokemonList(pageSize, 0); // Always start fresh on mount
        if (data && data.results) {
            const detailsPromises = data.results.map(p => fetchPokemonDetails(p.url));
            const details = await Promise.all(detailsPromises);

            const expandedDetails = expandWithGenderVariations(details);

            setPokemonList(expandedDetails);
            setOffset(pageSize);
        }
    };

    const loadMore = async () => {
        setLoading(true);

        if (isFiltering) {
            // Client side slice
            const nextBatch = filteredPool.slice(offset, offset + pageSize);
            if (nextBatch.length > 0) {
                const detailsPromises = nextBatch.map(p => fetchPokemonDetails(p.url));
                const details = await Promise.all(detailsPromises);
                const expanded = expandWithGenderVariations(details);
                setPokemonList(prev => [...prev, ...expanded]);
                setOffset(prev => prev + pageSize);
            }
            if (offset + pageSize >= filteredPool.length) {
                setHasMore(false);
            }
        } else {
            // Server side fetch
            const data = await fetchPokemonList(pageSize, offset);
            if (data && data.results) {
                const detailsPromises = data.results.map(p => fetchPokemonDetails(p.url));
                const details = await Promise.all(detailsPromises);
                const expanded = expandWithGenderVariations(details);
                setPokemonList(prev => [...prev, ...expanded]);
                setOffset(prev => prev + pageSize);
            } else {
                setHasMore(false);
            }
        }
        setLoading(false);
    };


    const loadFilteredPokemon = async () => {
        setLoading(true);
        setPokemonList([]);
        setOffset(0);
        setHasMore(true);

        try {
            let results = [];

            // Fetch Type 1
            const type1List = type1Filter ? await fetchPokemonByType(type1Filter) : [];

            if (type2Filter && type2Filter !== 'none') {
                // Fetch Type 2
                const type2List = await fetchPokemonByType(type2Filter);

                // Find Intersection
                // Both lists contain objects { name, url }
                // Use generic set to match names
                const type1Names = new Set(type1List.map(p => p.name));
                results = type2List.filter(p => type1Names.has(p.name));
            } else {
                results = type1List;
            }

            setFilteredPool(results);

            // Load first batch
            const firstBatch = results.slice(0, pageSize);
            const detailsPromises = firstBatch.map(p => fetchPokemonDetails(p.url));
            const details = await Promise.all(detailsPromises);

            const expanded = expandWithGenderVariations(details);

            setPokemonList(expanded);
            setOffset(pageSize);
            if (results.length <= pageSize) setHasMore(false);

        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        // Search is now handled by the useEffect, this just prevents form submission
    };

    const { team, addToTeam } = useTeam();

    const handleAnalyze = (types) => {
        const t1 = types[0];
        const t2 = types[1] || 'none';
        navigate(`/?type1=${t1}&type2=${t2}`);
    };

    const handleAddToTeam = (pokemon) => {
        const added = addToTeam(pokemon);
        const status = added ? 'success' : 'error';

        setAddFeedbacks(prev => ({ ...prev, [pokemon.id]: status }));

        setTimeout(() => {
            setAddFeedbacks(prev => {
                const newFeedbacks = { ...prev };
                delete newFeedbacks[pokemon.id];
                return newFeedbacks;
            });
        }, 3000);
    };

    const applyFilters = () => {
        // Filters are now applied automatically via useEffect
        // This just closes the panel
        setIsFilterOpen(false);
    };

    const clearAllFilters = () => {
        setFilters({
            generation: null,
            types: [],
            sortBy: 'pokedex',
            showSpecial: false
        });
        setIsFilterOpen(false);
        setSearchTerm('');
        loadInitialPokemon();
    };

    const clearFilters = () => {
        setSearchTerm('');
        if (isFiltering) {
            navigate('/pokedex');
        } else {
            setOffset(0);
            loadInitialPokemon();
        }
    };

    return (
        <div className={`mx-auto pb-20 px-2 sm:px-4 md:px-8 space-y-6 sm:space-y-10 overflow-safe ${isScrubbing ? 'is-scrubbing' : ''}`}>
            <div className="flex flex-col space-fluid-6">
                <div className="flex flex-col space-fluid-4">
                    <h1 className="text-fluid-3xl md:text-fluid-4xl lg:text-fluid-5xl font-black tracking-tight dark:text-white">Pokédex Explorer</h1>
                    <p className="text-slate-500 dark:text-[#92adc9] text-fluid-base md:text-fluid-lg lg:text-fluid-xl max-w-2xl lg:max-w-3xl">
                        {isFiltering
                            ? `Showing Pokémon with type: ${type1Filter} ${type2Filter && type2Filter !== 'none' ? `+ ${type2Filter}` : ''}`
                            : "Browse through the national Pokédex and analyze any Pokémon's defensive profile."
                        }
                    </p>
                </div>

                <div className="relative">
                    <form onSubmit={handleSearch} className="flex flex-wrap items-center space-fluid-4 bg-white dark:bg-[#1a2632] p-3 md:p-4 rounded-2xl border border-slate-200 dark:border-[#233648] overflow-safe">
                        <div className="flex-1 min-w-[240px] flex-zoom-safe">
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                                <input
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        // Clear filters when starting a search
                                        if (e.target.value && isFiltering) {
                                            navigate('/pokedex');
                                        }
                                    }}
                                    className="w-full bg-slate-50 dark:bg-[#233648] border-none rounded-xl py-3 pl-10 text-fluid-sm focus:ring-2 focus:ring-primary outline-none dark:text-white"
                                    placeholder="Search by name or number..."
                                    type="text"
                                />
                            </div>
                        </div>

                        {/* Page Size Selector */}
                        <select
                            value={pageSize}
                            onChange={(e) => {
                                setPageSize(Number(e.target.value));
                            }}
                            className="bg-slate-100 dark:bg-[#233648] border border-slate-200 dark:border-[#2a3f52] rounded-xl px-4 py-3 text-fluid-sm font-bold dark:text-white focus:ring-2 focus:ring-primary outline-none"
                        >
                            <option value={25}>25 per page</option>
                            <option value={50}>50 per page</option>
                            <option value={100}>100 per page</option>
                            <option value={200}>200 per page</option>
                        </select>

                        <button
                            type="button"
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className="bg-primary text-white px-6 py-3 rounded-xl font-bold text-fluid-sm flex items-center gap-2 hover:bg-primary/90 transition-colors touch-target"
                        >
                            <span className="material-symbols-outlined">filter_list</span>
                            Filters
                        </button>
                        {(searchTerm || isFiltering || filters.generation || filters.types.length > 0) && (
                            <button
                                type="button"
                                onClick={clearAllFilters}
                                className="text-slate-500 dark:text-slate-400 text-fluid-sm font-bold hover:text-red-500 transition-colors touch-target"
                            >
                                Clear All
                            </button>
                        )}
                    </form>

                    {/* Filter Panel */}
                    {isFilterOpen && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1a2632] border border-slate-200 dark:border-[#233648] rounded-xl shadow-xl p-4 sm:p-6 z-50 animate-fade-in-down overflow-safe max-h-[80vh] overflow-y-auto custom-scrollbar" style={{ maxWidth: 'min(calc(100vw - 4rem), 600px)' }}>
                            {/* Generation Filter */}
                            <div className="mb-6">
                                <h4 className="text-sm font-bold text-slate-700 dark:text-white mb-3">Generation</h4>
                                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(gen => (
                                        <button
                                            key={gen}
                                            type="button"
                                            onClick={() => setFilters({ ...filters, generation: filters.generation === gen ? null : gen })}
                                            className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors ${filters.generation === gen
                                                ? 'bg-primary text-white'
                                                : 'bg-slate-100 dark:bg-[#233648] dark:text-white hover:bg-slate-200 dark:hover:bg-[#2a3f52]'
                                                }`}
                                        >
                                            Gen {gen}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Type Filter */}
                            <div className="mb-6">
                                <h4 className="text-sm font-bold text-slate-700 dark:text-white mb-3">Types</h4>
                                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                    {TYPE_LIST.map(type => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => {
                                                const newTypes = filters.types.includes(type)
                                                    ? filters.types.filter(t => t !== type)
                                                    : [...filters.types, type];
                                                setFilters({ ...filters, types: newTypes });
                                            }}
                                            className={`px-3 py-2 rounded-lg text-xs font-bold capitalize transition-all ${filters.types.includes(type)
                                                ? `${TYPES[type].color} text-white shadow-md`
                                                : 'bg-slate-100 dark:bg-[#233648] dark:text-white hover:bg-slate-200 dark:hover:bg-[#2a3f52]'
                                                }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Sort Options */}
                            <div className="mb-6">
                                <h4 className="text-sm font-bold text-slate-700 dark:text-white mb-3">Sort By</h4>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setFilters({ ...filters, sortBy: 'pokedex' })}
                                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${filters.sortBy === 'pokedex'
                                            ? 'bg-primary text-white'
                                            : 'bg-slate-100 dark:bg-[#233648] dark:text-white hover:bg-slate-200 dark:hover:bg-[#2a3f52]'
                                            }`}
                                    >
                                        Pokedex Order
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFilters({ ...filters, sortBy: 'alphabetical' })}
                                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${filters.sortBy === 'alphabetical'
                                            ? 'bg-primary text-white'
                                            : 'bg-slate-100 dark:bg-[#233648] dark:text-white hover:bg-slate-200 dark:hover:bg-[#2a3f52]'
                                            }`}
                                    >
                                        Alphabetical
                                    </button>
                                </div>
                            </div>

                            {/* Special Forms */}
                            <div className="mb-4">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={filters.showSpecial}
                                        onChange={(e) => setFilters({ ...filters, showSpecial: e.target.checked })}
                                        className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm font-bold text-slate-700 dark:text-white group-hover:text-primary dark:group-hover:text-primary transition-colors">
                                        Show Only Special Forms (Mega, Gigamax, Regional)
                                    </span>
                                </label>
                            </div>

                            {/* Apply/Clear Buttons */}
                            <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-[#233648]">
                                <button
                                    type="button"
                                    onClick={applyFilters}
                                    className="flex-1 bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors"
                                >
                                    Apply Filters
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFilters({
                                            generation: null,
                                            types: [],
                                            sortBy: 'pokedex',
                                            showSpecial: false
                                        });
                                    }}
                                    className="px-4 py-2 bg-slate-100 dark:bg-[#233648] dark:text-white rounded-lg font-bold text-sm hover:bg-slate-200 dark:hover:bg-[#2a3f52] transition-colors"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid gap-2 sm:gap-4 md:gap-5 lg:gap-6 pokemon-grid-container overflow-safe"
                style={{
                    gridTemplateColumns: `repeat(auto-fill, minmax(150px, 1fr))`
                }}>
                {pokemonList.map((pokemon, index) => {
                    // Check if this pokemon is the first of its generation in the current list
                    let genId = null;
                    if (!searchTerm && !isFiltering) {
                        for (const [gen, range] of Object.entries(GENERATION_RANGES)) {
                            if (pokemon.id === range.start) {
                                genId = `gen-${gen}`;
                                break;
                            }
                        }
                    }

                    return (
                        <div key={pokemon.id} id={genId} className="pokemon-card bg-white dark:bg-[#1a2632] border border-slate-200 dark:border-[#233648] rounded-2xl md:rounded-3xl p-3 md:p-5 flex flex-col group hover:shadow-lg transition-all duration-300 h-full flex-zoom-safe">
                            <div className="flex justify-between items-start space-fluid-4">
                                <span className="text-fluid-xs font-bold text-slate-400">#{String(pokemon.id).padStart(4, '0')}</span>
                                <button className="text-slate-300 hover:text-red-500 transition-colors p-1 touch-target">
                                    <span className="material-symbols-outlined text-fluid-lg">favorite</span>
                                </button>
                            </div>
                            <div
                                onClick={() => navigate(`/pokemon/${pokemon.id.toString().includes('-f') ? pokemon.id.split('-')[0] : pokemon.id}`)}
                                className="aspect-pokemon bg-slate-50 dark:bg-[#233648] rounded-xl md:rounded-2xl space-fluid-4 flex items-center justify-center overflow-hidden p-3 md:p-4 group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                            >
                                <img alt={pokemon.name} className="w-full h-full object-contain" src={pokemon.image} />
                            </div>
                            <div className="text-center space-fluid-4 flex-grow">
                                <h3 className="text-fluid-sm md:text-fluid-lg font-black capitalize mb-2 dark:text-white line-clamp-1">{pokemon.name}</h3>
                                <div className="flex justify-center space-fluid-2 flex-wrap">
                                    {pokemon.types.map(type => (
                                        <TypeBadge key={type} type={type} />
                                    ))}
                                </div>
                            </div>
                            <div className="mt-auto grid grid-cols-2 gap-1.5 sm:gap-2">
                                <button
                                    onClick={() => handleAddToTeam(pokemon)}
                                    className={`py-1.5 sm:py-2 md:py-2.5 transition-all rounded-lg md:rounded-xl text-[10px] sm:text-fluid-xs font-bold flex items-center justify-center gap-1 md:gap-2 touch-target ${addFeedbacks[pokemon.id] === 'success'
                                        ? 'bg-green-500 text-white shadow-lg'
                                        : addFeedbacks[pokemon.id] === 'error'
                                            ? 'bg-red-500 text-white shadow-lg'
                                            : 'bg-slate-100 dark:bg-[#233648] hover:bg-green-500 hover:text-white dark:text-white'
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-[16px] sm:text-fluid-sm transition-transform duration-300">
                                        {addFeedbacks[pokemon.id] === 'success' ? 'check_circle' : addFeedbacks[pokemon.id] === 'error' ? 'error' : 'add_circle'}
                                    </span>
                                    <span className="inline">
                                        {addFeedbacks[pokemon.id] === 'success' ? 'Ok' : addFeedbacks[pokemon.id] === 'error' ? 'Full' : 'Add'}
                                    </span>
                                </button>
                                <button
                                    onClick={() => handleAnalyze(pokemon.types)}
                                    className="py-1.5 sm:py-2 md:py-2.5 bg-slate-100 dark:bg-[#233648] hover:bg-primary hover:text-white dark:text-white transition-all rounded-lg md:rounded-xl text-[10px] sm:text-fluid-xs font-bold flex items-center justify-center gap-1 md:gap-2 touch-target"
                                >
                                    <span className="material-symbols-outlined text-[16px] sm:text-fluid-sm">calculate</span>
                                    <span className="inline">Types</span>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Fast Scroll Scrubber */}
            {!searchTerm && !isFiltering && (
                <div
                    className="quick-nav-rail md:hidden"
                    ref={scrubberRef}
                    onTouchStart={handleScrubStart}
                    onTouchMove={handleScrub}
                    onTouchEnd={handleScrubEnd}
                    onClick={handleScrub}
                >
                    <div className="scrubber-track"></div>
                    <div
                        className="scrubber-thumb"
                        style={{ top: `${scrollPercent}%` }}
                    ></div>

                    {/* Floating Label for active Generation */}
                    <div
                        className="scrubber-label"
                        style={{ top: `${scrollPercent}%` }}
                    >
                        Gen {activeGen || '...'}
                    </div>

                    {/* Static guide markers */}
                    <div className="absolute inset-0 flex flex-col justify-between py-2 items-center pointer-events-none opacity-30">
                        {['1', '5', '9'].map(g => (
                            <span key={g} className="text-[8px] font-black dark:text-white">G{g}</span>
                        ))}
                    </div>
                </div>
            )}

            <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className={`scroll-top-btn ${showScrollTop ? 'visible' : ''}`}
            >
                <span className="material-symbols-outlined font-black">arrow_upward</span>
            </button>

            {!searchTerm && hasMore && (
                <div className="flex flex-col items-center space-fluid-6 py-12">
                    {loading && (
                        <div className="flex items-center space-fluid-4">
                            <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-fluid-sm font-semibold text-slate-500">Loading...</span>
                        </div>
                    )}
                    <button
                        onClick={loadMore}
                        className="px-12 py-4 bg-white dark:bg-[#1a2632] border border-slate-200 dark:border-[#233648] hover:border-primary dark:hover:border-primary rounded-full font-bold text-fluid-sm shadow-sm transition-all dark:text-white touch-target"
                        disabled={loading}
                    >
                        Load More Pokémon
                    </button>
                </div>
            )}

            {pokemonList.length === 0 && !loading && (
                <div className="text-center py-12 text-slate-500">
                    <p>No Pokémon found matching criteria.</p>
                </div>
            )}
        </div>
    );
};

export default Pokedex;
