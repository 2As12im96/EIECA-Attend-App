import { Outlet } from "react-router-dom"
import Sidebar from "./employee-panel/Sidebar/Sidebar"
import Navbar from "../AdminDashboard/Dashboard/Navbar/Navbar"
import { useState } from "react";

function EmployeeDashboard() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };
    return (
        <div className="flex h-screen bg-gray-100">
          <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar}/>
          <div className={`
                flex flex-col flex-1 overflow-y-auto h-screen
                lg:ml-64 
            `}>
                <Navbar 
                    toggleSidebar={toggleSidebar} 
                />
                <main className="p-4 pt-12 lg:pt-4"> 
                    <Outlet />
                </main>
            </div>
      </div>
    )
}

export default EmployeeDashboard
