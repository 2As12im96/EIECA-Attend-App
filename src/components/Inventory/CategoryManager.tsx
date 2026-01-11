import { useEffect, useState } from 'react';
import axios from 'axios';
import { Url } from '../../utils/Url';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faFolderPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

function CategoryManager () {
    const [categories, setCategories] = useState([]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const navigate = useNavigate();


    useEffect(() => { fetchCategories(); }, []);

    const fetchCategories = async () => {
        try {
            const res = await axios.get(`${Url}/inventory/categories`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.data.success) setCategories(res.data.categories);
        } catch (err) { console.error("خطأ في الجلب", err); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${Url}/inventory/category`, { name, description }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.data.success) {
                Swal.fire("تم!", "تم إضافة القسم بنجاح", "success");
                setName(''); setDescription('');
                fetchCategories();
            }
        } catch (err: any) {
            Swal.fire("خطأ", err.response?.data?.message || "فشل الإضافة", "error");
        }
    };

    const handleDelete = async (id: string) => {
        const result = await Swal.fire({
            title: "هل أنت متأكد؟",
            text: "سيؤدي هذا إلى حذف القسم نهائياً!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "نعم، احذفه",
            cancelButtonText: "إلغاء",
            reverseButtons: true
        });

        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.delete(`${Url}/inventory/category/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (res.data.success) {
                    Swal.fire("تم الحذف!", "تم إزالة القسم بنجاح.", "success");
                    fetchCategories(); // إعادة جلب الأقسام لتحديث الجدول
                }
            } catch (err: any) {
                Swal.fire("خطأ", err.response?.data?.message || "فشل حذف القسم", "error");
            }
        }
    };

    return (
        <div className="p-4 max-w-8xl mx-auto">
            <button onClick={() => navigate(-1)} className="mb-6 text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-2 font-medium">
                <FontAwesomeIcon icon={faArrowLeft} /> العودة للمخزن
            </button>
            <h2 className="text-2xl font-bold mb-4 mt-4">إدارة أقسام المنتجات</h2>
            {/* Form الإضافة */}
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input 
                        className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="اسم القسم (مثلاً: أحبار)"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    <input 
                        className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="وصف مختصر (اختياري)"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
                <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-xl flex items-center gap-2">
                    <FontAwesomeIcon icon={faFolderPlus} /> حفظ القسم
                </button>
            </form>

            {/* جدول العرض */}
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                <table className="w-full text-right">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="p-4">اسم القسم</th>
                            <th className="p-4">الوصف</th>
                            <th className="p-4">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((cat: any) => (
                            <tr key={cat._id} className="border-t">
                                <td className="p-4 font-bold">{cat.name}</td>
                                <td className="p-4 text-gray-500">{cat.description || '---'}</td>
                                <td className="p-4">
                                    <button className="text-red-500 cursor-pointer hover:text-red-600 hover:underline" onClick={() => handleDelete(cat._id)}><FontAwesomeIcon icon={faTrash} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CategoryManager;