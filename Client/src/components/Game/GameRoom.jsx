import { useGameRoom } from "@contexts/GameRoomContext";
import WordDisplay from "./GameScreen/Word/WordDisplay";
import Spinner from "@common/Spinner/Spinner";
import styles from "./GameRoom.module.css";
import KeeperWordPopup from "./Modals/KeeperWordPopup";
import SubmitClue from "./GameScreen/Seeker/SubmitClue";
import CluetactPopup from "./Modals/CluetactPopup";
import BlockedCluesSection from "./GameScreen/BlockedClues/BlockedCluesSection";
import GameOverPopup from "./Modals/GameOverPopup";
import FloatingLetters from "../Animations/FloatingLetters/FloatingLetters";
import NotificationBox from "./NotificationBox/NotificationBox";
import PlayersTable from "./GameScreen/Player/PlayersTable";
import PlayerMainMessageHeader from "./GameScreen/Player/PlayerMainMessageHeader";
import SeekerCluePanel from "./GameScreen/Seeker/SeekerCluePanel";
import KeeperCluePanel from "@components/Game/KeeperCluePanel/KeeperCluePanel";
import ExitGameButton from "./ExitGameButton";
import ConfimModal from "./Modals/ConfirmModal";
import { useState } from "react";
import CountdownTimer from "./CountdownTimer";
import Modal from "@components/common/Modal/Modal";

function GameRoom() {
    const { timeLeft, setTimeLeft, gameState, loading, handleExitGame, notification } = useGameRoom();
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    if (loading) return <Spinner />;

    return (
        <div className={styles.room}>
            {!gameState.isKeeper && !gameState.isWordChosen && <Modal>Waiting for the keeper to choose a word...</Modal>}

            {gameState.isKeeper && !gameState.isWordChosen && <KeeperWordPopup showConfirmModal={() => setShowConfirmModal(true)} />}

            {gameState.cluetact && <CluetactPopup />}
            {gameState.winners?.length > 0 && <GameOverPopup />}

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
                <PlayersTable players={gameState.players} />
            </div>

            {/* Main Game Panel */}
            <div className={styles.main}>
                {/* Notification */}
                {notification.message && <NotificationBox />}

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

            {showConfirmModal && <ConfimModal handleCloseModal={() => setShowConfirmModal(false)} handleConfirmExit={handleExitGame} />}

            <FloatingLetters />
        </div>
    );
}

export default GameRoom;
