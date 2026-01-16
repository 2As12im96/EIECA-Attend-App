import { useEffect, useState, useCallback } from 'react';
import DataTable from 'react-data-table-component';
import axios from 'axios';
import { Url } from '../../utils/Url';
import { useAuth } from '../Context/Context';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faSearch, 
    faFilter, 
    faExclamationTriangle, 
    faImage,
    faBoxOpen
} from '@fortawesome/free-solid-svg-icons';

const InventoryAlerts = () => {
    const { user }: any = useAuth();
    const [alerts, setAlerts] = useState<any[]>([]);
    const [locations, setLocations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedLocation, setSelectedLocation] = useState("all");
    const [totalItems, setTotalItems] = useState(0);

    // 1. دالة جلب البيانات
    const fetchAlerts = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${Url}/inventory/low-stock`, {
                params: { 
                    locationId: selectedLocation,
                    limit: 1000 // نطلب كمية كبيرة لأن الجدول سيتولى الترقيم داخلياً (Client-side pagination)
                },
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                setAlerts(res.data.lowStockItems || []);
                setTotalItems(res.data.count || 0);
            }
        } catch (err) {
            console.error("Error fetching alerts:", err);
        } finally {
            setLoading(false);
        }
    }, [selectedLocation]);

    // 2. جلب الفروع للأدمن فقط
    useEffect(() => {
        if (user?.role === 'admin') {
            const fetchLocs = async () => {
                try {
                    const res = await axios.get(`${Url}/inventory/locations`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    });
                    if (res.data.success) setLocations(res.data.locations);
                } catch (err) {}
            };
            fetchLocs();
        }
    }, [user]);

    useEffect(() => {
        fetchAlerts();
    }, [fetchAlerts]);

    // 3. تعريف أعمدة الجدول
    const columns = [
        {
            name: 'المنتج',
            grow: 2,
            sortable: true,
            selector: (row: any) => row.item?.name,
            cell: (row: any) => (
                <div className="flex items-center gap-3 py-2">
                    {row.item?.imageUrl ? (
                        <img src={row.item.imageUrl} className="w-10 h-10 rounded-lg object-cover border" alt="" />
                    ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-300 border">
                            <FontAwesomeIcon icon={faImage} />
                        </div>
                    )}
                    <div className="text-right">
                        <div className="font-bold text-gray-800">{row.item?.name}</div>
                        <div className="text-[10px] text-gray-400 font-mono uppercase tracking-tighter">SKU: {row.item?.sku}</div>
                    </div>
                </div>
            )
        },
        {
            name: 'الموقع / الفرع',
            sortable: true,
            selector: (row: any) => row.location?.name,
            cell: (row: any) => (
                <div className="font-bold text-blue-600 text-sm">
                    {row.location?.name}
                </div>
            )
        },
        {
            name: 'المخزون الحالي',
            sortable: true,
            center: true,
            selector: (row: any) => row.quantity,
            cell: (row: any) => (
                <div className="px-3 py-1 bg-red-50 text-red-600 rounded-full font-black border border-red-100">
                    {row.quantity}
                </div>
            )
        },
        {
            name: 'حد الأمان',
            sortable: true,
            center: true,
            selector: (row: any) => row.alertLimit,
            cell: (row: any) => (
                <div className="font-bold text-gray-400">
                    {row.alertLimit}
                </div>
            )
        },
        {
            name: 'الحالة',
            width: '120px',
            cell: () => (
                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-[10px] font-black">
                    تحت الحد
                </span>
            )
        }
    ];

    // 4. فلترة البحث
    const filteredData = alerts.filter(a => 
        a.item?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.item?.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 bg-[#f8fafc] min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <div className="bg-red-600 p-3 rounded-2xl shadow-lg shadow-red-200 text-white">
                        <FontAwesomeIcon icon={faExclamationTriangle} className="text-2xl" />
                    </div>
                    <div className="text-right">
                        <h1 className="text-2xl font-black text-gray-800">تنبيهات نقص المخزون</h1>
                        <p className="text-sm text-gray-500">الأصناف التي وصلت للحد الأدنى أو أقل</p>
                    </div>
                </div>
                
                <div className="bg-white px-6 py-4 rounded-3xl border border-red-100 flex flex-col items-center">
                    <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">إجمالي النواقص</span>
                    <span className="text-3xl font-black text-red-600 leading-none">{totalItems}</span>
                </div>
            </div>

            {/* Filters Container */}
            <div className="bg-white p-4 rounded-[2rem] shadow-sm mb-6 flex flex-wrap gap-4 items-center border border-gray-100">
                <div className="flex-1 relative min-w-[300px]">
                    <FontAwesomeIcon icon={faSearch} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input 
                        type="text" 
                        placeholder="ابحث بالاسم أو SKU داخل النواقص..."
                        className="w-full pr-12 pl-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {user?.role === 'admin' && (
                    <div className="flex items-center gap-2 bg-gray-50 px-4 py-1.5 rounded-xl border border-gray-100">
                        <FontAwesomeIcon icon={faFilter} className="text-gray-400 text-xs" />
                        <select 
                            className="bg-transparent py-2 px-2 outline-none text-sm font-bold text-gray-600 cursor-pointer"
                            value={selectedLocation}
                            onChange={(e) => setSelectedLocation(e.target.value)}
                        >
                            <option value="all">كل الفروع</option>
                            {locations.map((loc) => (
                                <option key={loc._id} value={loc._id}>{loc.name}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                <DataTable
                    columns={columns}
                    data={filteredData}
                    pagination
                    paginationPerPage={10}
                    progressPending={loading}
                    highlightOnHover
                    pointerOnHover
                    noDataComponent={
                        <div className="p-20 text-center text-gray-300">
                            <FontAwesomeIcon icon={faBoxOpen} size="3x" className="mb-4 opacity-20" />
                            <p className="font-bold text-lg">لا توجد نواقص في هذا الفرع حالياً</p>
                        </div>
                    }
                />
            </div>
        </div>
    );
};

export default InventoryAlerts;