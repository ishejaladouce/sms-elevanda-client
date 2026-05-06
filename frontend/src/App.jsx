import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import FeesPage from "./pages/FeesPage.jsx";
import GradesPage from "./pages/GradesPage.jsx";
import AttendancePage from "./pages/AttendancePage.jsx";
import TimetablePage from "./pages/TimetablePage.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/fees" element={<FeesPage />} />
      <Route path="/grades" element={<GradesPage />} />
      <Route path="/attendance" element={<AttendancePage />} />
      <Route path="/timetable" element={<TimetablePage />} />
      <Route path="/notifications" element={<NotificationsPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="*" element={<div className="p-6">Not found</div>} />
    </Routes>
  );
}

