import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAuth } from "../../../Context/Context";
import { faBars } from "@fortawesome/free-solid-svg-icons";


interface NavbarProps {
    toggleSidebar: () => void;
}

function Navbar({ toggleSidebar }: NavbarProps) {
    const {user , logout }:any = useAuth();
    
    return (
        <div className="nav flex items-center text-white justify-between h-12 bg-blue-500 px-4 py-2 sticky top-0 z-50">
            <button 
                className="lg:hidden text-white mr-4 focus:outline-none"
                onClick={toggleSidebar}
                aria-label="Toggle Menu"
            >
                <FontAwesomeIcon icon={faBars} size="lg" />
            </button>
            <p>Welcom {user.name}</p>
            <button className='px-4 py-1 bg-blue-700 hover:bg-blue-800' title='تسجيل الخروج' onClick={()=> logout()}>تسجيل الخروج</button>
        </div>
    )
}

export default Navbar
