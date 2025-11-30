import { createContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem("token") || null);
    const [refreshToken, setRefreshToken] = useState(localStorage.getItem("refresh") || null);

    const saveToken = (jwt) => {
        localStorage.setItem("token", jwt);
        setToken(jwt);
    };

    const saveRefreshToken = (refreshToken) => {
        localStorage.setItem("refresh", refreshToken);
        setRefreshToken(refreshToken);
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("refresh");
        setToken(null);
        setRefreshToken(null);
    };

    return (
        <AuthContext.Provider value={{ token, refreshToken, saveToken, saveRefreshToken, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
