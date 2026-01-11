import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faBoxOpen, faBarcode, faLayerGroup, faDollarSign, 
    faImage, faStoreAlt, faSave, faCloudUploadAlt, 
    faTimesCircle, faInfoCircle, 
    faArrowLeft
} from '@fortawesome/free-solid-svg-icons';
import { Url } from '../../utils/Url';

const AddItem = () => {
    const navigate = useNavigate();

    // --- الحالات (States) ---
    const [formData, setFormData] = useState({
        sku: '',
        name: '',
        description: '',
        unitOfMeasure: 'قطعة',
        costPrice: '',
        category: '',
    });

    const [locations, setLocations] = useState([]);
    const [categories, setCategories] = useState([]);
    const [branchStocks, setBranchStocks] = useState<{ [key: string]: number }>({});
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // --- جلب البيانات الأساسية ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const [locRes, catRes] = await Promise.all([
                    axios.get(`${Url}/inventory/locations`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${Url}/inventory/categories`, { headers: { Authorization: `Bearer ${token}` } })
                ]);
                setLocations(locRes.data.locations);
                setCategories(catRes.data.categories);
            } catch (err) {
                console.error("خطأ في جلب البيانات:", err);
                Swal.fire('خطأ', 'فشل في تحميل الفروع أو الأقسام', 'error');
            }
        };
        fetchData();
    }, []);

    // --- معالجة المدخلات النصية ---
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleStockChange = (locationId: string, value: string) => {
        setBranchStocks({
            ...branchStocks,
            [locationId]: parseInt(value) || 0
        });
    };

    // --- إعدادات Drag & Drop ---
    const onDrop = useCallback((acceptedFiles: File[]) => {
        const selectedFile = acceptedFiles[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        multiple: false
    });

    const removeImage = () => {
        setFile(null);
        setPreview(null);
    };

    // --- إرسال البيانات ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // تحقق بسيط
        if (Object.keys(branchStocks).length === 0 || Object.values(branchStocks).every(v => v === 0)) {
            const confirm = await Swal.fire({
                title: 'تنبيه',
                text: "لم تقم بإدخال كميات لأي فرع، هل تريد المتابعة وإضافة الصنف برصيد صفر؟",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'نعم، تابع',
                cancelButtonText: 'إلغاء'
            });
            if (!confirm.isConfirmed) return;
        }

        setLoading(true);
        const data = new FormData();
        data.append('sku', formData.sku);
        data.append('name', formData.name);
        data.append('description', formData.description);
        data.append('unitOfMeasure', formData.unitOfMeasure);
        data.append('costPrice', formData.costPrice);
        data.append('category', formData.category);
        data.append('branchStocks', JSON.stringify(branchStocks)); // إرسال توزيع المخزون
        
        if (file) data.append('itemImage', file);

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${Url}/inventory/add-item`, data, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (res.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'تمت الإضافة',
                    text: 'تم حفظ الصنف وتوزيع الكميات بنجاح',
                    timer: 2000,
                    showConfirmButton: false
                });
                navigate('/admin-dashboard/inventory');
            }
        } catch (err: any) {
            Swal.fire('خطأ', err.response?.data?.message || 'حدث خطأ أثناء الحفظ', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-8xl mx-auto p-4 md:p-8 bg-white shadow-2xl rounded-[2rem] border border-gray-50">
            <button onClick={() => navigate(-1)} className="mb-6 text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-2 font-medium">
                <FontAwesomeIcon icon={faArrowLeft} /> العودة للمخزن
            </button>

            {/* الرأس */}
            <div className="text-center mb-10">
                <h2 className="text-4xl font-black text-gray-800 flex items-center justify-center gap-4">
                    <div className="bg-blue-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                        <FontAwesomeIcon icon={faBoxOpen} />
                    </div>
                    إضافة صنف جديد
                </h2>
                <p className="text-gray-500 mt-3 font-medium text-lg">قم بتعبئة بيانات المنتج وتوزيع مخزونه الافتتاحي</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* القسم الأول: المعلومات الأساسية */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-600 mr-2"><FontAwesomeIcon icon={faBarcode} className="ml-1 text-blue-500"/> رمز المنتج (SKU)</label>
                        <input name="sku" value={formData.sku} onChange={handleChange} required placeholder="مثال: APP-IPH-15" className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-mono" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-600 mr-2"><FontAwesomeIcon icon={faBoxOpen} className="ml-1 text-blue-500"/> اسم المنتج</label>
                        <input name="name" value={formData.name} onChange={handleChange} required placeholder="أدخل اسم المنتج بالكامل" className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-600 mr-2"><FontAwesomeIcon icon={faLayerGroup} className="ml-1 text-blue-500"/> القسم / الفئة</label>
                        <select name="category" value={formData.category} onChange={handleChange} required className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all">
                            <option value="">اختر القسم المناسب</option>
                            {categories.map((cat: any) => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-600 mr-2"><FontAwesomeIcon icon={faDollarSign} className="ml-1 text-blue-500"/> سعر التكلفة</label>
                        <input type="number" name="costPrice" value={formData.costPrice} onChange={handleChange} required placeholder="0.00" className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all" />
                    </div>
                </div>

                {/* القسم الثاني: توزيع المخزون */}
                <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-6 md:p-8 rounded-[2.5rem] border border-blue-100 shadow-inner">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-blue-900 flex items-center gap-3">
                            <FontAwesomeIcon icon={faStoreAlt} />
                            توزيع الكميات على الفروع
                        </h3>
                        <span className="bg-blue-200 text-blue-800 text-xs font-black px-3 py-1 rounded-full uppercase">الرصيد الافتتاحي</span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {locations.map((loc: any) => (
                            <div key={loc._id} className="bg-white p-5 rounded-3xl shadow-sm flex items-center justify-between border border-transparent hover:border-blue-300 transition-all">
                                <div>
                                    <p className="font-extrabold text-gray-800 leading-tight">{loc.name}</p>
                                    <p className="text-xs text-gray-400 font-medium">{loc.city}</p>
                                </div>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        min="0"
                                        placeholder="0"
                                        className="w-20 p-2 pr-2 bg-gray-50 border-none rounded-xl text-center font-black text-blue-600 focus:ring-2 focus:ring-blue-400 transition-all"
                                        onChange={(e) => handleStockChange(loc._id, e.target.value)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* القسم الثالث: رفع الصورة (Drag & Drop) */}
                <div className="space-y-4">
                    <label className="text-sm font-bold text-gray-600 mr-2"><FontAwesomeIcon icon={faImage} className="ml-1 text-blue-500"/> صورة المنتج</label>
                    
                    {!preview ? (
                        <div 
                            {...getRootProps()} 
                            className={`group border-2 border-dashed rounded-[2rem] p-12 transition-all cursor-pointer flex flex-col items-center justify-center gap-4
                                ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}
                        >
                            <input {...getInputProps()} />
                            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                <FontAwesomeIcon icon={faCloudUploadAlt} className="text-blue-500 text-4xl" />
                            </div>
                            <div className="text-center">
                                <p className="text-gray-700 font-bold text-xl">اسحب صورة المنتج هنا</p>
                                <p className="text-gray-400 font-medium">أو انقر لتصفح ملفاتك</p>
                            </div>
                        </div>
                    ) : (
                        <div className="relative w-full max-w-sm mx-auto">
                            <img src={preview} alt="معاينة" className="w-full h-64 object-cover rounded-[2rem] shadow-2xl border-4 border-white" />
                            <button 
                                type="button" 
                                onClick={removeImage}
                                className="absolute -top-3 -right-3 bg-red-500 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-all scale-110"
                            >
                                <FontAwesomeIcon icon={faTimesCircle} size="lg" />
                            </button>
                        </div>
                    )}
                </div>

                {/* الوصف (TextArea) */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-600 mr-2"><FontAwesomeIcon icon={faInfoCircle} className="ml-1 text-blue-500"/> وصف المنتج (اختياري)</label>
                    <textarea 
                        name="description" 
                        value={formData.description}
                        onChange={handleChange}
                        rows={3} 
                        className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="أدخل تفاصيل إضافية عن المنتج..."
                    />
                </div>

                {/* زر الحفظ */}
                <button 
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-[2rem] transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-3 text-xl disabled:bg-gray-300"
                >
                    {loading ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    ) : (
                        <>
                            <FontAwesomeIcon icon={faSave} />
                            حفظ المنتج وتحديث الفروع
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default AddItem;