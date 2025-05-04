import { useEffect, useState } from "react";
import socket from "../socket";

export default function useGameRoomSocket(roomId, hasJoinedRef) {
    const [players, setPlayers] = useState();
    const [loading, setLoading] = useState(true);
    const [isKeeper, setIsKeeper] = useState(false);
    const [keeperWord, setKeeperWord] = useState("");
    const [isWordChosen, setIsWordChosen] = useState(false);
    const [logMessage, setLogMessage] = useState("");
    const [clues, setClues] = useState([]);
    const [cluetact, setCluetact] = useState(null);
    const [word, setWord] = useState({
        revealedWord: "",
        wordLength: 0,
        word: "",
    });

    const handleGuess = (clue) => {
        const guess = prompt(`What word do you think "${clue.definition}" is referring to?`);
        if (guess && guess.trim()) {
            socket.emit("submit_guess", { guess, clueId: clue.id });
        }
    };

    const hasUnblockedClues = clues.some((clue) => !clue.blocked);

    useEffect(() => {
        socket.on("cluetact_success", ({ guesser, word, revealed }) => {
            setCluetact({ guesser, word });
            setWord((prev) => ({ ...prev, revealedWord: revealed }));
        });

        return () => socket.off("cluetact_success");
    }, []);

    useEffect(() => {
        socket.on("clue_revealed", ({ id, definition, from }) => {
            setClues((prev) => [...prev, { id, from, definition, blocked: false }]);
        });

        socket.on("clue_blocked", ({ word, from, definition, blockedBy }) => {
            setClues((prev) => prev.map((clue) => (clue.definition === definition && clue.from === from ? { ...clue, blocked: true } : clue)));
        });

        socket.on("clue_submitted", ({ from, definition }) => {
            setLogMessage(`A clue was submitted by ${from}. You may block it.`);
            setClues((prev) => [...prev, { from, definition, blocked: false }]);
        });

        return () => {
            socket.off("clue_revealed");
            socket.off("clue_blocked");
            socket.off("clue_submitted");
        };
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
            setLogMessage(data.message || "");
        });

        socket.on("keeper_word_chosen", (data) => {
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
            socket.off("game_start");
            socket.off("request_keeper_word");
            socket.off("keeper_word_chosen");
        };
    }, [roomId]);

    return {
        players,
        loading,
        isKeeper,
        keeperWord,
        setKeeperWord,
        isWordChosen,
        logMessage,
        clues,
        cluetact,
        setCluetact,
        word,
        hasUnblockedClues,
        handleGuess,
    };
}
