import axios from "axios"
import { useEffect, useState } from "react"
import { Url } from "../../../../utils/Url"
import { columns, LeaveButtons } from "../../../../utils/LeaveHelper";
import DataTable from "react-data-table-component";
import type { LeavesRow } from "../../../Types/type";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";


function Leaves() {
    const [leaves , setLeaves] = useState<LeavesRow[]>([]);
    const [filteredLeave , setFilteredLeave] = useState<LeavesRow[]>([]);
    const [loading , setLoading] = useState<boolean>(false);
    const [error , setError] = useState<boolean>(false);

    const fetchLeaves = async()=>{
        setLoading(true);
        try{
            const res = await axios.get(`${Url}/leave` , {
              headers:{
                  Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
            })
            if(res.data.success){
              let sno = 1;
              const data = await res.data.leaves.map((leave:any)=> ({
                  _id: leave._id,
                  sno: sno++,
                  employeeId: leave.employeeId.employeeId,
                  name: leave.employeeId.userId.name,
                  leaveType: leave.leaveType,
                  department: leave.employeeId.department.dep_name,
                  days: new Date(leave.endDate).getDate() - new Date(leave.startDate).getDate(),
                  status:leave.status,
                    action: (<LeaveButtons Id={leave._id}/>),
              }));
              setLeaves(data);
              setFilteredLeave(data);
              setLoading(false);
            }
        }catch(err:any){
            if(err.res && !err.res.data.success){
                setLoading(false);
                setError(true);
            }
        }
        finally{
          setLoading(false);
        }
    }
    
    useEffect(()=>{
      fetchLeaves();
    },[]);

    const filterByInput = (e: React.ChangeEvent<HTMLInputElement>)=>{
        const searchTerm = e.target.value.toLowerCase();
        const data = leaves.filter(leave => 
          leave.employeeId.toLowerCase().includes(searchTerm)
        );
        setFilteredLeave(data);
    }

    const filterByButton = (status: string) => {
        if (status === 'All') {
            setFilteredLeave(leaves);
            return;
        }
        const data = leaves.filter(leave => 
          leave.status.toLowerCase() === status.toLowerCase()
        );
        setFilteredLeave(data);
    }
    return (
      <>
          {loading ? 
            (
                <div className="fixed inset-0 bg-white/80 flex items-center justify-center z-50">
                  <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="ml-3 text-lg text-gray-700">Loading...</span>
                </div>
            ):
            (
                <>
                  <Link to="/admin-dashboard" className="inline-block mb-2 pl-2 text-blue-500 hover:text-blue-700">
                      <span>
                          <FontAwesomeIcon icon={faArrowLeft} />
                      </span>
                  </Link>
                  <div className="p-6">
                      <div className="text-center">
                          <h3 className="text-2xl font-bold">قسم أدارة الإجازات</h3>
                      </div>
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-6 gap-4 ">
                          <input type="text" placeholder="Search By Emp Id" className="px-4 py-0.5 border w-full md:w-auto" onChange={filterByInput}/>
                          <div className="flex space-x-3 w-full md:w-auto justify-between md:justify-end ">

                              <button className="px-2 py-1 bg-gray-500 text-white hover:bg-gray-600 rounded rounded-md" 
                              onClick={()=> filterByButton('All')}>الكل</button>

                              <button className="px-2 py-1 bg-blue-600 text-white hover:bg-blue-700 rounded rounded-md" 
                              onClick={()=> filterByButton('Pending')}>قيد الإنتظار</button>

                              <button className="px-2 py-1 bg-blue-600 text-white hover:bg-blue-700 rounded rounded-md" 
                              onClick={()=> filterByButton('Approved')}>تمت الموافقة</button>

                              <button className="px-2 py-1 bg-blue-600 text-white hover:bg-blue-700 rounded rounded-md" 
                              onClick={()=> filterByButton('Rejected')}>مرفوضة</button>
                          </div>
                      </div>
                      <div className="mt-3 overflow-x-auto"> 
                          <DataTable<LeavesRow> columns={columns} data={filteredLeave} pagination/>
                    </div>
                      {error && 
                        <div className="text-center">
                          <p className="font-medium text-black-600">لا توجد طلبات إجازة</p>
                        </div>
                      }
                  </div>
                </>
            )
          }
      </>
    )
}

export default Leaves
