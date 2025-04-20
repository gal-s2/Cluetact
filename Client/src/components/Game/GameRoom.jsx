import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import socket from "../../socket";
import WordDisplay from "./WordDisplay";
import Table from "./Table";
import PlayerCard from "./PlayerCard";
import Spinner from "../Routes/Spinner";

import styles from "./GameRoom.module.css";
import KeeperWordPopup from "./KeeperWordPopup";

function GameRoom() {
  const { roomId } = useParams();

  const [players, setPlayers] = useState();
  const [loading, setLoading] = useState(true);
  const [isKeeper, setIsKeeper] = useState(false);
  const [keeperWord, setKeeperWord] = useState("");
  const [logMessage, setLogMessage] = useState("");

<<<<<<< Updated upstream
    // Word data for word component
    const [revealedWord, setRevealedWord] = useState("");
    const [wordLength, setWordLength] = useState(0);

    // were currently using ref here becuase of react strict mode
    // which will call useEffect twice
    // and therefore will send join room to server twice
    const hasJoinedRef = useRef(false);
=======
  // were currently using ref here becuase of react strict mode
  // which will call useEffect twice
  // and therefore will send join room to server twice
  const hasJoinedRef = useRef(false);
>>>>>>> Stashed changes

  useEffect(() => {
    if (!hasJoinedRef.current) {
      socket.emit("join_room", { roomId });
      hasJoinedRef.current = true;
    }

    socket.on("game_start", (data) => {
      setLoading(false);
      console.log("data", data.room);
      setPlayers(data.room.players);
    });

    socket.on("request_keeper_word", (data) => {
      setIsKeeper(data.isKeeper);
      setLogMessage(data.message || "");
    });

<<<<<<< Updated upstream
        socket.on("keeper_word_chosen", (data) => {
            setLogMessage(data.message);

            if (data.success) {
                setIsKeeper(false);
                setKeeperWord("");
                setWordLength(data.length);
                setLogMessage("");
            }
        });

        return () => {
            console.log("Cleaning up game_start listener");
            //every function that we want to run only ONCE - has to be added below
            socket.off("game_start");
            socket.off("request_keeper_word");
            socket.off("keeper_word_chosen");
        };
    }, [roomId]);
=======
    socket.on("log_message", (data) => {
      console.log("log_message", data);
      setLogMessage(data.message);

      if (data.success) {
        setIsKeeper(false);
        setKeeperWord("");
        setLogMessage("");
      }
    });

    return () => {
      console.log("Cleaning up game_start listener");
      //every function that we want to run only ONCE - has to be added below
      socket.off("game_start");
      socket.off("request_keeper_word");
      socket.off("log_message");
    };
  }, [roomId]);
>>>>>>> Stashed changes

  if (loading) return <Spinner />;

<<<<<<< Updated upstream
    return (
        <div className={styles.room}>
            <div className={styles.wordDisplay}>
                <WordDisplay word={revealedWord} length={wordLength} />
            </div>
=======
  return (
    <div className={styles.room}>
      <div className={styles.wordDisplay}>
        <WordDisplay word={""} length={0} />
      </div>
>>>>>>> Stashed changes

      {isKeeper && (
        <KeeperWordPopup
          keeperWord={keeperWord}
          setKeeperWord={setKeeperWord}
          logMessage={logMessage}
        />
      )}

      <div className={styles.table}>
        {Object.values(players).map((player, index) => (
          <PlayerCard key={player.username} player={player} position={index} />
        ))}
      </div>
    </div>
  );
}

export default GameRoom;
