import { Navigate } from "react-router-dom";
import { useAuth } from "../components/Context/Context";



function RouleBaseRoute({children , requiredRole}:any) {
    const {user , loading}:any = useAuth();
    if(loading){
        return <div>Loading...</div>;
    }
    if(!requiredRole.includes(user.role)){
        <Navigate to='/unauthorized'/>
    }
    return user ? children : <Navigate to="/login" />;
}

export default RouleBaseRoute
