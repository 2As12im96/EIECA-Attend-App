import { useState, useEffect } from 'react';
import ArchiveList from './ArchiveList';
import { checkIn, checkOut, getEmployeeTodayStatus } from '../../services/AttendanceService'; 
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const EmployeeAttendancePortal = () => {
    const [isCheckedIn, setIsCheckedIn] = useState<boolean | null>(null); 
    const [isLoading, setIsLoading] = useState(false);
    const [statusError, setStatusError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const response = await getEmployeeTodayStatus(); 
                setIsCheckedIn(response.data.isCheckedIn);
            } catch (error) {
                setIsCheckedIn(false); 
                setStatusError("فشل التحقق من الحضور. يُرجى التحقق من اتصال الخادم.");
            }
        };

        fetchStatus();
    }, []);

    const handleCheckIn = async () => {
        setIsLoading(true);
        setStatusError(null);
        try {
            await checkIn();
            setIsCheckedIn(true);
        } catch (error: any) {
            setStatusError(error.response?.data?.message || "فشل تسجيل الدخول. ربما قمتَ بتسجيل الدخول اليوم، أو أن الخادم غير متاح.");
        } finally {
            setIsLoading(false);
        }
    };
    const handleCheckOut = async () => {
        setIsLoading(true);
        setStatusError(null);
        try {
            await checkOut(); 
            setIsCheckedIn(false);
        } catch (error: any) {
            setStatusError(error.response?.data?.message || "فشل تسجيل المغادرة. يُرجى التأكد من تسجيل الوصول أولاً.");
        } finally {
            setIsLoading(false);
        }
    };
    const isLoadingStatus = isCheckedIn === null;


    return (
        <>
            <span className="return-page mt-2 ml-2 p-2 rounded-full hover:bg-gray-200 inline-block">
                <Link to='/employee-dashboard' className="text-blue-600 hover:underline flex items-center">
                    <FontAwesomeIcon icon={faArrowLeft} />
                </Link>
            </span>
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-6">بوابة الحضور والانصراف</h1>
                
                {statusError && (
                    <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
                        ⚠️ {statusError}
                    </div>
                )}

                <div className="bg-white shadow-lg rounded-xl p-8 flex justify-center space-x-8 rtl:space-x-reverse mb-10">
                    
                    {isLoadingStatus ? (
                        <div className="py-5 text-indigo-600 font-semibold">يتم التحقق من حالتك...</div>
                    ) : (
                        <>
                            <button
                                onClick={handleCheckIn}
                                disabled={isCheckedIn === true || isLoading}
                                className={`px-12 py-5 text-lg font-semibold rounded-full transition duration-300 ${
                                    (isCheckedIn === true || isLoading) ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'
                                }`}
                            >
                                {isLoading && !isCheckedIn ? 'جاري تسجيل الحضور...' : 'الحضور'}
                            </button>
                            
                            <button
                                onClick={handleCheckOut}
                                disabled={isCheckedIn !== true || isLoading} 
                                className={`px-12 py-5 text-lg font-semibold rounded-full transition duration-300 ${
                                    (isCheckedIn !== true || isLoading) ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 text-white'
                                }`}
                            >
                                {isLoading && isCheckedIn ? 'جاري تسجيل الأنصراف...' : 'الأنصراف'}
                            </button>
                        </>
                    )}
                </div>
                
                <div className="mt-8">
                    <h2 className="text-xl font-semibold mb-4 border-b pb-2">الأرشيف الشخصي</h2>
                    <ArchiveList role="employee" /> 
                </div>
            </div>
        </>
    );
};

export default EmployeeAttendancePortal;