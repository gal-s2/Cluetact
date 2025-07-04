import styles from "./WordDisplay.module.css";
import { useGameRoom } from "../../../../contexts/GameRoomContext";

function WordDisplay() {
    const { gameState } = useGameRoom();
    const isKeeper = gameState.isKeeper;
    const word = gameState.keeperWord || "";
    const revealedWord = gameState.revealedWord || "";
    const length = gameState.wordLength || 0;
    let currentDisplay = "";

    if (isKeeper) {
        console.log("Keeper's word:", word);
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

//the _ addition code: "_".repeat(length - revealedWord.length).trim()
