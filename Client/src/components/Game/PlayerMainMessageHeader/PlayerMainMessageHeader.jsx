import { useGameRoom } from "@contexts/GameRoomContext";
import { useUser } from "@contexts/UserContext";
import { useEffect } from "react";
import styles from "./PlayerMainMessageHeader.module.css";

function PlayerMainMessageHeader() {
    const { gameState } = useGameRoom();
    const { user } = useUser();

    const getStatusMessage = () => {
        const isMyTurn = gameState.clueGiverUsername === user.username;

        // If I'm the keeper
        if (gameState.isKeeper) {
            if (!gameState.activeClue) {
                return "Waiting for seekers to drop their clues... stay sharp! 🎯";
            } else {
                return "Hot clue incoming! Block it before it's too late ⚡";
            }
        }

        // If I'm a seeker
        if (!gameState.isKeeper) {
            if (!gameState.activeClue) {
                if (isMyTurn) {
                    return "Your moment to shine! Drop a clever clue ✨";
                } else {
                    return `Waiting for ${gameState.clueGiverUsername} to submit a clue... 🤔`;
                }
            } else {
                if (isMyTurn) {
                    return "Your clue is live! Will the keeper block it? 🔥";
                } else {
                    return `${gameState.clueGiverUsername}'s clue is in play... 👀 Time to guess!`;
                }
            }
        }

        return "";
    };

    const message = getStatusMessage();

    if (!message) return null;

    return (
        <div className={styles.headerContainer}>
            <div className={styles.messageBox}>
                <p className={styles.statusMessage}>{message}</p>
            </div>
        </div>
    );
}

export default PlayerMainMessageHeader;
