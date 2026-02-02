
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <div className="max-w-[1440px] mx-auto w-full flex flex-col lg:flex-row flex-1">
                <Sidebar />
                <main className="flex-1 p-6 lg:p-10 overflow-y-auto w-full">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
