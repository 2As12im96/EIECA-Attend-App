import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../../../Authentication/Login/login.module.css";
import { Url } from "../../../../utils/Url";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";



function AddDepartment() {
    const [department , setDepartment] = useState({
        dep_name: '',
        description: ''
    });
    const [Loading , setLoading] = useState<boolean>(false);
    const navigate = useNavigate();
    const handleChange = (e:any)=>{
        const {name , value}  = e.target;
        setDepartment({...department , [name]:value});
    }
    const handleSubmit = async(e:any)=>{
        e.preventDefault();
        setLoading(true);
        try{
            const response = await axios.post(`${Url}/department/add`, department, {
                headers:{
                    "Authorization": `Bearer ${localStorage.getItem('token')}`
                }
            });
            if(response.data.success){
                navigate('/admin-dashboard/departments');
            }
        }catch(err:any){
            if(err.response && err.response.data.error){
                alert(err.response.data.error);
            }
        }
        finally{
            setLoading(false);
        }
    }
    return (
        <>
        {Loading ? 
            <div className="fixed inset-0 bg-white/80 flex items-center justify-center z-50">
                <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="ml-3 text-lg text-gray-700">Loading...</span>
            </div> :
            <>
                <Link to="/admin-dashboard/departments" className="inline-block mb-2 pl-2 text-blue-500 hover:text-blue-700">
                    <span>
                        <FontAwesomeIcon icon={faArrowLeft} />
                    </span>
                </Link>
                <div className="max-w-6xl mx-auto mt-2 bg-white p-2 rounded-md shadow-md">
                    <div>
                        <h2 className="text-2xl font-bold mb-6">أنشاء قسم جديد</h2>
                        <form onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor='dep_name' className="text-sm font-medium text-gray-700">أسم القسم</label>
                                <input id='dep_name' name='dep_name' type="text" placeholder="أكتب اسم القسم" className="mt-1 w-full p-2 border border-gray-300 rounded-md" onChange={handleChange} required/>
                            </div>
                            <div className="mt-3">
                                <label htmlFor='description' className="block text-sm font-medium text-gray-700">الوصف</label>
                                <textarea id='description' name='description' placeholder="أكتب وصف تفصيلى للقسم (أختيارى)" className="mt-1 p-2 block w-full border border-gray-300 rounded-md" onChange={handleChange}></textarea>
                            </div>
                            <button type="submit" className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            {Loading ? <span className={styles.loader}></span> : <span>أنشاء القسم</span>}    
                            </button>
                        </form>
                    </div>
                </div>
            </>
        }
        </>
    )
}

export default AddDepartment
