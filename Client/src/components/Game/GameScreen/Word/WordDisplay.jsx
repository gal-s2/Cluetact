import styles from "./WordDisplay.module.css";
import { useGameRoom } from "../../../../contexts/GameRoomContext";

function WordDisplay() {
    const { gameState } = useGameRoom();
    const isKeeper = gameState.isKeeper;
    const word = gameState.keeperWord || "";
    const revealedWord = gameState.revealedWord || "";
    let currentDisplay = "";

    if (isKeeper) {
        currentDisplay = word.split("").map((char, index) => {
            const isRevealed = index < revealedWord.length;
            return (
                <b key={index} className={isRevealed ? styles.revealed : styles.hidden}>
                    {char}
                </b>
            );
        });
    } else {
        currentDisplay = <b>{revealedWord + "..."}</b>;
    }

    return <div className={styles.word}>{currentDisplay}</div>;
}

export default WordDisplay;
