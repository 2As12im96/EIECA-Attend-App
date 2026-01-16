import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Url } from '../../utils/Url';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/Context';

const NotificationBell = () => {
    const [count, setCount] = useState(0);
    const navigate = useNavigate();
    const { user }: any = useAuth(); 

    const fetchAlertCount = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const res = await axios.get(`${Url}/inventory/low-stock`, {
                params: { limit: 1 }, 
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                // قراءة الحقل count كما يظهر في معاينة الـ Network الخاصة بك
                setCount(res.data.count || 0);
            }
        } catch (err) {
            console.error("Error fetching bell count:", err);
        }
    }, []);

    useEffect(() => {
        if (user) {
            fetchAlertCount();
            const interval = setInterval(fetchAlertCount, 3 * 60 * 1000);
            return () => clearInterval(interval);
        }
    }, [user, fetchAlertCount]);

    const handleBellClick = () => {
        const dashboardPrefix = user?.role === 'admin' ? 'admin-dashboard' : 'employee-dashboard';
        navigate(`/${dashboardPrefix}/inventory-alerts`);
    };

    return (
        <div 
            onClick={handleBellClick}
            className="relative cursor-pointer p-2 hover:bg-white/10 rounded-full transition-all group"
        >
            <FontAwesomeIcon icon={faBell} className="text-white text-xl group-hover:scale-110 transition-transform" />
            
            {count > 0 && (
                <span className="absolute top-0.5 right-0.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-black text-white bg-red-600 border-2 border-blue-700 rounded-full animate-pulse">
                    {count > 99 ? '99+' : count}
                </span>
            )}
        </div>
    );
};

export default NotificationBell;