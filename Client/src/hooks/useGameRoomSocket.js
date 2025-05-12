import { useEffect, useState } from "react";
import socket from "../socket";
import { useUser } from "../components/UserContext";
import SOCKET_EVENTS from "@shared/socketEvents.json";

export default function useGameRoomSocket(roomId, hasJoinedRef) {
    const { user } = useUser();

    const [gameState, setGameState] = useState({
        players: [],
        revealedWord: "",
        keeperWord: "",
        wordLength: 0,
    });

    const [loading, setLoading] = useState(true);
    const [isKeeper, setIsKeeper] = useState(false);
    const [isWordChosen, setIsWordChosen] = useState(false);
    const [logMessage, setLogMessage] = useState("");
    const [clues, setClues] = useState([]);
    const [cluetact, setCluetact] = useState(null);
    const [activeClue, setActiveClue] = useState(null);

    const handleClueClick = (clue) => {
        setActiveClue(clue);
    };

    const handleGuessSubmit = (guess, clue) => {
        socket.emit(SOCKET_EVENTS.TRY_CLUETACT, { guess, clueId: clue.id });
        setActiveClue(null);
    };

    const setKeeperWord = (word) => {
        setGameState((prev) => ({
            ...prev,
            keeperWord: word,
        }));
    };

    useEffect(() => {
        socket.on(SOCKET_EVENTS.CLUETACT_SUCCESS, ({ guesser, clues, word, revealed, isWordComplete, keeper, players }) => {
            setCluetact({ guesser, word });
            setClues(clues);

            if (isWordComplete) {
                setIsWordChosen(false);
                setIsKeeper(keeper === user.username);
                setGameState((prev) => ({
                    ...prev,
                    players,
                    revealedWord: "",
                    keeperWord: "",
                    wordLength: 0,
                }));
            } else {
                setGameState((prev) => ({
                    ...prev,
                    revealedWord: revealed,
                }));
            }
        });

        return () => socket.off(SOCKET_EVENTS.CLUETACT_SUCCESS);
    }, []);

    useEffect(() => {
        socket.on(SOCKET_EVENTS.CLUE_REVEALED, (clues) => {
            setClues(clues);
        });

        socket.on(SOCKET_EVENTS.CLUE_BLOCKED, ({ word, from, definition, blockedBy }) => {
            console.log("Clue being updated:", { definition, from, word });
            setClues((prev) => prev.map((clue) => (clue.definition === definition && clue.from === from ? { ...clue, blocked: true, word } : clue)));
        });

        socket.on(SOCKET_EVENTS.NEW_CLUE_TO_BLOCK, ({ from, definition }) => {
            setLogMessage(`A clue was submitted by ${from}. You may block it.`);
            setClues((prev) => [...prev, { from, definition, blocked: false }]);
        });

        return () => {
            socket.off(SOCKET_EVENTS.CLUE_REVEALED);
            socket.off(SOCKET_EVENTS.CLUE_BLOCKED);
            socket.off(SOCKET_EVENTS.NEW_CLUE_TO_BLOCK);
        };
    }, []);

    useEffect(() => {
        if (!hasJoinedRef.current) {
            console.log("trying to let the server know i am joining the room...");
            socket.emit(SOCKET_EVENTS.JOIN_ROOM, { roomId });
            hasJoinedRef.current = true;
        }

        socket.on(SOCKET_EVENTS.ROUND_START, (data) => {
            setLoading(false);
            setGameState((prev) => ({
                ...prev,
                players: data.players,
            }));
            console.log("players are: ", data.players);
            const currentPlayer = data.players.find((p) => p.username === user.username);
            setIsKeeper(currentPlayer?.role === "keeper");
            setIsWordChosen(false);
        });

        socket.on(SOCKET_EVENTS.GAME_JOIN, (data) => {
            setLoading(false);
            setGameState((prev) => ({
                ...prev,
                players: data.players,
            }));
            console.log("players are: ", data.players);
            const currentPlayer = data.players.find((p) => p.username === user.username);
            setIsKeeper(currentPlayer?.role === "keeper");
            setIsWordChosen(true);
        });

        socket.on(SOCKET_EVENTS.KEEPER_WORD_CHOSEN, (data) => {
            if (data.success) {
                setIsWordChosen(true);

                setGameState((prev) => ({
                    ...prev,
                    wordLength: data.length,
                    revealedWord: data.revealedWord,
                    keeperWord: data.word, // assuming this is the keeper's actual word
                }));

                setLogMessage("");
            }
        });

        return () => {
            socket.off(SOCKET_EVENTS.ROUND_START);
            socket.off(SOCKET_EVENTS.GAME_JOIN);
            socket.off(SOCKET_EVENTS.REQUEST_KEEPER_WORD);
            socket.off(SOCKET_EVENTS.KEEPER_WORD_CHOSEN);
        };
    }, [roomId]);

    return {
        gameState,
        setKeeperWord,
        loading,
        isKeeper,
        isWordChosen,
        logMessage,
        clues,
        cluetact,
        setCluetact,
        handleClueClick,
        handleGuessSubmit,
        activeClue,
        setActiveClue,
    };
}
