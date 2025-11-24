import axios from "axios";
import { Url } from "../../utils/Url";
import type { ArchiveResponse, MonthlyReport, ReportsResponse } from "../Types/type";

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

const ATTENDANCE_API_URL = `${Url}/attendance`;
interface TodayStatusResponse {
    success: boolean;
    isCheckedIn: boolean; 
}

export const checkIn = () => 
    axios.post(`${ATTENDANCE_API_URL}/check-in`, {}, getAuthHeaders());

export const checkOut = () => 
    axios.post(`${ATTENDANCE_API_URL}/check-out`, {}, getAuthHeaders());

export const getEmployeeTodayStatus = () => 
    axios.get<TodayStatusResponse>(
        `${ATTENDANCE_API_URL}/today-status`, 
        getAuthHeaders()
    );


export const getMyMonthlyReport = (year: number, month: number) => 
    axios.get<{ success: true; report: MonthlyReport }>(
        `${ATTENDANCE_API_URL}/report/my/${year}/${month}`, 
        getAuthHeaders()
    );


export const getAllEmployeesMonthlyReport = async (year: number, month: number) => {
    const url = `${ATTENDANCE_API_URL}/report/all/${year}/${month}`;
    const response = await axios.get<ReportsResponse>(url, getAuthHeaders());
    return response;
};;




export const getAttendanceArchive = (role: 'admin' | 'employee') => 
    axios.get<ArchiveResponse>( 
        `${ATTENDANCE_API_URL}/archive/${role}`, 
        getAuthHeaders()
    );

export const getIndividualEmployeeReportForAdmin = (employeeId: string, year: number, month: number) =>
    axios.get<{ success: true; report: MonthlyReport }>(
        `${ATTENDANCE_API_URL}/report/individual/${employeeId}/${year}/${month}`, 
        getAuthHeaders()
    );