import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminDashboard from "./components/AdminDashboard/AdminDashboard";
import Login from "./components/Authentication/Login/login";
import EmployeeDashboard from "./components/EmployeeDashboard/employeeDashboard";
import EmployeeSummery from "./components/EmployeeDashboard/employee-panel/summery/Summery";
import LeaveList from "./components/EmployeeDashboard/employee-panel/Leaves/LeaveList";
import AddLeaves from "./components/EmployeeDashboard/employee-panel/Leaves/AddLeaves";
import EmployeeSetting from "./components/EmployeeDashboard/employee-panel/Setting/Setting";
import Summery from "./components/AdminDashboard/Dashboard/Summery/Summery";
import Employee from "./components/AdminDashboard/Dashboard/Employee/Employee";
import View from "./components/AdminDashboard/Dashboard/Employee/ViewEmployee";
import AddEmpolyee from "./components/AdminDashboard/Dashboard/Employee/AddEmpolyee";
import EditEmployee from "./components/AdminDashboard/Dashboard/Employee/EditEmployee";
import Departments from "./components/AdminDashboard/Dashboard/Department/Departments";
import AddDepartment from "./components/AdminDashboard/Dashboard/Department/AddDepartment";
import EditDepartment from "./components/AdminDashboard/Dashboard/Department/EditDepartment";
import Leaves from "./components/AdminDashboard/Dashboard/Leaves/Leaves";
import Salary from "./components/AdminDashboard/Dashboard/Salary/ِAddSalary";
import ViewSalary from "./components/AdminDashboard/Dashboard/Salary/ViewSalary";
import PrivatedRoutes from "./utils/PrivatedRoutes";
import RouleBaseRoute from "./utils/RouleBaseRoute";
import LeaveDetails from "./components/AdminDashboard/Dashboard/Leaves/LeaveDetails";
import EmployeeAttendancePortal from "./components/Attendence/Employee Attendences/EmployeeAttendancePortal";
import Attendence from "./components/Attendence/Admin Attendences/Attendence";
import EmployeeReportViewer from "./components/Attendence/Employee Attendences/EmployeeReportViewer";
import IndividualEmployeeReportAdmin from "./components/AdminDashboard/Dashboard/Employee/IndividualEmployeeReportAdmin";
import SimpleReportFetcher from "./components/Attendence/Admin Attendences/Attendence";
import {jwtDecode} from 'jwt-decode';
import AdminList from "./components/AdminDashboard/Dashboard/Admins/AdminList";
import AdminDetails from "./components/AdminDashboard/Dashboard/Admins/AdminDetails";
import GenerateToken from "./components/Authentication/Login/GenerateToken";
import SimpleResetPassword from "./components/Authentication/Login/SimpleResetPassword";


const App: React.FC = () => {
  let userRole = 'guest';
  const token = localStorage.getItem('token');

  if (token) {
      try {
          const decoded = jwtDecode(token) as { role: string };
          userRole = decoded.role;
      } catch (e) {
          console.error("Invalid token");
      }
  }
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin-dashboard" />}></Route>
        <Route path="/login" element={<Login />} ></Route>
        <Route path="/forgot-password" element={<GenerateToken />} ></Route>
        <Route path="/update-password/:token" element={<SimpleResetPassword />} ></Route>

        {/* Admin Dashboard */}
        <Route path="/admin-dashboard" element={
          <PrivatedRoutes>
            <RouleBaseRoute requiredRole={['admin']}>
            <AdminDashboard />
            </RouleBaseRoute>
          </PrivatedRoutes>
          }>
            <Route index element={<Summery />}></Route>
          
            {/* Employees Admin */}
            <Route path="employees" element={<Employee/>}></Route>
            <Route path="employees/:id" element={<View userRole={userRole}/>}></Route>
            <Route path="add-employees" element={<AddEmpolyee/>}></Route>
            <Route path="employees/edit/:id" element={<EditEmployee/>}></Route>

            <Route path="admin-list" element={<AdminList />} />
            <Route path="admin-details/:id" element={<AdminDetails />} />
          
            {/* Departments Admin */}
            <Route path="departments" element={<Departments/>}></Route>
            <Route path="add-department" element={<AddDepartment/>}></Route>
            <Route path="department/:id" element={<EditDepartment/>}></Route>
            
            {/* Leaves Admin */}
            <Route path="leaves" element={<Leaves/>}></Route>
            <Route path="leaves/:id" element={<LeaveDetails userRole={userRole}/>}></Route>
            <Route path="employees/leaves/:id" element={<LeaveList userRole={userRole}/>}></Route>
            
            {/* Salaries Admin */}
            <Route path="salary/add" element={<Salary/>}></Route>
            <Route path="employees/salary/:id" element={<ViewSalary userRole={userRole}/>}></Route>
            
            {/* Attendences */}
            <Route path="attendence" element={<Attendence/>}></Route>
            <Route path="attendence" element={<SimpleReportFetcher/>}></Route>
            <Route path="attendence-report/employee/:employeeId/:year/:month" element={<IndividualEmployeeReportAdmin />}></Route>
          
            {/* Setting Admin */}
            <Route path="settings" element={<EmployeeSetting userRole={userRole}/>}></Route>

        </Route>

        {/* Employees Dashboard */}
        <Route path="/employee-dashboard" element={
            <PrivatedRoutes>
                <RouleBaseRoute requiredRole={['admin' ,'employee']}>
                    <EmployeeDashboard />
                </RouleBaseRoute>
            </PrivatedRoutes>
        }>
            <Route index element={<EmployeeSummery />}></Route>
            <Route path="profile/:id" element={<View userRole={userRole}/>}></Route>
            <Route path="leaves/:id" element={<LeaveList userRole={userRole}/>}></Route>
            <Route path="add-leaves" element={<AddLeaves/>}></Route>
            <Route path="salary/:id" element={<ViewSalary userRole={userRole}/>}></Route>
            
            {/* Employee Attendence */}
            <Route path="attendence" element={<EmployeeAttendancePortal/>}></Route>
            <Route path="attendence-report/:year/:month" element={<EmployeeReportViewer />}></Route>

            <Route path="setting" element={<EmployeeSetting userRole={userRole}/>}></Route>
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;