import { useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useUser } from "../UserContext";
import WordDisplay from "./WordDisplay";
import PlayerCard from "./PlayerCard";
import Spinner from "../Routes/Spinner";
import styles from "./GameRoom.module.css";
import KeeperWordPopup from "./KeeperWordPopup";
import SubmitClue from "./SubmitClue";
import ClueBubble from "./ClueBubble";
import KeeperClueList from "./KeeperClueList";
import CluetactPopup from "./CluetactPopup";
import ProfileModal from "./ProfileModal";
import useGameRoomSocket from "../../hooks/useGameRoomSocket";

function GameRoom() {
    // -----
    // were currently using ref here becuase of react strict mode
    // which will call useEffect twice
    // and therefore will send join room to server twice
    // -----
    const hasJoinedRef = useRef(false);
    const { user } = useUser();
    const { roomId } = useParams();

    const { players, loading, isKeeper, keeperWord, setKeeperWord, isWordChosen, logMessage, clues, cluetact, setCluetact, word, handleGuess } = useGameRoomSocket(roomId, hasJoinedRef);

    const [selectedPlayer, setSelectedPlayer] = useState(null);

    if (loading) return <Spinner />;

    const handlePlayerCardClick = (player) => {
        // should open a small modal profile in future.
        const userData = players.find((p) => p.username === player.username);
        setSelectedPlayer(userData);
    };

    const closeProfileModal = () => {
        setSelectedPlayer(null);
    };

    return (
        <div className={styles.room}>
            <div className={styles.wordDisplay}>
                <WordDisplay isKeeper={isKeeper} revealedWord={word.revealedWord} word={word.word} length={word.wordLength} />
            </div>

            {cluetact && <CluetactPopup guesser={cluetact.guesser} word={cluetact.word} onClose={() => setCluetact(null)} />}

            {isKeeper && !isWordChosen && <KeeperWordPopup keeperWord={keeperWord} setKeeperWord={setKeeperWord} logMessage={logMessage} />}

            <div className={styles.table}>
                {players.map((player) => (
                    <PlayerCard key={player.username} player={player} me={player.username === user.username} onClick={() => handlePlayerCardClick(player)} />
                ))}
            </div>

            <div className={styles.cluesSection}>
                {!isKeeper && clues.map((clue) => <ClueBubble key={clue.id} id={clue.id} from={clue.from} definition={clue.definition} blocked={clue.blocked} onGuess={() => handleGuess(clue)} />)}
                {isKeeper && <KeeperClueList clues={clues} />}
            </div>

            {!isKeeper && isWordChosen && <SubmitClue revealedPrefix={word.revealedWord} />}

            {selectedPlayer && <ProfileModal player={selectedPlayer} onClose={closeProfileModal} />}
        </div>
    );
}

export default GameRoom;
