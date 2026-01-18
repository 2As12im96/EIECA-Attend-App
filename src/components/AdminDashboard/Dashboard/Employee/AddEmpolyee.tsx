import { useEffect, useState } from "react"
import type { DepartmentRow } from "../../../Types/type";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import useLoginLogic from "../../../Authentication/Login/login.logic";
import styles from "../../../Authentication/Login/login.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faBoxOpen, faUserShield } from "@fortawesome/free-solid-svg-icons";
import { Url } from "../../../../utils/Url";
import { fetchEmployees } from "../../../../utils/EmployeeHelper";

function AddEmpolyee() {
    const { eye, toggleEye } = useLoginLogic();
    const [department, setDepartment] = useState<DepartmentRow[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    
    const [formData, setFormData] = useState<Record<string, any>>({
        inventoryAccessType: 'none',
        inventoryScope: '',
        branch: 'Cairo' // قيمة افتراضية للفرع
    });
    
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            const departments = await fetchEmployees();
            setDepartment(departments);
        };
        fetchData();
    }, []);

    const handleChange = (e: any) => {
        const { name, value, files, type, checked } = e.target;
        if (name === 'profileImage') {
            setFormData((prevData) => ({ ...prevData, [name]: files[0] }));
        } else if (type === 'checkbox') {
            setFormData((prevData) => ({ ...prevData, [name]: checked }));
        } else {
            setFormData((prevData) => ({ ...prevData, [name]: value }));
        }
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const formDataObj = new FormData();

            // --- منطق تحويل الاختيارات العربية إلى قيم Boolean صحيحة للموديل ---
            // نفحص الاختيار المختار في الـ select ونحدد الـ true والـ false
            const isViewOnly = formData.inventoryAccessType === 'view';
            const isManage = formData.inventoryAccessType === 'manage';

            const inventoryPermissions = {
                canView: isViewOnly || isManage, // True لو اختار مشاهدة أو إدارة
                canManage: isManage,             // True فقط لو اختار إدارة كاملة
                accessibleBranches: formData.inventoryScope || 'Cairo' 
            };

            // إضافة البيانات الأساسية لـ FormData مع استبعاد حقول الواجهة المؤقتة
            Object.keys(formData).forEach((key) => {
                if (key === 'inventoryAccessType' || key === 'inventoryScope') {
                    // نتخطى هذه الحقول لأننا سنضعها داخل الكائن الموحد بالأسفل
                    return;
                }

                if (key === 'profileImage') {
                    if (formData[key]) {
                        formDataObj.append(key, formData[key]);
                    }
                } else {
                    formDataObj.append(key, formData[key]);
                }
            });

            // إضافة كائن الصلاحيات الموحد (inventoryPermissions) كـ String
            // هذا هو الحقل الذي يبحث عنه موديل Employee في الباك اند
            formDataObj.append('inventoryPermissions', JSON.stringify(inventoryPermissions));

            const res = await axios.post(`${Url}/employee/add`, formDataObj, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (res.data.success) {
                // alert("تمت إضافة الموظف بنجاح وتفعيل الصلاحيات!");
                navigate('/admin-dashboard/employees');
            }
        } catch (err: any) {
            console.error("Error during submission:", err);
            setError('خطأ في الإضافة: ' + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 sm:px-6 lg:px-8">
            <div className='max-w-8xl mx-auto bg-white p-2 sm:p-2 rounded-xl shadow-md border border-gray-100'>
                <div className="flex items-center gap-3 mb-8 border-b pb-4">
                    <div className="bg-blue-600 text-white p-3 rounded-lg shadow-blue-200 shadow-lg">
                        <FontAwesomeIcon icon={faUserShield} size="lg" />
                    </div>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">إضافة عضو جديد</h2>
                        <p className="text-sm text-gray-500">إدارة البيانات الشخصية وصلاحيات النظام</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-y-6 gap-x-8'>
                        
                        {/* الاسم */}
                        <div className="flex flex-col gap-1">
                            <label htmlFor="Name" className="text-sm font-semibold text-gray-700">الاسم بالكامل</label>
                            <input type="text" name='name' placeholder='أكتب الاسم ثنائى' id='Name' className='p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all' onChange={handleChange} required/>
                        </div>

                        {/* البريد الإلكتروني */}
                        <div className="flex flex-col gap-1">
                            <label htmlFor="Email" className='text-sm font-semibold text-gray-700'>البريد الإلكترونى</label>
                            <input type="email" name="email" placeholder="example@company.com" id='Email' className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" onChange={handleChange} required/>
                        </div>

                        {/* القسم */}
                        <div className="flex flex-col gap-1">
                            <label htmlFor="Department" className='text-sm font-semibold text-gray-700'>القسم</label>
                            <select name="department" id='Department' className="p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" onChange={handleChange} required>
                                <option value="">تحديد القسم</option>
                                {department.map(dep =>(
                                    <option key={dep._id} value={dep._id}>{dep.dep_name}</option>
                                ))}
                            </select>
                        </div>

                        {/* الفرع الرئيسي للموظف */}
                        <div className="flex flex-col gap-1">
                            <label htmlFor="Branch" className='text-sm font-semibold text-gray-700 font-bold text-blue-700'>فرع العمل الرئيسي</label>
                            <select name="branch" id='Branch' className="p-3 border border-blue-300 rounded-lg bg-blue-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all" onChange={handleChange} value={formData.branch} required>
                                <option value="">حدد الفرع المسموح...</option>
                                <option value="Cairo">فرع القاهرة </option>
                                <option value="Mansoura">فرع المنصورة </option>
                                <option value="Both">كل الفروع</option>
                            </select>
                        </div>

                        {/* Employee ID */}
                        <div className="flex flex-col gap-1">
                            <label htmlFor="Employee" className='text-sm font-semibold text-gray-700'>Employee ID</label>
                            <input type="text" name="employeeId" placeholder="ID رقم" id='Employee' className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" onChange={handleChange} required/>
                        </div>

                        {/* رقم الهاتف */}
                        <div className="flex flex-col gap-1">
                            <label htmlFor="Phone" className='text-sm font-semibold text-gray-700'>رقم الهاتف</label>
                            <input type="phone" name="phoneNumber" placeholder="01xxxxxxxxx" id='Phone' className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" onChange={handleChange} required/>
                        </div>

                        {/* تاريخ الميلاد */}
                        <div className="flex flex-col gap-1">
                            <label htmlFor="Date" className='text-sm font-semibold text-gray-700'>تاريخ الميلاد</label>
                            <input type="date" name="dob" id='Date' className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" onChange={handleChange} required/>
                        </div>

                        {/* النوع */}
                        <div className="flex flex-col gap-1">
                            <label htmlFor="Gender" className='text-sm font-semibold text-gray-700'>النوع</label>
                            <select name="gender" id='Gender' className="p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" onChange={handleChange} required>
                                <option value="">تحديد النوع</option>
                                <option value="Male">ذكر</option>
                                <option value="Female">أنثى</option>
                            </select>
                        </div>

                        {/* الحالة الاجتماعية */}
                        <div className="flex flex-col gap-1">
                            <label htmlFor="Martial" className='text-sm font-semibold text-gray-700'>الحالة الاجتماعية</label>
                            <select name="maritalStatus" id='Martial' className="p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" onChange={handleChange} required>
                                <option value="">تحديد الحالة</option>
                                <option value="Single">أعزب</option>
                                <option value="Married">متزوج</option>
                            </select>
                        </div>

                        {/* الوظيفة */}
                        <div className="flex flex-col gap-1">
                            <label htmlFor="Designation" className='text-sm font-semibold text-gray-700'>الوظيفة</label>
                            <input type="text" name="designation" placeholder="تحديد الوظيفة" id='Designation' className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" onChange={handleChange} required/>
                        </div>
                    </div>

                    {/* قسم الصلاحيات المطور */}
                    <div className="bg-blue-50 p-2 sm:p-4 rounded-2xl border border-blue-100 shadow-sm">
                        <label className="block text-md font-bold text-blue-900 mb-4 flex items-center gap-2">
                            <FontAwesomeIcon icon={faBoxOpen} /> صلاحيات نظام المخازن
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-blue-700 uppercase tracking-wider">نوع الوصول للمخزن</label>
                                <select 
                                    name="inventoryAccessType" 
                                    className="w-full p-3 border border-blue-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" 
                                    onChange={handleChange}
                                    value={formData.inventoryAccessType}
                                >
                                    <option value="none">لا يمكنه الدخول للمخازن</option>
                                    <option value="view">مشاهدة فقط (فنيين/مهندسين/مبيعات/مشتريات)</option>
                                    <option value="manage">إدارة كاملة (إضافة/تعديل/حذف)</option>
                                </select>
                            </div>
                            <div className={`space-y-1 transition-opacity duration-300 ${formData.inventoryAccessType === 'none' ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                                <label className="text-xs font-bold text-blue-700 uppercase tracking-wider">نطاق فروع المخزن المسموحة</label>
                                <select 
                                    name="inventoryScope" 
                                    className="w-full p-3 border border-blue-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" 
                                    onChange={handleChange}
                                    required={formData.inventoryAccessType !== 'none'}
                                    value={formData.inventoryScope}
                                >
                                    <option value="">حدد الفرع المسموح...</option>
                                    <option value="Cairo">مخزن القاهرة </option>
                                    <option value="Mansoura">مخزن المنصورة </option>
                                    <option value="Both">كل الفروع</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* باقي الحقول */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-1">
                            <label htmlFor="Salary" className='text-sm font-semibold text-gray-700'>الراتب الشهري</label>
                            <input type="number" name="salary" placeholder="0.00" id='Salary' className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" onChange={handleChange} required/>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label htmlFor="Password" className='text-sm font-semibold text-gray-700'>كلمة المرور</label>
                            <div className="relative flex items-center justify-between w-full">
                                <input type={eye ? "text" : "password"} id='Password' name='password' placeholder='********' className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" onChange={handleChange} required/>
                                <button type="button" className="absolute right-3 text-gray-500 hover:text-blue-600 transition-colors" onClick={toggleEye}>
                                    <FontAwesomeIcon icon={eye ? faEyeSlash : faEye} />
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label htmlFor="Role" className='text-sm font-semibold text-gray-700'>نوع الحساب</label>
                            <select name="role" id='Role' className="p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" onChange={handleChange} required>
                                <option value="">Select Role</option>
                                <option value="admin">Admin</option>
                                <option value="employee">Employee</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label htmlFor="uploadImage" className='text-sm font-semibold text-gray-700'>صورة الملف الشخصي</label>
                            <input type="file" name="profileImage" id='uploadImage' className="p-2 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" onChange={handleChange} required/>
                        </div>
                    </div>

                    {/* زر الحفظ */}
                    <div className="pt-6 border-t mt-4">
                        <button type="submit" disabled={loading} className='w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-xl shadow-lg shadow-blue-100 transition-all transform active:scale-[0.98]'>
                            {loading ? <span className={styles.loader}></span> : "تأكيد وإضافة الموظف للنظام"}
                        </button>
                    </div>
                </form>

                {error && <div className="mt-4 p-4 bg-red-50 border-r-4 border-red-500 text-red-700 font-bold rounded-md animate-pulse">{error}</div>}
            </div>
        </div>
    )
}

export default AddEmpolyee;