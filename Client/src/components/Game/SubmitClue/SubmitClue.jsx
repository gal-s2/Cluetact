import { useState } from "react";
import styles from "./SubmitClue.module.css";
import socket from "@services/socket";
import SOCKET_EVENTS from "@shared/socketEvents.json";
import { useGameRoom } from "@contexts/GameRoomContext";
import Button from "@common/Button/Button";

const WORD_MAX_LENGTH = 20;
const DEFINITION_MAX_LENGTH = 100;

function SubmitClue() {
    const { gameState, setNotification, socket } = useGameRoom();
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

    const handleSuggest = () => {
        socket.emit(SOCKET_EVENTS.CLIENT_GET_SUGGESTIONS, { revealedPrefix });
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

            <input className={styles.input} value={definition} onChange={(e) => onChangeDefinition(e.target.value)} placeholder="Enter your definition" maxLength={DEFINITION_MAX_LENGTH} />
            <div className={styles.charCount}>
                {definition.length} / {DEFINITION_MAX_LENGTH} characters
            </div>
            <div className={styles.suggestContainer}>
                {(!gameState.suggestions || gameState.suggestions.length === 0) && (
                    <div className={styles.suggestionsButtonContainer}>
                        <button type="button" className={styles.suggestButton} onClick={handleSuggest} disabled={word.trim() || definition.trim()}>
                            Suggest Me Words
                        </button>
                    </div>
                )}
                {gameState.suggestions && gameState.suggestions.length > 0 && (
                    <div className={styles.suggestionsLabelContaiener}>
                        <label className={styles.suggestLabel}>Found Suggestions: {gameState.suggestions.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(", ")}</label>
                    </div>
                )}
            </div>

            <Button type="submit" color="green" disabled={!definition.trim() || !word.trim()}>
                Submit Clue
            </Button>
        </form>
    );
}

export default SubmitClue;
