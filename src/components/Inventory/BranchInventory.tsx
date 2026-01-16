import { useEffect, useState, useMemo } from 'react';
import DataTable from 'react-data-table-component';
import axios from 'axios';
import { Url } from '../../utils/Url';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faExclamationTriangle, faTrash, faEdit, faBoxes, faImage, 
    faFilter, faMapMarkerAlt, faPlus, faChartPie, faPrint, 
    faChevronDown, faFilePdf, faFileExcel
} from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/Context'; 
import Swal from 'sweetalert2';

const BranchInventory = () => {
    const { user }: any = useAuth();
    const navigate = useNavigate();
    const [inventory, setInventory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showPrintOptions, setShowPrintOptions] = useState(false);

    // تعديل المنطق ليكون أكثر مرونة في قراءة المسمى الوظيفي
    const canManage = useMemo(() => {
        if (user?.role === 'admin') return true;
        const jobTitle = user?.designation || "";
        return jobTitle.includes('مدير مخزن') || jobTitle.includes('مدير مخازن');
    }, [user]);

    useEffect(() => {
        if (user?.locationName) {
            fetchInventory();
        }
    }, [user]);

    const fetchInventory = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get(`${Url}/inventory/report`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                const userBranch = user?.locationName?.trim();
                const branchData = res.data.report.filter((item: any) => {
                    if (user?.role === 'admin') return true;
                    return item.locationName?.trim() === userBranch;
                });
                setInventory(branchData);
            }
        } catch (err) {
            console.error("خطأ في جلب البيانات:", err);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = (type: 'pdf' | 'excel') => {
        const location = encodeURIComponent(user?.locationName || '');
        const url = `/employee-dashboard/inventory/report-print?location=${location}${type === 'excel' ? '&type=excel' : ''}`;
        navigate(url);
        setShowPrintOptions(false);
    };

    const handleDelete = async (id: string) => {
        const result = await Swal.fire({
            title: "هل أنت متأكد؟",
            text: "لن تتمكن من التراجع عن هذا الإجراء!",
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
                fetchInventory();
            } catch (err) {
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
                <img src={row.imageUrl} className="w-10 h-10 rounded-lg object-cover border shadow-sm" alt="" /> :
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-300 border">
                    <FontAwesomeIcon icon={faImage} />
                </div>
        },
        {
            name: 'الصنف / SKU',
            sortable: true,
            grow: 2,
            cell: (row: any) => (
                <div className="py-2 text-right">
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
                    row.isLowStock ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
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
                            <Link to={`edit/${row.itemId}`} className="text-blue-500 hover:scale-125 transition-transform">
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
        <div className="p-6 bg-[#f8fafc] min-h-screen font-tajawal">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <div className="bg-emerald-600 p-3 rounded-2xl shadow-lg text-white">
                        <FontAwesomeIcon icon={faBoxes} className="text-3xl" />
                    </div>
                    <div className="text-right">
                        <h2 className="text-3xl font-black text-gray-800 leading-tight">{user?.locationName || "الفرع"}</h2>
                        <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-emerald-500" />
                            {user?.designation || "إدارة المخزون"}
                        </p>
                    </div>
                </div>

                {canManage && (
                    <div className="flex flex-wrap gap-2">
                        <Link to="categories" className="bg-white border text-gray-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-gray-50 transition shadow-sm">
                            <FontAwesomeIcon icon={faChartPie} className="text-orange-500" /> الأقسام
                        </Link>
                        <Link to="add" className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-blue-700 shadow-lg transition">
                            <FontAwesomeIcon icon={faPlus} /> صنف جديد
                        </Link>
                        <div className="relative">
                            <button 
                                onClick={() => setShowPrintOptions(!showPrintOptions)}
                                className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-emerald-700 shadow-lg transition"
                            >
                                <FontAwesomeIcon icon={faPrint} /> طباعة التقرير <FontAwesomeIcon icon={faChevronDown} className="text-[10px]" />
                            </button>
                            {showPrintOptions && (
                                <div className="absolute left-0 top-full mt-2 w-40 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden">
                                    <button onClick={() => handlePrint('pdf')} className="w-full text-right px-4 py-3 text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700">
                                        <FontAwesomeIcon icon={faFilePdf} className="text-red-500" /> تصدير PDF
                                    </button>
                                    <button onClick={() => handlePrint('excel')} className="w-full text-right px-4 py-3 text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700 border-t">
                                        <FontAwesomeIcon icon={faFileExcel} className="text-green-600" /> تصدير Excel
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex justify-between items-center">
                    <div>
                        <p className="text-gray-400 text-xs font-bold mb-1 uppercase tracking-wider">إجمالي الأصناف</p>
                        <h3 className="text-4xl font-black text-slate-800">{inventory.length}</h3>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl text-slate-400">
                        <FontAwesomeIcon icon={faBoxes} size="xl" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex justify-between items-center">
                    <div>
                        <p className="text-gray-400 text-xs font-bold mb-1 uppercase tracking-wider">نواقص المخزن</p>
                        <h3 className="text-4xl font-black text-red-600">{inventory.filter(i => i.isLowStock).length}</h3>
                    </div>
                    <div className="bg-red-50 p-4 rounded-2xl text-red-400">
                        <FontAwesomeIcon icon={faExclamationTriangle} size="xl" />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 bg-white flex flex-col md:flex-row justify-between gap-4">
                    <div className="relative flex-1 max-w-xl">
                        <FontAwesomeIcon icon={faFilter} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
                        <input
                            type="text"
                            placeholder="ابحث بالاسم أو SKU..."
                            className="w-full pr-12 pl-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-emerald-500 transition text-sm outline-none"
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
                    noDataComponent={<div className="p-10 text-gray-400 italic font-bold">لا توجد أصناف في هذا الفرع</div>}
                />
            </div>
        </div>
    );
};

export default BranchInventory;