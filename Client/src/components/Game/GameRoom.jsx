import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import socket from "../../socket";
import WordDisplay from "./WordDisplay";
import PlayerCard from "./PlayerCard";
import Spinner from "../Routes/Spinner";
import styles from "./GameRoom.module.css";
import KeeperWordPopup from "./KeeperWordPopup";
import SubmitClue from "./SubmitClue";
import ClueBubble from "./ClueBubble";
import KeeperClueList from "./KeeperClueList";
import CluetactPopup from "./CluetactPopup";

function GameRoom() {
    // -----
    // were currently using ref here becuase of react strict mode
    // which will call useEffect twice
    // and therefore will send join room to server twice
    // -----
    const hasJoinedRef = useRef(false);

    const { roomId } = useParams();

    const [players, setPlayers] = useState();
    const [loading, setLoading] = useState(true);
    const [isKeeper, setIsKeeper] = useState(false);
    const [keeperWord, setKeeperWord] = useState("");
    const [isWordChosen, setIsWordChosen] = useState(false);
    const [logMessage, setLogMessage] = useState("");
    const [clues, setClues] = useState([]);
    const [cluetact, setCluetact] = useState(null);
    const hasUnblockedClues = clues.some((clue) => !clue.blocked);

    const handleGuess = (clue) => {
        const guess = prompt(
            `What word do you think "${clue.definition}" is referring to?`
        );

        if (guess && guess.trim()) {
            socket.emit("submit_guess", { guess, clueId: clue.id });
        }
    };

    // state for word data
    const [word, setWord] = useState({
        revealedWord: "",
        wordLength: 0,
        word: "",
    });

    useEffect(() => {
        socket.on("cluetact_success", ({ guesser, word, revealed }) => {
            setCluetact({ guesser, word });

            // Optionally update word state (revealedLetters)
            setWord((prev) => ({
                ...prev,
                revealedWord: revealed, // if server sends new revealed part
            }));
        });

        return () => socket.off("cluetact_success");
    }, []);

    useEffect(() => {
        socket.on("clue_revealed", ({ id, definition, from }) => {
            setClues((prev) => [
                ...prev,
                { id, from, definition, blocked: false },
            ]);
            console.log(`New clue from ${from}: ${definition}`);
        });

        return () => socket.off("clue_revealed");
    }, []);

    useEffect(() => {
        socket.on("clue_blocked", ({ word, from, definition, blockedBy }) => {
            setClues((prev) =>
                prev.map((clue) =>
                    clue.definition === definition && clue.from === from
                        ? { ...clue, blocked: true }
                        : clue
                )
            );
            console.log(`Clue blocked: "${word}" from ${from} by ${blockedBy}`);
        });

        return () => socket.off("clue_blocked");
    }, []);

    useEffect(() => {
        socket.on("clue_submitted", ({ from, definition }) => {
            setLogMessage(`A clue was submitted by ${from}. You may block it.`);
            setClues((prev) => [...prev, { from, definition, blocked: false }]);
            console.log(`Keeper alert: clue submitted by ${from}`);
        });

        return () => socket.off("clue_submitted");
    }, []);

    useEffect(() => {
        if (!hasJoinedRef.current) {
            socket.emit("join_room", { roomId });
            hasJoinedRef.current = true;
        }

        socket.on("game_start", (data) => {
            setLoading(false);
            setPlayers(data.room.players);
        });

        socket.on("request_keeper_word", (data) => {
            setIsKeeper(data.isKeeper);
            setIsWordChosen(false);
            console.log("isKeeper value is ", data.isKeeper);
            setLogMessage(data.message || "");
        });

        socket.on("keeper_word_chosen", (data) => {
            setLogMessage(data.message);

            if (data.success) {
                setIsWordChosen(true);
                setKeeperWord("");

                setWord((prev) => ({
                    ...prev,
                    wordLength: data.length,
                    revealedWord: data.revealedWord,
                    word: data.word,
                }));
                setLogMessage("");
            }
        });

        return () => {
            console.log("Cleaning up game_start listener");

            // every function that we want to run only ONCE - has to be added below
            socket.off("game_start");
            socket.off("request_keeper_word");
            socket.off("keeper_word_chosen");
        };
    }, [roomId]);

    if (loading) return <Spinner />;

    return (
        <div className={styles.room}>
            <div className={styles.wordDisplay}>
                <WordDisplay
                    isKeeper={isKeeper}
                    revealedWord={word.revealedWord}
                    word={word.word}
                    length={word.wordLength}
                />
            </div>

            {cluetact && (
                <CluetactPopup
                    guesser={cluetact.guesser}
                    word={cluetact.word}
                    onClose={() => setCluetact(null)}
                />
            )}

            {isKeeper && !isWordChosen && (
                <KeeperWordPopup
                    keeperWord={keeperWord}
                    setKeeperWord={setKeeperWord}
                    logMessage={logMessage}
                />
            )}

            <div className={styles.table}>
                {Object.values(players).map((player, index) => (
                    <PlayerCard
                        key={player.username}
                        player={player}
                        position={index}
                    />
                ))}
            </div>

            <div className={styles.cluesSection}>
                {!isKeeper &&
                    clues.map((clue) => (
                        <ClueBubble
                            key={clue.id}
                            id={clue.id}
                            from={clue.from}
                            definition={clue.definition}
                            blocked={clue.blocked}
                            onGuess={() => handleGuess(clue)}
                        />
                    ))}

                {isKeeper && <KeeperClueList clues={clues} />}
            </div>

            {!isKeeper && isWordChosen && (
                <SubmitClue revealedPrefix={word.revealedWord} />
            )}
        </div>
    );
}

export default GameRoom;
