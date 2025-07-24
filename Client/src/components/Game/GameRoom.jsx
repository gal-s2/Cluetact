import { useGameRoom } from "../../contexts/GameRoomContext";
import WordDisplay from "./GameScreen/Word/WordDisplay";
import Spinner from "../Routes/Spinner/Spinner";
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
import KeeperCluePanel from "./GameScreen/Keeper/KeeperCluePanel";
import ExitGameButton from "./ExitGameButton";
import ConfimModal from "./Modals/ConfirmModal";
import { useState } from "react";
import CountdownTimer from "./CountdownTimer";

function GameRoom() {
    const { timeLeft, setTimeLeft, gameState, loading, handleExitGame, notification } = useGameRoom();

    const [showConfirmModal, setShowConfirmModal] = useState(false);

    if (loading) return <Spinner />;

    return (
        <div className={styles.room}>
            {!gameState.isKeeper && !gameState.isWordChosen && (
                <div className={styles.waitOverlay}>
                    <div className={styles.waitMessage}>Waiting for the keeper to choose a word...</div>
                </div>
            )}

            {gameState.isKeeper && !gameState.isWordChosen && (
                <div className={styles.waitOverlay}>
                    <div className={styles.popupWrapper}>
                        <KeeperWordPopup showConfirmModal={() => setShowConfirmModal(true)} />
                    </div>
                </div>
            )}

            {gameState.cluetact && <CluetactPopup />}

            {gameState.winners?.length > 0 && <GameOverPopup />}

            <div className={styles.content}>
                <PlayersTable players={gameState.players} />

                {notification.message && <NotificationBox />}

                {gameState.isWordChosen && (
                    <div className={styles.wordDisplay}>
                        <WordDisplay />
                    </div>
                )}

                <>
                    <PlayerMainMessageHeader></PlayerMainMessageHeader>
                </>

                {!gameState.isKeeper && gameState.isWordChosen && gameState.isSubmittingClue && !gameState.activeClue && (
                    <div className={styles.clueSubmitWrapper}>
                        <SubmitClue />
                    </div>
                )}

                <div className={styles.cluesSection}>{gameState.isKeeper ? <KeeperCluePanel /> : <SeekerCluePanel />}</div>

                {gameState.isKeeper && <BlockedCluesSection maxVisibleItems={5} />}
                <FloatingLetters />
            </div>

            {timeLeft > 0 && <CountdownTimer timeLeft={timeLeft} setTimeLeft={setTimeLeft} />}

            <ExitGameButton onExit={() => setShowConfirmModal(true)} />

            {showConfirmModal && <ConfimModal handleCloseModal={() => setShowConfirmModal(false)} handleConfirmExit={handleExitGame} />}
        </div>
    );
}

export default GameRoom;
