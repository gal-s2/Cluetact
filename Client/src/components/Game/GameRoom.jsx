import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { useGameRoom } from "../../contexts/GameRoomContext";
import WordDisplay from "./GameScreen/Word/WordDisplay";
import Spinner from "../Routes/Spinner/Spinner";
import styles from "./GameRoom.module.css";
import KeeperWordPopup from "./GameScreen/Keeper/KeeperWordPopup";
import SubmitClue from "./GameScreen/Seeker/SubmitClue";
import KeeperClueList from "./GameScreen/Keeper/KeeperClueList";
import ClueSection from "./GameScreen/ClueSection/ClueSection";
import CluetactPopup from "./Modals/CluetactPopup";
import BlockedCluesSection from "./GameScreen/BlockedClues/BlockedCluesSection";
import GuessActionLine from "./GameScreen/Seeker/GuessActionLine";
import GameOverPopup from "./Modals/GameOverPopup";
import FloatingLetters from "../Animations/FloatingLetters/FloatingLetters";
import NotificationBox from "./NotificationBox/NotificationBox";
import PlayersTable from "./GameScreen/Player/PlayersTable";
import PlayerMainMessageHeader from "./GameScreen/Player/PlayerMainMessageHeader";

function GameRoom() {
    const { gameState, loading, handleExitGame, notification } = useGameRoom();

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
                        <KeeperWordPopup />
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

                <div className={styles.cluesSection}>
                    {!gameState.isKeeper && <ClueSection />}
                    {!gameState.isKeeper && !gameState.isSubmittingClue && <GuessActionLine />}
                    {gameState.isKeeper && <KeeperClueList />}
                </div>

                <BlockedCluesSection maxVisibleItems={5} />
                <FloatingLetters />
            </div>

            <button className={styles.exitButton} onClick={handleExitGame} title="Exit Game">
                <FontAwesomeIcon icon={faArrowRightFromBracket} />
            </button>
        </div>
    );
}

export default GameRoom;
