import styles from "./ClueBubble.module.css";

function ClueBubble({ from, definition, word, blocked, onGuess }) {
    return (
        <div className={`${styles.bubble} ${blocked ? styles.blocked : ""}`} onClick={!blocked ? onGuess : undefined}>
            {blocked && <span className={styles.blockIcon}>❌</span>}
            <strong>{from}:</strong>{" "}
            {blocked ? (
                <div className={styles.blockedContent}>
                    <span className={styles.blockedWord}>{word.toUpperCase()}</span>
                    <div className={styles.definition}>{definition}</div>
                </div>
            ) : (
                <>{definition}</>
            )}
        </div>
    );
}

export default ClueBubble;
