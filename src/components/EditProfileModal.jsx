
import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';

const EditProfileModal = () => {
    const { userData, updateProfile, isEditModalOpen, setIsEditModalOpen } = useUser();
    const [name, setName] = useState('');
    const [rank, setRank] = useState('');
    const [avatar, setAvatar] = useState(null);
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        if (isEditModalOpen) {
            setName(userData.name);
            setRank(userData.rank);
            setPreview(userData.avatar);
        }
    }, [isEditModalOpen, userData]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert('La imagen no debe superar 2MB');
                return;
            }
            if (!file.type.startsWith('image/')) {
                alert('Solo se permiten archivos de imagen');
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                setPreview(event.target.result);
                setAvatar(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        updateProfile({
            name: name.trim() || 'Pro Trainer',
            rank: rank.trim() || 'Master Ball',
            avatar: avatar || userData.avatar
        });
        setIsEditModalOpen(false);
    };

    if (!isEditModalOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/70 flex justify-center items-center z-[9999] p-4 animate-fade-in"
            onClick={() => setIsEditModalOpen(false)}
        >
            <div
                className="bg-white dark:bg-[#1a2632] p-6 sm:p-8 rounded-2xl max-w-md w-full shadow-2xl animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl sm:text-2xl font-black dark:text-white">Editar Perfil</h2>
                    <button
                        onClick={() => setIsEditModalOpen(false)}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                    >
                        <span className="material-symbols-outlined text-2xl">close</span>
                    </button>
                </div>

                <div className="space-y-5">
                    <div className="flex flex-col items-center gap-4 mb-2">
                        <div className="relative group">
                            <div className="size-24 rounded-full bg-slate-100 dark:bg-[#233648] flex items-center justify-center overflow-hidden border-4 border-primary/20">
                                {preview ? (
                                    <img src={preview} alt="Preview" className="size-full object-cover" />
                                ) : (
                                    <span className="material-symbols-outlined text-5xl text-primary/40">account_circle</span>
                                )}
                            </div>
                            <label className="absolute bottom-0 right-0 bg-primary text-white size-8 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-primary/90 transition-all">
                                <span className="material-symbols-outlined text-sm">edit</span>
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                            </label>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Avatar (Recomendado 20x20 o superior)</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Nombre</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Pro Trainer"
                            maxLength={50}
                            className="w-full bg-slate-50 dark:bg-[#233648] border-none rounded-xl py-3 px-4 text-fluid-sm focus:ring-2 focus:ring-primary outline-none dark:text-white font-bold"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Rango</label>
                        <input
                            type="text"
                            value={rank}
                            onChange={(e) => setRank(e.target.value)}
                            placeholder="Master Ball"
                            maxLength={30}
                            className="w-full bg-slate-50 dark:bg-[#233648] border-none rounded-xl py-3 px-4 text-fluid-sm focus:ring-2 focus:ring-primary outline-none dark:text-white font-bold"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={handleSave}
                            className="flex-1 bg-primary text-white py-3 rounded-xl font-bold text-fluid-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                        >
                            Guardar Cambios
                        </button>
                        <button
                            onClick={() => setIsEditModalOpen(false)}
                            className="px-6 bg-slate-100 dark:bg-[#233648] text-slate-600 dark:text-slate-300 py-3 rounded-xl font-bold text-fluid-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditProfileModal;
