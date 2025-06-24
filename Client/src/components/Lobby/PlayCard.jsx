import styles from "./Lobby.module.css";

function PlayCard({ playMenuOpen, setPlayMenuOpen, findGame, setShowJoinModal, handleCreateRoom }) {
    return (
        <div className={styles.card}>
            <button className={styles.buttonPrimary} onClick={setPlayMenuOpen} aria-expanded={playMenuOpen} aria-haspopup="true">
                Play
            </button>

            {playMenuOpen && (
                <div className={styles.dropdown} role="menu">
                    <button onClick={findGame} role="menuitem">
                        Find Game
                    </button>
                    <button onClick={setShowJoinModal} role="menuitem">
                        Join Room
                    </button>
                    <button onClick={handleCreateRoom} role="menuitem">
                        Create Room
                    </button>
                </div>
            )}
        </div>
    );
}

export default PlayCard;
