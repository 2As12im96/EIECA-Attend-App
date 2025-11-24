import { useEffect, useState } from "react"
import type { DepartmentRow } from "../../../Types/type";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import useLoginLogic from "../../../Authentication/Login/login.logic";
import styles from "../../../Authentication/Login/login.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { Url } from "../../../../utils/Url";
import { fetchEmployees } from "../../../../utils/EmployeeHelper";

function AddEmpolyee() {
    const { eye , toggleEye} = useLoginLogic();
    const [department  , setDepartment] = useState<DepartmentRow[]>([]);
    const [loading , setLoading] = useState<boolean>(false);
    const [error , setError] = useState<string | null>(null);
    const [formData , setFormData] = useState<Record<string, any>>({});
    const navigate = useNavigate();
    useEffect(()=>{
        const fetchData = async () => {
            const departments = await fetchEmployees();
            setDepartment(departments);
        };
        fetchData();
    },[]);
    const handleChange = (e:any)=> {
        const {name , value , files} = e.target;
        if(name === 'profileImage'){
            setFormData((prevData)=>( {...prevData , [name] : files[0]}))
        }else{
            setFormData((prevData)=>( {...prevData , [name] : value}))
        }
    }
    const handleSubmit = async(e:any)=>{
        e.preventDefault();
        const formDataObj = new FormData();
        Object.keys(formData).forEach((key)=>{
            formDataObj.append(key , formData[key])
        });
        setLoading(true)
        try{
            const res = await axios.post(`${Url}/employee/add` , formDataObj ,{
                headers:{
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            if(res.data.success){
                navigate('/admin-dashboard/employees');
            }
        } catch(err: any) {
              setError('خطأ في الخادم: ' + (err?.message ?? String(err)));
              setLoading(false);
        }
        finally{
            setLoading(false);
        }
    }
    return (
        <>
            <div className='max-w-6xl mx-auto mt-2 bg-white p-3 rounded-md shadow'>
                <h2 className="text-2xl font-bold mb-6">أضافة عضو جديد</h2>
                <form onSubmit={handleSubmit}>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        {/* Name */}
                        <div>
                            <label htmlFor="Name" className="block text-sm font-medium text-gray-700 cursor-pointer">الأسم</label>
                            <input type="text" name='name' placeholder='أكتب الاسم ثنائى' id='Name' className='mt-1 p-2 block w-full border border-gray-300 rounded-md' onChange={handleChange} required/>
                        </div>
                        {/* Email */}
                        <div>
                            <label htmlFor="Email" className='block text-sm font-medium text-gray-700 cursor-pointer'>البريد الإلكترونى</label>
                            <input type="email" name="email" placeholder="ادخل البريد الإكترونى" id='Email' className="mt-1 p-2 block w-full border border-gray-300 rounded-md" onChange={handleChange} required/>
                        </div>
                        {/* Employee ID */}
                        <div>
                            <label htmlFor="Employee" className='block text-sm font-medium text-gray-700 cursor-pointer'>Employee ID</label>
                            <input type="text" name="employeeId" placeholder="قم بأنشاء رقم ID للموظف" id='Employee' className="mt-1 p-2 block w-full border border-gray-300 rounded-md" onChange={handleChange} required/>
                        </div>
                        {/* Phone Number */}
                        <div>
                            <label htmlFor="Phone" className='block text-sm font-medium text-gray-700 cursor-pointer'>رقم الهاتف</label>
                            <input type="phone" name="phoneNumber" placeholder="أدخل رقم الهاتف" id='Phone' className="mt-1 p-2 block w-full border border-gray-300 rounded-md" onChange={handleChange} required/>
                        </div>
                        {/* Date of Birth */}
                        <div>
                            <label htmlFor="Date" className='block text-sm font-medium text-gray-700 cursor-pointer'>تاريخ الميلاد</label>
                            <input type="date" name="dob" placeholder="Dop" id='Date' className="mt-1 p-2 block w-full border border-gray-300 rounded-md" onChange={handleChange} required/>
                        </div>
                        {/* Gender */}
                        <div>
                            <label htmlFor="Gender" className='block text-sm font-medium text-gray-700 cursor-pointer'>النوع</label>
                            <select name="gender" id='Gender' className="mt-1p-2 block w-full border border-gray-300 rounded-md" onChange={handleChange} required>
                                <option value="">تحديد النوع</option>
                                <option value="Male">ذكر</option>
                                <option value="Female">أنثى</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        {/* Martial Status */}
                        <div>
                            <label htmlFor="Martial" className='block text-sm font-medium text-gray-700 cursor-pointer'>الحالة الأجتماعية</label>
                            <select name="maritalStatus" id='Martial' className="mt-1p-2 block w-full border border-gray-300 rounded-md" onChange={handleChange} required>
                                <option value="">تحديد الحالة الأجتماعية</option>
                                <option value="Single">أعزب</option>
                                <option value="Married">متزوج</option>
                            </select>
                        </div>
                        {/* Designation */}
                        <div>
                            <label htmlFor="Designation" className='block text-sm font-medium text-gray-700 cursor-pointer'>المسمى الوظيفى</label>
                            <input type="text" name="designation" placeholder="أكتب اسم الوظيفة" id='Designation' className="mt-1 p-2 block w-full border border-gray-300 rounded-md" onChange={handleChange} required/>
                        </div>
                        {/* Department */}
                        <div>
                            <label htmlFor="Department" className='block text-sm font-medium text-gray-700 cursor-pointer'>القسم</label>
                            <select name="department" id='Department' className="mt-1p-2 block w-full border border-gray-300 rounded-md" onChange={handleChange} required>
                                <option value="">تحديد القسم</option>
                                {department.map(dep =>(
                                    <option key={dep._id} value={dep._id}>{dep.dep_name}</option>
                                ))}
                            </select>
                        </div>
                        {/* Salary */}
                        <div>
                            <label htmlFor="Salary" className='block text-sm font-medium text-gray-700 cursor-pointer'>الراتب</label>
                            <input type="number" name="salary" placeholder="أكتب رقم الراتب" id='Salary' className="mt-1 p-2 block w-full border border-gray-300 rounded-md" onChange={handleChange} required/>
                        </div>
                        {/* Password */}
                        <div>
                            <label htmlFor="Password" className='block text-sm font-medium text-gray-700 cursor-pointer'>كلمة المرور</label>
                            <span className={styles.passwordInput +  " flex items-center justify-between"}>
                                <input type={eye ? "text" : "password"} id='Password' name='password' placeholder='********' className="mt-1 p-2 block w-full border border-gray-300 rounded-md" onChange={handleChange} required/>
                                <span className={styles.eyeIcon} onClick={toggleEye}>
                                    <FontAwesomeIcon icon={eye ?  faEyeSlash : faEye} />
                                </span>
                            </span>
                        </div>
                        {/* Role */}
                        <div>
                            <label htmlFor="Role" className='block text-sm font-medium text-gray-700 cursor-pointer'>نوع الحساب</label>
                            <select name="role" id='Role' className="mt-1p-2 block w-full border border-gray-300 rounded-md" onChange={handleChange} required>
                                <option value="">Select Role</option>
                                <option value="admin">Admin</option>
                                <option value="employee">Employee</option>
                            </select>
                        </div>
                        {/* Upload Image */}
                        <div>
                            <label htmlFor="uploadImage" className='block text-sm font-medium text-gray-700 cursor-pointer'>تحميل صورة</label>
                            <input type="file" name="profileImage" placeholder="Upload Image" id='uploadImage' className="mt-1 p-2 block w-full border border-gray-300 rounded-md" onChange={handleChange} required/>
                        </div>
                    </div>
                    <button type="submit" className='w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md'>
                        {loading ? <span className={styles.loader}></span> : <span>أضافة عضو جديد</span>}
                    </button>
                </form>
                {error && <p className="text-red font-bold p-4">{error}</p> || null}
            </div>
        </>
    )
}

export default AddEmpolyee
