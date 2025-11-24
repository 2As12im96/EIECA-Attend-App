import { useState, useCallback, type FormEvent} from "react";
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
    const { login }:any = useAuth();
    const navigate = useNavigate();


    const handleSubmit = useCallback(async (e: FormEvent) => {
        setLoading(true);
        setError(''); 
        setRes('');   
        e.preventDefault();
        try {
            const response = await axios.post<LoginResponse>(`${Url}/login`, {
                email,
                password
            });
            setRes(response.data.message);
            if(response.data.success){
                login(response.data.user);
                localStorage.setItem("token" , response.data.token)
                if(response.data.user.role === 'admin'){
                    navigate('/admin-dashboard');
                }
                else{
                    navigate('/employee-dashboard');
                }
            }
        } catch (err) {
            console.error("Login Error:", err);
            if (axios.isAxiosError(err)) {
                const axiosError = err as AxiosError<{ error?: string, message?: string }>;
                const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || 'فشل تسجيل الدخول';
                setError(errorMessage);
            } else {
                setError('حدث خطأ غير متوقع');
            }
        } finally {
            setLoading(false);
        }
    }, [email, password]);

    const toggleEye = useCallback(() => {
        setEye(prevEye => !prevEye);
    }, []);

    return {
        setEmail,
        setPassword,
        res,
        loading,
        error,
        eye,
        handleSubmit,
        toggleEye
    };
}

export default useLoginLogic;