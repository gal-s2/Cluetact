import { useState } from "react";
import { useGameRoom } from "@contexts/GameRoomContext";
import WordDisplay from "./WordDisplay/WordDisplay";
import Spinner from "@common/Spinner/Spinner";
import styles from "./GameRoom.module.css";
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
import Modal from "@components/common/Modal/Modal";

function GameRoom() {
    const { timeLeft, setTimeLeft, gameState, loading, handleExitGame, notification } = useGameRoom();
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    if (loading) return <Spinner />;

    return (
        <div className={styles.room}>
            {/* WHEN KEEPER CHOOSING WORD */}
            {gameState.status === "KEEPER_CHOOSING_WORD" && !gameState.isKeeper && <Modal>Waiting for the keeper to choose a word...</Modal>}
            {gameState.status === "KEEPER_CHOOSING_WORD" && gameState.isKeeper && <KeeperWordPopup showConfirmModal={() => setShowConfirmModal(true)} />}

            {gameState.cluetact && <CluetactPopup />}
            {/* remove the winners part here*/}
            {gameState.status === "END" && <GameOverPopup />}

            {gameState.isWordChosen && (
                <div className={styles.wordDisplay}>
                    <WordDisplay />
                </div>
            )}

            <div className={styles.sidebar}>
                {/* Timer */}
                {timeLeft > 0 && (
                    <div className={styles.timerContainer}>
                        <CountdownTimer timeLeft={timeLeft} setTimeLeft={setTimeLeft} />
                    </div>
                )}

                {/* Players Table */}
                <PlayersList players={gameState.players} />
            </div>

            {/* Main Game Panel */}
            <div className={styles.main}>
                {/* Header Message */}
                <PlayerMainMessageHeader />

                {/* Clue Submit */}
                {!gameState.isKeeper && gameState.isWordChosen && gameState.isSubmittingClue && !gameState.activeClue && (
                    <div className={styles.clueSubmitWrapper}>
                        <SubmitClue />
                    </div>
                )}

                {/* Clues Section */}
                <div className={styles.cluesSection}>{gameState.isKeeper ? <KeeperCluePanel /> : <SeekerCluePanel />}</div>

                {/* Blocked Clues for Keeper */}

                <div className={styles.blockedCluesContainer}>
                    <BlockedCluesSection maxVisibleItems={5} />
                </div>
            </div>

            <ExitGameButton onExit={() => setShowConfirmModal(true)} />

            {showConfirmModal && <ConfirmModal handleCloseModal={() => setShowConfirmModal(false)} handleConfirmExit={handleExitGame} />}
            {/* Notification */}
            {notification.message && <NotificationBox />}

            <FloatingLetters />
        </div>
    );
}

export default GameRoom;
