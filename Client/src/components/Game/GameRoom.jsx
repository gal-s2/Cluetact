import { useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import WordDisplay from "./GameScreen/Word/WordDisplay";
import PlayerCard from "./GameScreen/Player/PlayerCard";
import Spinner from "../Routes/Spinner/Spinner";
import styles from "./GameRoom.module.css";
import KeeperWordPopup from "./GameScreen/Keeper/KeeperWordPopup";
import SubmitClue from "./GameScreen/Seeker/SubmitClue";
import KeeperClueList from "./GameScreen/Keeper/KeeperClueList";
import ClueSection from "./GameScreen/ClueSection/ClueSection";
import CluetactPopup from "./Modals/CluetactPopup";
import ProfileModal from "./Modals/ProfileModal";
import useGameRoomSocket from "../../hooks/useGameRoomSocket";
import BlockedCluesSection from "./GameScreen/BlockedClues/BlockedCluesSection";
import GuessActionLine from "./GameScreen/Seeker/GuessActionLine";
import GameOverPopup from "./Modals/GameOverPopup";
import FloatingLetters from "../Animations/FloatingLetters/FloatingLetters";
import NotificationBox from "./NotificationBox/NotificationBox";

function GameRoom() {
    // -----
    // were currently using ref here becuase of react strict mode
    // which will call useEffect twice
    // and therefore will send join room to server twice
    // -----
    const hasJoinedRef = useRef(false);
    const { user } = useUser();
    const { roomId } = useParams();

    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [notification, setNotification] = useState({ message: "", type: "notification" });

    const { gameState, loading, setKeeperWord, setCluetact, handleGuessSubmit, handleNextRound, handleExitGame } = useGameRoomSocket(roomId, hasJoinedRef, setNotification);

    if (loading) return <Spinner />;

    const handlePlayerCardClick = (player) => {
        // should open a small modal profile in future.
        const userData = gameState.players.find((p) => p.username === player.username);
        setSelectedPlayer(userData);
    };

    const closeProfileModal = () => {
        setSelectedPlayer(null);
    };

    const handleGuessSubmitFromActionLine = (guess) => {
        handleGuessSubmit(guess, gameState.clues[gameState.clues.length - 1]);
    };

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
                        <KeeperWordPopup keeperWord={gameState.keeperWord} setKeeperWord={setKeeperWord} logMessage={gameState.logMessage} />
                    </div>
                </div>
            )}

            {selectedPlayer && <ProfileModal player={selectedPlayer} onClose={closeProfileModal} />}
            {gameState.cluetact && <CluetactPopup guesser={gameState.cluetact.guesser} word={gameState.cluetact.word} onClose={() => setCluetact(null)} />}
            {gameState.winners?.length > 0 && <GameOverPopup winners={gameState.winners} onNextRound={handleNextRound} onExit={handleExitGame} />}

            <div className={styles.content}>
                <div className={styles.table}>
                    {gameState.players.map((player) => (
                        <PlayerCard key={player.username} player={player} me={player.username === user.username} onClick={() => handlePlayerCardClick(player)} />
                    ))}
                </div>

                {notification.message && <NotificationBox message={notification.message} type={notification.type} onDone={() => setNotification({ message: "", type: "notification" })} />}

                {gameState.isWordChosen && (
                    <div className={styles.wordDisplay}>
                        <WordDisplay isKeeper={gameState.isKeeper} revealedWord={gameState.revealedWord} word={gameState.keeperWord} length={gameState.wordLength} />
                    </div>
                )}

                {!gameState.isKeeper && gameState.isWordChosen && gameState.isSubmittingClue && (
                    <div className={styles.clueSubmitWrapper}>
                        <SubmitClue revealedPrefix={gameState.revealedWord} setNotification={setNotification} clues={gameState.clues} />
                    </div>
                )}

                <div className={styles.cluesSection}>
                    {/* Seeker's Clue Section */}
                    {!gameState.isKeeper && <ClueSection clues={gameState.clues} guesses={gameState.guesses} />}

                    {/* Seeker's Guess Action Line */}
                    {!gameState.isKeeper && !gameState.isSubmittingClue && <GuessActionLine onSubmit={handleGuessSubmitFromActionLine} />}

                    {/* Keeper's Clue List */}
                    {gameState.isKeeper && <KeeperClueList clues={gameState.clues} />}
                </div>

                <BlockedCluesSection clues={gameState.clues} maxVisibleItems={5} />

                <FloatingLetters />
            </div>

            <button className={styles.exitButton} onClick={handleExitGame} title="Exit Game">
                <FontAwesomeIcon icon={faArrowRightFromBracket} />
            </button>
        </div>
    );
}

export default GameRoom;
