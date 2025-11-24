import { Link, useNavigate, useParams } from "react-router-dom"
import axios from "axios";
import type { EmployeeRow, ViewProps } from "../../../Types/type";
import { useEffect, useState } from "react";
import { Url } from "../../../../utils/Url";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";



function View({ userRole }: ViewProps) {
    const {id} = useParams<{id?: string}>();
    const [employee , setEmployee] = useState<EmployeeRow | null>(null);
    const [ empLoading , setEmpLaoding] = useState<boolean>(false);
    
    const isAdmin = userRole === 'admin'; 

    useEffect(()=> {
        const fetchEmployee = async () => {
            setEmpLaoding(true);
            try{
                const res = await axios.get(`${Url}/employee/${id}` , {
                    headers:{
                        "Authorization": `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if(res.data.success && res.data.employee){ 
                    setEmployee(res.data.employee); 
                }
            }
            catch(err: any){
                if(err.res && err.res.data.success){
                    alert(err.res.data.message);
                }
            }
            finally{
                setEmpLaoding(false);
            }
        }
        fetchEmployee();
    },[id]);
    
    const navigate = useNavigate();
    const handleViewReport = () => {
        if (isAdmin && employee?.employeeId) {
            const currentYear = new Date().getFullYear();
            const currentMonth = new Date().getMonth() + 1;
            navigate(`/admin-dashboard/attendence-report/employee/${employee._id}/${currentYear}/${currentMonth}`); 
        }
    };
    return (
        <>
            {empLoading ? 
                <div className="fixed inset-0 bg-white/80 flex items-center justify-center z-50">
                    <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="ml-3 text-lg text-gray-700">Loading...</span>
                </div>  :
                <>
                    <span className="return-page mt-2 ml-2 p-2 rounded-full hover:bg-gray-200 inline-block">
                        <Link to={isAdmin ? '/admin-dashboard/employees' : '/employee-dashboard'} className="text-blue-600 hover:underline flex items-center">
                            <FontAwesomeIcon icon={faArrowLeft} />
                        </Link>
                    </span>
                    <div className="max-w-3xl mx-auto mt-2 bg-white p-2 rounded-md shadow-md">
                        <h2 className="text-2xl font-bold mb-8 text-center">البيانات الشخصية للموظف</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <img src={`${employee?.userId?.profileImage}`} className="rounded-full border w-72 h-72 object-cover" alt="Employee Profile" />
                            <div className="p-2">
                                <div className="flex space-x-3 mb-5">
                                    <p className="text-lg font-bold">Employee ID:</p>
                                    <p className="font-medium">{employee?.employeeId}</p>
                                </div>
                                <div className="flex space-x-3 mb-5">
                                    <p className="text-lg font-bold">الأسم:</p>
                                    <p className="font-medium">{employee?.userId.name}</p>
                                </div>
                                <div className="flex space-x-3 mb-5">
                                    <p className="text-lg font-bold">رقم الهاتف:</p>
                                    <p className="font-medium">
                                        {employee?.phoneNumber}
                                    </p>
                                </div>
                                <div className="flex space-x-3 mb-5">
                                    <p className="text-lg font-bold">البريد الإلكترونى:</p>
                                    <p className="font-medium">
                                        {employee?.userId.email}
                                    </p>
                                </div>
                                <div className="flex space-x-3 mb-5">
                                    <p className="text-lg font-bold">تاريخ الميلاد:</p>
                                    <p className="font-medium">{new Date(employee?.dob ?? '').toLocaleDateString()}</p>
                                </div>
                                <div className="flex space-x-3 mb-5">
                                    <p className="text-lg font-bold">النوع:</p>
                                    <p className="font-medium">{employee?.gender}</p>
                                </div>
                                <div className="flex space-x-3 mb-5">
                                    <p className="text-lg font-bold">القسم:</p>
                                    <p className="font-medium">{employee?.department?.dep_name}</p>
                                </div>
                                <div className="flex space-x-3 mb-5">
                                    <p className="text-lg font-bold">المسمى الوظيفى:</p>
                                    <p className="font-medium text-blue-600">{employee?.designation}</p>
                                </div>
                                <div className="flex space-x-3 mb-5">
                                    <p className="text-lg font-bold">الراتب:</p>
                                    <p className="font-medium text-blue-600">{employee?.salary}</p>
                                </div>
                                <div className="flex space-x-3 mb-5">
                                    <p className="text-lg font-bold">الحالة الإجتماعية:</p>
                                    <p className="font-medium">{employee?.maritalStatus}</p>
                                </div>
                                {isAdmin && (
                                    <div className="mt-6">
                                        <button 
                                            onClick={handleViewReport}
                                            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-150 shadow-md"
                                            disabled={!employee} 
                                        >
                                            تقرير الحضور الشهرى للموظف
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            }
        </>
    )
}

export default View