import styles from "./Lobby.module.css";

function PlayCard({ playMenuOpen, setPlayMenuOpen, findGame, setShowJoinModal, handleCreateRoom }) {
    return (
        <div className={styles.card}>
            <button className={styles.buttonPrimary} onClick={() => setPlayMenuOpen((prev) => !prev)}>
                Play
            </button>

            {playMenuOpen && (
                <div className={styles.dropdown}>
                    <button onClick={findGame}>Find Game</button>
                    <button onClick={() => setShowJoinModal(true)}>Join Room</button>
                    <button onClick={handleCreateRoom}>Create Room</button>
                </div>
            )}
        </div>
    );
}

export default PlayCard;
