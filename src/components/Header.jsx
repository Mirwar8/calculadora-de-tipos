import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';

const Header = () => {
    const { theme, toggleTheme } = useTheme();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const searchRef = useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsSearchOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.length === 0) {
            setSearchResults([]);
            setIsSearchOpen(false);
            return;
        }

        if (query.length > 0) {
            import('../services/pokeapi').then(mod => {
                mod.searchPokemonLocal(query).then(res => {
                    setSearchResults(res);
                    setIsSearchOpen(true);
                });
            });
        } else {
            setSearchResults([]);
            setIsSearchOpen(false);
        }
    };

    return (
        <header className="border-b border-solid border-slate-200 dark:border-[#233648] bg-white dark:bg-background-dark px-4 sm:px-6 py-3 sticky top-0 z-50 transition-colors duration-300 overflow-safe">
            <div className="mx-auto flex items-center justify-between" style={{ maxWidth: 'clamp(100vw, 95vw, 1440px)' }}>
                <div className="flex items-center gap-4 sm:gap-6 lg:gap-8">
                    <Link to="/" className="flex items-center space-fluid-4 touch-target">
                        <div className="size-8 text-primary">
                            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path clipRule="evenodd" d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z" fill="currentColor" fillRule="evenodd"></path>
                            </svg>
                        </div>
                        <h2 className="text-lg sm:text-xl font-bold leading-tight tracking-tight dark:text-white">TypeCoverage</h2>
                    </Link>
                    <nav className="hidden md:flex items-center gap-4 lg:gap-6">
                        <Link className="text-fluid-sm font-semibold text-slate-600 hover:text-primary dark:text-slate-400 dark:hover:text-white transition-colors" to="/">Calculator</Link>
                        <Link className="text-fluid-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-white transition-colors" to="/pokedex">Pokedex</Link>
                        <Link className="text-fluid-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-white transition-colors" to="/teamBuilder">Team Builder</Link>
                        <a className="text-fluid-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-white transition-colors" href="#">Abilities</a>
                    </nav>
                </div>
                <div className="flex flex-1 justify-end gap-2 sm:gap-4 max-w-xl ml-4 sm:ml-8">
                    <div className="flex-1 hidden sm:block relative" ref={searchRef}>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <span className="material-symbols-outlined text-xl">search</span>
                            </div>
                            <input
                                className="block w-full pl-10 pr-3 py-2 border-none bg-slate-100 dark:bg-[#233648] rounded-full text-fluid-sm placeholder-slate-500 focus:ring-2 focus:ring-primary dark:text-white outline-none transition-colors duration-300"
                                placeholder="Search Pokémon..."
                                type="text"
                                value={searchQuery}
                                onChange={handleSearch}
                                onFocus={() => {
                                    if (searchQuery.length > 0) setIsSearchOpen(true);
                                }}
                            />
                        </div>

                        {/* Search Results Dropdown */}
                        {isSearchOpen && searchResults.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#192633] border border-slate-200 dark:border-[#324d67] rounded-xl shadow-xl max-h-[300px] overflow-y-auto z-50 animate-fade-in-down custom-scrollbar overflow-safe" style={{ maxWidth: 'min(calc(100vw - 4rem), 400px)' }}>
                                {searchResults.map(pokemon => (
                                    <Link
                                        to={`/pokedex?search=${pokemon.name}`}
                                        key={pokemon.id}
                                        onClick={() => setIsSearchOpen(false)}
                                        className="flex items-center space-fluid-3 p-3 hover:bg-slate-50 dark:hover:bg-[#233648] border-b border-slate-100 dark:border-[#233648] last:border-0 transition-colors cursor-pointer touch-target"
                                    >
                                        <div className="size-8 flex items-center justify-center bg-slate-100 dark:bg-[#101922] rounded-lg p-1">
                                            <img src={pokemon.image} alt={pokemon.name} className="size-full object-contain pixelated aspect-sprite" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-fluid-sm font-bold text-slate-700 dark:text-white capitalize leading-tight">{pokemon.name}</span>
                                            <span className="text-fluid-xs text-slate-400 dark:text-slate-500">#{String(pokemon.id).padStart(4, '0')}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2 relative" ref={menuRef}>
                        {/* Mobile menu button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden flex items-center justify-center rounded-full size-10 bg-slate-100 dark:bg-[#233648] hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-white touch-target"
                        >
                            <span className="material-symbols-outlined text-[20px]">menu</span>
                        </button>

                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="hidden md:flex items-center justify-center rounded-full size-10 bg-slate-100 dark:bg-[#233648] hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-white touch-target"
                        >
                            <span className="material-symbols-outlined text-[20px] transition-transform duration-500" style={{ transform: isMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>settings</span>
                        </button>

                        {/* Settings Dropdown */}
                        {isMenuOpen && (
                            <div className="absolute top-12 right-0 w-64 bg-white dark:bg-[#192633] border border-slate-200 dark:border-[#324d67] rounded-xl shadow-xl p-4 z-50 animate-fade-in-down overflow-safe" style={{ maxWidth: 'min(calc(100vw - 4rem), 320px)' }}>
                                <h3 className="text-fluid-sm font-bold text-slate-900 dark:text-white mb-3">Settings</h3>
                                <div className="flex items-center justify-between">
                                    <span className="text-fluid-sm text-slate-600 dark:text-[#92adc9] flex items-center space-fluid-2">
                                        <span className="material-symbols-outlined text-lg">dark_mode</span>
                                        Dark Mode
                                    </span>
                                    {/* Toggle Switch */}
                                    <button
                                        onClick={toggleTheme}
                                        className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out touch-target ${theme === 'dark' ? 'bg-primary' : 'bg-slate-300'}`}
                                    >
                                        <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300 ease-in-out ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                    </button>
                                </div>
                            </div>
                        )}

                        <button className="flex items-center justify-center rounded-full size-10 bg-slate-100 dark:bg-[#233648] hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-white touch-target">
                            <span className="material-symbols-outlined text-[20px]">person</span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;