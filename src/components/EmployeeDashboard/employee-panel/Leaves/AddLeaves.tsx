import { useEffect, useState } from "react"
import { useAuth } from "../../../Context/Context";
import axios from "axios";
import styles from '../../../Authentication/Login/login.module.css';
import { Link, useNavigate } from "react-router-dom";
import { Url } from "../../../../utils/Url";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

interface LeaveFormData {
    userId: string | undefined;
    leaveType?: string;
    startDate?: string;
    endDate?: string;
    reason?: string;
}

function AddLeaves() {
    const {user} = useAuth();
    const [leave, setLeave] = useState<LeaveFormData>({
        userId: user?._id, 
    });
    const [loading , setLoading] = useState<boolean>(false);
    const [error, setError] = useState<{ status: boolean; message: string }>({ status: false, message: '' });
    const navigate = useNavigate();

    useEffect(() => {
        if (user?._id && leave.userId === undefined) {
            setLeave(prevState => ({ ...prevState, userId: user._id }));
        }
    }, [user, leave.userId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>)=>{
        const {name , value} = e.target;
        setLeave((prevState)=> ({...prevState , [name] : value}));
    }
    const handleSubmit = async(e: React.FormEvent)=>{
        e.preventDefault();
        if (!leave.userId) {
            setError({ status: true, message: 'لم يتم تحميل بيانات المستخدم. يُرجى الانتظار أو تسجيل الدخول مرة أخرى.' });
            return;
        }

        setLoading(true);
        try{
            const res = await axios.post(`${Url}/leave/add` , leave , {
                headers:{
                    "Authorization": `Bearer ${localStorage.getItem('token')}`,
                },
            })
            if(res.data.success){
                navigate(`/employee-dashboard/leaves/${user?._id}`);
            }
        }catch(err:any){
            const errorMessage = err.response?.data?.err || err.message;
            setError({ status: true, message: errorMessage });
        }
        finally{
            setLoading(false);
        }
    }
    return (
        <>
            <Link to={`/employee-dashboard/leaves/${user?._id}`} className="inline-block mb-2 pl-2 text-blue-500 hover:text-blue-700">
                <span>
                    <FontAwesomeIcon icon={faArrowLeft} />
                </span>
            </Link>
            <div className="max-w-6xl mx-auto mt-2 bg-white p-2 rounded-md shadow-md">
                <h2 className="text-2xl font-bold mb-6">طلب إجازة</h2>
                <form onSubmit={handleSubmit}>
                    <div className="flex flex-col space-y-4">
                        <div>
                            <label htmlFor="leaveType" className="block text-sm font-medium text-gray-700">نوع الإجازة</label>
                            <select name="leaveType" id="leaveType" onChange={handleChange} className="mt-1 p-2 block w-full border border-gray-300 rounded-md" required>
                                <option value="">حدد نوع الإجازة</option>
                                <option value="Sick Leave">إجازة مرضية</option>
                                <option value="Casual Leave">إجازة عرضية</option>
                                <option value="Annual Leave">الإجازة السنوية</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* From date */}
                            <div>
                                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">من تاريخ</label>
                                <input type="date" name="startDate" onChange={handleChange} id='startDate' className="mt-1 p-2 block w-full border border-gray-300 rounded-md" required/>
                            </div>
                            {/* To date */}
                            <div>
                                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">إلى تاريخ</label>
                                <input type="date" name="endDate" onChange={handleChange} id='endDate' className="mt-1 p-2 block w-full border border-gray-300 rounded-md" required/>
                            </div>
                            {/* Description */}
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700">الوصف</label>
                                <textarea name="reason" id="description" placeholder="Reason" onChange={handleChange} className="w-full border border-gray-300"></textarea>
                            </div>
                        </div>
                        <button type='submit' className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" disabled={loading}>
                            {loading ? 
                                (<>
                                    <span className={styles.loader}></span> 
                                </>):
                                (<>
                                    <span>تقديم طلب الإجازة</span> 
                                </>)
                            }
                        </button>
                    </div>
                </form>
                {error && 
                    <div className="w-full text-center p-4">
                        <p className="text-red-600 font-medium 2xl">{error.message}</p>
                    </div>
                }
            </div>
        </>
    )
}

export default AddLeaves
