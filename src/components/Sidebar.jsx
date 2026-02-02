
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
    const location = useLocation();

    const getLinkClass = (path) => {
        const isActive = location.pathname === path;
        return isActive
            ? "flex items-center gap-3 px-4 py-3 rounded-full bg-primary text-white font-semibold shadow-lg shadow-primary/20 transition-all"
            : "flex items-center gap-3 px-4 py-3 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#233648] transition-colors";
    };

    return (
        <aside className="w-full lg:w-72 border-r border-slate-200 dark:border-[#233648] p-6 flex flex-col justify-between hidden lg:flex sticky top-[65px] h-[calc(100vh-65px)]">
            <div className="flex flex-col gap-8">
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-[#1a2632] rounded-xl border border-slate-100 dark:border-[#233648]">
                    <div className="bg-primary/20 rounded-full size-12 flex items-center justify-center overflow-hidden">
                        <span className="material-symbols-outlined text-primary text-2xl">account_circle</span>
                    </div>
                    <div className="flex flex-col">
                        <h3 className="font-bold text-sm">Pro Trainer</h3>
                        <p className="text-xs text-slate-500 dark:text-[#92adc9]">Rank: Master Ball</p>
                    </div>
                </div>
                <nav className="flex flex-col gap-2">
                    <Link className={getLinkClass('/')} to="/">
                        <span className="material-symbols-outlined">calculate</span>
                        <span className="text-sm">Type Calculator</span>
                    </Link>
                    <Link className={getLinkClass('/pokedex')} to="/pokedex">
                        <span className="material-symbols-outlined">menu_book</span>
                        <span className="text-sm">Pokédex</span>
                    </Link>
                    <Link className={getLinkClass('/teamBuilder')} to="/teamBuilder">
                        <span className="material-symbols-outlined">group_work</span>
                        <span className="text-sm">Team Builder</span>
                    </Link>
                    <a className="flex items-center gap-3 px-4 py-3 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#233648] transition-colors" href="#">
                        <span className="material-symbols-outlined">analytics</span>
                        <span className="text-sm">Move Analytics</span>
                    </a>
                    <a className="flex items-center gap-3 px-4 py-3 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#233648] transition-colors" href="#">
                        <span className="material-symbols-outlined">bolt</span>
                        <span className="text-sm">Damage Calc</span>
                    </a>
                    <a className="flex items-center gap-3 px-4 py-3 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#233648] transition-colors" href="#">
                        <span className="material-symbols-outlined">history</span>
                        <span className="text-sm">Recent Lookups</span>
                    </a>
                </nav>
            </div>
            <div className="mt-auto pt-8">
                <div className="bg-primary/10 rounded-2xl p-4 border border-primary/20">
                    <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Premium Feature</p>
                    <p className="text-sm mb-4 dark:text-slate-300">Unlock advanced type synergy and meta-prediction tools.</p>
                    <button className="w-full py-2 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-full transition-all">
                        Upgrade Pro
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
