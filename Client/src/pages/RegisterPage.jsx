import { useState } from "react";
import axios from "axios";
import styles from "./Auth.module.css";

export default function RegisterPage({ onNavigate }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/auth/register", { email, password });
      alert("Registration successful!");
      onNavigate("login");
    } catch (error) {
      alert("Registration failed");
    }
  };

  return (
    <div className={styles.container}>
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Register</button>
      </form>
      <button onClick={() => onNavigate("login")} className={styles.link}>Already have an account? Login</button>
      <button onClick={() => onNavigate("welcome")} className={styles.link}>Back</button>
    </div>
  );
}
