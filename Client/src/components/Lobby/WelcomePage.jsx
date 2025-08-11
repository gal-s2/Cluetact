import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useUser } from "@contexts/UserContext";
import { baseUrl } from "@config/baseUrl";
import styles from "../Lobby/Lobby.module.css";
import Logo from "../General/Logo/Logo";
import InfoSection from "./InfoSection";
import MusicToggleButton from "../General/MusicToggleButton/MusicToggleButton.jsx";

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
                <p className={styles.subtitle}>
                    The ultimate word guessing experience
                </p>
            </header>

            {/* Main Content */}
            <main className={styles.main}>
                <div className={styles.actionCards}>
                    <div className={`${styles.card} ${styles.primaryCard}`}>
                        <div className={styles.cardIcon}>🎮</div>
                        <h2>Ready to Play?</h2>
                        <p>
                            Jump right into the action and start your
                            word-guessing adventure
                        </p>
                        <button
                            className={styles.primaryButton}
                            onClick={navigateToLogin}
                        >
                            Login / Register
                        </button>
                    </div>

                    <div className={`${styles.card} ${styles.secondaryCard}`}>
                        <div className={styles.cardIcon}>👤</div>
                        <h2>Try as Guest</h2>
                        <p>
                            Get a taste of the game without creating an account
                        </p>
                        <button
                            className={styles.secondaryButton}
                            onClick={playAsGuestClick}
                        >
                            Play as Guest
                        </button>
                    </div>
                </div>
            </main>

            {/* Bottom Info Section */}
            <InfoSection />
            <MusicToggleButton />
        </div>
    );
}
