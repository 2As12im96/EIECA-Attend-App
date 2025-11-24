import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from "./login.module.css";
import { Link } from 'react-router-dom';
import { Url } from '../../../utils/Url';

const API_BASE_URL = Url;

const GenerateToken: React.FC = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const response = await axios.post<{ success: boolean; message: string; token: string }>(
                `${API_BASE_URL}/generate-reset-token`,
                { email }
            );

            const receivedToken = response.data.token;
            navigate(`/update-password/${receivedToken}`);
            
        } catch (err: any) {
            console.error("خطأ في توليد الرمز:", err);
            
            const errorMessage = err.response?.data?.error || "فشل توليد رابط التحديث. تأكد من صحة البريد الإلكتروني.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className={styles.login + " flex flex-col items-center h-screen justify-center bg-gradient-to-b from-blue-600 from-50% to-gray-100 to-50% space-y-6"}>
            <h2 className="font-Playwrite text-3xl text-white text-center">EIECA المؤسسة الهندسية</h2>
            
            <div className="border shadow p-6 bg-white w-full max-w-md rounded-lg">
                <h2 className='text-2xl text-center font-bold mb-6'>إعادة تعيين كلمة المرور</h2>
                
                <p className="text-center text-gray-600 mb-4">
                    الرجاء إدخال بريدك الإلكتروني لتحديث كلمة المرور.
                </p>

                {successMessage && <p className="text-green-500 text-center mb-4">{successMessage}</p>}
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label htmlFor="email" className='block text-gray-700 font-medium mb-1'>البريد الألكترونى</label>
                        <input 
                            type="email" 
                            id='email' 
                            name='email' 
                            placeholder='أدخل بريدك الإلكتروني المسجل' 
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                            onChange={(e) => setEmail(e.target.value)} 
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <button 
                            type="submit" 
                            className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition duration-300 font-semibold" 
                            disabled={loading}
                        >
                            {loading ? 
                                <span className={styles.loader}></span> 
                                : 
                                <span>تأكيد البريد وتحديث كلمة المرور</span>
                            }
                        </button>
                    </div>

                    <div className="text-center mt-4">
                        <Link to='/login' className="text-sm text-gray-600 hover:text-blue-600 hover:underline">
                            العودة لتسجيل الدخول
                        </Link>
                    </div>

                </form>
                {error && <p className="text-red-500 text-center mt-4">{error}</p>}
            </div>
        </section>
    );
};

export default GenerateToken;