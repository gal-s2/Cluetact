import axios from "axios";
import logo from "../../assets/Cluetact.jpeg";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";
import { baseUrl } from "../../config/baseUrl";
import styles from "./WelcomePage.module.css";

export default function WelcomePage() {
    const navigate = useNavigate();
    const { setUser } = useUser();

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
            <img src={logo} alt="Cluetact Logo" className={styles.logo} />

            <div className={styles.buttons}>
                <button className={styles.primaryButton} onClick={() => navigate("/login")}>
                    Login / Register
                </button>

                <button className={styles.secondaryButton} onClick={playAsGuestClick}>
                    Play as Guest
                </button>
            </div>
        </div>
    );
}
