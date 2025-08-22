import { useState, useEffect, useRef } from "react";
import { useGameRoom } from "@contexts/GameRoomContext";
import { useMusic } from "../Music/MusicContext.jsx";
import { useUser } from "@contexts/UserContext.jsx";
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
import styles from "./GameRoom.module.css";

function GameRoom() {
    const { timeLeft, setTimeLeft, gameState, loading, handleExitGame, notification } = useGameRoom();
    const { user } = useUser();
    const { changeTrack, currentTrack } = useMusic();
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const trackChangedRef = useRef(false);

    useEffect(() => {
        changeTrack("gameRoom");
    }, [changeTrack]);

    if (loading) return <Spinner />;

    return (
        <div className={styles.room}>
            {/* WHEN KEEPER CHOOSING WORD */}
            {gameState.status === "KEEPER_CHOOSING_WORD" && <KeeperWordPopup showConfirmModal={() => setShowConfirmModal(true)} />}

            {gameState.cluetact && <CluetactPopup />}
            {gameState.status === "END" && <GameOverPopup />}

            <div className={styles.wordDisplay}>
                <WordDisplay />
            </div>

            {/* MAIN CONTENT AREA */}
            <div className={styles.mainContent}>
                {/* SIDEBAR */}
                <div className={styles.sidebar}>
                    {/* Timer Section */}
                    {timeLeft > 0 && (
                        <div className={styles.timerContainer}>
                            <CountdownTimer timeLeft={timeLeft} setTimeLeft={setTimeLeft} />
                        </div>
                    )}

                    {/* Players List */}
                    <div className={styles.playersContainer}>
                        <PlayersList players={gameState.players} />
                    </div>
                </div>

                {/* MAIN GAME PANEL */}
                <div className={styles.main}>
                    {/* Header Message */}
                    <div className={styles.headerSection}>
                        <PlayerMainMessageHeader />
                    </div>

                    {/* Clue Submit Section */}
                    {!gameState.isKeeper && gameState.isWordChosen && gameState.isSubmittingClue && !gameState.activeClue && (
                        <div className={styles.clueSubmitWrapper}>
                            <SubmitClue />
                        </div>
                    )}

                    {/* Main Clues Section */}
                    <div className={styles.cluesSection}>{gameState.isKeeper ? <KeeperCluePanel /> : <SeekerCluePanel />}</div>

                    {/* Blocked Clues for Keeper */}
                    {gameState.isKeeper && (
                        <div className={styles.blockedCluesContainer}>
                            <BlockedCluesSection maxVisibleItems={5} />
                        </div>
                    )}
                </div>
            </div>

            {/* FLOATING UI ELEMENTS */}
            <div className={styles.floatingElements}>
                <MusicToggleButton />
                <ExitGameButton onExit={() => setShowConfirmModal(true)} />
            </div>

            {/* MODALS & NOTIFICATIONS */}
            {showConfirmModal && <ConfirmModal handleCloseModal={() => setShowConfirmModal(false)} handleConfirmExit={handleExitGame} />}

            {notification.message && <NotificationBox />}

            {/* BACKGROUND ANIMATIONS */}
            <FloatingLetters />
        </div>
    );
}

export default GameRoom;
