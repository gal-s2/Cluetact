import { useState } from "react";
import styles from "./GameRoom.module.css";

function SubmitGuess() {
    const [definition, setDefinition] = useState("");
    const [word, setWord] = useState("");

    function submitSeekerGuess() {
        socket.emit("submit_seeker_guess", { word, definition });
    }

    return (
        <div>
            <textarea className={styles.seekerTextarea} placeholder="Enter your definition" value={definition} onChange={(e) => setDefinition(e.target.value)} />
            <div className={styles.seekerCharCount}>{definition.length} characters</div>

            <input className={styles.seekerInput} type="text" placeholder="Enter your word" value={word} onChange={(e) => setWord(e.target.value)} />
            <div className={styles.seekerCharCount}>{word.length} characters</div>

            <button className={styles.seekerButton} onClick={submitSeekerGuess}>
                Submit
            </button>
        </div>
    );
}

export default SubmitGuess;
