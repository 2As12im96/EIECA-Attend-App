import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ArchiveItem } from '../../Types/type';
import { getAttendanceArchive } from '../../services/AttendanceService';


interface ArchiveListProps {
    role: 'admin' | 'employee';
}

const ArchiveList: React.FC<ArchiveListProps> = ({ role }) => {
    const [archive, setArchive] = useState<ArchiveItem[]>([]);
    const navigate = useNavigate();

    const monthNames: { [key: number]: string } = {
        1: 'يناير', 2: 'فبراير', 3: 'مارس', 4: 'أبريل',
        5: 'مايو', 6: 'يونيو', 7: 'يوليو', 8: 'أغسطس',
        9: 'سبتمبر', 10: 'أكتوبر', 11: 'نوفمبر', 12: 'ديسمبر'
    };

    useEffect(() => {
        const fetchArchive = async () => {
            try {
                const response = await getAttendanceArchive(role);
                setArchive(response.data.archive); 
                
            } catch (error) {
                console.error("خطأ في جلب الأرشيف:", error);
            }
        };
        fetchArchive();
    }, [role]);

    const handleMonthClick = (year: number, month: number) => {
        if (role === 'admin') {
            navigate(`/admin-dashboard/attendence-report/${year}/${month}`);
        } else {
            navigate(`/employee-dashboard/attendence-report/${year}/${month}`); 
        }
    };

    if (archive.length === 0) {
        return <p className="text-gray-500">لا تتوفر سجلات حضور سابقة.</p>;
    }

    return (
        <div className="flex flex-wrap gap-4">
            {archive.map((item, index) => (
                <button
                    key={index}
                    onClick={() => handleMonthClick(item.year, item.month)}
                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium py-2 px-4 rounded-lg transition duration-150 shadow-md"
                >
                    {monthNames[item.month]} {item.year}
                </button>
            ))}
        </div>
    );
};

export default ArchiveList;