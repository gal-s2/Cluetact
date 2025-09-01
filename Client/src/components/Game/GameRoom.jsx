import { useState, useEffect, useRef } from "react";
import { useGameRoom } from "@contexts/GameRoomContext";
import { useMusic } from "../Music/MusicContext.jsx";
import { useUser } from "@contexts/UserContext.jsx";
import SOCKET_EVENTS from "@shared/socketEvents.json";

import WordDisplay from "./WordDisplay/WordDisplay";
import Spinner from "@common/Spinner/Spinner";
import KeeperWordPopup from "./KeeperWordPopup/KeeperWordPopup";
import SubmitClue from "./SubmitClue/SubmitClue";
import CluetactPopup from "./CluetactPopup/CluetactPopup";
import BlockedCluesSection from "./BlockedClues/BlockedCluesSection";
import GameOverPopup from "./GameOverPopup/GameOverPopup";
import FloatingLetters from "../Animations/FloatingLetters/FloatingLetters";
import NotificationBox from "./NotificationBox/NotificationBox";
import PlayersList from "./PlayersList/PlayersList";
import PlayerMainMessageHeader from "./PlayerMainMessageHeader/PlayerMainMessageHeader";
import SeekerCluePanel from "./SeekerCluePanel/SeekerCluePanel";
import KeeperCluePanel from "@components/Game/KeeperCluePanel/KeeperCluePanel";
import ExitGameButton from "./ExitGameButton/ExitGameButton";
import ConfirmModal from "./ConfirmModal/ConfirmModal";
import CountdownTimer from "./CountdownTimer/CountdownTimer";
import MusicToggleButton from "../General/MusicToggleButton/MusicToggleButton.jsx";

import FloatingReactionsOverlay from "./Emoji/FloatingReactionsOverlay";

import styles from "./GameRoom.module.css";

function GameRoom() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    const {
        timeLeft,
        setTimeLeft,
        gameState,
        loading,
        handleExitGame,
        notification,
        socket, // must be exposed from useGameRoom()
    } = useGameRoom();

    const { user } = useUser();
    const { changeTrack } = useMusic();

    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // username -> HTMLElement (anchor for positioning reactions)
    const anchorsRef = useRef(new Map());
    const registerAnchor = (username, el) => {
        if (!username) return;
        if (el) anchorsRef.current.set(username, el);
        else anchorsRef.current.delete(username);
    };

    // overlay state
    const [activeReactions, setActiveReactions] = useState([]);

    useEffect(() => {
        changeTrack("gameRoom");
    }, [changeTrack]);

    // listen for reactions from server, show for 5s
    useEffect(() => {
        if (!socket) return;

        const onShow = ({ id, username, emoji }) => {
            const anchorEl = anchorsRef.current.get(username);
            // fallback coordinates if anchor not found
            let x = window.innerWidth / 2;
            let y = 96;
            if (anchorEl) {
                const rect = anchorEl.getBoundingClientRect();
                x = rect.left + rect.width / 2;
                y = rect.top; // float from above the card
            }

            x = Math.max(12, Math.min(x, window.innerWidth - 12));
            y = Math.max(12, Math.min(y, window.innerHeight - 12));
            const item = { id, emoji, x, y };
            setActiveReactions((prev) => [...prev, item]);

            // remove after 5 seconds
            setTimeout(() => {
                setActiveReactions((prev) => prev.filter((r) => r.id !== id));
            }, 5000);
        };

        socket.on(SOCKET_EVENTS.SERVER_EMOJI_SHOW, onShow);
        return () => socket.off(SOCKET_EVENTS.SERVER_EMOJI_SHOW, onShow);
    }, [socket]);

    // local send API (used by PlayerCard via PlayersList)
    const sendEmoji = (emoji) => {
        console.log("sendEmoji ->", emoji, "socket?", !!socket);
        if (!socket || !emoji) return;
        socket.emit(SOCKET_EVENTS.CLIENT_EMOJI_SEND, { emoji });
    };

    if (loading) return <Spinner />;

    return (
        <div className={styles.room}>
            {/* When keeper is choosing word */}
            {gameState.status === "KEEPER_CHOOSING_WORD" && (
                <KeeperWordPopup
                    showConfirmModal={() => setShowConfirmModal(true)}
                />
            )}

            {gameState.cluetact && <CluetactPopup />}
            {gameState.status === "END" && <GameOverPopup />}

            <div className={styles.wordDisplay}>
                <WordDisplay />
            </div>

            {/* Main content */}
            <div className={styles.mainContent}>
                {/* Sidebar */}
                <div className={styles.sidebar}>
                    {/* Timer */}
                    {timeLeft > 0 && (
                        <div className={styles.timerContainer}>
                            <CountdownTimer
                                timeLeft={timeLeft}
                                setTimeLeft={setTimeLeft}
                            />
                        </div>
                    )}

                    {/* Players */}
                    <div className={styles.playersContainer}>
                        <PlayersList
                            onSendEmoji={sendEmoji}
                            registerAnchor={registerAnchor}
                        />
                    </div>
                </div>

                {/* Main panel */}
                <div className={styles.main}>
                    <div className={styles.headerSection}>
                        <PlayerMainMessageHeader />
                    </div>

                    {/* Clue submit */}
                    {!gameState.isKeeper &&
                        gameState.isWordChosen &&
                        gameState.isSubmittingClue &&
                        !gameState.activeClue && (
                            <div className={styles.clueSubmitWrapper}>
                                <SubmitClue />
                            </div>
                        )}

                    {/* Clues section */}
                    <div className={styles.cluesSection}>
                        {gameState.isKeeper ? (
                            <KeeperCluePanel />
                        ) : (
                            <SeekerCluePanel />
                        )}
                    </div>

                    {/* Blocked clues (keeper only) */}
                    {gameState.isKeeper && (
                        <div className={styles.blockedCluesContainer}>
                            <BlockedCluesSection maxVisibleItems={5} />
                        </div>
                    )}
                </div>
            </div>

            {/* Floating controls */}
            <div className={styles.floatingElements}>
                <MusicToggleButton />
                <ExitGameButton onExit={() => setShowConfirmModal(true)} />
            </div>

            {/* Modals & notifications */}
            {showConfirmModal && (
                <ConfirmModal
                    handleCloseModal={() => setShowConfirmModal(false)}
                    handleConfirmExit={handleExitGame}
                />
            )}

            {notification.message && <NotificationBox />}

            {/* Emoji overlay (portal; high z-index; pointer-events: none) */}
            {mounted && <FloatingReactionsOverlay items={activeReactions} />}

            {/* Background animation */}
            <FloatingLetters />
        </div>
    );
}

export default GameRoom;
