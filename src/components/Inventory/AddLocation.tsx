import { useState, useEffect } from 'react';
import axios from 'axios';
import { Url } from '../../utils/Url';
import { Building2, MapPin, Navigation, UserCheck, Loader2 } from 'lucide-react';
import type { EmployeeRow } from '../Types/type';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';


const AddLocation = () => {
    const [formData, setFormData] = useState({
        name: '',
        city: '',
        address: '',
        managerId: ''
    });

    const [employees, setEmployees] = useState<EmployeeRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const navigate = useNavigate();


    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${Url}/employee`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.data.success) {
                    setEmployees(response.data.employees);
                }
            } catch (err) {
                console.error("خطأ في جلب الموظفين", err);
            }
        };
        fetchEmployees();
    }, []);

    const handleChange = (e:any) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e:any) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${Url}/inventory/add-location`, 
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setMessage({ type: 'success', text: 'تم إنشاء الفرع الجديد بنجاح وإضافته للنظام.' });
                setFormData({ name: '', city: '', address: '', managerId: '' }); 
            }
        } catch (err:any) {
            const errorMsg = err.response?.data?.message || 'حدث خطأ أثناء محاولة إضافة الموقع.';
            setMessage({ type: 'error', text: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    const styles : { [key: string]: React.CSSProperties } = {
        container: {
            padding: '30px',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
            direction: 'rtl',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        },
        inputGroup: {
            marginBottom: '20px',
            display: 'flex',
            flexDirection: 'column'
        },
        label: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#374151'
        },
        input: {
            padding: '12px 16px',
            borderRadius: '10px',
            border: '1px solid #d1d5db',
            fontSize: '15px',
            transition: 'border-color 0.2s',
            outline: 'none',
            backgroundColor: '#f9fafb'
        },
        button: {
            width: '100%',
            padding: '14px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '10px',
            transition: 'background-color 0.2s'
        },
        alert: {
            padding: '12px',
            borderRadius: '10px',
            marginBottom: '20px',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
        }
    };

    return (
        <>
            <button onClick={() => navigate(-1)} className="p-6 text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-2 font-medium">
                <FontAwesomeIcon icon={faArrowLeft} /> العودة للمخزن
            </button>
            <div style={styles.container}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <div style={{ backgroundColor: '#eff6ff', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 15px' }}>
                        <Building2 size={30} color="#2563eb" />
                    </div>
                    <h2 style={{ fontSize: '24px', color: '#111827', margin: '0' }}>إضافة فرع جديد</h2>
                    <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '5px' }}>أدخل بيانات المستودع أو الفرع الجديد بدقة</p>
                </div>
                
                {message.text && (
                    <div style={{ 
                        ...styles.alert,
                        backgroundColor: message.type === 'success' ? '#ecfdf5' : '#fef2f2',
                        color: message.type === 'success' ? '#065f46' : '#991b1b',
                        border: `1px solid ${message.type === 'success' ? '#a7f3d0' : '#fecaca'}`
                    }}>
                        {message.type === 'success' ? '✓ ' : '⚠ '}
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>
                            <Building2 size={18} /> اسم الفرع
                        </label>
                        <input
                            type="text"
                            name="name"
                            placeholder="مثال: مخزن القاهرة الرئيسي"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            style={styles.input}
                            onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>
                            <MapPin size={18} /> المدينة
                        </label>
                        <input
                            type="text"
                            name="city"
                            placeholder="أدخل اسم المدينة"
                            value={formData.city}
                            onChange={handleChange}
                            required
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>
                            <Navigation size={18} /> العنوان التفصيلي
                        </label>
                        <textarea
                            name="address"
                            placeholder="المنطقة، الشارع، علامة مميزة..."
                            value={formData.address}
                            onChange={handleChange}
                            style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }}
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>
                            <UserCheck size={18} /> مسؤول الفرع (المدير)
                        </label>
                        <select
                            name="managerId"
                            value={formData.managerId}
                            onChange={handleChange}
                            style={styles.input}
                        >
                            <option value="">-- اختر مديراً للفرع --</option>
                            {employees.map(emp => (
                                <option key={emp._id} value={emp._id}>
                                    {emp.userId?.name || emp.employeeId}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        style={{ 
                            ...styles.button,
                            backgroundColor: loading ? '#93c5fd' : '#2563eb'
                        }}
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : null}
                        {loading ? 'جاري المعالجة...' : 'تأكيد إضافة الفرع'}
                    </button>
                </form>
            </div>
        </>
    );
};

export default AddLocation;