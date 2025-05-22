import { useUser } from "../../UserContext";
import styles from "./GameOverPopup.module.css";

function GameOverPopup({ winners, onNextRound, onExit }) {
    const { user } = useUser();
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
                    <button className={styles.nextButton} onClick={onNextRound}>
                        Next Round
                    </button>
                    <button className={styles.exitButton} onClick={onExit}>
                        Exit
                    </button>
                </div>
            </div>
        </div>
    );
}

export default GameOverPopup;
