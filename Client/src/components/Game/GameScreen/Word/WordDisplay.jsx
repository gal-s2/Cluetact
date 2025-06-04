import styles from "./WordDisplay.module.css";

function WordDisplay({ isKeeper, revealedWord, word, length }) {
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

//the _ addition code: "_".repeat(length - revealedWord.length).trim()
