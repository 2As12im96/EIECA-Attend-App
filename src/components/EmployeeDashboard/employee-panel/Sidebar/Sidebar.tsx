import { faCalendarDays, faGaugeHigh, faGear, faMoneyBillWave, faTimes, faUser } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { NavLink } from "react-router-dom"
import { useAuth } from "../../../Context/Context"

interface AdminSideBarProps {
    isOpen: boolean;
    toggleSidebar: () => void;
}

function Sidebar({ isOpen, toggleSidebar }: AdminSideBarProps) {
    const {user} = useAuth();
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
        <div className={sidebarClasses}>
            <div className="bg-gray-800 text-white  fixed left-0 top-0 bottom-0 space-y-2 w-64">
                    <div className="bg-blue-600 h-12 flex items-center justify-between p-2">
                        <div className="flex items-center">
                            <img src="/image/logo.png" className="h-10 w-auto object-contain cursor-pointer" alt="logo" />
                            <h2 className="text-2xl text-center font-pacific ml-3">Employee MS</h2>
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
                        <NavLink to='/employee-dashboard' className={({ isActive }) => `${isActive ? "bg-blue-500" : ""} flex items-center space-x-4 block py-2.5 px-4 rounded`} end>
                            <li>
                                <FontAwesomeIcon icon={faGaugeHigh} />
                                <span>لوحة القيادة</span>
                            </li>
                        </NavLink>

                        <NavLink to={`/employee-dashboard/profile/${user?._id}`} className={({ isActive }) => `${isActive ? "bg-blue-500" : ""} flex items-center space-x-4 block py-2.5 px-4 rounded`}>
                            <li>
                                <FontAwesomeIcon icon={faUser}/>
                                <span>الملف الشخصى</span>
                            </li>
                        </NavLink>

                        <NavLink to={`/employee-dashboard/leaves/${user?._id}`} className={({ isActive }) => `${isActive ? "bg-blue-500" : ""} flex items-center space-x-4 block py-2.5 px-4 rounded`}>
                            <li>
                                <FontAwesomeIcon icon={faCalendarDays} />
                                <span>الإجازات</span>
                            </li>
                        </NavLink>

                        <NavLink to={`/employee-dashboard/salary/${user?._id}`} className={({ isActive }) => `${isActive ? "bg-blue-500" : ""} flex items-center space-x-4 block py-2.5 px-4 rounded`}>
                            <li>
                                <FontAwesomeIcon icon={faMoneyBillWave} />
                                <span>المرتبات</span>
                            </li>
                        </NavLink>

                        <NavLink to='/employee-dashboard/attendence' className={({ isActive }) => `${isActive ? "bg-blue-500" : ""} flex items-center space-x-4 block py-2.5 px-4 rounded`}>
                            <li>
                                <FontAwesomeIcon icon={faCalendarDays} />
                                <span>الحضور و الإنصراف</span>
                            </li>
                        </NavLink>


                        <NavLink to='/employee-dashboard/setting' className={({ isActive }) => `${isActive ? "bg-blue-500" : ""} flex items-center space-x-4 block py-2.5 px-4 rounded`}>
                            <li>
                                <FontAwesomeIcon icon={faGear} />
                                <span>الأعدادات</span>
                            </li>
                        </NavLink>

                    </ul>
                </div>
        </div>
    )
}

export default Sidebar
