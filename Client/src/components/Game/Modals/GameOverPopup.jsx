import { useUser } from "../../../contexts/UserContext";
import styles from "./GameOverPopup.module.css";
import { useGameRoom } from "../../../contexts/GameRoomContext";

function GameOverPopup() {
    const { user } = useUser();
    const { gameState, handleNextRound, handleExitGame } = useGameRoom();
    const winners = gameState.winners || [];
    const isWinner = winners.includes(user.username);

    return (
        <div className={styles.overlay}>
            <div className={styles.popup}>
                <h2 className={isWinner ? styles.winText : styles.loseText}>{isWinner ? "🎉 You Win!" : "😢 You Lost"}</h2>

                <div className={styles.winnersSection}>
                    <h3>🏆 Winner{winners.length > 1 ? "s" : ""}</h3>
                    <ul>
                        {winners.map((winner, index) => (
                            <li key={index}>{winner}</li>
                        ))}
                    </ul>
                </div>

                <div className={styles.buttons}>
                    <button className={styles.nextButton} onClick={handleNextRound}>
                        Next Round
                    </button>
                    <button className={styles.exitButton} onClick={handleExitGame}>
                        Exit
                    </button>
                </div>
            </div>
        </div>
    );
}

export default GameOverPopup;
