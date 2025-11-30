// src/Routes.js
import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import Dashboard from "../pages/Dashboard";
import ProtectedRoute from "../routes/ProtectedRoute";
import CompleteProfilePage from "../pages/CompleteProfilePage";
import AdminRoute from "./AdminRoute";
import AdminPanel from "../pages/AdminPanel";

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>

                <Route path="/" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/complete-profile"
                    element={
                        <ProtectedRoute>
                            <CompleteProfilePage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin"
                    element={
                        <AdminRoute>
                            <AdminPanel />
                        </AdminRoute>
                    }
                />

                <Route path="*" element={<Navigate to="/dashboard" />} />

            </Routes>
        </BrowserRouter>
    );
}

