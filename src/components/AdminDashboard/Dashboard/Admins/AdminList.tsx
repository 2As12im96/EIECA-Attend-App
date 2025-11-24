import React, { useEffect, useMemo, useState } from "react";
import * as DataTableModule from "react-data-table-component"; 
import { type TableColumn } from "react-data-table-component"; 
import type { AdminRow } from "../../../Types/type";
import axios from "axios";
import { Url } from "../../../../utils/Url";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

const DataTable = DataTableModule.default || DataTableModule; 

const adminColumns: TableColumn<AdminRow>[] = [
    { name: '#', selector: (row: AdminRow) => row.sno, sortable: true, width: '60px' },
    { 
        name: 'Image', 
        cell: (row: AdminRow) => (
            <img src={row.profileImage || 'default-image.png'} alt={row.name} className="h-10 w-10 rounded-full object-cover" />
        ), 
        width: '80px' 
    },
    { name: 'الأسم', selector: (row: AdminRow) => row.name, sortable: true },
    { name: 'البريد الإلكترونى', selector: (row: AdminRow) => row.email, sortable: true },
    { 
        name: 'Actions', 
        cell: (row: AdminRow) => row.action, 
        ignoreRowClick: true, 
        allowOverflow: true, 
        button: true, 
        width: '120px' 
    }
];

const AdminList: React.FC = () => {
    const [admins, setAdmins] = useState<AdminRow[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [filteredAdmins, setFilteredAdmins] = useState<AdminRow[]>([]);

    const fetchAdmins = async () => {
        setLoading(true);
        try {
            const res = await axios.get<{ success: boolean; admins: any[] }>(`${Url}/admins`, {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (res.data.success) {
                let sno = 1;
                const data: AdminRow[] = res.data.admins.map((admin: any) => ({
                    _id: admin._id,
                    sno: sno++,
                    name: admin.name,
                    email: admin.email,
                    profileImage: admin.profileImage,
                    action: (
                        <Link to={`/admin-dashboard/admin-details/${admin._id}`} className='w-20 bg-green-500 text-white text-center px-5 py-1 rounded mr-2 hover:bg-green-700 transition w-20 h-8'>
                            رؤية
                        </Link>
                    )
                }));
                setAdmins(data);
                setFilteredAdmins(data);
            }
        } catch (err: any) {
            alert(err.response?.data?.message || "خطأ في جلب بيانات المسؤول");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    const memoizedColumns = useMemo(() => adminColumns, []);

    const handleFilter = (e: React.ChangeEvent<HTMLInputElement>)=>{
        const searchTerm = e.target.value.toLowerCase();
        const records = admins.filter((admin) => {
            return admin.name.toLowerCase().includes(searchTerm) || admin.email.toLowerCase().includes(searchTerm);
        });
        setFilteredAdmins(records);
    };

    return (
        <>
            {loading ? 
                <div className="fixed inset-0 bg-white/80 flex items-center justify-center z-50">
                    <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="ml-3 text-lg text-gray-700">Loading...</span>
                </div> 
                :
                <div className="p-2">
                    <Link to="/admin-dashboard" className="inline-block mb-2 text-blue-500 hover:text-blue-700">
                        <span>
                            <FontAwesomeIcon icon={faArrowLeft} />
                        </span>
                    </Link>
                    <div className='text-center'>
                        <h1 className="text-2xl font-bold p-4">قسم إدارة المسئولين</h1>
                    </div>
                    <div className='flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0'>
                        <input 
                            type="text" 
                            placeholder="Search By Name or Email" 
                            className="w-full md:w-auto px-4 py-1.5 border" 
                            onChange={handleFilter} 
                        />
                        <Link 
                            to='/admin-dashboard/add-employees' 
                            className='w-full md:w-auto text-center px-4 py-1.5 bg-blue-600 rounded text-white hover:bg-blue-700 transition'
                        >
                            أضافة مسئول جديد
                        </Link>
                    </div>
                    <div className="mt-4 overflow-x-auto">
                        <DataTable<AdminRow> 
                            columns={memoizedColumns} 
                            data={filteredAdmins} 
                            pagination
                        />
                    </div>
                </div>
            }
        </>
    );
}

export default AdminList;