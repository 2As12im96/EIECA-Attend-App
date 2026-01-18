import { useEffect, useState, useMemo } from 'react';
import DataTable from 'react-data-table-component';
import axios from 'axios';
import { Url } from '../../utils/Url';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPlus,
    faExclamationTriangle,
    faTrash,
    faEdit,
    faBoxes,
    faImage,
    faFilter,
    faWarehouse,
    faChartPie,
    faTimes ,
    faPrint, faFilePdf, faFileExcel, faChevronDown, 
    // faExchangeAlt
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAuth } from '../Context/Context';
import Swal from 'sweetalert2';

const InventoryList = () => {
    const { user } = useAuth();
    const [inventory, setInventory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterLocation, setFilterLocation] = useState('all');

    // 1. جلب البيانات عند تحميل الصفحة
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
                setInventory(res.data.report);
            }
        } catch (err) {
            console.error("خطأ في جلب بيانات المخزن", err);
        } finally {
            setLoading(false);
        }
    };

    // 2. وظيفة حذف صنف
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
                fetchInventory();
            } catch (err: any) {
                Swal.fire("خطأ", "لا يمكن حذف صنف مرتبط بحركات مخزنية", "error");
            }
        }
    };

    // 3. معالجة البيانات وتجميعها (Grouping)
    const groupedData = useMemo(() => {
        const groups: any = {};

        inventory.forEach((item: any) => {
            // فلترة بناءً على الموقع المختار من الكروت
            if (filterLocation !== 'all' && item.locationName !== filterLocation) return;

            const id = item.itemId;
            if (!groups[id]) {
                groups[id] = {
                    itemId: item.itemId,
                    itemName: item.itemName,
                    itemSku: item.itemSku,
                    imageUrl: item.imageUrl,
                    totalQuantity: 0,
                    branches: [],
                    hasWarning: false
                };
            }

            groups[id].totalQuantity += item.currentQuantity;
            groups[id].branches.push(item);
        });

        return Object.values(groups).map((group: any) => {
            let isLow = false;
            if (filterLocation === 'all') {
                isLow = group.totalQuantity < 10;
            } else {
                const branchData = group.branches[0];
                isLow = branchData && branchData.currentQuantity < 10;
            }
            return { ...group, hasWarning: isLow };
        });
    }, [inventory, filterLocation]);

    // 4. فلترة البحث
    const filteredData = groupedData.filter((item: any) =>
        item.itemName?.toLowerCase().includes(search.toLowerCase()) ||
        item.itemSku?.toLowerCase().includes(search.toLowerCase())
    );

    const uniqueLocations = Array.from(new Set(inventory.map(item => item.locationName)));
    const canManage = user?.role === 'admin' || user?.inventoryPermissions?.accessType === 'manage';

    // 5. مكون تفاصيل الفروع (عند ضغط سهم التوسيع)
    const ExpandedComponent = ({ data }: { data: any }) => (
        <div className="bg-slate-50 p-6 border-y border-slate-200" >
            <h4 className="text-sm font-bold mb-4 text-slate-700 flex items-center gap-2">
                <FontAwesomeIcon icon={faWarehouse} className="text-blue-500" />
                تفاصيل الكميات في الفروع
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {data.branches.map((br: any, index: number) => (
                    <div key={index} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center">
                        <div className="text-right">
                            <p className="text-xs font-bold text-gray-500">{br.locationName}</p>
                            <p className={`text-lg font-black ${br.isLowStock ? 'text-red-600' : 'text-emerald-600'}`}>
                                {br.currentQuantity} <span className="text-[10px] text-gray-400">وحدة</span>
                            </p>
                        </div>
                        <div className="text-left border-r pr-4">
                            <p className="text-[10px] text-gray-400 uppercase">حد التنبيه</p>
                            <p className="text-sm font-bold text-slate-600">{br.minStockLevel || 0}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    // 6. تعريف أعمدة الجدول
    const columns = [
        {
            name: 'الصورة',
            width: '100px',
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
            name: filterLocation === 'all' ? 'إجمالي الكمية' : `الكمية في ${filterLocation}`,
            sortable: true,
            selector: (row: any) => row.totalQuantity,
            cell: (row: any) => (
                <div className={`px-4 py-1 rounded-full font-black text-sm border ${
                    row.hasWarning ? 'bg-red-50 text-red-600 border-red-100' : 'bg-gray-100 text-gray-700 border-gray-200'
                }`}>
                    {row.totalQuantity}
                </div>
            )
        },
        {
            name: 'الحالة',
            cell: (row: any) => row.hasWarning ? (
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

    const navigate = useNavigate();
    const [showPrintOptions, setShowPrintOptions] = useState(false);

    const handlePrint = (type: 'pdf' | 'excel') => {
        navigate(`/admin-dashboard/inventory/report-print?type=${type}&location=${filterLocation}`);
    };

    return (
        <div className="p-6 bg-[#f8fafc] min-h-screen" >
            {/* Header القسم العلوي */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-200 text-white">
                        <FontAwesomeIcon icon={faBoxes} className="text-3xl" />
                    </div>
                    <div className="text-right">
                        <h2 className="text-3xl font-black text-gray-800 leading-tight">مستودع المنتجات الشامل</h2>
                        <p className="text-sm text-gray-500 mt-1">عرض إجمالي الكميات مع إمكانية تفصيل الفروع</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {canManage && (
                        <>
                            <Link to="categories" className="bg-white border text-gray-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-gray-50 transition shadow-sm">
                                <FontAwesomeIcon icon={faChartPie} className="text-orange-500" /> الأقسام
                            </Link>
                            
                            {/* زر تحويل البضاعة الجديد */}
                            {/* <Link to="transfer" className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-purple-700 shadow-lg shadow-purple-100 transition">
                                <FontAwesomeIcon icon={faExchangeAlt} /> تحويل مخزني
                            </Link> */}

                            <Link to="location" className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-red-700 shadow-lg shadow-blue-100 transition">
                                <FontAwesomeIcon icon={faPlus} /> فرع مخزن جديد
                            </Link>

                            <Link to="add" className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-100 transition">
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
                                    <div className="absolute top-full mt-2 w-40 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden">
                                        <button 
                                            onClick={() => handlePrint('pdf')}
                                            className="w-full text-right px-4 py-3 text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                                        >
                                            <FontAwesomeIcon icon={faFilePdf} className="text-red-500" /> تصدير PDF
                                        </button>
                                        <button 
                                            onClick={() => handlePrint('excel')}
                                            className="w-full text-right px-4 py-3 text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700 border-t border-gray-50"
                                        >
                                            <FontAwesomeIcon icon={faFileExcel} className="text-green-600" /> تصدير Excel
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* كروت الفروع */}
            <div className="mb-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <button
                    onClick={() => setFilterLocation('all')}
                    className={`p-4 rounded-2xl border transition-all text-right shadow-sm ${
                        filterLocation === 'all'
                            ? 'bg-blue-600 text-white border-blue-600 ring-4 ring-blue-50'
                            : 'bg-white border-gray-100 text-gray-600 hover:border-blue-200'
                    }`}
                >
                    <p className="text-[16px] opacity-70 mb-1">الرصيد الكلي</p>
                    <p className="text-2xl font-black leading-none">{groupedData.length} <span className="text-[16px]">صنف</span></p>
                </button>
                {uniqueLocations.map(loc => (
                    <button
                        key={loc}
                        onClick={() => setFilterLocation(loc)}
                        className={`p-4 rounded-2xl border transition-all text-right shadow-sm ${
                            filterLocation === loc
                                ? 'bg-emerald-600 text-white border-emerald-600 ring-4 ring-emerald-50'
                                : 'bg-white border-gray-100 text-gray-600 hover:border-emerald-200'
                        }`}
                    >
                        <p className="text-[16px] opacity-70 mb-1">فرع {loc}</p>
                        <p className="text-2xl font-black leading-none">
                            {inventory.filter(i => i.locationName === loc).length}
                        </p>
                    </button>
                ))}
            </div>

            {/* حاوية الجدول والبحث */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row justify-between gap-4 bg-white">
                    <div className="relative flex-1 max-w-xl">
                        <FontAwesomeIcon icon={faFilter} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
                        <input
                            type="text"
                            placeholder="ابحث بالاسم أو SKU..."
                            className="w-full pr-12 pl-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 transition text-sm outline-none"
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    {filterLocation !== 'all' && (
                        <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold border border-blue-100 animate-fade-in">
                            عرض نتائج: {filterLocation}
                            <button onClick={() => setFilterLocation('all')} className="hover:text-blue-800">
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>
                    )}
                </div>

                <DataTable
                    columns={columns}
                    data={filteredData}
                    pagination
                    progressPending={loading}
                    expandableRows
                    expandableRowsComponent={ExpandedComponent}
                    highlightOnHover
                    pointerOnHover
                    noDataComponent={<div className="p-10 text-gray-400 italic">لا توجد أصناف حالياً</div>}
                />
            </div>
        </div>
    );
};

export default InventoryList;