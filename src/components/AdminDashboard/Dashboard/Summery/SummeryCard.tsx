import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

function SummeryCard({icon  , text , number , color}:any) {
  return (
    <div className="rounded flex bg-white">
        <div className={`text-3xl flex justify-center items-center ${color} text-white px-4`}>
            <FontAwesomeIcon icon={icon} />
        </div>
        <div className="pl-4 py-1">
            <p className="text-lg font-semibold">{text}</p>
            <p className="text-xl font-bold">{number}</p>
        </div>
    </div>
  )
}

export default SummeryCard
