import { useTheme } from '../hooks/useTheme';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="flex items-center justify-center rounded-full size-10 bg-slate-100 dark:bg-[#233648] hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-white touch-target"
            aria-label="Toggle theme"
        >
            <span className="material-symbols-outlined text-[20px]">
                {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
        </button>
    );
};

export default ThemeToggle;