import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useUser } from "@contexts/UserContext";
import { baseUrl } from "@config/baseUrl";
import styles from "./WelcomePage.module.css";
import Logo from "../General/Logo/Logo";

export default function WelcomePage() {
    const navigate = useNavigate();
    const { setUser } = useUser();

    const navigateToLogin = () => {
        navigate("/login");
    };

    const playAsGuestClick = async () => {
        try {
            const response = await axios.post(`${baseUrl}/auth/guest`);
            console.log("Guest login response:", response.data);
            if (response.status === 200) {
                setUser(response.data);
                navigate("/lobby");
            } else {
                alert(`guest login failed`);
            }
        } catch (error) {
            alert("Something went wrong. Please try again." + error);
        }
    };

    return (
        <div className={styles.container}>
            {/* Header Section */}
            <header className={styles.header}>
                <Logo className={styles.logo} />
                <h1>Welcome to Cluetact</h1>
                <p className={styles.subtitle}>The ultimate word guessing experience</p>
            </header>

            {/* Main Content */}
            <main className={styles.main}>
                <div className={styles.actionCards}>
                    <div className={`${styles.card} ${styles.primaryCard}`}>
                        <div className={styles.cardIcon}>🎮</div>
                        <h2>Ready to Play?</h2>
                        <p>Jump right into the action and start your word-guessing adventure</p>
                        <button className={styles.primaryButton} onClick={() => navigate("/login")}>
                            Login / Register
                        </button>
                    </div>

                    <div className={`${styles.card} ${styles.secondaryCard}`}>
                        <div className={styles.cardIcon}>👤</div>
                        <h2>Try as Guest</h2>
                        <p>Get a taste of the game without creating an account</p>
                        <button className={styles.secondaryButton} onClick={playAsGuestClick}>
                            Play as Guest
                        </button>
                    </div>
                </div>
            </main>

            {/* Bottom Info Section */}
            <div className={styles.infoSection}>
                <div className={styles.infoColumn}>
                    <h3>About</h3>
                    <p>Cluetact is a fast-paced word game where players try to guess a secret word by racing to define related words. Each round is packed with deduction, logic, and surprise twists.</p>
                </div>
                <div className={styles.infoColumn}>
                    <h3>News</h3>
                    <p>
                        🆕 New feature: You can now select custom avatars!
                        <br />✨ Improved game flow and new mystery-themed design!
                        <br />
                        🐞 Bug fixes for mobile responsiveness.
                    </p>
                </div>
                <div className={styles.infoColumn}>
                    <h3>How to Play</h3>
                    <p>The Keeper picks a secret word and reveals only the first letter. Seekers submit clues (definitions) for different words starting with that letter. Everyone races to guess the clue — but beware, the Keeper guesses too!</p>
                </div>
            </div>
        </div>
    );
}
