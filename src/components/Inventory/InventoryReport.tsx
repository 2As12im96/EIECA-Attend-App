import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Url } from '../../utils/Url';
import { Printer, FileText, CheckCircle, FileSpreadsheet, ArrowRight } from 'lucide-react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const InventoryReport = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    
    // توحيد القيمة الافتراضية لسهولة البرمجة
    const locationFilter = searchParams.get('location') || 'all';
    const reportType = searchParams.get('type'); 

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${Url}/inventory/report`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                let filtered = res.data.report;
                if (locationFilter !== 'all') {
                    filtered = filtered.filter((item: any) => 
                        item.locationName?.trim() === locationFilter.trim()
                    );
                }
                setData(filtered);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const exportToExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('تقرير المخزون');
        worksheet.views = [{ rightToLeft: true } as any];

        worksheet.columns = [
            { header: 'م', key: 'id', width: 8 },
            { header: 'كود الصنف', key: 'sku', width: 20 },
            { header: 'اسم المنتج', key: 'name', width: 45 },
            { header: 'الكمية الحالية', key: 'qty', width: 15 },
            { header: 'الموقع/المخزن', key: 'location', width: 25 },
        ];

        data.forEach((item, index) => {
            const row = worksheet.addRow({
                id: index + 1,
                sku: item.itemSku,
                name: item.itemName,
                qty: item.currentQuantity,
                location: item.locationName,
            });

            if (item.currentQuantity < 10) {
                row.getCell(4).font = { color: { argb: 'FFFF0000' }, bold: true }; 
            }
        });

        // تنسيق الهيدر
        const headerRow = worksheet.getRow(1);
        headerRow.eachCell((cell) => {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E40AF' } };
            cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
            cell.alignment = { horizontal: 'center' };
        });

        worksheet.eachRow((row) => {
            row.eachCell(cell => {
                cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
                cell.alignment = { horizontal: 'center' };
            });
            row.getCell(3).alignment = { horizontal: 'right' }; // محاذاة الاسم لليمين
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const fileName = `تقرير_مخزون_${locationFilter.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.xlsx`;
        saveAs(new Blob([buffer]), fileName);
    };

    const confirmAndPrint = () => {
        setShowModal(false);
        setTimeout(() => window.print(), 300);
    };

    if (loading) return <div className="p-10 text-center font-bold text-blue-600 animate-pulse">جاري تجهيز التقرير...</div>;

    return (
        <div className="report-wrapper" dir="rtl">
            <div className="no-print control-panel shadow-xl bg-white p-6 rounded-3xl mb-8 flex flex-wrap justify-between items-center border border-blue-50">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                        <ArrowRight size={24} />
                    </button>
                    <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-100">
                        <FileText size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-gray-800">
                            {reportType === 'excel' ? 'تصدير Excel المنسق' : 'معاينة طباعة PDF'}
                        </h2>
                        <p className="text-xs text-gray-400 font-bold">الهدف: {locationFilter === 'all' ? 'كامل الشركة' : locationFilter}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    {reportType === 'excel' ? (
                        <button onClick={exportToExcel} className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2">
                            <FileSpreadsheet size={20} /> تحميل Excel
                        </button>
                    ) : (
                        <button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2">
                            <Printer size={20} /> بدء الطباعة
                        </button>
                    )}
                </div>
            </div>

            <div className="printable-document">
                <div className="report-header">
                    <h1>كشف حصر مخزون المنتجات</h1>
                    <div className="meta-info">
                        <span>التاريخ: {new Date().toLocaleDateString('ar-EG')}</span>
                        <span className="bg-gray-100 px-3 py-1 rounded-lg">الفرع: {locationFilter === 'all' ? 'كامل المستودعات' : locationFilter}</span>
                        <span>إجمالي الأصناف: {data.length}</span>
                    </div>
                </div>

                <table className="report-table">
                    <thead>
                        <tr>
                            <th>م</th>
                            <th>كود الصنف</th>
                            <th>اسم المنتج</th>
                            <th>الكمية</th>
                            <th>الموقع</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, index) => (
                            <tr key={index} className={item.currentQuantity < 10 ? "low-stock-row" : ""}>
                                <td className="text-center">{index + 1}</td>
                                <td className="text-center mono">{item.itemSku}</td>
                                <td className="text-right font-bold">{item.itemName}</td>
                                <td className={`text-center font-black ${item.currentQuantity < 10 ? 'text-red-600' : ''}`}>
                                    {item.currentQuantity}
                                </td>
                                <td className="text-center">{item.locationName}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="report-signatures">
                    <div className="sig-box">
                        <p>توقيع أمين المستودع</p>
                        <div className="line"></div>
                    </div>
                    <div className="sig-box">
                        <p>يعتمد / المدير العام</p>
                        <div className="line"></div>
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm no-print">
                   <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl">
                        <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                            <CheckCircle className="text-blue-600" size={32} />
                        </div>
                        <h3 className="text-2xl font-black mb-2">تأكيد الطباعة</h3>
                        <p className="text-gray-500 mb-6">سيتم تجهيز التقرير لفرع ({locationFilter === 'all' ? 'كامل المستودعات' : locationFilter}).</p>
                        <div className="flex gap-3">
                            <button onClick={confirmAndPrint} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold">طباعة</button>
                            <button onClick={() => setShowModal(false)} className="flex-1 bg-gray-100 py-4 rounded-2xl font-bold">إلغاء</button>
                        </div>
                   </div>
                </div>
            )}

            <style>{`
                @media screen {
                    .report-wrapper { padding: 40px; background: #f1f5f9; min-height: 100vh; font-family: 'Segoe UI', sans-serif; }
                    .printable-document { background: white; margin: auto; box-shadow: 0 10px 30px rgba(0,0,0,0.1); border-radius: 8px; }
                }
                .report-header { text-align: center; margin-bottom: 30px; border-bottom: 3px double #1e3a8a; padding-bottom: 15px; }
                .report-header h1 { font-size: 24pt; font-weight: 900; color: #1e3a8a; }
                .meta-info { display: flex; justify-content: center; gap: 20px; font-weight: bold; margin-top: 10px; }
                .report-table { width: 100%; border-collapse: collapse; }
                .report-table th, .report-table td { border: 1px solid #334155; padding: 10px; }
                .report-table th { background: #f1f5f9 !important; -webkit-print-color-adjust: exact; }
                .report-signatures { display: flex; justify-content: space-between; margin-top: 60px; }
                .line { border-top: 1px solid #000; width: 150px; margin-top: 40px; }
                .low-stock-row { background-color: #fff5f5 !important; }
                @media print {
                    @page { size: A4; margin: 0; }
                    body * { visibility: hidden; }
                    .printable-document, .printable-document * { visibility: visible; }
                    .printable-document { position: absolute; left: 0; top: 0; width: 100%; padding: 15mm; }
                    .no-print { display: none !important; }
                    .low-stock-row { background-color: #f0f0f0 !important; -webkit-print-color-adjust: exact; }
                }
            `}</style>
        </div>
    );
};

export default InventoryReport;