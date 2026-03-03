import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import { UserProvider } from '../context/UserContext';
import EditProfileModal from './EditProfileModal';

const Layout = () => {
    return (
        <UserProvider>
            <div className="min-h-screen bg-white dark:bg-background-dark text-slate-900 transition-colors duration-300 flex flex-col">
                <Header />
                <div className="flex flex-1 w-full">
                    <Sidebar />
                    <main className="flex-1 w-full px-4 sm:px-6 md:px-8 pt-20 sm:pt-24 lg:pt-28 pb-6 sm:pb-8 lg:pb-10 max-w-full overflow-hidden lg:ml-[72px] flex flex-col">
                        <div className="flex-1 mx-auto w-full px-2 sm:px-4 lg:px-8">
                            <Outlet />
                        </div>
                    </main>
                </div>
                {/* Footer outside main for full-width spanning */}
                <Footer />
                <EditProfileModal />
            </div>
        </UserProvider>
    );
};

export default Layout;
