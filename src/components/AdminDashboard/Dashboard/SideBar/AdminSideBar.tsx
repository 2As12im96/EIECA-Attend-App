import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBuilding, faCalendarDays, faGaugeHigh, faGear, faMoneyBillWave, faTimes, faUsers } from "@fortawesome/free-solid-svg-icons";


interface AdminSideBarProps {
    isOpen: boolean;
    toggleSidebar: () => void;
}

function AdminSideBar({ isOpen, toggleSidebar }: AdminSideBarProps) {
    const sidebarClasses = `
        bg-gray-800 text-white 
        h-screen z-50
        fixed left-0 top-0
        w-full
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:w-64 
        lg:translate-x-0 
    `;
    return (
        <>
            <div className={sidebarClasses}>
                <div className="bg-blue-600 h-12 flex items-center justify-between p-2">
                    <div className="flex items-center">
                        <img src="/image/logo.png" className="h-10 w-auto object-contain cursor-pointer" alt="EIECA" />
                        <h2 className="text-2xl text-center font-pacific ml-3">EIECA MS</h2>
                    </div>

                    <button 
                        className="lg:hidden text-white focus:outline-none"
                        onClick={toggleSidebar}
                        aria-label="Close Menu"
                    >
                        <FontAwesomeIcon icon={faTimes} size="lg" />
                    </button>
                </div>
                <ul className="lg:block" onClick={toggleSidebar}>
                    <NavLink to='/admin-dashboard' className={({ isActive }) => `${isActive ? "bg-blue-500" : ""} flex items-center space-x-4 block py-2.5 px-4 rounded`} end>
                        <li>
                            <FontAwesomeIcon icon={faGaugeHigh} />
                            <span className="ml-3">لوحة التحكم</span>
                        </li>
                    </NavLink>
                    <NavLink to='/admin-dashboard/employees' className={({ isActive }) => `${isActive ? "bg-blue-500" : ""} flex items-center space-x-4 block py-2.5 px-4 rounded`}>
                        <li>
                            <FontAwesomeIcon icon={faUsers} />
                            <span className="ml-3">الموظفين</span>
                        </li>
                    </NavLink>

                    <NavLink to='/admin-dashboard/admin-list' className={({ isActive }) => `${isActive ? "bg-blue-500" : ""} flex items-center space-x-4 block py-2.5 px-4 rounded`}>
                        <li>
                            <FontAwesomeIcon icon={faUsers} />
                            <span className="ml-3">Admins</span>
                        </li>
                    </NavLink>

                    <NavLink to='/admin-dashboard/departments' className={({ isActive }) => `${isActive ? "bg-blue-500" : ""} flex items-center space-x-4 block py-2.5 px-4 rounded`}>
                        <li>
                            <FontAwesomeIcon icon={faBuilding} />
                            <span>الأقسام</span>
                        </li>
                    </NavLink>
                    <NavLink to='/admin-dashboard/leaves' className={({ isActive }) => `${isActive ? "bg-blue-500" : ""} flex items-center space-x-4 block py-2.5 px-4 rounded`}>
                        <li>
                            <FontAwesomeIcon icon={faCalendarDays} />
                            <span>الإجازات</span>
                        </li>
                    </NavLink>
                    <NavLink to='/admin-dashboard/salary/add' className={({ isActive }) => `${isActive ? "bg-blue-500" : ""} flex items-center space-x-4 block py-2.5 px-4 rounded`}>
                        <li>
                            <FontAwesomeIcon icon={faMoneyBillWave} />
                            <span>المرتبات</span>
                        </li>
                    </NavLink>

                    <NavLink to='/admin-dashboard/attendence' className={({ isActive }) => `${isActive ? "bg-blue-500" : ""} flex items-center space-x-4 py-2.5 px-4 rounded`}>
                        <li>
                            <FontAwesomeIcon icon={faCalendarDays} />
                            <span>الحضور و الإنصراف</span>
                        </li>
                    </NavLink>

                    <NavLink to='/admin-dashboard/settings' className={({ isActive }) => `${isActive ? "bg-blue-500" : ""} flex items-center space-x-4 block py-2.5 px-4 rounded`}>
                        <li>
                            <FontAwesomeIcon icon={faGear} />
                            <span>الأعدادات</span>
                        </li>
                    </NavLink>
                </ul>
            </div>
            {isOpen && (
                <div 
                    onClick={toggleSidebar}
                    className="fixed inset-0 bg-black opacity-50 z-40 lg:hidden"
                ></div>
            )}
        </>
    )
}

export default AdminSideBar
