import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Url } from "../../../../utils/Url";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faUserShield, faMoneyBillWave, faMapMarkerAlt, faLock } from "@fortawesome/free-solid-svg-icons";

const AdminDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>(); 
    const [admin, setAdmin] = useState<any | null>(null); // استخدمنا any مؤقتاً لتشمل الحقول الجديدة
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchAdminDetails = async () => {
            setLoading(true);
            try {
                const res = await axios.get<{ success: boolean; admin: any }>(`${Url}/admins/${id}`, { 
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (res.data.success) {
                    setAdmin(res.data.admin);
                }
            } catch (err: any) {
                console.error("خطأ في جلب التفاصيل:", err);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchAdminDetails();
    }, [id]);

    if (loading) return <div className="p-10 text-center animate-pulse text-blue-600 font-bold">جاري تحميل تفاصيل المسؤول...</div>;
    if (!admin) return <div className="p-10 text-center text-red-600 font-bold">لم يتم العثور على المسؤول.</div>;

    return (
        <div className="p-2 max-w-8xl mx-auto mt-4">
            {/* زر الرجوع */}
            <Link to="/admin-dashboard/admin-list" className="inline-flex items-center gap-2 mb-6 text-gray-600 hover:text-blue-600 transition-colors font-medium">
                <FontAwesomeIcon icon={faArrowLeft} /> العودة لقائمة المسؤولين
            </Link>

            <div className="bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-100">
                {/* الرأس الهيدر */}
                <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-8 text-white">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <img 
                            src={admin.profileImage || '/default-avatar.png'} 
                            alt={admin.name} 
                            className="w-32 h-32 rounded-2xl border-4 border-white/20 shadow-xl object-cover"
                        />
                        <div className="text-center md:text-right">
                            <h2 className="text-3xl font-bold">{admin.name}</h2>
                            <p className="text-blue-100 flex items-center justify-center md:justify-start gap-2 mt-1">
                                <FontAwesomeIcon icon={faUserShield} /> مسؤول النظام - {admin.role}
                            </p>
                        </div>
                    </div>
                </div>

                {/* البيانات الأساسية */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
                    
                    {/* المعلومات الشخصية */}
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-gray-800 border-r-4 border-blue-600 pr-3">المعلومات الأساسية</h3>
                        <div className="bg-gray-50 p-6 rounded-2xl space-y-4">
                            <p className="flex justify-between border-b border-gray-200 pb-2">
                                <span className="text-gray-500 font-medium">البريد الإلكتروني:</span>
                                <span className="text-gray-800 font-bold">{admin.email}</span>
                            </p>
                            <p className="flex justify-between border-b border-gray-200 pb-2">
                                <span className="text-gray-500 font-medium">تاريخ الانضمام:</span>
                                <span className="text-gray-800 font-bold">{new Date(admin.createdAt).toLocaleDateString('ar-EG')}</span>
                            </p>
                            <p className="flex justify-between">
                                <span className="text-gray-500 font-medium">رقم الهاتف:</span>
                                <span className="text-gray-800 font-bold">{admin.phoneNumber || "غير مسجل"}</span>
                            </p>
                        </div>
                    </div>

                    {/* البيانات المالية والمكانية */}
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-gray-800 border-r-4 border-green-500 pr-3">بيانات العمل</h3>
                        <div className="bg-gray-50 p-6 rounded-2xl space-y-4">
                            <p className="flex justify-between border-b border-gray-200 pb-2">
                                <span className="text-gray-500 font-medium flex items-center gap-2">
                                    <FontAwesomeIcon icon={faMoneyBillWave} className="text-green-500" /> الراتب:
                                </span>
                                <span className="text-green-700 font-bold">{admin.salary?.toLocaleString()} EGP</span>
                            </p>
                            <p className="flex justify-between border-b border-gray-200 pb-2">
                                <span className="text-gray-500 font-medium flex items-center gap-2">
                                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-red-500" /> الفرع الرئيسي:
                                </span>
                                <span className="text-gray-800 font-bold">{admin.branch === 'Both' ? 'القاهرة والمنصورة' : admin.branch}</span>
                            </p>
                            <p className="flex justify-between">
                                <span className="text-gray-500 font-medium">المسمى الوظيفي:</span>
                                <span className="text-blue-600 font-bold">{admin.designation || "Admin"}</span>
                            </p>
                        </div>
                    </div>

                    {/* صلاحيات المخازن - تظهر في عرض كامل */}
                    <div className="md:col-span-2 space-y-4 mt-4">
                        <h3 className="text-xl font-bold text-gray-800 border-r-4 border-orange-500 pr-3 flex items-center gap-2">
                            <FontAwesomeIcon icon={faLock} className="text-orange-500" /> صلاحيات المخازن والسيستم
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className={`p-4 rounded-2xl border ${admin.inventoryPermissions?.canView ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                <p className="text-sm text-gray-600">رؤية المخزن</p>
                                <p className={`font-bold ${admin.inventoryPermissions?.canView ? 'text-green-700' : 'text-red-700'}`}>
                                    {admin.inventoryPermissions?.canView ? "مسموح" : "ممنوع"}
                                </p>
                            </div>
                            <div className={`p-4 rounded-2xl border ${admin.inventoryPermissions?.canManage ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                <p className="text-sm text-gray-600">إدارة الأصناف</p>
                                <p className={`font-bold ${admin.inventoryPermissions?.canManage ? 'text-green-700' : 'text-red-700'}`}>
                                    {admin.inventoryPermissions?.canManage ? "مسموح" : "ممنوع"}
                                </p>
                            </div>
                            <div className="p-4 rounded-2xl border bg-blue-50 border-blue-200">
                                <p className="text-sm text-gray-600">نطاق الفروع</p>
                                <p className="font-bold text-blue-700">
                                    {admin.inventoryPermissions?.accessibleBranches || "غير محدد"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminDetails;