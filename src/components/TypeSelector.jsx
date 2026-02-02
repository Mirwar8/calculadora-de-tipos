
import { TYPES, TYPE_LIST } from '../utils/pokemonTypes';

const TypeSelector = ({ type1, type2, setType1, setType2 }) => {
    const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

    const handleType1Change = (e) => {
        const newType = e.target.value;
        setType1(newType);
        if (newType === type2) {
            setType2("none");
        }
    };

    const handleType2Change = (e) => {
        setType2(e.target.value);
    };

    return (
        <section className="bg-white dark:bg-[#1a2632] p-8 rounded-3xl border border-slate-200 dark:border-[#233648] shadow-sm">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">touch_app</span>
                Select Pokémon Types
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">

                {/* Type 1 Input */}
                <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-500 dark:text-slate-400 ml-1 uppercase tracking-widest">
                        Type 1 (Required)
                    </label>
                    <div className="relative">
                        <select
                            value={type1}
                            onChange={handleType1Change}
                            className={`w-full bg-slate-50 dark:bg-[#233648] border-none rounded-full py-4 px-6 text-lg font-bold appearance-none cursor-pointer focus:ring-2 focus:ring-primary ${TYPES[type1]?.color} text-white`}
                            style={{ backgroundImage: 'none' }} // Remove default arrow to use custom one
                        >
                            {TYPE_LIST.map((type) => (
                                <option key={type} value={type} className="bg-white text-slate-900 dark:bg-[#233648] dark:text-white">
                                    {capitalize(type)}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-white">
                            <span className="material-symbols-outlined">expand_more</span>
                        </div>
                    </div>
                </div>

                {/* Type 2 Input */}
                <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-500 dark:text-slate-400 ml-1 uppercase tracking-widest">
                        Type 2 (Optional)
                    </label>
                    <div className="relative">
                        <select
                            value={type2}
                            onChange={handleType2Change}
                            className={`w-full bg-slate-50 dark:bg-[#233648] border-none rounded-full py-4 px-6 text-lg font-bold appearance-none cursor-pointer focus:ring-2 focus:ring-primary ${type2 !== "none" ? TYPES[type2]?.color + ' text-white' : 'text-slate-900 dark:text-white'}`}
                            style={{ backgroundImage: 'none' }}
                        >
                            <option value="none" className="bg-white text-slate-900 dark:bg-[#233648] dark:text-white">None</option>
                            {TYPE_LIST.map((type) => (
                                <option
                                    key={type}
                                    value={type}
                                    disabled={type === type1}
                                    className="bg-white text-slate-900 dark:bg-[#233648] dark:text-white disabled:text-slate-300 dark:disabled:text-slate-600"
                                >
                                    {capitalize(type)}
                                </option>
                            ))}
                        </select>
                        <div className={`absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none ${type2 !== 'none' ? 'text-white' : 'text-slate-400'}`}>
                            <span className="material-symbols-outlined">expand_more</span>
                        </div>
                    </div>
                </div>

            </div>

            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-[#233648] flex flex-wrap gap-3">
                <span className="text-sm font-semibold text-slate-400 mr-2 self-center">Quick Presets:</span>
                <button onClick={() => { setType1('ghost'); setType2('steel') }} className="px-4 py-2 bg-slate-100 dark:bg-[#233648] hover:bg-primary/20 rounded-full text-xs font-bold transition-all">Gholdengo</button>
                <button onClick={() => { setType1('steel'); setType2('ghost') }} className="px-4 py-2 bg-slate-100 dark:bg-[#233648] hover:bg-primary/20 rounded-full text-xs font-bold transition-all">Aegislash</button>
                <button onClick={() => { setType1('dragon'); setType2('ghost') }} className="px-4 py-2 bg-slate-100 dark:bg-[#233648] hover:bg-primary/20 rounded-full text-xs font-bold transition-all">Dragapult</button>
                <button onClick={() => { setType1('fire'); setType2('none') }} className="ml-auto text-primary hover:underline text-sm font-bold">Reset Selection</button>
            </div>
        </section>
    );
};

export default TypeSelector;
