import { Navigate } from "react-router-dom";
import { useAuth } from "../components/Context/Context";


function PrivatedRoutes({children}:any) {
    const {user , loading}:any = useAuth();
    if(loading){
        return <div>Loading...</div>;
    }
    return user ? children : <Navigate to="/login" />;
}

export default PrivatedRoutes
