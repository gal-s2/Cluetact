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
    const noWinners = gameState.players.reduce((sum, player) => sum + (player.gameScore || 0), 0) === 0;

    return (
        <Modal>
            <h2 className={noWinners ? styles.noWinText : isWinner ? styles.winText : styles.loseText}>{noWinners ? "😐 No Winners" : isWinner ? "🎉 You Win!" : "😢 You Lost"}</h2>
            {gameState.logMessage && gameState.logMessage.length > 0 && <p>{gameState.logMessage}</p>}

            {!noWinners && (
                <div className={styles.winnersSection}>
                    <h3>🏆 Winner{winners.length > 1 ? "s" : ""}</h3>
                    <ul>
                        {winners.map((winner, index) => (
                            <li key={index}>{winner}</li>
                        ))}
                    </ul>
                </div>
            )}

            <div className={styles.buttons}>
                <Button color="danger" onClick={handleExitGame}>
                    Exit
                </Button>
            </div>
        </Modal>
    );
}

export default GameOverPopup;
