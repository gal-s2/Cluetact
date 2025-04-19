import styles from "./WordDisplay.module.css";

function WordDisplay({ word, length }) {
    const currentDisplay = word ? word : "_ ".repeat(length).trim();

    return (
        <div className={styles.wrapper}>
            <b className={styles.word}>{currentDisplay}</b>
        </div>
    );
}

export default WordDisplay;
