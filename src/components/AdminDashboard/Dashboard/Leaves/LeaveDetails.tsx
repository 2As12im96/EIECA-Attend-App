import { Link, useNavigate, useParams } from "react-router-dom"
import axios from "axios";
import type { LeaveDetailsRow, ViewProps } from "../../../Types/type";
import { useEffect, useState } from "react";
import { Url } from "../../../../utils/Url";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

function LeaveDetails({ userRole }: ViewProps) {
    const { id } = useParams<{ id?: string }>();

    const [leave, setLeave] = useState<LeaveDetailsRow | null>(null);
    const [loading, setLaoding] = useState<boolean>(false);
    const [error, setError] = useState<boolean | string>(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLeave = async () => {
            if (!id) return;
            setLaoding(true);
            try {
                const res = await axios.get(`${Url}/leave/detail/${id}`, {
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (res.data.success && res.data.leave) {
                    setLeave(res.data.leave);
                } else {
                    setError('No leave record found.');
                }
            }
            catch (err: any) {
                if (err.response && err.response.data) {
                    setError(err.response.data.err || 'فشل في جلب تفاصيل الإجازة.');
                } else {
                    setError('فشل جلب البيانات بسبب خطأ في الشبكة.');
                }
            }
            finally {
                setLaoding(false);
            }
        }
        fetchLeave();
    }, [id]);
    const changeStatus = async (leaveId: string, status: 'Approved' | 'Rejected') => {
        try {
            const res = await axios.put(`${Url}/leave/${leaveId}`, { status }, {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (res.data.success) {
                navigate('/admin-dashboard/leaves');
            }
        }
        catch (err: any) {
            if (err.response && err.response.data) {
                 setError(err.response.data.message || 'فشل في تحديث الحالة.');
            } else {
                 setError('خطأ في الشبكة أو فشل غير معروف.');
            }
        }
    }
    const isAdmin = userRole === 'admin'; 
    return (
        <>
            {loading ? 
                <div className="fixed inset-0 bg-white/80 flex items-center justify-center z-50">
                    <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="ml-3 text-lg text-gray-700">Loading...</span>
                </div>  :
                <>
                    <Link to={isAdmin ? '/admin-dashboard/leaves' : '/employee-dashboard'} className="inline-block mb-2 pl-2 text-blue-500 hover:text-blue-700">
                        <span>
                            <FontAwesomeIcon icon={faArrowLeft} />
                        </span>
                    </Link>
                    <div className="max-w-3xl mx-auto mt-10 bg-white p-8 rounded-md shadow-md">
                        <h2 className="text-2xl font-bold mb-8 text-center">تفاصيل طلب الإجازة</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <img src={`${leave?.employeeId.userId.profileImage}`} className="rounded-full border w-72 h-72 object-cover mt-1" alt="" />
                            <div className="p-4">
                                <div className="flex space-x-3 mb-5">
                                    <p className="text-lg font-bold">الأسم:</p>
                                    <p className="font-medium mt-1">{leave?.employeeId.userId.name}</p>
                                </div>
                                <div className="flex space-x-3 mb-5">
                                    <p className="text-lg font-bold">Employee ID:</p>
                                    <p className="font-medium mt-1">{leave?.employeeId.employeeId}</p>
                                </div>
                                <div className="flex space-x-3 mb-5">
                                    <p className="text-lg font-bold">نوع الإجازة:</p>
                                    <p className="font-medium mt-1">{leave?.leaveType}</p>
                                </div>
                                <div className="flex space-x-3 mb-5">
                                    <p className="text-lg font-bold">القسم:</p>
                                    <p className="font-medium mt-1">{leave?.employeeId.department.dep_name}</p>
                                </div>
                                <div className="flex space-x-3 mb-5">
                                    <p className="text-lg font-bold">بداية الإجازة:</p>
                                    <p className="font-medium text-blue-600 mt-1">{new Date(leave?.startDate ?? '').toLocaleDateString()}</p>
                                </div>
                                <div className="flex space-x-3 mb-5">
                                    <p className="text-lg font-bold">نهاية الإجازة:</p>
                                    <p className="font-medium text-blue-600 mt-1">{new Date(leave?.endDate ?? '').toLocaleDateString()}</p>
                                </div>
                                <div className="flex space-x-3 mb-5">
                                    <p className="text-lg font-bold">
                                        {leave?.status === 'Pending' ? 'Action:' : 'Status:'}
                                    </p>
                                    {leave?.status === 'Pending' ?
                                        (
                                            <div className="flex space-x-2">
                                                <button className="rounded rounded-md px-2 py-0.5 bg-teal-300 hover:bg-teal-400 text-white" onClick={() => changeStatus(leave._id, 'Approved')}>تمت الموافقة</button>
                                                <button className="rounded rounded-md px-2 py-0.5 bg-red-300 hover:bg-red-400 text-white" onClick={() => changeStatus(leave._id, 'Rejected')}>مرفوضة</button>
                                            </div>
                                        ) :
                                        (
                                            <p className="font-medium mt-1">{leave?.status}</p>
                                        )
                                    }
                                    
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                            <div className="flex space-x-3 mb-5">
                                <p className="text-lg font-bold">السبب:</p>
                                <p className="font-medium mt-1">{leave?.reason}</p>
                            </div>
                        </div>

                        {error && 
                            <div className="text-center">
                                <p className="font-medium text-black-600">لا يوجد طلبات إجازة</p>
                            </div>
                        }
                    </div>
                </>
            }  
        </>
    )
}

export default LeaveDetails
