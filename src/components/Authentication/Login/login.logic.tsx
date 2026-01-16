import { useState, useCallback, type FormEvent } from "react";
import axios, { AxiosError } from "axios";
import { useAuth } from "../../Context/Context";
import { useNavigate } from "react-router-dom";
import type { LoginResponse, UseLoginLogicResult } from "../../Types/type";
import { Url } from "../../../utils/Url";

function useLoginLogic(): UseLoginLogicResult {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [res, setRes] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [eye, setEye] = useState<boolean>(false);
    
    // سحب دالة login التي أضفناها في الـ Context
    const { login } = useAuth(); 
    const navigate = useNavigate();

    const handleSubmit = useCallback(async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(''); 
        setRes('');   

        try {
            const response = await axios.post<LoginResponse>(`${Url}/login`, {
                email,
                password
            });

            if (response.data.success) {
                setRes(response.data.message);
                localStorage.setItem("token", response.data.token);
                
                // تحديث حالة المستخدم في الـ Context فوراً
                login(response.data.user);

                // التوجيه بناءً على الصلاحيات
                if (response.data.user.role === 'admin') {
                    navigate('/admin-dashboard');
                } else {
                    navigate('/employee-dashboard');
                }
            }
        } catch (err) {
            console.error("Login Error:", err);
            if (axios.isAxiosError(err)) {
                const axiosError = err as AxiosError<{ error?: string, message?: string }>;
                setError(axiosError.response?.data?.message || 'فشل تسجيل الدخول');
            } else {
                setError('حدث خطأ غير متوقع');
            }
        } finally {
            setLoading(false);
        }
    }, [email, password, login, navigate]);

    const toggleEye = useCallback(() => setEye(prev => !prev), []);

    return { setEmail, setPassword, res, loading, error, eye, handleSubmit, toggleEye };
}

export default useLoginLogic;