import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import styles from './AuthForm.module.css';
import logo from '../../assets/Cluetact.jpeg';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function AuthForm({ type }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};

        if (!emailRegex.test(email)) { // Email validation
            newErrors.email = "Invalid email address";
        }

        if (password.length < 6) { // Password validation (minimum 6 characters)
            newErrors.password = "Password must be at least 6 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0; // Return true if no errors
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        let url;
        if (type === 'login') {
            url = "http://localhost:3000/auth/login";
        } else {
            url = "http://localhost:3000/auth/register";
        }

        try {
            const response = await axios.post(url, { email, password, username });

            if (response.status === 200) {
                alert(`${type === 'login' ? 'Login' : 'Registration'} successful!`);
            } else {
                alert(`${type === 'login' ? 'Login' : 'Registration'} failed`);
            }        
        } catch (error) {
            const newErrors = { server: error.response?.data?.error || "Something went wrong. Please try again." };
            setErrors(newErrors);
        }
    }

    return (
        <div className={styles.authContainer}>
            <img src={logo} alt="Cluetact Logo" className={styles.logo} />
            <h2>{type === 'login' ? "Login" : "Register"}</h2>
            <form onSubmit={handleSubmit} className={styles.authForm}>
                {type === 'register' && (
                <input 
                    type="text" 
                    placeholder="Username" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    required 
                />
                )}

                <input 
                    type="text" 
                    placeholder="Email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    className={errors.email ? styles.invalidInput : ""} 
                    required 
                />

                {errors.email && <p className={styles.error}>{errors.email}</p>}

                <input 
                    type="password" 
                    placeholder="Password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className={errors.password ? styles.invalidInput : ""}
                    required 
                />
                
                {errors.password && <p className={styles.error}>{errors.password}</p>}
                {errors.server && <p className={styles.error}>{errors.server}</p>}

                <button type="submit">{type === 'login' ? "Login" : "Sign Up"}</button>
            </form>
            <p>
                {type === "login" ? "Don't have an account? " : "Already have an account? "}
                <Link to={type === "login" ? "/register" : "/login"} className="toggle">
                    {type === "login" ? "Sign up" : "Login"}
                </Link>
            </p>
        </div>
    );
}

export default AuthForm;