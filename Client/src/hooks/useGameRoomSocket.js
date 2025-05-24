import { useEffect, useState } from "react";
import socket from "../services/socket";
import { useUser } from "../contexts/UserContext";
import SOCKET_EVENTS from "@shared/socketEvents.json";

export default function useGameRoomSocket(roomId, hasJoinedRef, setNotification) {
    const { user } = useUser();

    const [loading, setLoading] = useState(true);
    const [activeClue, setActiveClue] = useState(null);

    const [gameState, setGameState] = useState({
        players: [],
        revealedWord: "",
        keeperWord: "",
        wordLength: 0,
        isKeeper: false,
        isWordChosen: false,
        logMessage: "",
        clues: [],
        cluetact: null,
        winners: [],
    });

    const setKeeperWord = (word) => {
        setGameState((prev) => ({
            ...prev,
            keeperWord: word,
        }));
    };

    const setCluetact = (data) => {
        setGameState((prev) => ({
            ...prev,
            cluetact: data,
        }));
    };

    const handleClueClick = (clue) => {
        setActiveClue(clue);
    };

    const handleGuessSubmit = (guess, clue) => {
        socket.emit(SOCKET_EVENTS.CLIENT_TRY_CLUETACT, { guess, clueId: clue.id });
        setActiveClue(null);
    };

    const handleNextRound = () => {
        // TODO: emit socket event to start next round
    };

    const handleExitGame = () => {
        socket.emit(SOCKET_EVENTS.CLIENT_EXIT_ROOM, { roomId });
    };

    useEffect(() => {
        socket.on(SOCKET_EVENTS.SERVER_CLUETACT_SUCCESS, ({ guesser, clues, word, revealed, isWordComplete, keeper, players, winners }) => {
            if (isWordComplete) {
                setGameState((prev) => ({
                    ...prev,
                    winners,
                    players,
                    cluetact: { guesser, word },
                    clues,
                    revealedWord: "",
                    keeperWord: "",
                    wordLength: 0,
                    isKeeper: keeper === user.username,
                    isWordChosen: false,
                }));
            } else {
                setGameState((prev) => ({
                    ...prev,
                    cluetact: { guesser, word },
                    players,
                    clues,
                    revealedWord: revealed,
                }));
            }
        });

        return () => socket.off(SOCKET_EVENTS.CLUETACT_SUCCESS);
    }, []);

    useEffect(() => {
        socket.on(SOCKET_EVENTS.SERVER_CLUE_REVEALED, (clues) => {
            setGameState((prev) => ({
                ...prev,
                clues,
            }));
            setNotification(`new clue definition by ${clues[clues.length - 1].from}: "${clues[clues.length - 1].definition}"`);
        });

        socket.on(SOCKET_EVENTS.SERVER_CLUE_BLOCKED, ({ word, from, definition }) => {
            setGameState((prev) => ({
                ...prev,
                clues: prev.clues.map((clue) => (clue.definition === definition && clue.from === from ? { ...clue, blocked: true, word } : clue)),
            }));
        });

        socket.on(SOCKET_EVENTS.SERVER_NEW_CLUE_TO_BLOCK, ({ from, definition }) => {
            setGameState((prev) => ({
                ...prev,
                logMessage: `A clue was submitted by ${from}. You may block it.`,
                clues: [...prev.clues, { from, definition, blocked: false }],
            }));
        });

        return () => {
            socket.off(SOCKET_EVENTS.SERVER_CLUE_REVEALED);
            socket.off(SOCKET_EVENTS.SERVER_CLUE_BLOCKED);
            socket.off(SOCKET_EVENTS.SERVER_NEW_CLUE_TO_BLOCK);
        };
    }, []);

    useEffect(() => {
        const tryJoinRoom = () => {
            if (socket.connected && user?.username) {
                console.log("✅ Socket ready, emitting JOIN_ROOM");
                socket.emit(SOCKET_EVENTS.CLIENT_JOIN_ROOM, { roomId });
            } else {
                console.log("⏳ Waiting for socket/user to be ready...");
                setTimeout(tryJoinRoom, 100);
            }
        };

        tryJoinRoom();

        socket.on(SOCKET_EVENTS.SERVER_GAME_JOIN, (data) => {
            setGameState((prev) => ({
                ...prev,
                players: data.players,
                keeperWord: data.keeperWord,
                revealedWord: data.revealedWord,
                wordLength: data.wordLength,
                clues: data.clues,
                isKeeper: data.isKeeper,
                isWordChosen: data.isWordChosen,
            }));
            setLoading(false);
        });

        socket.on(SOCKET_EVENTS.SERVER_KEEPER_WORD_CHOSEN, (data) => {
            if (data.success) {
                setGameState((prev) => ({
                    ...prev,
                    wordLength: data.length,
                    revealedWord: data.revealedWord,
                    keeperWord: data.word,
                    isWordChosen: true,
                    logMessage: "",
                }));
            }
        });

        return () => {
            socket.off(SOCKET_EVENTS.SERVER_ROUND_START);
            socket.off(SOCKET_EVENTS.SERVER_GAME_JOIN);
            socket.off(SOCKET_EVENTS.SERVER_KEEPER_WORD_CHOSEN);
        };
    }, [roomId, user?.username]);

    return {
        gameState,
        setKeeperWord,
        loading,
        isKeeper: gameState.isKeeper,
        isWordChosen: gameState.isWordChosen,
        logMessage: gameState.logMessage,
        clues: gameState.clues,
        cluetact: gameState.cluetact,
        setCluetact,
        handleClueClick,
        handleGuessSubmit,
        handleNextRound,
        handleExitGame,
        activeClue,
        setActiveClue,
    };
}
