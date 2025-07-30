import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./AuthForm.module.css";
import { baseUrl } from "../../../config/baseUrl";
import { useGoogleLogin } from "@react-oauth/google";
import { useUser } from "@contexts/UserContext";
import Logo from "@components/General/Logo/Logo";
import GoogleButton from "../GoogleButton/GoogleButton";

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
        flow: "auth-code",
        ux_mode: "popup",
        onSuccess: async (codeResponse) => {
            try {
                console.log("Google login code:", codeResponse.code);
                const response = await axios.post(`${baseUrl}/auth/google`, {
                    token: codeResponse.code,
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
                <Logo className={styles.logo} />
                <h2>{type === "login" ? "Login" : "Register"}</h2>

                <GoogleButton onClick={googleLogin} />

                <form onSubmit={handleSubmit} className={styles.authForm}>
                    {type === "register" && <input type="text" placeholder="Email" value={email || ""} onChange={(e) => setEmail(e.target.value)} required />}

                    <input type="text" placeholder="Username" value={username || ""} onChange={(e) => setUsername(e.target.value)} className={errors.username ? styles.invalidInput : ""} required />
                    {errors.username && <p className={styles.error}>{errors.username}</p>}

                    <input type="password" placeholder="Password" value={password || ""} onChange={(e) => setPassword(e.target.value)} className={errors.password ? styles.invalidInput : ""} required />

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
