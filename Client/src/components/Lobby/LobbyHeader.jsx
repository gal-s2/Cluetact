import Logo from "../General/Logo/Logo";
import styles from "./Lobby.module.css";

function LobbyHeader({ username }) {
    return (
        <header className={styles.header}>
            <Logo className={styles.logo} />
            <h1>Welcome, {username}!</h1>
        </header>
    );
}

export default LobbyHeader;
