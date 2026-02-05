
import { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [userData, setUserData] = useState({
        name: 'Pro Trainer',
        rank: 'Master Ball',
        avatar: null
    });
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        const savedData = localStorage.getItem('usuarioData');
        if (savedData) {
            try {
                setUserData(JSON.parse(savedData));
            } catch (error) {
                console.error('Error parsing saved user data:', error);
            }
        }
    }, []);

    const updateProfile = (newData) => {
        const updated = { ...userData, ...newData };
        setUserData(updated);
        localStorage.setItem('usuarioData', JSON.stringify(updated));
    };

    return (
        <UserContext.Provider value={{ userData, updateProfile, isEditModalOpen, setIsEditModalOpen }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
