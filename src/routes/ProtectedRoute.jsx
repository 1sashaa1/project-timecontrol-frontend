import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
    const { token } = useContext(AuthContext);

    if (!token) {
        return <Navigate to="/" replace />;
    }

    return children;
}
