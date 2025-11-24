import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Url } from "../../../../utils/Url";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import type { AdminUser } from "../../../Types/type";



const AdminDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>(); 
    const [admin, setAdmin] = useState<AdminUser | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchAdminDetails = async () => {
            setLoading(true);
            try {
                const res = await axios.get<{ success: boolean; admin: AdminUser }>(`${Url}/admins/${id}`, { 
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (res.data.success) {
                    setAdmin(res.data.admin);
                }
            } catch (err: any) {
                alert(err.response?.data?.message || "خطأ في جلب تفاصيل المسؤول");
            } finally {
                setLoading(false);
            }
        };
        if (id) {
            fetchAdminDetails();
        }
    }, [id]);

    if (loading) {
        return <div className="p-5 text-center">تحميل تفاصيل المسؤول...</div>;
    }

    if (!admin) {
        return <div className="p-5 text-center text-red-600">لم يتم العثور على المسؤول.</div>;
    }

    return (
        <div className="p-2 max-w-4xl mx-auto bg-white shadow-lg rounded-lg mt-2">
            <Link to="/admin-dashboard/admin-list" className="inline-block mb-4 text-blue-500 hover:text-blue-700">
                <span>
                    <FontAwesomeIcon icon={faArrowLeft} />
                </span>
            </Link>
            <h2 className="text-3xl font-bold mb-6 text-blue-600 border-b pb-2">الملف الشخصي للمسؤول: {admin.name}</h2>
            <div className="flex flex-col md:flex-row items-start gap-8">
                <div className="md:w-1/3">
                    <img 
                        src={admin.profileImage || 'default-avatar.png'} 
                        alt={admin.name} 
                        className="w-full h-auto rounded-lg shadow-md object-cover"
                    />
                </div>
                <div className="md:w-2/3 space-y-4">
                    <p className="text-lg">
                        <span className="font-semibold text-gray-700">الأسم:</span> {admin.name}
                    </p>
                    <p className="text-lg">
                        <span className="font-semibold text-gray-700">البريد الإلكترونى:</span> {admin.email}
                    </p>
                    <p className="text-lg">
                        <span className="font-semibold text-gray-700">Role:</span> <span className="text-blue-500 font-bold uppercase">{admin.role}</span>
                    </p>
                    <p className="text-lg">                        
                        <span className="font-semibold text-gray-700">
                            تاريخ الإنضمام : 
                        </span> <span>{new Date(admin.createdAt).toLocaleDateString()}</span>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default AdminDetails;