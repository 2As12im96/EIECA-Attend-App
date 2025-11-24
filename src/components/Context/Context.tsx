import axios from 'axios';
import { createContext, useState, useContext, type ReactNode, useEffect } from 'react';
import type { AuthContextType, UserType } from '../Types/type';
import { Url } from '../../utils/Url';

const UserContext = createContext<AuthContextType>({ user: null, login: () => {}, logout: () => {} });

const AuthContext = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserType>(null);
    const [loading, setLoading] = useState<boolean>(true);
    useEffect(()=>{
        const verifyUser = async()=>{
            try{
                const token = localStorage.getItem("token");
                if(token){
                    const response = await axios.get(`${Url}/verify` ,{ 
                            headers:{
                                Authorization: `Bearer ${token}`,
                            }
                        }
                    );
                    if(response.data.success){
                        setUser(response.data.user);
                    }
                }else{
                    setUser(null);
                    setLoading(false);
                }
            }
            catch(error){
                if (axios.isAxiosError(error) && error.response && !error.response.data?.error) {
                    setUser(null);
                }
                console.error("خطأ فى التحقق:", error);
            }
            finally{
                setLoading(false);
            }
        }
        verifyUser();
    },[])
    const login = (userData: UserType) => {
        setUser(userData);
    };
    const logout = () => {
        setUser(null);
        localStorage.removeItem("token");
    };

    return(
        <UserContext.Provider value={{user , login , logout , loading}}>
            {children}
        </UserContext.Provider>
    )
}
export const useAuth = ()=> useContext(UserContext);
export default AuthContext;

