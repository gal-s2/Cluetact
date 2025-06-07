import { useEffect, useState } from "react";
import socket from "../services/socket";
import { useUser } from "../contexts/UserContext";
import SOCKET_EVENTS from "@shared/socketEvents.json";

export default function useGameRoomSocket(roomId, hasJoinedRef) {
    const { user } = useUser();
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({ message: "", type: "notification" });
    const [gameState, setGameState] = useState({
        players: [],
        revealedWord: "",
        keeperWord: "",
        wordLength: 0,
        isKeeper: false,
        isSubmittingClue: false,
        isWordChosen: false,
        logMessage: "",
        clues: [],
        guesses: [],
        cluetact: null,
        winners: [],
        activeClue: null,
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

    const handleGuessSubmit = (guess) => {
        const clue = gameState.activeClue;
        socket.emit(SOCKET_EVENTS.CLIENT_TRY_CLUETACT, { guess, clueId: clue.id });
        setGameState((prev) => ({
            ...prev,
            activeClue: null,
        }));
    };

    const handleNextRound = () => {
        // TODO: emit socket event to start next round
    };

    const handleExitGame = () => {
        socket.emit(SOCKET_EVENTS.CLIENT_EXIT_ROOM, { roomId });
    };

    useEffect(() => {
        socket.on(SOCKET_EVENTS.SERVER_CLUETACT_SUCCESS, ({ guesser, clues, word, revealed, isWordComplete, keeper, players, winners, clueGiverUsername }) => {
            setGameState((prev) => ({
                ...prev,
                cluetact: { guesser, word },
                players,
                clues,
                isSubmittingClue: clueGiverUsername === user.username,
                activeClue: null,
            }));
            if (isWordComplete) {
                setGameState((prev) => ({
                    ...prev,
                    winners,
                    revealedWord: "",
                    keeperWord: "",
                    wordLength: 0,
                    isKeeper: keeper === user.username,
                    isWordChosen: false,
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
        socket.on(SOCKET_EVENTS.SERVER_CLUE_REVEALED, (clues) => {
            setGameState((prev) => ({
                ...prev,
                clues,
                activeClue: clues[clues.length - 1] || null,
            }));
            const definition = clues[clues.length - 1].definition;
            const from = clues[clues.length - 1].from;
            if (from !== user.username) setNotification({ message: `new clue definition by ${clues[clues.length - 1].from}: "${clues[clues.length - 1].definition}"`, type: "notification" });
        });

        socket.on(SOCKET_EVENTS.SERVER_CLUE_BLOCKED, ({ word, from, definition, clueGiverUsername }) => {
            setGameState((prev) => ({
                ...prev,
                clues: prev.clues.map((clue) => (clue.definition === definition && clue.from === from ? { ...clue, blocked: true, active: false, word } : clue)),
                isSubmittingClue: clueGiverUsername === user.username,
                activeClue: null,
            }));
            if (!gameState.isKeeper) setNotification({ message: `The keeper blocked "${from}" by guessing the word "${word}"`, type: "notification" });
        });

        socket.on(SOCKET_EVENTS.SERVER_ERROR_MESSAGE, (message) => {
            setNotification({ message, type: "error" });
        });

        socket.on(SOCKET_EVENTS.SERVER_NEW_CLUE_TO_BLOCK, ({ from, definition }) => {
            setGameState((prev) => ({
                ...prev,
                logMessage: `A clue was submitted by ${from}. You may block it.`,
                clues: [...prev.clues, { from, definition, blocked: false }],
            }));
            setNotification({ message: `new clue definition by ${from}: "${definition}"`, type: "notification" });
        });

        socket.on(SOCKET_EVENTS.SERVER_GUESS_FAILED, (guesses) => {
            setGameState((prev) => ({
                ...prev,
                guesses: guesses,
            }));
        });

        return () => {
            socket.off(SOCKET_EVENTS.SERVER_CLUE_REVEALED);
            socket.off(SOCKET_EVENTS.SERVER_CLUE_BLOCKED);
            socket.off(SOCKET_EVENTS.SERVER_NEW_CLUE_TO_BLOCK);
            socket.off(SOCKET_EVENTS.SERVER_ERROR_MESSAGE);
            socket.off(SOCKET_EVENTS.SERVER_GUESS_FAILED);
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
                activeClue: data.clues[data.clues.length - 1] || null,
                isKeeper: data.isKeeper,
                isWordChosen: data.isWordChosen,
                guesses: data.guesses,
                isSubmittingClue: data.isSubmittingClue,
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
                    isSubmittingClue: data.isSubmittingClue,
                }));
            } else setNotification({ message: "The word you entered is invalid. Please enter a valid English word.", type: "error" });
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
        setCluetact,
        handleGuessSubmit,
        handleNextRound,
        handleExitGame,
        notification,
        setNotification,
    };
}
