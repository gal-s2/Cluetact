import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./AuthForm.module.css";
import logo from "../../../assets/Cluetact.jpeg";
import { baseUrl } from "../../../config/baseUrl";
import { useGoogleLogin } from "@react-oauth/google";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

import { useUser } from "../../../contexts/UserContext";

function AuthForm({ type }) {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [errors, setErrors] = useState({});

    const { setUser } = useUser();

    const validateForm = () => {
        const newErrors = {};

        if (!username.trim()) {
            newErrors.username = "Username is required";
        }

        if (password.length < 6) {
            // Password validation (minimum 6 characters)
            newErrors.password = "Password must be at least 6 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0; // Return true if no errors
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        let url;
        if (type === "login") {
            url = `${baseUrl}/auth/login`;
        } else {
            url = `${baseUrl}/auth/register`;
        }

        try {
            const response = await axios.post(url, {
                email,
                password,
                username,
            });
            console.log(response);

            if (response.status === 200) {
                setUser(response.data);
                navigate("/lobby");
            } else {
                alert(`${type === "login" ? "Login" : "Registration"} failed`);
            }
        } catch (error) {
            console.log("error:", error);
            const newErrors = {
                server: error.response?.data?.error || "Something went wrong. Please try again.",
            };
            setErrors(newErrors);
        }
    };

    // Custom Google login using useGoogleLogin hook
    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                // Get user info from Google
                const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
                    headers: {
                        Authorization: `Bearer ${tokenResponse.access_token}`,
                    },
                });
                const userInfo = await userInfoResponse.json();

                // Send to your backend
                const response = await axios.post(`${baseUrl}/auth/google`, {
                    token: tokenResponse.access_token,
                    userInfo: userInfo,
                });

                if (response.status === 200) {
                    setUser(response.data);
                    navigate("/lobby");
                } else {
                    setErrors({ server: "Google login failed" });
                }
            } catch (err) {
                console.error("Google login error:", err);
                setErrors({ server: "Google login failed" });
            }
        },
        onError: () => setErrors({ server: "Google login failed" }),
    });

    return (
        <div className={styles.authContainer}>
            <div className={styles.content}>
                <img src={logo} alt="Cluetact Logo" className={styles.logo} />
                <h2>{type === "login" ? "Login" : "Register"}</h2>

                {/* Custom Google Login Button */}
                <button onClick={googleLogin} className={styles.googleLoginBtn} type="button">
                    <svg width="18" height="18" viewBox="0 0 18 18">
                        <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z" />
                        <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.04a4.8 4.8 0 0 1-7.18-2.53H1.83v2.07A8 8 0 0 0 8.98 17z" />
                        <path fill="#FBBC05" d="M4.5 10.49a4.8 4.8 0 0 1 0-3.07V5.35H1.83a8 8 0 0 0 0 7.28l2.67-2.14z" />
                        <path fill="#EA4335" d="M8.98 4.72c1.16 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.35L4.5 7.42a4.77 4.77 0 0 1 4.48-2.7z" />
                    </svg>
                    Continue with Google
                </button>

                <form onSubmit={handleSubmit} className={styles.authForm}>
                    {type === "register" && <input type="text" placeholder="Email" value={email || ""} onChange={(e) => setEmail(e.target.value)} required />}

                    <input type="text" placeholder="Username" value={username || ""} onChange={(e) => setUsername(e.target.value)} className={errors.username ? styles.invalidInput : ""} required />
                    {errors.username && <p className={styles.error}>{errors.username}</p>}

                    <input
                        type="password"
                        placeholder="Password"
                        value={password || ""}
                        onChange={(e) => setPassword(e.target.value)}
                        className={errors.password ? styles.invalidInput : ""}
                        required
                    />

                    {errors.password && <p className={styles.error}>{errors.password}</p>}
                    {errors.server && <p className={styles.error}>{errors.server}</p>}

                    <button type="submit">{type === "login" ? "Login" : "Sign Up"}</button>
                </form>

                <p>
                    {type === "login" ? "Don't have an account? " : "Already have an account? "}
                    <Link to={type === "login" ? "/register" : "/login"} className={styles.toggle}>
                        {type === "login" ? "Sign up" : "Login"}
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default AuthForm;
