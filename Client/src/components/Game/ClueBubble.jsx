import styles from "./ClueBubble.module.css";

function ClueBubble({ from, definition, blocked, onGuess }) {
    return (
        <div
            className={`bubble ${blocked ? "blocked" : ""}`}
            onClick={!blocked ? onGuess : undefined}
        >
            <strong>{from}:</strong> {definition}
        </div>
    );
}

export default ClueBubble;
