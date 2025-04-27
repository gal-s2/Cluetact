import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import socket from "../../socket";
import WordDisplay from "./WordDisplay";
import PlayerCard from "./PlayerCard";
import Spinner from "../Routes/Spinner";

import styles from "./GameRoom.module.css";
import KeeperWordPopup from "./KeeperWordPopup";

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
    const [logMessage, setLogMessage] = useState("");

    // state for word data
    const [word, setWord] = useState({
        revealedWord: "",
        wordLength: 0,
        word: "",
    });

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
            setLogMessage(data.message || "");
        });

        socket.on("keeper_word_chosen", (data) => {
            setLogMessage(data.message);

            if (data.success) {
                setIsKeeper(false);
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
                    isKeeper={true}
                    revealedWord={word.revealedWord}
                    word={word.word}
                    length={word.wordLength}
                />
            </div>

            {isKeeper && (
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
        </div>
    );
}

export default GameRoom;
