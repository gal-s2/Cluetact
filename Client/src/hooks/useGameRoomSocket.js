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
        clueGiverUsername: null,
        isWordChosen: false,
        logMessage: "",
        clues: [],
        guesses: [],
        cluetact: null,
        winners: [],
        activeClue: null,
        isWordComplete: false,
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
            if (isWordComplete) {
                setGameState((prev) => ({
                    ...prev,
                    winners,
                    isKeeper: keeper === user.username,
                    isWordChosen: false,
                }));
            }
            setGameState((prev) => ({
                ...prev,
                cluetact: { guesser, word },
                players,
                clues,
                isSubmittingClue: clueGiverUsername === user.username,
                clueGiverUsername,
                activeClue: null,
                revealedWord: revealed,
                isWordComplete,
            }));
        });

        return () => socket.off(SOCKET_EVENTS.CLUETACT_SUCCESS);
    }, [gameState]);

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

        socket.on(SOCKET_EVENTS.SERVER_CLUE_BLOCKED, ({ clue, clueGiverUsername }) => {
            setGameState((prev) => ({
                ...prev,
                clues: prev.clues.map((prevClues) => ({ ...prevClues, clue })),
                isSubmittingClue: clueGiverUsername === user.username,
                clueGiverUsername,
                activeClue: null,
            }));
            console.log("I received a clue blocked event, am I a keeper?", gameState.isKeeper);
            if (!gameState.isKeeper) setNotification({ message: `The keeper blocked "${clue.from}" by guessing the word "${clue.word}"`, type: "notification" });
            else setNotification({ message: `You blocked "${clue.from}" by guessing the word "${clue.word}"`, type: "success" });
        });

        socket.on(SOCKET_EVENTS.SERVER_ERROR_MESSAGE, (message) => {
            setNotification({ message, type: "error" });
        });

        socket.on(SOCKET_EVENTS.SERVER_NEW_CLUE_TO_BLOCK, (clues) => {
            const clue = clues[clues.length - 1];
            setGameState((prev) => ({
                ...prev,
                logMessage: `A clue was submitted by ${clue.from}. You may block it.`,
                clues: clues,
                activeClue: clue,
            }));
            setNotification({ message: `new clue definition by ${clue.from}: "${clue.definition}"`, type: "notification" });
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
    }, [gameState]);

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
                activeClue: data.clues[data.clues.length - 1]?.active || null,
                isKeeper: data.isKeeper,
                isWordChosen: data.isWordChosen,
                guesses: data.guesses,
                isSubmittingClue: data.clueGiverUsername === user?.username,
                clueGiverUsername: data.clueGiverUsername,
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
                    isSubmittingClue: data.clueGiverUsername === user?.username,
                    clueGiverUsername: data.clueGiverUsername,
                    isWordComplete: false,
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
