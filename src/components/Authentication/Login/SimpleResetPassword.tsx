import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import styles from "./login.module.css";
import { Link } from 'react-router-dom';
import { Url } from '../../../utils/Url';

const API_BASE_URL = Url; 

const SimpleResetPassword: React.FC = () => {
    const { token } = useParams<{ token: string }>(); 
    const navigate = useNavigate();

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [eye, setEye] = useState(false);

    const toggleEye = () => setEye(!eye);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        if (newPassword !== confirmPassword) {
            setError("كلمة المرور الجديدة وتأكيدها غير متطابقين.");
            setLoading(false);
            return;
        }

        if (!token) {
            setError("رمز التحديث مفقود. الرجاء البدء من صفحة 'نسيت كلمة المرور'.");
            setLoading(false);
            return;
        }

        try {
            const response = await axios.patch<{ success: boolean; message: string }>(
                `${API_BASE_URL}/reset-password-simple/${token}`,
                { newPassword }
            );

            setSuccessMessage(response.data.message || "تم تحديث كلمة المرور بنجاح.");
            setTimeout(() => {
                navigate('/login');
            }, 3000);
            
        } catch (err: any) {
            console.error("خطأ في تحديث كلمة المرور:", err);
            
            const errorMessage = err.response?.data?.error || "فشل تحديث كلمة المرور. قد يكون الرابط منتهي الصلاحية.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className={styles.login + " flex flex-col items-center h-screen justify-center bg-gradient-to-b from-blue-600 from-50% to-gray-100 to-50% space-y-6"}>
            <h2 className="font-Playwrite text-3xl text-white text-center">EIECA المؤسسة الهندسية</h2>
            
            <div className="border shadow p-6 bg-white w-full max-w-md rounded-lg">
                <h2 className='text-2xl text-center font-bold mb-6'>تعيين كلمة المرور الجديدة</h2>
                
                {successMessage ? (
                    <div className="text-center">
                        <p className="text-green-600 text-lg font-semibold mb-4">{successMessage}</p>
                        <p className="text-gray-600">سيتم توجيهك إلى صفحة تسجيل الدخول قريباً...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        
                        <div className="mb-4">
                            <label htmlFor="newPassword" className='block text-gray-700 font-medium mb-1'>كلمة المرور الجديدة</label>
                            <span className={styles.passwordInput + " flex items-center justify-between"}>
                                <input 
                                    type={eye ? "text" : "password"} 
                                    id='newPassword' 
                                    name='newPassword' 
                                    placeholder='ادخل كلمة المرور الجديدة' 
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                    onChange={(e) => setNewPassword(e.target.value)} 
                                    required
                                />
                                <span className={styles.eyeIcon} onClick={toggleEye}>
                                    <FontAwesomeIcon icon={eye ? faEyeSlash : faEye} />
                                </span>
                            </span>
                        </div>

                        <div className="mb-6">
                            <label htmlFor="confirmPassword" className='block text-gray-700 font-medium mb-1'>تأكيد كلمة المرور</label>
                            <span className={styles.passwordInput + " flex items-center justify-between"}>
                                <input 
                                    type="password" 
                                    id='confirmPassword' 
                                    name='confirmPassword' 
                                    placeholder='أكد كلمة المرور الجديدة' 
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                    onChange={(e) => setConfirmPassword(e.target.value)} 
                                    required
                                />
                            </span>
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
                                    <span>تعيين وتحديث كلمة المرور</span>
                                }
                            </button>
                        </div>

                    </form>
                )}
                
                {error && <p className="text-red-500 text-center mt-4">{error}</p>}
                
                {!successMessage && (
                    <div className="text-center mt-4">
                        <Link to='/login' className="text-sm text-gray-600 hover:text-blue-600 hover:underline">
                            العودة إلى تسجيل الدخول
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
};

export default SimpleResetPassword;