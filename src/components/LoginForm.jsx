import React, { useState, useContext } from "react";
import {login, saveUserInfo} from "../services/AuthService";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "../App.css"; // подключаем CSS

export default function LoginForm() {
    const { saveToken, saveRefreshToken } = useContext(AuthContext);
    const navigate = useNavigate();
    const [loginData, setLoginData] = useState({ login: "", password: "" });
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await login(loginData);
            saveToken(response.data.token);
            saveRefreshToken(response.data.refreshToken);
            saveUserInfo(response.data.id, response.data.username, response.data.role);

            setError("");
            if (!response.data.profileCompleted) {
                navigate("/complete-profile");
            } else {
                navigate("/dashboard");
            }
        } catch (err) {
            setError("Неверный логин или пароль");
        }
    };

    return (
        <div className="auth-container">
            <h2 className="auth-title">Login</h2>
            {error && <div className="auth-error">{error}</div>}
            <form className="auth-form" onSubmit={handleSubmit}>
                <input
                    className="auth-input"
                    placeholder="Логин"
                    value={loginData.login}
                    onChange={e => setLoginData({...loginData, login: e.target.value})}
                />
                <input
                    className="auth-input"
                    type="password"
                    placeholder="Пароль"
                    value={loginData.password}
                    onChange={e => setLoginData({...loginData, password: e.target.value})}
                />
                <button className="auth-button" type="submit">Login</button>
            </form>

            <p style={{marginTop: "15px", fontSize: "14px"}}>
                Don't have an account?{" "}
                <span
                    style={{color: "#4CAF50", cursor: "pointer", fontWeight: "bold"}}
                    onClick={() => navigate("/register")}
                >
          Register here
        </span>
            </p>
        </div>
    );
}
