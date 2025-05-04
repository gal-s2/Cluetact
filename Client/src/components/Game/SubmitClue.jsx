import { useState } from "react";
import styles from "./SubmitClue.module.css";
import socket from "../../socket";

function SubmitClue({ revealedPrefix }) {
    const [definition, setDefinition] = useState("");
    const [word, setWord] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!word.startsWith(revealedPrefix)) {
            alert(`Word must start with: ${revealedPrefix}`);
            return;
        }

        socket.emit("submit_clue", { definition, word });
        setDefinition("");
        setWord("");
    };

    return (
        <form className={styles.container} onSubmit={handleSubmit}>
            <textarea className={styles.textarea} value={definition} onChange={(e) => setDefinition(e.target.value)} placeholder="Enter your 3-word definition" maxLength={100} />
            <input className={styles.input} value={word} onChange={(e) => setWord(e.target.value)} placeholder={`Word starting with "${revealedPrefix}"`} />
            <button className={styles.button} type="submit" disabled={!definition.trim() || !word.trim()}>
                Submit Clue
            </button>
        </form>
    );
}

export default SubmitClue;
