import axios from 'axios';
import {Url} from '../utils/Url.tsx';
import { useNavigate } from 'react-router-dom';
import type { TableColumn } from 'react-data-table-component';
import type { EmployeeRow } from '../components/Types/type.ts';



export const columns: TableColumn<EmployeeRow>[] = [
    {
        name: 'S No',
        selector: (row) => row.sno ?? '',
        width:"40px"
    },
    {
        name: 'الأسم',
        selector: (row) => row.name,
        width:"140px",
        sortable: true
    },
    {
        name: 'الصورة الشخصية',
        cell: (row) => (
            <img 
                width={40} 
                className="rounded-full" 
                src={`${row.profileImage}`} 
                alt={row.name} 
            /> 
        ),
        width:"200px"
    },
    {
        name: 'القسم',
        selector: (row) => row.dep_name,
    },
    {
        name: 'DOB',
        selector: (row) => row.dob,
        width:'120px',
        sortable:true
    },
    {
        name: 'Action',
        cell: (row) => row.action,
    }
];

export const fetchEmployees = async()=>{
    let departments;
    try{
        const res = await axios.get(`${Url}/department` , {
            headers:{
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        })
        if(res.data.success){
            departments = res.data.departments
        }
    }catch(err:any){
        if(err.res && !err.res.data.success){
            alert(err.res.data.error);
        }
    }
    return departments
}; 

export const getEmployees = async(id: string)=>{ 
    if (!id || id === 'undefined') {
        return [];
    }
    let employee = [];
    try{
        const res = await axios.get(`${Url}/employee/department/${id}` , { 
            headers:{
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        })
        console.log(res)
        if(res.data.success){
            employee = res.data.employee
        }
    }catch(err:any){
        console.error("حدث خطأ أثناء جلب الموظفين حسب معرف القسم:", err); 
        if(err.res && !err.res.data.success){
        }
        return []
    }
    return employee || [];
}; 

export const EmployeeButtons = ({ Id }:any) => {
    const navigate = useNavigate();

    return (
        <div className="flex space-x-3">
            <button
                className="w-20 bg-green-500 text-white px-5 py-1 rounded mr-2 hover:bg-green-700 transition w-20 h-8"
                onClick={() => navigate(`/admin-dashboard/employees/${Id}`)}
            >
                رؤية
            </button>
            <button
                className="w-20 bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-700 transition"
                onClick={() => navigate(`/admin-dashboard/employees/edit/${Id}`)}
            >
                تعديل
            </button>
            <button
                className="w-20 bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-700 transition"
                onClick={()=> navigate(`/admin-dashboard/employees/salary/${Id}`)}
            >
                المرتب
            </button>
            <button
                className="w-20 bg-red-500 text-white px-2 py-1 rounded hover:bg-red-700 transition"
                onClick={()=> navigate(`/admin-dashboard/employees/leaves/${Id}`)}
            >
                الأجازة
            </button>
        </div>
    )
}