import { useState } from "react";
import axios from "axios";
import styles from "./Auth.module.css";

export default function LoginPage({ onNavigate }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/auth/login", { email, password });
      alert("Login successful!");
      onNavigate("welcome");  // Redirect to welcome or dashboard
    } catch (error) {
      alert("Invalid credentials");
    }
  };

  return (
    <div className={styles.container}>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Login</button>
      </form>
      <button onClick={() => onNavigate("register")} className={styles.link}>Don't have an account? Register</button>
      <button onClick={() => onNavigate("welcome")} className={styles.link}>Back</button>
    </div>
  );
}
