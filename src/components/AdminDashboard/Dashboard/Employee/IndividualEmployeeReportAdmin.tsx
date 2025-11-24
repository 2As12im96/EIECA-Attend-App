import { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getAttendanceArchive, getIndividualEmployeeReportForAdmin } from "../../../services/AttendanceService";
import type { ArchiveItem, MonthlyReport } from "../../../Types/type";
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import * as domToImage from 'dom-to-image-more'; 
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

const IndividualEmployeeReportAdmin: React.FC = () => {
    const { employeeId, year, month } = useParams<{ employeeId: string, year: string, month: string }>();
    const navigate = useNavigate();
    
    const printRef = useRef<HTMLDivElement>(null); 
    
    const [report, setReport] = useState<MonthlyReport | null>(null);
    const [archive, setArchive] = useState<ArchiveItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const currentYear = parseInt(year || new Date().getFullYear().toString(), 10); 
    const currentMonth = parseInt(month || (new Date().getMonth() + 1).toString(), 10);

    const formatMinutesToHours = (value: any) => {
        const numberValue = Number(value);
        if (isNaN(numberValue)) return '0.00';
        return (numberValue / 60).toFixed(2);
    };

    const formatTotalHours = (value: any) => {
        const numberValue = Number(value);
        if (isNaN(numberValue)) return '0.00';
        return numberValue.toFixed(2);
    };

    const getMonthName = (m: number) => {
        const date = new Date(2000, m - 1, 1);
        return format(date, 'MMMM');
    };
    
    const exportPdf = async () => {
        const targetElement = printRef.current;
        if (!targetElement || !report) return;

        const exportButton = targetElement.querySelector('.export-button') as HTMLElement | null;
        const tableContainer = targetElement.querySelector('.daily-attendance-container') as HTMLElement | null;
        
        const originalOverflowX = targetElement.style.overflowX;
        const originalOverflowY = targetElement.style.overflowY; 
        const originalWidth = targetElement.style.width;
        const originalPaddingBottom = targetElement.style.paddingBottom; 
        const originalTableOverflow = tableContainer?.style.overflowX;

        try {
            if (exportButton) exportButton.style.display = 'none';
            if (tableContainer) tableContainer.style.overflow = 'visible';

            targetElement.style.overflowX = 'visible';
            targetElement.style.overflowY = 'visible';
            targetElement.style.width = `${targetElement.scrollWidth}px`; 
            targetElement.style.paddingBottom = '50px'; 
            
            await new Promise(resolve => setTimeout(resolve, 50));

            const actualWidth = targetElement.scrollWidth;
            const actualHeight = targetElement.scrollHeight; 

            const dataUrl = await domToImage.toJpeg(targetElement, { 
                quality: 0.95, 
                width: actualWidth, 
                height: actualHeight,
                bgcolor: '#ffffff' 
            });

            targetElement.style.overflowX = originalOverflowX;
            targetElement.style.overflowY = originalOverflowY; 
            targetElement.style.width = originalWidth;
            targetElement.style.paddingBottom = originalPaddingBottom; 
            if (exportButton) exportButton.style.display = 'flex';
            if (tableContainer && originalTableOverflow) tableContainer.style.overflowX = originalTableOverflow; 

            const pdf = new jsPDF('l', 'mm', 'a4'); 
            const pdfWidth = pdf.internal.pageSize.getWidth();
            
            const imgWidth = pdfWidth; 
            const imgHeight = (actualHeight * imgWidth) / actualWidth; 
            
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(dataUrl, 'JPEG', 0, position, imgWidth, imgHeight);
            heightLeft -= pdf.internal.pageSize.getHeight();
            
            while (heightLeft >= -1) { 
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(dataUrl, 'JPEG', 0, position, imgWidth, imgHeight);
                heightLeft -= pdf.internal.pageSize.getHeight();
            }

            const employeeNameForFile = report.name.replace(/\s+/g, '_') || `Employee_${report.employeeId}`;
            const filename = `${employeeNameForFile}_Monthly_Report_${getMonthName(currentMonth)}_${currentYear}.pdf`;
            pdf.save(filename);
            
        } catch (error) {
            console.error("PDF export failed:", error);

            if (targetElement) { 
                targetElement.style.overflowX = originalOverflowX;
                targetElement.style.overflowY = originalOverflowY; 
                targetElement.style.width = originalWidth;
                targetElement.style.paddingBottom = originalPaddingBottom;
                if (exportButton) exportButton.style.display = 'flex';
                if (tableContainer && originalTableOverflow) tableContainer.style.overflowX = originalTableOverflow;
            }
            setError("فشل إنشاء ملف PDF. تأكد من تحميل جميع الأنماط بشكل صحيح..");
        }
    };

    useEffect(() => {
        if (!employeeId) return;
        
        const fetchArchive = async () => {
             try {
                 const res = await getAttendanceArchive('admin'); 
                 setArchive(res.data.archive);
            } catch (err: any) {
                 console.error("فشل في استرجاع الأرشيف :", err);
            }
        };

        const fetchReport = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await getIndividualEmployeeReportForAdmin(employeeId, currentYear, currentMonth);
                setReport(res.data.report);
            } catch (err: any) {
                setError(`فشل في إحضار التقرير لهذا الشهر ${currentMonth}/${currentYear}: ` + (err.response?.data?.message || err.message));
                setReport(null);
            } finally {
                setLoading(false);
            }
        };

        fetchArchive();
        fetchReport();
    }, [employeeId, currentYear, currentMonth]);

    const handleArchiveNavigation = (newYear: number, newMonth: number) => {
        navigate(`/admin-dashboard/attendence-report/employee/${employeeId}/${newYear}/${newMonth}`);
    };

    if (loading) return <p className="text-center mt-10 text-lg">تحميل تقرير الموظف...</p>;
    if (error) return <p className="text-red-500 text-center mt-10">{error}</p>;

    return (
        <>
            <span className="return-page mt-2 ml-2 p-2 rounded-full hover:bg-gray-200 inline-block">
                <Link to='/admin-dashboard/employees' className="text-blue-600 hover:underline flex items-center">
                    <FontAwesomeIcon icon={faArrowLeft} />
                </Link>
            </span>
            <div className="p-6">
                
                <div className="mb-8">
                    <p className="text-lg font-medium mb-2">أرشيف:</p>
                    <div className="flex flex-wrap gap-2">
                        {archive.map(item => (
                            <button 
                                key={`${item.year}-${item.month}`} 
                                onClick={() => handleArchiveNavigation(item.year, item.month)}
                                className={`px-4 py-1 text-sm rounded-full transition duration-150 ${
                                    currentYear === item.year && currentMonth === item.month
                                        ? 'bg-blue-600 text-white shadow' 
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                {getMonthName(item.month)} {item.year}
                            </button>
                        ))}
                    </div>
                </div>
                
                <hr className="my-6" />

                {report && (
                    <div ref={printRef} className="bg-white p-6 rounded-lg shadow-md"> 
                        <div className="mb-6 pb-4 border-b border-gray-200 flex flex-col gap-3">
                            <h2 className="text-2xl font-bold text-gray-800 w-full text-center sm:text-left">
                                الملخص الشهري {getMonthName(currentMonth)} {currentYear}: {report.name || 'N/A'} 
                                {report.department && ` (${report.department})`} 
                            </h2>
                            
                            <div className="export-button w-full">
                                <button 
                                    onClick={exportPdf} 
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-150 flex items-center justify-center text-sm font-medium"
                                >
                                    ⬇️ تحميل التقرير كملف (PDF)
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
                            
                            <div className="bg-white border border-gray-200 rounded-lg p-3 text-center shadow-sm">
                                <p className="text-2xl font-bold text-blue-600">{report.presentDays}</p>
                                <p className="text-sm text-gray-500">أيام الحضور</p>
                            </div>
                            
                            <div className="bg-white border border-gray-200 rounded-lg p-3 text-center shadow-sm">
                                <p className="text-2xl font-bold text-green-600">{report.totalLeaveDays}</p>
                                <p className="text-sm text-gray-500">الإجازات المعتمدة</p>
                            </div>
                            
                            <div className="bg-white border border-gray-200 rounded-lg p-3 text-center shadow-sm">
                                <p className="text-2xl font-bold text-red-600">{report.absenceDays}</p>
                                <p className="text-sm text-gray-500">الغياب الفعلي</p>
                            </div>
                            
                            <div className="bg-white border border-gray-200 rounded-lg p-3 text-center shadow-sm">
                                <p className="text-2xl font-bold text-purple-600">{formatTotalHours(report.totalWorkDurationHours)}</p>
                                <p className="text-sm text-gray-500">إجمالي الساعات الفعلية</p>
                            </div>

                            <div className="bg-white border border-gray-200 rounded-lg p-3 text-center shadow-sm">
                                <p className="text-2xl font-bold text-gray-800">{formatTotalHours(report.requiredHours)}</p>
                                <p className="text-sm text-gray-500">ساعات العمل المطلوبة</p>
                            </div>

                            <div className="bg-white border border-gray-200 rounded-lg p-3 text-center shadow-sm">
                                <p className="text-2xl font-bold text-indigo-600">{formatTotalHours(report.overtimeHours)}</p>
                                <p className="text-sm text-gray-500">الساعات الاضافية</p>
                            </div>

                            <div className="bg-white border border-gray-200 rounded-lg p-3 text-center shadow-sm">
                                <p className="text-2xl font-bold text-pink-600">{formatTotalHours(report.shortfallHours)}</p>
                                <p className="text-sm text-gray-500">الساعات المتبقية</p>
                            </div>
                        </div>
                    
                        <h3 className="text-xl font-semibold mt-8 mb-4 border-t pt-4">سجل الحضور اليومي</h3>
                        {report?.dailyAttendance && report.dailyAttendance.length > 0 ? (
                            <div className="daily-attendance-container overflow-x-auto bg-white rounded-md border border-gray-200"> 
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">التاريخ</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">الحضور</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">الأنصراف</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">وقت العمل (بالساعات)</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">الحالة</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {report.dailyAttendance.map((day, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-left">{day.date}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center">{day.checkIn}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center">{day.checkOut}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center">
                                                    {formatMinutesToHours(day.workDuration)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                        ${day.status === 'Full Day' ? 'bg-green-100 text-green-800' :
                                                        day.status === 'Early Out' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-gray-100 text-gray-800'}`}>
                                                        {day.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 mt-4">لا توجد سجلات حضور لهذا الشهر.</p>
                        )}
                    </div>
                )}
            </div>
        </>
    );
};

export default IndividualEmployeeReportAdmin;