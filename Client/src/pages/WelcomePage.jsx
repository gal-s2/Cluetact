import styles from "./WelcomePage.module.css";
import logo from '../assets/Cluetact.jpeg'

export default function WelcomePage({ onNavigate }) {
  return (
    <div className={styles.container}>
      <img className={styles.logo} src={logo} alt="logo" />
      <button onClick={() => onNavigate("login")} className={styles.button}>Login</button>
      <button onClick={() => onNavigate("register")} className={styles.button}>Register</button>
    </div>
  );
}
