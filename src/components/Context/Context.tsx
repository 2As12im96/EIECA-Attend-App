import axios from 'axios';
import { createContext, useState, useContext, type ReactNode, useEffect } from 'react';
import { Url } from '../../utils/Url';

interface AuthContextType {
    user: any;
    login: (userData: any) => void;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const login = (userData: any) => {
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
        window.location.href = '/login';
    };

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
                            const empRes = await axios.get(`${Url}/employee/my-profile`, {
                                headers: { Authorization: `Bearer ${token}` }
                            });

                            if (empRes.data.success) {
                                const empData = empRes.data.employee;
                                const perms = empData.inventoryPermissions;

                                // تحديد نوع الوصول نصياً لتسهيل التعامل معه في الـ Sidebar
                                let accessType = 'none';
                                if (perms?.canManage) accessType = 'manage';
                                else if (perms?.canView) accessType = 'view';

                                setUser({
                                    ...basicUser,
                                    location: empData.branch?._id || empData.branch,
                                    locationName: empData.branch?.name || "مخزن غير محدد",
                                    designation: empData.designation,
                                    // توحيد البيانات هنا
                                    inventoryPermissions: {
                                        accessType: accessType,
                                        accessibleBranches: perms?.accessibleBranches || 'none'
                                    }
                                });
                            }
                        } else {
                            setUser(basicUser); 
                        }
                    }
                }
            } catch (error) {
                console.error("Auth Verification Error:", error);
                localStorage.removeItem("token");
            } finally {
                setLoading(false);
            }
        };
        verifyUser();
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};



// if (empRes.data.success) {
//     const empData = empRes.data.employee;
    
//     const branchMap: Record<string, string> = {
//         "695739d923381ec08a3e36f4": "مخزن القاهرة",
//         "69573a0f23381ec08a3e3703": "مخزن المنصورة"
//     };

//     const branchId = typeof empData.branch === 'object' ? empData.branch._id : empData.branch;
//     setUser({
//         ...basicUser,
//         location: branchId, 
//         locationName: branchMap[branchId] || empData.branch?.name || "مخزن غير محدد",
//         // location: empData.branch, 
//         // locationName: branchMap[empData.branch] || empData.branch,
//         designation: empData.designation,
//         inventoryPermissions: empData.inventoryPermissions 
//     });
// }

// if (empRes.data.success) {
//     const empData = empRes.data.employee;
    
//     // تأكد من وجود بيانات الفرع أولاً قبل الوصول للـ ID
//     const branchId = empData.branch?._id || empData.branch; 

//     const branchMap: Record<string, string> = {
//         "695739d923381ec08a3e36f4": "مخزن القاهرة",
//         "69573a0f23381ec08a3e3703": "مخزن المنصورة"
//     };

//     setUser({
//         ...basicUser,
//         location: branchId, 
//         // نستخدم اختصاراً لضمان عدم تمرير كائن للـ locationName
//         locationName: typeof branchId === 'string' ? (branchMap[branchId] || "مخزن غير معروف") : (empData.branch?.name || "مخزن غير محدد"),
//         designation: empData.designation,
//         inventoryPermissions: empData.inventoryPermissions 
//     });
// }




// if (empRes.data.success) {
//     const empData = empRes.data.employee;

//     setUser({
//         ...basicUser,
//         // إذا كان الـ Backend يرسل اسم الفرع داخل كائن branch
//         locationName: empData.branch?.branchName || "مخزن غير محدد", 
//         designation: empData.designation,
//         inventoryPermissions: empData.inventoryPermissions 
//     });
// }