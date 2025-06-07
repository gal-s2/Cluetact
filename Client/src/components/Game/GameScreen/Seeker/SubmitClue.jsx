import { useState, useContext } from "react";
import styles from "./SubmitClue.module.css";
import socket from "../../../../services/socket";
import SOCKET_EVENTS from "@shared/socketEvents.json";
import { useUser } from "../../../../contexts/UserContext";
import { useGameRoom } from "../../../../contexts/GameRoomContext";

const WORD_MAX_LENGTH = 20;
const DEFINITION_MAX_LENGTH = 100;

function SubmitClue() {
    const { gameState, setNotification } = useGameRoom();
    const revealedPrefix = gameState.revealedWord || "";
    const clues = gameState.clues || [];
    const [definition, setDefinition] = useState("");
    const [word, setWord] = useState("");
    const { user } = useUser();
    console.log("clues", clues);

    // Check if the last clue was submitted by the current user
    const lastClue = clues[clues.length - 1];
    const isWaitingForOthers = lastClue && lastClue.from === user.username;

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

    // Show waiting message if user already submitted the last clue
    if (isWaitingForOthers) {
        return <div className={styles.waitingBar}>⏳ Clue Submitted! Waiting for other players to guess your word...</div>;
    }

    return (
        <form className={styles.container} onSubmit={handleSubmit}>
            <h3 className={styles.yourTurnHeading}>It’s your turn to submit a clue! ✍️</h3>
            <input className={styles.input} value={word} onChange={(e) => onChangeWord(e.target.value)} placeholder={`Word starting with "${revealedPrefix}"`} />
            <div className={styles.charCount}>
                {word.length} / {WORD_MAX_LENGTH} characters
            </div>

            <textarea className={styles.textarea} value={definition} onChange={(e) => onChangeDefinition(e.target.value)} placeholder="Enter your definition" maxLength={DEFINITION_MAX_LENGTH} />
            <div className={styles.charCount}>
                {definition.length} / {DEFINITION_MAX_LENGTH} characters
            </div>

            <button className={styles.button} type="submit" disabled={!definition.trim() || !word.trim()}>
                Submit Clue
            </button>
        </form>
    );
}

export default SubmitClue;
