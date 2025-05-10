import { useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useUser } from "../UserContext";
import WordDisplay from "./WordDisplay";
import PlayerCard from "./PlayerCard";
import Spinner from "../Routes/Spinner";
import styles from "./GameRoom.module.css";
import KeeperWordPopup from "./KeeperWordPopup";
import SubmitClue from "./SubmitClue";
import KeeperClueList from "./KeeperClueList";
import CluetactPopup from "./CluetactPopup";
import ProfileModal from "./ProfileModal";
import useGameRoomSocket from "../../hooks/useGameRoomSocket";
import SeekerClueSection from "./SeekerClueSection";
import GuessModal from "./GuessModal";

function GameRoom() {
    // -----
    // were currently using ref here becuase of react strict mode
    // which will call useEffect twice
    // and therefore will send join room to server twice
    // -----
    const hasJoinedRef = useRef(false);
    const { user } = useUser();
    const { roomId } = useParams();

    const { gameState, loading, isKeeper, setKeeperWord, isWordChosen, logMessage, clues, cluetact, setCluetact, handleClueClick, handleGuessSubmit, activeClue, setActiveClue } = useGameRoomSocket(
        roomId,
        hasJoinedRef
    );

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
        <>
            <div className={styles.room}>
                <div className={styles.wordDisplay}>
                    <WordDisplay isKeeper={isKeeper} revealedWord={gameState.revealedWord} word={gameState.keeperWord} length={gameState.wordLength} />
                </div>

                {cluetact && <CluetactPopup guesser={cluetact.guesser} word={cluetact.word} onClose={() => setCluetact(null)} />}

                {isKeeper && !isWordChosen && <KeeperWordPopup keeperWord={gameState.keeperWord} setKeeperWord={setKeeperWord} logMessage={logMessage} />}

                <div className={styles.table}>
                    {gameState.players.map((player) => (
                        <PlayerCard key={player.username} player={player} me={player.username === user.username} onClick={() => handlePlayerCardClick(player)} />
                    ))}
                </div>

                <div className={styles.cluesSection}>
                    {!isKeeper && <SeekerClueSection clues={clues} onGuess={handleClueClick} />}
                    {activeClue && <GuessModal clue={activeClue} onSubmit={handleGuessSubmit} onCancel={() => setActiveClue(null)} />}

                    {isKeeper && <KeeperClueList clues={clues} />}
                </div>

                {!isKeeper && isWordChosen && <SubmitClue revealedPrefix={gameState.revealedWord} />}

                {selectedPlayer && <ProfileModal player={selectedPlayer} onClose={closeProfileModal} />}
            </div>
            {!isKeeper && !isWordChosen && (
                <div className={styles.waitOverlay}>
                    <div className={styles.waitMessage}>Waiting for the keeper to choose a word...</div>
                </div>
            )}
        </>
    );
}

export default GameRoom;
