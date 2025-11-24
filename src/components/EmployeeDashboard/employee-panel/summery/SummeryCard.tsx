import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useAuth } from "../../../Context/Context"

function SummeryCard({icon , color}:any) {
    const {user} =useAuth();
    return (
        <div className="rounded flex bg-white p-2">
            <div className={`rounded rounded-md text-3xl flex justify-center items-center ${color} text-white px-4`}>
                <FontAwesomeIcon icon={icon} />
            </div>
            <div className="pl-4 py-1">
                <p className="text-lg font-semibold">مرحبًا بعودتك</p>
                <p className="text-lg font-bold text-blue-600">{user?.name}</p>
            </div>
        </div>
    )
}

export default SummeryCard
