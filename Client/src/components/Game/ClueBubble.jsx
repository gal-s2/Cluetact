import styles from "./ClueBubble.module.css";

function ClueBubble({ from, definition, onGuess }) {
    return (
        <div className={styles.bubble} onClick={onGuess}>
            <p className={styles.definition}>
                <strong>{from}:</strong> {definition}
            </p>
        </div>
    );
}

export default ClueBubble;
