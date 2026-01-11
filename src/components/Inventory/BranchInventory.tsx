import { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import axios from 'axios';
import { Url } from '../../utils/Url';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faExclamationTriangle,
    faImage,
    faFilter,
    faWarehouse,
    faChartPie,
    faPlus,
    faEdit,
    faTrash
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../Context/Context';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

const BranchInventory = () => {
    const { user } = useAuth();
    const [inventory, setInventory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // صلاحية الإدارة (إضافة/تعديل/حذف)
    const canManage = user?.role === 'admin' || user?.inventoryPermissions?.accessType === 'manage';

    useEffect(() => {
        fetchInventory();
    }, [user]);

    const fetchInventory = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get(`${Url}/inventory/report`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                const userBranch = user?.branch?.toLowerCase() || "";
                const branchData = res.data.report.filter((item: any) => {
                    const locName = item.locationName?.toLowerCase() || "";
                    if (userBranch.includes("mansoura") || userBranch.includes("منصورة")) {
                        return locName.includes("منصورة");
                    }
                    if (userBranch.includes("cairo") || userBranch.includes("قاهرة")) {
                        return locName.includes("قاهرة");
                    }
                    return locName.includes(userBranch);
                });
                setInventory(branchData);
            }
        } catch (err) {
            console.error("Error fetching inventory:", err);
        } finally {
            setLoading(false);
        }
    };

    // دالة الحذف
    const handleDelete = async (id: string) => {
        const result = await Swal.fire({
            title: "هل أنت متأكد؟",
            text: "سيتم حذف الصنف نهائياً من كافة الفروع!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            confirmButtonText: "نعم، احذفه",
            cancelButtonText: "إلغاء",
            reverseButtons: true
        });

        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${Url}/inventory/item/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                Swal.fire("تم الحذف!", "تم إزالة الصنف بنجاح.", "success");
                fetchInventory(); // إعادة تحميل البيانات
            } catch (err: any) {
                Swal.fire("خطأ", "لا يمكن حذف صنف مرتبط بحركات مخزنية", "error");
            }
        }
    };

    const filteredData = inventory.filter((item: any) =>
        item.itemName?.toLowerCase().includes(search.toLowerCase()) ||
        item.itemSku?.toLowerCase().includes(search.toLowerCase())
    );

    const columns = [
        {
            name: 'الصورة',
            width: '80px',
            cell: (row: any) => row.imageUrl ?
                <img src={row.imageUrl} className="w-10 h-10 rounded-lg object-cover border" alt="" /> :
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-300 border">
                    <FontAwesomeIcon icon={faImage} />
                </div>
        },
        {
            name: 'الصنف / SKU',
            sortable: true,
            grow: 2,
            cell: (row: any) => (
                <div className="py-2 text-left">
                    <div className="font-bold text-gray-800 leading-tight">{row.itemName}</div>
                    <div className="text-[10px] text-blue-500 font-mono mt-1 uppercase tracking-tighter">{row.itemSku}</div>
                </div>
            )
        },
        {
            name: 'الكمية الحالية',
            sortable: true,
            selector: (row: any) => row.currentQuantity,
            cell: (row: any) => (
                <div className={`px-4 py-1 rounded-full font-black text-sm border ${
                    row.isLowStock ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                }`}>
                    {row.currentQuantity}
                </div>
            )
        },
        {
            name: 'الحالة',
            cell: (row: any) => row.isLowStock ? (
                <div className="flex items-center gap-1 text-red-600 bg-red-50 px-3 py-1 rounded-full text-[10px] font-bold border border-red-100">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="animate-pulse" /> نقص مخزون
                </div>
            ) : (
                <div className="text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-[10px] font-bold border border-emerald-100">متوفر</div>
            )
        },
        {
            name: 'إجراءات',
            width: '120px',
            cell: (row: any) => (
                <div className="flex gap-4">
                    {canManage && (
                        <>
                            {/* تم تعديل المسار ليعود خطوة للخلف لأن صفحة الموظف في مستوى مختلف في الـ Routes */}
                            <Link to={`../inventory/edit/${row.itemId}`} className="text-blue-500 hover:scale-125 transition-transform">
                                <FontAwesomeIcon icon={faEdit} />
                            </Link>
                            <button onClick={() => handleDelete(row.itemId)} className="text-red-400 hover:scale-125 transition-transform">
                                <FontAwesomeIcon icon={faTrash} />
                            </button>
                        </>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="p-6 bg-[#f8fafc] min-h-screen text-left" dir="ltr">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-200 text-white">
                        <FontAwesomeIcon icon={faWarehouse} className="text-3xl" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-gray-800 leading-tight">مخزن الفرع</h2>
                        <p className="text-sm text-gray-500 mt-1">عرض المخزون لفرع: <span className="font-bold text-blue-600">{user?.branch || "الفرع الحالي"}</span></p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {canManage && (
                        <>
                            <Link to="../inventory/categories" className="bg-white border text-gray-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-gray-50 transition shadow-sm">
                                <FontAwesomeIcon icon={faChartPie} className="text-orange-500" /> الأقسام
                            </Link>
                            <Link to="../inventory/add" className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-100 transition">
                                <FontAwesomeIcon icon={faPlus} /> صنف جديد
                            </Link>
                        </>
                    )}
                </div>
            </div>

            {/* Statistics */}
            <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-600 p-4 rounded-2xl border border-blue-600 text-white shadow-sm">
                    <p className="text-[16px] opacity-70 mb-1">أصناف الفرع</p>
                    <p className="text-2xl font-black leading-none">{filteredData.length} <span className="text-[16px]">صنف</span></p>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row justify-between gap-4 bg-white">
                    <div className="relative flex-1 max-w-xl">
                        <FontAwesomeIcon icon={faFilter} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                        <input
                            type="text"
                            placeholder="ابحث بالاسم أو SKU..."
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 transition text-sm outline-none"
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={filteredData}
                    pagination
                    progressPending={loading}
                    highlightOnHover
                    pointerOnHover
                    noDataComponent={<div className="p-10 text-gray-400 italic text-center">لا توجد بيانات لهذا الفرع</div>}
                />
            </div>
        </div>
    );
};

export default BranchInventory;