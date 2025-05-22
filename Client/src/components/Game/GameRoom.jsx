import { useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useUser } from "../UserContext";
import WordDisplay from "./GameScreen/Word/WordDisplay";
import PlayerCard from "./GameScreen/Player/PlayerCard";
import Spinner from "../Routes/Spinner";
import styles from "./GameRoom.module.css";
import KeeperWordPopup from "./GameScreen/Keeper/KeeperWordPopup";
import SubmitClue from "./GameScreen/Player/SubmitClue";
import KeeperClueList from "./GameScreen/Keeper/KeeperClueList";
import CluetactPopup from "./Modals/CluetactPopup";
import ProfileModal from "./Modals/ProfileModal";
import useGameRoomSocket from "../../hooks/useGameRoomSocket";
import SeekerClueSection from "./GameScreen/Seeker/SeekerClueSection";
import GuessModal from "./Modals/GuessModal";
import GameOverPopup from "./Modals/GameOverPopup";

function GameRoom() {
    // -----
    // were currently using ref here becuase of react strict mode
    // which will call useEffect twice
    // and therefore will send join room to server twice
    // -----
    const hasJoinedRef = useRef(false);
    const { user } = useUser();
    const { roomId } = useParams();

    const { gameState, loading, setKeeperWord, setCluetact, handleClueClick, handleGuessSubmit, handleNextRound, handleExitGame, activeClue, setActiveClue } = useGameRoomSocket(roomId, hasJoinedRef);

    const [selectedPlayer, setSelectedPlayer] = useState(null);

    if (loading) return <Spinner />;

    const handlePlayerCardClick = (player) => {
        // should open a small modal profile in future.
        const userData = gameState.players.find((p) => p.username === player.username);
        setSelectedPlayer(userData);
    };

    const closeProfileModal = () => {
        setSelectedPlayer(null);
    };

    return (
        <div className={styles.room}>
            {/* Blocking overlay */}
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

            {/* Modals */}
            {selectedPlayer && <ProfileModal player={selectedPlayer} onClose={closeProfileModal} />}
            {gameState.cluetact && <CluetactPopup guesser={gameState.cluetact.guesser} word={gameState.cluetact.word} onClose={() => setCluetact(null)} />}
            {activeClue && <GuessModal clue={activeClue} onSubmit={handleGuessSubmit} onCancel={() => setActiveClue(null)} />}
            {gameState.winners?.length > 0 && <GameOverPopup winners={gameState.winners} onNextRound={handleNextRound} onExit={handleExitGame} />}

            {/* Main content wrapper */}
            <div className={styles.content}>
                {gameState.isWordChosen && (
                    <div className={styles.wordDisplay}>
                        <WordDisplay isKeeper={gameState.isKeeper} revealedWord={gameState.revealedWord} word={gameState.keeperWord} length={gameState.wordLength} />
                    </div>
                )}

                <div className={styles.table}>
                    {gameState.players.map((player) => (
                        <PlayerCard key={player.username} player={player} me={player.username === user.username} onClick={() => handlePlayerCardClick(player)} />
                    ))}
                </div>

                <div className={styles.cluesSection}>
                    {!gameState.isKeeper && <SeekerClueSection clues={gameState.clues} onGuess={handleClueClick} />}
                    {gameState.isKeeper && <KeeperClueList clues={gameState.clues} />}
                </div>

                {!gameState.isKeeper && gameState.isWordChosen && (
                    <div className={styles.clueSubmitWrapper}>
                        <SubmitClue revealedPrefix={gameState.revealedWord} />
                    </div>
                )}
            </div>
        </div>
    );
}

export default GameRoom;
