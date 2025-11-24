import { Outlet } from "react-router-dom";
import AdminSideBar from "./Dashboard/SideBar/AdminSideBar";
import Navbar from "./Dashboard/Navbar/Navbar";
import { useState } from "react";


function AdminDashboard() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };
    return (
      <div className="flex h-screen bg-gray-100"> 
            <AdminSideBar 
                isOpen={isSidebarOpen} 
                toggleSidebar={toggleSidebar}
            />
            <div className={`
                flex flex-col flex-1 overflow-y-auto h-screen
                lg:ml-64 
            `}>
                <Navbar 
                    toggleSidebar={toggleSidebar} 
                />
                <main className="pt-2"> 
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default AdminDashboard
