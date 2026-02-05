import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { useUser } from '../context/UserContext';

const Header = () => {
    const { theme, toggleTheme } = useTheme();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showMobileSearch, setShowMobileSearch] = useState(false);
    const searchRef = useRef(null);
    const mobileMenuRef = useRef(null);
    const { userData, setIsEditModalOpen } = useUser();
    const [isScrolled, setIsScrolled] = useState(false);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsSearchOpen(false);
            }
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
                setIsMobileMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }, [isMobileMenuOpen]);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
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
        <header className={`border-b border-solid border-slate-200 dark:border-[#233648] bg-white dark:bg-background-dark px-4 sm:px-6 py-3 fixed top-0 left-0 right-0 z-[60] transition-all duration-300 ${isScrolled ? 'shadow-lg dark:shadow-black/20' : ''}`}>
            <div className="mx-auto flex items-center justify-between" style={{ maxWidth: 'min(95vw, 1440px)' }}>
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
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#192633] border border-slate-200 dark:border-[#324d67] rounded-xl shadow-xl max-h-[300px] overflow-y-auto z-50 animate-fade-in-down custom-scrollbar" style={{ maxWidth: 'min(calc(100vw - 4rem), 400px)' }}>
                                {searchResults.map(pokemon => (
                                    <Link
                                        to={`/pokemon/${pokemon.id}`}
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

                    <div className="flex gap-1 sm:gap-2 relative" ref={menuRef}>
                        {/* Mobile Search Toggle */}
                        <button
                            onClick={() => setShowMobileSearch(!showMobileSearch)}
                            className="sm:hidden flex items-center justify-center rounded-full size-10 bg-slate-100 dark:bg-[#233648] hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-white touch-target"
                        >
                            <span className="material-symbols-outlined text-[20px]">{showMobileSearch ? 'close' : 'search'}</span>
                        </button>

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
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
                            <div className="absolute top-12 right-0 w-64 bg-white dark:bg-[#192633] border border-slate-200 dark:border-[#324d67] rounded-xl shadow-xl p-4 z-50 animate-fade-in-down" style={{ maxWidth: 'min(calc(100vw - 4rem), 320px)' }}>
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

                        <button
                            onClick={() => setIsEditModalOpen(true)}
                            className="flex items-center justify-center rounded-full size-10 bg-slate-100 dark:bg-[#233648] hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-white touch-target overflow-hidden border-2 border-transparent hover:border-primary/50"
                        >
                            {userData.avatar ? (
                                <img src={userData.avatar} alt="User Avatar" className="size-full object-cover" />
                            ) : (
                                <span className="material-symbols-outlined text-[20px]">person</span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Overlays */}
            <MobileSearchOverlay
                show={showMobileSearch}
                onShow={setShowMobileSearch}
                searchQuery={searchQuery}
                handleSearch={handleSearch}
                searchRef={searchRef}
                isSearchOpen={isSearchOpen}
                searchResults={searchResults}
                setIsSearchOpen={setIsSearchOpen}
            />
            <MobileMenuDrawer
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
                userData={userData}
            />
        </header>
    );
};

// Mobile Search Overlay Overlay
const MobileSearchOverlay = ({ show, onShow, searchQuery, handleSearch, searchRef, isSearchOpen, searchResults, setIsSearchOpen }) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 z-[100] bg-white dark:bg-background-dark animate-fade-in md:hidden">
            <div className="p-4 flex flex-col h-full">
                <div className="flex items-center gap-2 mb-4">
                    <button onClick={() => onShow(false)} className="size-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-[#233648]">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div className="flex-1 relative" ref={searchRef}>
                        <input
                            autoFocus
                            className="w-full bg-slate-100 dark:bg-[#233648] py-3 pl-10 pr-4 rounded-xl outline-none dark:text-white font-bold"
                            placeholder="Search Pokémon..."
                            type="text"
                            value={searchQuery}
                            onChange={handleSearch}
                        />
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {searchQuery.length > 0 && searchResults.length === 0 && (
                        <p className="text-center py-8 text-slate-400 italic">No Pokémon found for "{searchQuery}"</p>
                    )}
                    {searchResults.map(pokemon => (
                        <Link
                            to={`/pokemon/${pokemon.id}`}
                            key={pokemon.id}
                            onClick={() => { onShow(false); setIsSearchOpen(false); }}
                            className="flex items-center gap-4 p-4 border-b border-slate-100 dark:border-[#233648] active:bg-slate-50 dark:active:bg-[#233648]"
                        >
                            <div className="size-12 flex items-center justify-center bg-slate-100 dark:bg-[#101922] rounded-xl p-2">
                                <img src={pokemon.image} alt={pokemon.name} className="size-full object-contain pixelated" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-fluid-sm font-black text-slate-800 dark:text-white capitalize leading-tight">{pokemon.name}</span>
                                <span className="text-fluid-xs text-slate-400 dark:text-slate-500 font-bold">#{String(pokemon.id).padStart(4, '0')}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Mobile Navigation Drawer
const MobileMenuDrawer = ({ isOpen, onClose, userData }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] md:hidden overflow-hidden">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}></div>

            {/* Drawer Content */}
            <div className="absolute top-0 left-0 w-[280px] h-full bg-white dark:bg-[#1a2632] shadow-2xl animate-slide-in-left flex flex-col">
                <div className="p-6 border-b border-slate-100 dark:border-[#233648] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border border-primary/20">
                            {userData.avatar ? (
                                <img src={userData.avatar} alt="User" className="size-full object-cover" />
                            ) : (
                                <span className="material-symbols-outlined text-primary text-xl">account_circle</span>
                            )}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <h3 className="font-black text-sm truncate dark:text-white">{userData.name}</h3>
                            <p className="text-[10px] uppercase font-bold text-primary tracking-wider">{userData.rank}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <nav className="p-4 flex flex-col gap-2 overflow-y-auto">
                    {[
                        { to: '/', icon: 'calculate', label: 'Type Calculator' },
                        { to: '/pokedex', icon: 'menu_book', label: 'Pokédex' },
                        { to: '/teamBuilder', icon: 'group_work', label: 'Team Builder' },
                        { to: '#', icon: 'analytics', label: 'Move Analytics' },
                        { to: '#', icon: 'bolt', label: 'Damage Calc' },
                        { to: '#', icon: 'history', label: 'Recent Lookups' }
                    ].map(link => (
                        <Link
                            key={link.to}
                            to={link.to}
                            onClick={onClose}
                            className="flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-slate-50 dark:hover:bg-[#233648] text-slate-600 dark:text-slate-300 transition-colors"
                        >
                            <span className="material-symbols-outlined text-xl">{link.icon}</span>
                            <span className="text-sm font-bold">{link.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="mt-auto p-4">
                    <div className="bg-primary/10 rounded-2xl p-4 border border-primary/20">
                        <p className="text-[10px] font-black text-primary uppercase mb-1">Premium</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">Unlock advanced tools.</p>
                        <button className="w-full py-2 bg-primary text-white text-[10px] font-black rounded-lg uppercase">Upgrade</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Header;