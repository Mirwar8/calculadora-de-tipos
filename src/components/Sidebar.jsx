
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const Sidebar = () => {
    const location = useLocation();
    const { userData } = useUser();

    const getLinkClass = (path) => {
        const isActive = location.pathname === path;
        return isActive
            ? "flex items-center gap-3 px-4 py-3 rounded-full bg-primary text-white font-semibold shadow-lg shadow-primary/20 transition-all"
            : "flex items-center gap-3 px-4 py-3 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#233648] transition-colors";
    };

    return (
        <aside className="w-full lg:w-64 xl:w-72 2xl:w-80 border-r border-slate-200 dark:border-[#233648] p-3 sm:p-4 md:p-6 flex flex-col justify-between fixed left-0 top-[65px] h-[calc(100vh-65px)] overflow-safe z-[50] hidden lg:block">
            <div className="flex flex-col space-fluid-8">
                <div className="flex items-center space-fluid-3 p-3 bg-slate-50 dark:bg-[#1a2632] rounded-xl border border-slate-100 dark:border-[#233648]">
                    <div className="bg-primary/20 rounded-full size-12 flex items-center justify-center overflow-hidden flex-shrink-0 border-2 border-primary/10">
                        {userData.avatar ? (
                            <img src={userData.avatar} alt="User Avatar" className="size-full object-cover" />
                        ) : (
                            <span className="material-symbols-outlined text-primary text-2xl">account_circle</span>
                        )}
                    </div>
                    <div className="flex flex-col min-w-0 flex-1 ml-1">
                        <h3 className="font-black text-fluid-sm truncate dark:text-white leading-tight">{userData.name}</h3>
                        <p className="text-[10px] font-bold text-slate-500 dark:text-[#92adc9] truncate uppercase tracking-tighter opacity-80">{userData.rank}</p>
                    </div>
                </div>
                <nav className="flex flex-col space-fluid-2">
                    <Link className={getLinkClass('/')} to="/">
                        <span className="material-symbols-outlined text-fluid-lg">calculate</span>
                        <span className="text-fluid-sm">Type Calculator</span>
                    </Link>
                    <Link className={getLinkClass('/pokedex')} to="/pokedex">
                        <span className="material-symbols-outlined text-fluid-lg">menu_book</span>
                        <span className="text-fluid-sm">Pokédex</span>
                    </Link>
                    <Link className={getLinkClass('/teamBuilder')} to="/teamBuilder">
                        <span className="material-symbols-outlined text-fluid-lg">group_work</span>
                        <span className="text-fluid-sm">Team Builder</span>
                    </Link>
                    <a className="flex items-center space-fluid-3 px-4 py-3 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#233648] transition-colors touch-target" href="#">
                        <span className="material-symbols-outlined text-fluid-lg">analytics</span>
                        <span className="text-fluid-sm">Move Analytics</span>
                    </a>
                    <a className="flex items-center space-fluid-3 px-4 py-3 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#233648] transition-colors touch-target" href="#">
                        <span className="material-symbols-outlined text-fluid-lg">bolt</span>
                        <span className="text-fluid-sm">Damage Calc</span>
                    </a>
                    <a className="flex items-center space-fluid-3 px-4 py-3 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#233648] transition-colors touch-target" href="#">
                        <span className="material-symbols-outlined text-fluid-lg">history</span>
                        <span className="text-fluid-sm">Recent Lookups</span>
                    </a>
                </nav>
            </div>
            <div className="mt-auto pt-6 sm:pt-8">
                <div className="bg-primary/10 rounded-2xl p-4 border border-primary/20 overflow-safe">
                    <p className="text-fluid-xs font-bold text-primary uppercase tracking-wider mb-2">Premium Feature</p>
                    <p className="text-fluid-sm mb-4 dark:text-slate-300">Unlock advanced type synergy and meta-prediction tools.</p>
                    <button className="w-full py-2 bg-primary hover:bg-primary/90 text-white text-fluid-xs font-bold rounded-full transition-all touch-target">
                        Upgrade Pro
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
