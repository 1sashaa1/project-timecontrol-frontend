import React, { useState } from "react";
import {logout, register} from "../services/AuthService";
import { useNavigate } from "react-router-dom";

function RegisterForm() {
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [registerData, setRegisterData] = useState({
        login: "",
        email: "",
        password: ""
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        logout();
        try {
            setError("");
            await register(registerData);

            alert("Регистрация прошла успешно!");
            navigate("/");
        } catch (err) {
            setError(err.response?.data || "Регистрация не осуществлена...");
        }
    };

    return (
        <div className="auth-container">
            <h2 className="auth-title">Register</h2>

            {error && <div className="auth-error">{error}</div>}

            <form className="auth-form" onSubmit={handleSubmit}>
                <input
                    className="auth-input"
                    placeholder="Логин"
                    value={registerData.login}
                    onChange={(e) =>
                        setRegisterData({ ...registerData, login: e.target.value })
                    }
                />

                <input
                    className="auth-input"
                    placeholder="Email"
                    value={registerData.email}
                    onChange={(e) =>
                        setRegisterData({ ...registerData, email: e.target.value })
                    }
                />

                <input
                    className="auth-input"
                    type="password"
                    placeholder="Пароль"
                    value={registerData.password}
                    onChange={(e) =>
                        setRegisterData({ ...registerData, password: e.target.value })
                    }
                />

                <button className="auth-button" type="submit">
                    Register
                </button>
            </form>
        </div>
    );
}

export default RegisterForm;
