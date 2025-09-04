import { useEffect, useState, useRef } from "react";
import { useGameRoom } from "@contexts/GameRoomContext";
import styles from "./KeeperWordPopup.module.css";
import socket from "@services/socket";
import SOCKET_EVENTS from "@shared/socketEvents.json";
import Modal from "@common/Modal/Modal";
import Button from "@common/Button/Button";
import Spinner from "@components/common/Spinner/Spinner";
import formatTime from "@utils/formatTime";
import { useUser } from "@contexts/UserContext.jsx";

function KeeperWordPopup({ showConfirmModal }) {
    const { user } = useUser();
    const { gameState, isKeeperWordRejected, setIsKeeperWordRejected } = useGameRoom();
    const [loading, setLoading] = useState(false);
    const [keeperTimeLeft, setKeeperTimeLeft] = useState(gameState.keeperTime || 0);
    const [innerKeeperWord, setInnerKeeperWord] = useState("");
    const isKeeper = gameState.players.find((p) => p.username === user.username)?.role === "keeper";

    // Timer refs
    const endTimeRef = useRef(null);
    const intervalRef = useRef(null);

    const keeperWord = gameState.keeperWord || "";
    const logMessage = gameState.logMessage;

    useEffect(() => {
        // Reset loading state when the keeper word is rejected
        if (isKeeperWordRejected) {
            setLoading(false);
            setIsKeeperWordRejected(false);
        }
    }, [isKeeperWordRejected]);

    // Timer logic
    useEffect(() => {
        const newTimeLeft = gameState.keeperTime ?? 0;
        setKeeperTimeLeft(newTimeLeft);

        if (newTimeLeft === null) return;

        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        endTimeRef.current = Date.now() + newTimeLeft * 1000;
        intervalRef.current = setInterval(() => {
            const secondsLeft = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000));
            setKeeperTimeLeft(secondsLeft);

            if (secondsLeft === 0) {
                clearInterval(intervalRef.current);
            }
        }, 1000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [gameState]);

    const onSubmit = (e) => {
        // on form submit, emit the event to the server
        e.preventDefault();
        if (!innerKeeperWord || innerKeeperWord.trim() === "") return;
        setLoading(true);
        socket.emit(SOCKET_EVENTS.CLIENT_KEEPER_WORD_SUBMISSION, { word: innerKeeperWord });
    };

    return (
        <Modal onClose={() => showConfirmModal()} showCloseButton={true}>
            <div className={styles.container}>
                {/* Timer Display */}
                {keeperTimeLeft !== null && (
                    <div className={styles.timerWrapper}>
                        <div className={styles.timerLabel}>Time to choose word:</div>
                        <div className={styles.timerDisplay}>{formatTime(keeperTimeLeft ?? 0)}</div>
                    </div>
                )}
                {isKeeper ? (
                    <form onSubmit={onSubmit}>
                        {loading ? (
                            <>
                                <Spinner />
                                <div style={{ marginBottom: "2rem" }}>Submitting your word...</div>
                            </>
                        ) : (
                            <>
                                <input
                                    type="text"
                                    value={innerKeeperWord}
                                    onChange={(e) => setInnerKeeperWord(e.target.value)}
                                    placeholder="Enter your secret word"
                                    disabled={keeperTimeLeft === 0} // Disable input when time is up
                                />
                            </>
                        )}

                        <Button type="submit" color="accept" disabled={loading || !innerKeeperWord || innerKeeperWord.trim() === "" || keeperTimeLeft === 0}>
                            Submit
                        </Button>
                    </form>
                ) : (
                    <p>Waiting for the keeper to choose a word...</p>
                )}
            </div>
        </Modal>
    );
}

export default KeeperWordPopup;
