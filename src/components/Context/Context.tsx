import axios from 'axios';
import { createContext, useState, useContext, type ReactNode, useEffect } from 'react';
import type { AuthContextType, UserType } from '../Types/type';
import { Url } from '../../utils/Url';

const UserContext = createContext<AuthContextType>({ 
    user: null, 
    login: () => {}, 
    logout: () => {}, 
    loading: true 
});

const AuthContext = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserType>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const verifyUser = async () => {
            try {
                const token = localStorage.getItem("token");
                if (token) {
                    const response = await axios.get(`${Url}/verify`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    if (response.data.success) {
                        const basicUser = response.data.user;

                        if (basicUser.role === 'employee') {
                            try {
                                const empRes = await axios.get(`${Url}/employee/my-profile`, {
                                    headers: { Authorization: `Bearer ${token}` }
                                });
                                
                                if (empRes.data.success) {
                                    const empData = empRes.data.employee;
                                    const inventoryPerms = empData.inventoryPermissions?.accessType 
                                        ? empData.inventoryPermissions 
                                        : {
                                            accessType: empData.inventoryPermissions?.canManage ? 'manage' : 
                                                       (empData.inventoryPermissions?.canView ? 'view' : 'none'),
                                            accessibleBranches: empData.inventoryPermissions?.accessibleBranches || 'Cairo'
                                          };

                                    setUser({
                                        ...basicUser,
                                        branch: empData.branch,
                                        inventoryPermissions: inventoryPerms
                                    });
                                } else {
                                    setUser(basicUser);
                                }
                            } catch (empErr) {
                                console.error("فشل في جلب بيانات الموظف الإضافية:", empErr);
                                setUser(basicUser);
                            }
                        } else {
                            // في حالة الـ Admin
                            setUser(basicUser);
                        }
                    }
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error("خطأ في التحقق:", error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        verifyUser();
    }, []);

    const login = (userData: UserType) => {
        setUser(userData);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("token");
    };

    return (
        <UserContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </UserContext.Provider>
    );
};

export const useAuth = () => useContext(UserContext);
export default AuthContext;