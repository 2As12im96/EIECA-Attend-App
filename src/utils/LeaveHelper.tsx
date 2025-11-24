import type { TableColumn } from "react-data-table-component";
import { useNavigate } from "react-router-dom"
import type { LeavesRow } from "../components/Types/type";




export const columns: TableColumn<LeavesRow>[] = [
    {
        name: 'S No',
        selector: (row) => row.sno, 
        width:"40px"
    },
    {
        name: 'Emp ID',
        selector: (row) => row.employeeId,
        width:"120px"
    },
    {
        name: 'الأسم',
        selector: (row) => row.name, 
        width:"140px",
        sortable: true
    },
    {
        name: 'نوع الأجازة',
        selector: (row) => row.leaveType,
        width:"140px",
    },
    {
        name: 'القسم',
        selector: (row) => row.department, 
        width:"170px"
    },
    {
        name: 'الأيام',
        selector: (row) => row.days,
        width:'80px',
    },
    {
        name: 'الحالة',
        selector: (row) => row.status,
        width:'120px',
    },
    {
        name: 'Action',
        cell: (row) => row.action,
    }
];

export const LeaveButtons = ({Id}:any)=> {
    const navigate = useNavigate();
    
    const handleView = (id:any)=>{
        navigate(`/admin-dashboard/leaves/${id}`)
    };
    return(
        <button className="px-4 py-1 bg-blue-500 rounded text-white hover:bg-blue-600" onClick={()=> handleView(Id)}>رؤية</button>
    )
}