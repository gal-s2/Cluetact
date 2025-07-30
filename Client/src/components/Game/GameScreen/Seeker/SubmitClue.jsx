import { useState } from "react";
import styles from "./SubmitClue.module.css";
import socket from "../../../../services/socket";
import SOCKET_EVENTS from "@shared/socketEvents.json";
import { useGameRoom } from "../../../../contexts/GameRoomContext";
import Button from "@common/Button/Button";

const WORD_MAX_LENGTH = 20;
const DEFINITION_MAX_LENGTH = 100;

function SubmitClue() {
    const { gameState, setNotification } = useGameRoom();
    const revealedPrefix = gameState.revealedWord || "";
    const [definition, setDefinition] = useState("");
    const [word, setWord] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!word.toLowerCase().startsWith(revealedPrefix.toLowerCase())) {
            setNotification({ message: `Word must start with "${revealedPrefix}"`, type: "error" });
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
            <input className={styles.input} value={word} onChange={(e) => onChangeWord(e.target.value)} placeholder={`Word starting with "${revealedPrefix}"`} />
            <div className={styles.charCount}>
                {word.length} / {WORD_MAX_LENGTH} characters
            </div>

            <textarea style={{ resize: "none" }} className={styles.textarea} value={definition} onChange={(e) => onChangeDefinition(e.target.value)} placeholder="Enter your definition" maxLength={DEFINITION_MAX_LENGTH} />
            <div className={styles.charCount}>
                {definition.length} / {DEFINITION_MAX_LENGTH} characters
            </div>

            <Button type="submit" color="green" disabled={!definition.trim() || !word.trim()}>
                Submit Clue
            </Button>
        </form>
    );
}

export default SubmitClue;
