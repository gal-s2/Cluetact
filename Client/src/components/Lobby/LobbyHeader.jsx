import Logo from "../General/Logo/Logo";
import styles from "./Lobby.module.css";
import MusicToggleButton from "../General/MusicToggleButton/MusicToggleButton.jsx";

function LobbyHeader({ username }) {
    return (
        <header className={styles.header}>
            <Logo className={styles.logo} />
            <h1>Welcome, {username}!</h1>
            <MusicToggleButton />
        </header>
    );
}

export default LobbyHeader;
