import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Url } from '../../utils/Url';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faArrowLeft, faStore, faLock } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../Context/Context';

const EditItem = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth(); 
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        category: '',
        description: '',
        stocks: [] as { locationId: string, locationName: string, quantity: number }[]
    });

    useEffect(() => {
        fetchInitialData();
    }, [id]);

    const fetchInitialData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [itemRes, catRes] = await Promise.all([
                axios.get(`${Url}/inventory/item-details/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${Url}/inventory/categories`, { headers: { Authorization: `Bearer ${token}` } })
            ]);

            if (itemRes.data.success) {
                const data = itemRes.data.data;
                setFormData({
                    name: data.itemName,
                    sku: data.itemSku,
                    category: data.categoryId,
                    description: data.description || '',
                    stocks: data.branchDetails || []
                });
            }
            setCategories(catRes.data.categories || []);
        } catch (err) {
            Swal.fire("خطأ", "تعذر جلب بيانات الصنف", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleQuantityChange = (locationId: string, newQty: number) => {
        setFormData(prev => ({
            ...prev,
            stocks: prev.stocks.map(s => s.locationId === locationId ? { ...s, quantity: newQty } : s)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(`${Url}/inventory/item-bulk-update/${id}`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                Swal.fire("تم التحديث!", "تم حفظ التعديلات بنجاح.", "success");
                navigate(-1);
            }
        } catch (err: any) {
            Swal.fire("خطأ", "فشل في تحديث البيانات", "error");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-10 text-center text-blue-600 font-bold text-xl animate-pulse">جاري التحميل...</div>;

    return (
        <div className="p-4 max-w-8xl mx-auto text-right" dir="ltr">
            
            <button onClick={() => navigate(-1)} className="mb-6 text-gray-500 hover:text-blue-600 flex items-center gap-2 transition-all font-bold text-base">
                <FontAwesomeIcon icon={faArrowLeft} /> العودة للمخزن العام
            </button>

            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* القسم الأول: البيانات الأساسية - حجم خط متوسط p-8 */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-black mb-6 text-gray-800 flex items-center gap-3">
                        <span className="w-2 h-7 bg-blue-600 rounded-full"></span>
                        البيانات الأساسية للصنف
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-base font-bold text-gray-700 mb-2">اسم المنتج</label>
                            <input 
                                type="text" 
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-base font-semibold"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                required 
                            />
                        </div>

                        <div>
                            <label className="block text-base font-bold text-gray-700 mb-2">رمز المنتج (SKU)</label>
                            <input 
                                type="text" 
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-base font-mono font-bold"
                                value={formData.sku}
                                onChange={(e) => setFormData({...formData, sku: e.target.value})}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-base font-bold text-gray-700 mb-2">القسم / التصنيف</label>
                            <select 
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-base font-semibold"
                                value={formData.category}
                                onChange={(e) => setFormData({...formData, category: e.target.value})}
                            >
                                <option value="">اختر القسم</option>
                                {categories.map((cat: any) => (
                                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* القسم الثاني: تعديل الكميات - توزيع متناسق وحجم متوسط */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-black mb-8 text-gray-800 flex items-center gap-3">
                        <span className="w-2 h-7 bg-emerald-500 rounded-full"></span>
                        تعديل الكميات في الفروع
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {formData.stocks.map((stock) => {
                            const isAdmin = user?.role === 'admin';
                            const userBranch = user?.branch?.toLowerCase().trim() || "";
                            const currentLocName = stock.locationName?.toLowerCase().trim() || "";

                            // فحص ذكي للغة لفتح فرع القاهرة أو المنصورة حسب حساب الموظف
                            const isCairoMatch = userBranch === 'cairo' && currentLocName.includes('قاهرة');
                            const isMansouraMatch = userBranch === 'mansoura' && currentLocName.includes('منصورة');
                            const isBasicMatch = currentLocName.includes(userBranch) || userBranch.includes(currentLocName);

                            const canEdit = isAdmin || isCairoMatch || isMansouraMatch || isBasicMatch;

                            return (
                                <div key={stock.locationId} 
                                     className={`flex items-center justify-between p-6 rounded-2xl border transition-all ${
                                         !canEdit ? 'bg-gray-50 opacity-60' : 'bg-white border-gray-200 shadow-sm hover:border-emerald-200'
                                     }`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl text-xl ${!canEdit ? 'bg-gray-200 text-gray-400' : 'bg-emerald-50 text-emerald-600'}`}>
                                            <FontAwesomeIcon icon={canEdit ? faStore : faLock} />
                                        </div>
                                        <div className="flex flex-col text-right">
                                            <span className="font-bold text-gray-800 text-base">{stock.locationName}</span>
                                            {!canEdit && <span className="text-sm text-red-500 font-bold italic">للقراءة فقط</span>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <input 
                                            type="number"
                                            disabled={!canEdit}
                                            className={`w-24 p-2.5 text-center font-black rounded-xl outline-none transition-all text-lg ${
                                                !canEdit 
                                                ? "bg-transparent text-gray-400 cursor-not-allowed border-none shadow-none" 
                                                : "text-blue-700 bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-emerald-500"
                                            }`}
                                            value={stock.quantity}
                                            onChange={(e) => handleQuantityChange(stock.locationId, parseInt(e.target.value) || 0)}
                                        />
                                        <span className="text-sm font-bold text-gray-500">وحدة</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* أزرار التحكم */}
                <div className="flex gap-4">
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-2xl font-black text-lg shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-3"
                    >
                        <FontAwesomeIcon icon={faSave} />
                        {loading ? "جاري الحفظ..." : "حفظ التعديلات"}
                    </button>
                    <button 
                        type="button"
                        onClick={() => navigate(-1)}
                        className="px-10 bg-white border border-gray-200 text-gray-600 rounded-2xl font-bold text-base hover:bg-gray-50 transition-all"
                    >
                        إلغاء
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditItem;