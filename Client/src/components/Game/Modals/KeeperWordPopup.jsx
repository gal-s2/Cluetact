import { useEffect, useState } from "react";
import { useGameRoom } from "@contexts/GameRoomContext";
import styles from "./KeeperWordPopup.module.css";
import socket from "@services/socket";
import SOCKET_EVENTS from "@shared/socketEvents.json";
import Modal from "@common/Modal/Modal";
import Button from "@common/Button/Button";
import Spinner from "@components/common/Spinner/Spinner";

function KeeperWordPopup({ showConfirmModal }) {
    const { gameState, setKeeperWord, isKeeperWordRejected, setIsKeeperWordRejected } = useGameRoom();
    const [loading, setLoading] = useState(false);
    const keeperWord = gameState.keeperWord || "";
    const logMessage = gameState.logMessage;

    useEffect(() => {
        // Reset loading state when the keeper word is rejected
        if (isKeeperWordRejected) {
            setLoading(false);
            setIsKeeperWordRejected(false);
        }
    }, [isKeeperWordRejected]);

    const onSubmit = (e) => {
        // on form submit, emit the event to the server
        e.preventDefault();
        if (!keeperWord || keeperWord.trim() === "") return;
        setLoading(true);
        socket.emit(SOCKET_EVENTS.CLIENT_KEEPER_WORD_SUBMISSION, { word: keeperWord });
    };

    return (
        <Modal onClose={() => showConfirmModal()} showCloseButton={true}>
            <div className={styles.container}>
                <form onSubmit={onSubmit}>
                    {loading ? (
                        <>
                            <Spinner />
                            <div style={{ marginBottom: "2rem" }}>Submitting your word...</div>
                        </>
                    ) : (
                        <>
                            <p>{logMessage}</p>
                            <input type="text" value={keeperWord} onChange={(e) => setKeeperWord(e.target.value)} placeholder="Enter your secret word" />
                        </>
                    )}

                    <Button type="submit" color="accept" disabled={loading || !keeperWord || keeperWord.trim() === ""}>
                        Submit
                    </Button>
                </form>
            </div>
        </Modal>
    );
}

export default KeeperWordPopup;
