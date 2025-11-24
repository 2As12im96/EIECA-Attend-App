import { Link } from "react-router-dom";
import DataTable from "react-data-table-component";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import ConfirmationModal from "./ConfirmationModel";
import type { DeleteModalState, DepartmentRow } from "../../../Types/type";
import { Url } from "../../../../utils/Url";
import { columns ,  DepartmentButtons } from "../../../../utils/DepartmentHelper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

function Departments() {
    const [departments, setDepartments] = useState<DepartmentRow[]>([]);
    const [deplaoding, setDeplaoding] = useState<boolean>(false);
    const [deleteItem, setDeleteItem] = useState<DeleteModalState | null>(null);
    const [filteredDepartment , setFilteredDepartment] = useState< DepartmentRow[]>([]);
    console.log(filteredDepartment);

    const onDepartmentDelete = (id: string) => {
        const data = departments.filter((dep) => dep._id !== id);
        setDepartments(data);
    }
    
    const openDeleteModal = (id: string, name: string) => { 
        setDeleteItem({ id, name });
    };

    const closeDeleteModal = () => {
        setDeleteItem(null);
    };

    const handleConfirmDelete = async () => {
        if (!deleteItem) return;
        const idToDelete = deleteItem.id;
        closeDeleteModal();
        try {
            const res = await axios.delete(`${Url}/department/${idToDelete}`, {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (res.data.success) {
                onDepartmentDelete(idToDelete); 
            }
        } catch (err: any) {
            if (err.response && err.response.data.message) {
                alert(err.response.data.message);
            } else {
                alert("حدث خطأ أثناء الحذف الرجاء المحاولة مرة أخرى");
            }
        }
    };

    const memoizedColumns = useMemo(() => columns, []);

    useEffect(() => {
        const fetchDepartments = async () => {
            setDeplaoding(true);
            try {
                const res = await axios.get(`${Url}/department`, {
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (res.data.success) {
                    let sno = 1;
                    const data: DepartmentRow[] = res.data.departments.map((dep: any) => (
                        {
                            _id: dep._id,
                            sno: sno++,
                            dep_name: dep.dep_name,
                            action: (<DepartmentButtons DepId={String(dep._id)} DepName={dep.dep_name} onOpenModal={openDeleteModal} />)
                        }
                    ));
                    setDepartments(data);
                    setFilteredDepartment(data);
                }
            }
            catch (err: any) {
                if (err.response && err.response.data.message) {
                    alert(err.response.data.message);
                }
            }
            finally {
                setDeplaoding(false);
            }
        }
        fetchDepartments();
    }, []);

    
    const filterDepartments = (e:any)=>{
        const records = departments.filter((dep)=> dep.dep_name.toLocaleLowerCase().includes(e.target.value.toLocaleLowerCase()));
        setFilteredDepartment(records);
    }
    return (
        <>
            {deplaoding ?
                <div className="fixed inset-0 bg-white/80 flex items-center justify-center z-50">
                    <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="ml-3 text-lg text-gray-700">Loading...</span>
                </div> :
                <>
                    {deleteItem && ( 
                      <ConfirmationModal
                          onClose={closeDeleteModal}
                          onConfirm={handleConfirmDelete}
                          message={`هل أنت متأكد أنك تريد حذف هذا القسم: ${deleteItem.name}`}
                      />
                    )}

                    <div className="p-5">
                        <Link to="/admin-dashboard" className="inline-block mb-2 text-blue-500 hover:text-blue-700">
                            <span>
                                <FontAwesomeIcon icon={faArrowLeft} />
                            </span>
                        </Link>
                        <div className='text-center'>
                            <h1 className="text-2xl font-bold p-4">إدارة الأقسام</h1>
                        </div>
                        <div className='flex justify-between item-center'>
                            <input type="text" placeholder="البحث حسب اسم القسم" className="w-100 px-4 py-0.5 border" onChange={filterDepartments} />
                            <Link to='/admin-dashboard/add-department' className='px-4 py-1 bg-blue-600 rounded text-white hover:bg-blue-700 transition'>أضافة قسم جديد</Link>
                        </div>
                        <div className="mt-4">
                            <DataTable columns={memoizedColumns} data={departments} pagination/>
                        </div>
                    </div>
                </>
            }
        </>
    )
}

export default Departments