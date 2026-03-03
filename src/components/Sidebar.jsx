
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const Sidebar = () => {
    const location = useLocation();
    const { userData } = useUser();

    const getLinkClass = (path) => {
        const isActive = location.pathname === path;
        return isActive
            ? "flex items-center gap-3 px-3 py-3 rounded-full bg-primary text-white font-semibold shadow-lg shadow-primary/20 transition-all duration-300"
            : "flex items-center gap-3 px-3 py-3 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#233648] transition-all duration-300";
    };

    return (
        <aside className="sidebar-collapsed group/sidebar w-[72px] hover:w-72 border-r border-slate-200 dark:border-[#233648] p-3 flex flex-col justify-between fixed left-0 top-[65px] h-[calc(100vh-65px)] z-[50] hidden lg:flex transition-all duration-300 ease-in-out bg-white dark:bg-background-dark overflow-hidden">
            <div className="flex flex-col gap-4 flex-1 overflow-hidden">
                {/* User Profile */}
                <div className="flex items-center gap-3 p-1.5 bg-slate-50 dark:bg-[#1a2632] rounded-xl border border-slate-100 dark:border-[#233648] overflow-hidden min-h-[56px] relative">
                    <div className="bg-primary/20 rounded-full size-11 lg:size-10 flex items-center justify-center overflow-hidden flex-shrink-0 border-2 border-primary/10 mx-auto group-hover/sidebar:mx-0 transition-all duration-300 z-10">
                        {userData.avatar ? (
                            <img src={userData.avatar} alt="User Avatar" className="size-full object-cover" />
                        ) : (
                            <span className="material-symbols-outlined text-primary text-xl">account_circle</span>
                        )}
                    </div>
                    <div className="flex flex-col min-w-0 flex-1 opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 whitespace-nowrap absolute left-[60px] group-hover/sidebar:static">
                        <h3 className="font-black text-sm truncate dark:text-white leading-tight">{userData.name}</h3>
                        <p className="text-[10px] font-bold text-slate-500 dark:text-[#92adc9] truncate uppercase tracking-tighter opacity-80">{userData.rank}</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex flex-col gap-1 flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
                    <Link className={getLinkClass('/')} to="/">
                        <span className="material-symbols-outlined text-xl flex-shrink-0">calculate</span>
                        <span className="text-sm whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300">Type Calculator</span>
                    </Link>
                    <Link className={getLinkClass('/pokedex')} to="/pokedex">
                        <span className="material-symbols-outlined text-xl flex-shrink-0">menu_book</span>
                        <span className="text-sm whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300">Pokédex</span>
                    </Link>
                    <Link className={getLinkClass('/teamBuilder')} to="/teamBuilder">
                        <span className="material-symbols-outlined text-xl flex-shrink-0">group_work</span>
                        <span className="text-sm whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300">Team Builder</span>
                    </Link>
                    <Link className={getLinkClass('/emulator')} to="/emulator">
                        <span className="material-symbols-outlined text-xl flex-shrink-0">sports_esports</span>
                        <span className="text-sm whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300">GBA Emulator</span>
                    </Link>
                    <Link className={getLinkClass('/settings')} to="/settings">
                        <span className="material-symbols-outlined text-xl flex-shrink-0">settings</span>
                        <span className="text-sm whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300">Configuración</span>
                    </Link>

                    <div className="my-2 border-t border-slate-200 dark:border-[#233648]"></div>

                    <a className="flex items-center gap-3 px-3 py-3 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#233648] transition-all duration-300" href="#">
                        <span className="material-symbols-outlined text-xl flex-shrink-0">analytics</span>
                        <span className="text-sm whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300">Move Analytics</span>
                    </a>
                    <a className="flex items-center gap-3 px-3 py-3 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#233648] transition-all duration-300" href="#">
                        <span className="material-symbols-outlined text-xl flex-shrink-0">bolt</span>
                        <span className="text-sm whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300">Damage Calc</span>
                    </a>
                    <a className="flex items-center gap-3 px-3 py-3 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#233648] transition-all duration-300" href="#">
                        <span className="material-symbols-outlined text-xl flex-shrink-0">history</span>
                        <span className="text-sm whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300">Recent Lookups</span>
                    </a>
                </nav>
            </div>

            {/* Premium Section - always visible at bottom */}
            <div className="pt-4 flex-shrink-0">
                <div className="bg-primary/10 rounded-2xl p-3 border border-primary/20 overflow-hidden">
                    <div className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300">
                        <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">Premium Feature</p>
                        <p className="text-xs mb-3 dark:text-slate-300 whitespace-nowrap">Unlock advanced tools.</p>
                    </div>
                    <button className="w-full py-2 bg-primary hover:bg-primary/90 text-white text-[10px] font-bold rounded-full transition-all">
                        <span className="material-symbols-outlined text-sm group-hover/sidebar:hidden">star</span>
                        <span className="hidden group-hover/sidebar:inline">Upgrade Pro</span>
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
