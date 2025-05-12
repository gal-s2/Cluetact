import { useState } from "react";
import styles from "./SubmitClue.module.css";
import socket from "../../socket";
import SOCKET_EVENTS from "@shared/socketEvents.json";

const WORD_MAX_LENGTH = 20;
const DEFINITION_MAX_LENGTH = 100;

function SubmitClue({ revealedPrefix }) {
    const [definition, setDefinition] = useState("");
    const [word, setWord] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!word.toLowerCase().startsWith(revealedPrefix.toLowerCase())) {
            alert(`Word must start with: ${revealedPrefix}`);
            return;
        }

        socket.emit(SOCKET_EVENTS.CLIENT_SUBMIT_CLUE, { definition, word });
        setDefinition("");
        setWord("");
    };

    function onChangeDefinition(value) {
        if (value.length > DEFINITION_MAX_LENGTH || value === " ") return;
        setDefinition(value);
    }

    function onChangeWord(value) {
        if (value.length > WORD_MAX_LENGTH || value === " ") return;
        setWord(value);
    }

    return (
        <form className={styles.container} onSubmit={handleSubmit}>
            <textarea className={styles.textarea} value={definition} onChange={(e) => onChangeDefinition(e.target.value)} placeholder="Enter your 3-word definition" maxLength={100} />
            <div className={styles.charCount}>
                {definition.length} / {DEFINITION_MAX_LENGTH} characters
            </div>

            <input className={styles.input} value={word} onChange={(e) => onChangeWord(e.target.value)} placeholder={`Word starting with "${revealedPrefix}"`} />
            <div className={styles.charCount}>
                {word.length} / {WORD_MAX_LENGTH} characters
            </div>

            <button className={styles.button} type="submit" disabled={!definition.trim() || !word.trim()}>
                Submit Clue
            </button>
        </form>
    );
}

export default SubmitClue;
