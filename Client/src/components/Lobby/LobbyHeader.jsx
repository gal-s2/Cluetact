import styles from "./Lobby.module.css";
import logo from "../../assets/Cluetact.jpeg";

function LobbyHeader({ username }) {
    return (
        <header className={styles.header}>
            <img src={logo} alt="Cluetact Logo" className={styles.logo} />
            <h1>Welcome, {username}!</h1>
        </header>
    );
}

export default LobbyHeader;
