import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Url } from '../../utils/Url';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExchangeAlt , faBoxOpen } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../Context/Context';

const Transfers = () => {
    const { user } = useAuth();
    const [items, setItems] = useState<any[]>([]);
    const [locations, setLocations] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        itemId: '',
        destinationLocationId: '',
        quantity: '',
        reference: ''
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const token = localStorage.getItem("token");
            
            // المسارات الصحيحة بناءً على ملف InventoryRoutes.js الخاص بك
            const [itemsRes, locRes] = await Promise.all([
                axios.get(`${Url}/inventory/items`, { headers: { Authorization: `Bearer ${token}` } }), // أضفنا /items
                axios.get(`${Url}/inventory/locations`, { headers: { Authorization: `Bearer ${token}` } }) // أضفنا s لـ locations
            ]);

            // الباك اند يرسل البيانات في مصفوفة مباشرة أو داخل كائن
            setItems(itemsRes.data.items || itemsRes.data || []);
            setLocations(locRes.data.locations || locRes.data || []);
            
            // تصفية المواقع لاستبعاد موقع الموظف الحالي (تأكد أن user.location هو الـ ID)
            if (locRes.data.locations || locRes.data) {
                const allLocs = locRes.data.locations || locRes.data;
                setLocations(allLocs.filter((l: any) => l._id !== user?.location));
            }

        } catch (err) {
            console.error("Fetch Error:", err);
            Swal.fire({
                icon: 'error',
                title: 'خطأ في جلب البيانات',
                text: 'تأكد من صلاحيات الوصول أو الاتصال بالسيرفر'
            });
        }
    };

    const handleInitiate = async (e: React.FormEvent) => {
        e.preventDefault();

        const confirmResult = await Swal.fire({
            title: 'تأكيد التحويل؟',
            text: `سيتم نقل ${formData.quantity} قطعة إلى الفرع المختار`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'تأكيد وإرسال',
            cancelButtonText: 'إلغاء',
            confirmButtonColor: '#4f46e5'
        });

        if (confirmResult.isConfirmed) {
            setLoading(true);
            try {
                const token = localStorage.getItem("token");
                const payload = {
                    ...formData,
                    sourceLocationId: user?.location // الـ ID المخزن في الكونتكس
                };
                
                // المسار الصحيح للتحويل في الباك اند
                const res = await axios.post(`${Url}/inventory/transfer/initiate`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (res.data.success) {
                    Swal.fire({ icon: 'success', title: 'تمت العملية', text: 'تم خصم الكمية وبدء النقل', timer: 2000 });
                    setFormData({ itemId: '', destinationLocationId: '', quantity: '', reference: '' });
                }
            } catch (err: any) {
                Swal.fire({ icon: 'error', title: 'فشل التحويل', text: err.response?.data?.message || 'حدث خطأ' });
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen font-arabic" dir="rtl">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                        <FontAwesomeIcon icon={faExchangeAlt} className="text-indigo-600" />
                        نظام التحويلات بين الفروع
                    </h2>
                    <div className="text-sm bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full font-bold">
                        فرعك الحالي: {user?.locationName || "جاري التحميل..."}
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="bg-indigo-600 p-4 text-white">
                        <h3 className="font-bold flex items-center gap-2">
                            <FontAwesomeIcon icon={faBoxOpen} /> إنشاء مستند تحويل صادر
                        </h3>
                    </div>

                    <form onSubmit={handleInitiate} className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">المنتج المراد تحويله</label>
                            <select 
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition"
                                value={formData.itemId}
                                onChange={(e) => setFormData({...formData, itemId: e.target.value})}
                                required
                            >
                                <option value="">-- اختر صنفاً --</option>
                                {items.map((item: any) => (
                                    <option key={item._id} value={item.itemId?._id || item._id}>
                                        {item.itemId?.name || item.name} (المتوفر: {item.quantity})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">المستلم (الفرع الوجهة)</label>
                            <select 
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition"
                                value={formData.destinationLocationId}
                                onChange={(e) => setFormData({...formData, destinationLocationId: e.target.value})}
                                required
                            >
                                <option value="">-- اختر فرع الاستلام --</option>
                                {locations.map((loc: any) => (
                                    <option key={loc._id} value={loc._id}>{loc.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">الكمية المنقولة</label>
                            <input 
                                type="number" 
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition"
                                value={formData.quantity}
                                onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                                min="1" required placeholder="0"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">رقم المرجع / ملاحظات</label>
                            <input 
                                type="text" 
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition"
                                value={formData.reference}
                                onChange={(e) => setFormData({...formData, reference: e.target.value})}
                                placeholder="مثلاً: طلبية رقم #102"
                            />
                        </div>

                        <div className="md:col-span-2 mt-4">
                            <button 
                                type="submit"
                                disabled={loading}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:bg-gray-400"
                            >
                                {loading ? "جاري المعالجة..." : "تأكيد وإخراج الشحنة"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Transfers;