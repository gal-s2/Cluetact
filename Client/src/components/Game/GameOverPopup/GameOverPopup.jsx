import { useUser } from "@contexts/UserContext";
import { useGameRoom } from "@contexts/GameRoomContext";
import styles from "./GameOverPopup.module.css";
import Modal from "@components/common/Modal/Modal";
import Button from "@components/common/Button/Button";

function GameOverPopup() {
    const { user } = useUser();
    const { gameState, handleExitGame } = useGameRoom();
    const winners = gameState.winners || [];
    const isWinner = winners.includes(user.username);

    return (
        <Modal>
            <h2 className={isWinner ? styles.winText : styles.loseText}>{isWinner ? "🎉 You Win!" : "😢 You Lost"}</h2>

            {gameState.logMessage && gameState.logMessage.length > 0 && <p>{gameState.logMessage}</p>}

            <div className={styles.winnersSection}>
                <h3>🏆 Winner{winners.length > 1 ? "s" : ""}</h3>
                <ul>
                    {winners.map((winner, index) => (
                        <li key={index}>{winner}</li>
                    ))}
                </ul>
            </div>

            <div className={styles.buttons}>
                <Button color="danger" onClick={handleExitGame}>
                    Exit
                </Button>
            </div>
        </Modal>
    );
}

export default GameOverPopup;
