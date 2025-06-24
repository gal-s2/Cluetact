import { useNavigate } from "react-router-dom";
import styles from "./BackToLobbyButton.module.css";

function BackToLobbyButton({ children = "← Back", className = "", onClick = () => {} }) {
    const navigate = useNavigate();

    const handleBack = () => {
        navigate("/lobby");
    };

    return (
        <button className={`${styles.backButton} ${className}`} onClick={handleBack}>
            {children}
        </button>
    );
}

export default BackToLobbyButton;
