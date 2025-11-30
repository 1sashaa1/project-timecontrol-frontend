import { Navigate } from "react-router-dom";
import { isAdmin } from "../services/AuthService";

export default function AdminRoute({ children }) {
    return isAdmin() ? children : <Navigate to="/dashboard" replace />;
}