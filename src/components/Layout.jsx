
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = () => {
    return (
        <div className="min-h-screen flex flex-col responsive-container overflow-safe">
            <Header />
            <div className="w-full mx-auto px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 2xl:px-10 3xl:px-12 flex flex-col lg:flex-row flex-1" style={{ maxWidth: 'clamp(100vw, 95vw, 2560px)' }}>
                <Sidebar />
                <main className="flex-1 p-2 sm:p-3 md:p-4 lg:p-6 xl:p-8 2xl:p-10 overflow-y-auto w-full flex-zoom-safe">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
