import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import { UserProvider } from '../context/UserContext';
import EditProfileModal from './EditProfileModal';

const Layout = () => {
    console.log('Layout: rendering');
    return (
        <UserProvider>
            <div className="min-h-screen bg-white dark:bg-background-dark text-slate-900 transition-colors duration-300 flex flex-col">
                <Header />
                <div className="mx-auto flex flex-1" style={{ maxWidth: 'min(98vw, 1920px)' }}>
                    <Sidebar />
                    <main className="flex-1 w-full px-4 sm:px-6 md:px-8 pt-20 sm:pt-24 lg:pt-28 pb-6 sm:pb-8 lg:pb-10 max-w-full overflow-hidden lg:ml-64 xl:ml-72 2xl:ml-80 flex flex-col">
                        <div className="flex-1">
                            <Outlet />
                        </div>
                        {/* Footer placed inside main to inherit the layout container bounds and sidebar margins */}
                        <div className="mt-20 -mx-4 sm:-mx-6 md:-mx-8 -mb-6 sm:-mb-8 lg:-mb-10">
                            <Footer />
                        </div>
                    </main>
                </div>
                <EditProfileModal />
            </div>
        </UserProvider>
    );
};

export default Layout;
