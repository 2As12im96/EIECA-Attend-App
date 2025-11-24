import type { FormEvent, JSX } from "react";

interface UseLoginLogicResult {
    setEmail: (email: string) => void;
    setPassword: (password: string) => void;
    res: string;
    loading: boolean;
    error: string;
    eye: boolean;
    handleSubmit: (e: FormEvent) => Promise<void>;
    toggleEye: () => void;
}

interface LoginResponse {
    success: boolean;
    message: string;
    token: string;
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
    };
}

interface AuthContextType {
    user: UserType;
    login: (userData: UserType) => void;
    logout: () => void;
    loading?: boolean;
}

interface DepartmentRow {
    _id: string; 
    sno: number;
    dep_name: string; 
    action: JSX.Element;
}

interface EmployeeRow {
    _id: string;
    sno?: number; 
    name: string; 
    profileImage: string | JSX.Element;
    dep_name: string;
    dob: string;
    action?: JSX.Element; 

    employeeId: string;
    gender: string;
    maritalStatus: string;
    designation: string; 
    salary: number;
    phoneNumber:string;

    userId: {
        _id: string;
        name: string;
        profileImage: string;
        email: string;
        role: string;
    };
    department: {
        _id: string;
        dep_name: string;
    };
}

interface LeavesRow {
    sno: number; 
    name: string;
    days: number; 
    action: JSX.Element; 
    _id: string; 
    employeeId: string;
    leaveType: string;
    status: string;
    department: string;
    designation: string;
    dob: string
    gender: string;
    maritalStatus: string;
    userId: {
        name: string;
    }
    salary: number;
    endDate: string;
    startDate: string;
    reason: string;
}

interface PopulatedEmployee {
    _id: string;
    employeeId: string;
    designation: string;
    dob: string;
    gender: string;
    maritalStatus: string;
    salary: number;
    createdAt: string; 
    updateAt: string;
    __v: number;

    department: {
        dep_name: string;
        _id: string; 
    };

    userId: {
        _id: string;
        name: string;
        profileImage: string;
    }
}

interface LeaveDetailsRow {
    _id: string;
    leaveType: string;
    reason: string;
    status: string;
    startDate: string;
    endDate: string;
    appliedAt: string;
    updatedAt: string;
    __v: number;

    employeeId: PopulatedEmployee;
}

interface DepartmentButtonsProps {
    DepId: string;
    DepName: string; 
    onOpenModal: (id: string, name: string) => void;
}

interface DeleteModalState {
    id: string;
    name: string;
}

interface ConfirmationModalProps {
    message: string;
    onClose: () => void;
    onConfirm: () => void;
}

interface Leave {
    _id: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    reason?: string;
    appliedAt: string;
    status?: string;
}

interface Setting {
    userId: String | undefined ,
    oldPassword: String ,
    newPassword: String ,
    confirmPassword: String ,
}

interface PopulatedEmployeeForAttendance {
    _id: string;
    name: string;
    employeeId: string;
    userId: {
        _id: string;
        name: string;
    };
    department: {
        _id: string;
        dep_name: string;
    };
}

interface DailyAttendance {
    date: string;
    checkIn: string;
    checkInTime: string;
    checkOut: string | 'N/A';
    checkOutTime: string | null;
    status: string;
    _id: string;
    workDuration: number; 
    employeeId: PopulatedEmployeeForAttendance;
    durationHours: string;
}

interface LeaveDetail {
    type: string;
    start: string;
    end: string;
}

interface DepartmentObject {
    _id: string;
    dep_name: string;
}

interface MonthlyReport {
    employeeId: string;
    name: string;
    employeeID_Number: string;
    department: string | DepartmentObject;
    presentDays: number;
    totalLeaveDays: number;
    absenceDays: number;
    totalWorkDurationHours: number;
    requiredHours: number;
    overtimeHours: number;
    shortfallHours: number;
    dailyAttendance: DailyAttendance[]; 
    leaves: LeaveDetail[];
    reportMonth: number;
    reportYear: number;
    monthName?: string;
    getMonthName?: string; 
}

interface ReportsResponse {
    success: boolean;
    reports: {
        reports: MonthlyReport[];
    };
}

interface ArchiveItem {
    year: number;
    month: number;
}

interface ArchiveResponse {
    success: boolean;
    archive: ArchiveItem[];
}

interface DailySummary {
    [date: string]: { 
        [employeeId: string]: { checkIn: string; checkOut: string };
    };
}

interface ReportProps {
    report: MonthlyReport
}

interface ViewProps {
    userRole: string;
}

interface AdminRow {
    _id: string;
    sno: number;
    name: string;
    email: string;
    profileImage: string;
    action: React.ReactNode;
};


interface AdminUser {
    _id: string;
    name: string;
    email: string;
    role: string;
    profileImage: string;
    createdAt: string;
}

type UserType = { _id: string; email: string; name:string ; role: string; isActive:boolean; profileImage:string;} | null;


export type { 
    DepartmentButtonsProps, 
    DepartmentRow , 
    EmployeeRow ,
    LeavesRow , 
    LeaveDetailsRow ,
    UseLoginLogicResult , 
    LoginResponse  , 
    AuthContextType , 
    DeleteModalState , 
    ConfirmationModalProps , 
    Leave , 
    Setting , 
    DailyAttendance ,
    LeaveDetail ,
    MonthlyReport ,
    ReportsResponse ,
    ArchiveItem ,
    ArchiveResponse ,
    DailySummary ,
    ReportProps ,
    ViewProps ,
    AdminRow ,
    AdminUser ,
    UserType
};