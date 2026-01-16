import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../../Context/Context";
import NotificationBell from "../../../Inventory/NotificationBell";

interface NavbarProps { toggleSidebar: () => void; }

function Navbar({ toggleSidebar }: NavbarProps) {
    const { user, logout } = useAuth(); // استخدام logout من الـ Context المصحح
    
    return (
        <div className="nav flex items-center text-white justify-between h-12 bg-blue-600 px-4 py-2 sticky top-0 z-50">
            <div className="flex items-center gap-4">
                <button className="lg:hidden text-white focus:outline-none" onClick={toggleSidebar}>
                    <FontAwesomeIcon icon={faBars} size="lg" />
                </button>
                <p className="font-bold text-sm">مرحباً، {user?.name}</p>
            </div>

            <div className="flex items-center gap-6">
                <NotificationBell />
                <button 
                    className="px-4 py-1 bg-blue-500 hover:bg-blue-600 rounded-md transition-colors text-xs font-bold" 
                    onClick={logout} // ستعمل الآن بشكل صحيح
                >
                    <FontAwesomeIcon icon={faSignOutAlt} className="ml-1" />
                    تسجيل الخروج
                </button>
            </div>
        </div>
    );
}

export default Navbar;