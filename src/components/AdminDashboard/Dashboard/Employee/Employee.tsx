import axios from "axios";
import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import type {EmployeeRow} from "../../../Types/type";
import DataTable from "react-data-table-component";
import { Url } from "../../../../utils/Url";
import { columns ,EmployeeButtons } from "../../../../utils/EmployeeHelper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

function Employee() {
    const [employees , setEmployees] = useState<EmployeeRow[]>([]);
    const [emplaoding, setEmolaoding] = useState<boolean>(false);
    const [filteredEmployee , setFilteredEmployee] = useState<EmployeeRow[]>([]);
    
    useEffect(() => {
        const fetchEmployees = async () => {
            setEmolaoding(true);
            try {
                const res = await axios.get(`${Url}/employee`, {
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (res.data.success) {
                    let sno = 1;
                    const data: EmployeeRow[] = res.data.employees.map((emp: any) => (
                        {
                            _id: emp._id,
                            sno: sno++,
                            dep_name: emp.department.dep_name,
                            name: emp.userId.name,
                            dob:new Date (emp.dob).toLocaleDateString(),
                            profileImage: emp.userId.profileImage,
                            action: (<EmployeeButtons Id={emp._id}/>)
                        }
                    ));
                    setEmployees(data);
                    setFilteredEmployee(data);
                }
            }
            catch (err: any) {
                if (err.response && err.response.data.message) {
                    alert(err.response.data.message);
                }
            }
            finally {
                setEmolaoding(false);
            }
        }
        fetchEmployees();
    }, []);
    const memoizedColumns = useMemo(() => columns, []);

    const handleFilter = (e:any)=>{
        const searchTerm = e.target.value.toLowerCase();
        const records = employees.filter((emp)=> {
            return emp.name.toLowerCase().includes(searchTerm)
        })
        setFilteredEmployee(records)
    }
    return (
      <>
        {emplaoding ? 
          <div className="fixed inset-0 bg-white/80 flex items-center justify-center z-50">
              <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="ml-3 text-lg text-gray-700">Loading...</span>
          </div>  :
          <>
            <Link to="/admin-dashboard" className="inline-block mb-2 ml-2 text-blue-500 hover:text-blue-700">
                <span>
                    <FontAwesomeIcon icon={faArrowLeft} />
                </span>
            </Link>
            <div className="p-5">
                <div className='text-center'>
                    <h1 className="text-2xl font-bold p-4">قسم إدارة الموظفين</h1>
                </div>
                <div className='flex justify-between item-center'>
                    <input type="text" placeholder="البحث حسب اسم الموظف" className="w-100 px-4 py-0.5 border" onChange={handleFilter} />
                    <Link to='/admin-dashboard/add-employees' className='px-4 py-1 bg-blue-600 rounded text-white hover:bg-blue-700 transition'>أضافة موظف جديد</Link>
                </div>
                <div className="mt-4 overflow-x-auto">
                    <DataTable<EmployeeRow> columns={memoizedColumns} data={filteredEmployee} pagination/>
                </div>
            </div>
          </>
        }
      </>
    )
}

export default Employee
