import { useEffect, useRef, useState } from "react";
import socket from "@services/socket";
import { useUser } from "@contexts/UserContext";
import SOCKET_EVENTS from "@shared/socketEvents.json";

export default function useGameRoomSocket(roomId) {
    const { user } = useUser();
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({
        message: "",
        type: "notification",
    });
    const [timeLeft, setTimeLeft] = useState(0);
    const [isKeeperWordRejected, setIsKeeperWordRejected] = useState(false);

    const [gameState, setGameState] = useState({
        players: [],
        status: "",
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
        keeperTime: 0,
    });

    // Creating a ref for gameState, making sure it getting updated in every state update
    const gameStateRef = useRef(gameState);
    useEffect(() => {
        gameStateRef.current = gameState;
    }, [gameState]);

    const setKeeperWord = (word) => {
        setGameState((prev) => ({ ...prev, keeperWord: word }));
    };

    const setCluetact = (data) => {
        setGameState((prev) => ({ ...prev, cluetact: data }));
    };

    const handleGuessSubmit = (guess) => {
        const clue = gameState.activeClue;
        socket.emit(SOCKET_EVENTS.CLIENT_TRY_CLUETACT, {
            guess,
            clueId: clue.id,
        });
    };

    const handleExitGame = () => {
        socket.emit(SOCKET_EVENTS.CLIENT_EXIT_ROOM, { roomId });
    };

    useEffect(() => {
        socket.on(SOCKET_EVENTS.SERVER_GAME_JOIN, (data) => {
            setGameState((prev) => ({
                ...prev,
                players: data.players,
                status: data.status,
                keeperWord: data.keeperWord,
                revealedWord: data.revealedWord,
                wordLength: data.wordLength,
                clues: data.clues,
                activeClue: data.clues[data.clues.length - 1]?.active,
                isKeeper: data.isKeeper,
                isWordChosen: data.isWordChosen,
                guesses: data.guesses,
                isSubmittingClue: data.clueGiverUsername === user?.username,
                clueGiverUsername: data.clueGiverUsername,
                keeperTime: data.keeperTime,
            }));
            setLoading(false);
        });

        socket.on(SOCKET_EVENTS.SERVER_KEEPER_WORD_CHOSEN, (data) => {
            if (data.success) {
                setIsKeeperWordRejected(false);
                setGameState((prev) => ({
                    ...prev,
                    status: data.status,
                    wordLength: data.length,
                    revealedWord: data.revealedWord,
                    keeperWord: data.word,
                    isWordChosen: true,
                    logMessage: "",
                    isSubmittingClue: data.clueGiverUsername === user?.username,
                    clueGiverUsername: data.clueGiverUsername,
                    isWordComplete: false,
                }));
                setTimeLeft(data.timeLeft);
            } else {
                setIsKeeperWordRejected(true);
                setNotification({ message: data.message, type: "error" });
            }
        });

        socket.on(SOCKET_EVENTS.SERVER_CLUETACT_SUCCESS, (data) => {
            if (data.isWordComplete) {
                setGameState((prev) => ({
                    ...prev,
                    winners: data.winners,
                    isKeeper: data.keeper === user.username,
                    isWordChosen: false,
                }));
            }
            setGameState((prev) => ({
                ...prev,
                cluetact: { guesser: data.guesser, word: data.word },
                players: data.players,
                clues: data.clues,
                isSubmittingClue: data.clueGiverUsername === user.username,
                clueGiverUsername: data.clueGiverUsername,
                activeClue: null,
                revealedWord: data.revealed,
                isWordComplete: data.isWordComplete,
                guesses: [],
                keeperWord: data.keeperWord,
            }));
            setTimeLeft(data.timeLeft);
            if (data.status === "END") {
                setTimeout(() => {
                    setGameState((prev) => ({
                        ...prev,
                        status: data.status,
                    }));
                }, 5000); // <-- delay belongs here
            } else {
                setGameState((prev) => ({
                    ...prev,
                    status: data.status,
                }));
            }
        });

        socket.on(SOCKET_EVENTS.SERVER_RACE_TIMEOUT, (data) => {
            setGameState((prev) => ({
                ...prev,
                status: data.status,
                players: data.players,
                clues: data.clues,
                isSubmittingClue: data.clueGiverUsername === user.username,
                clueGiverUsername: data.clueGiverUsername,
                activeClue: null,
                revealedWord: data.revealed,
                isWordComplete: data.isWordComplete,
                guesses: [],
                keeperWord: data.keeperWord,
            }));
            setTimeLeft(data.timeLeft);
            setNotification({
                message: `guesser failed to guess ${data.prevClueGiverUsername}'s clue, turn moves to ${data.clueGiverUsername}`,
                type: "notification",
            });
        });

        socket.on(SOCKET_EVENTS.SERVER_CLUE_SUBMISSION_TIMEOUT, (data) => {
            setGameState((prev) => ({
                ...prev,
                players: data.players,
                status: data.status,
                clueGiverUsername: data.clueGiverUsername,
                isSubmittingClue: data.clueGiverUsername === user.username,
                activeClue: null,
            }));
            setTimeLeft(data.timeLeft);
            setNotification({
                message: "Clue submission time is over! Moving to the next seeker",
                type: "notification",
            });
        });

        socket.on(SOCKET_EVENTS.SERVER_CLUE_REVEALED, (data) => {
            const lastClue = data.clues[data.clues.length - 1];
            setGameState((prev) => ({
                ...prev,
                status: data.status,
                clues: data.clues,
                activeClue: lastClue || null,
            }));

            if (lastClue?.from !== user.username) {
                setNotification({
                    message: `new clue definition by ${lastClue.from}: "${lastClue.definition}"`,
                    type: "notification",
                });
            }
            setTimeLeft(data.timeLeft);
        });

        socket.on(SOCKET_EVENTS.SERVER_CLUE_BLOCKED, (data) => {
            setGameState((prev) => ({
                ...prev,
                players: data.players,
                clues: prev.clues.map((c) => (c.id === data.clue.id ? { ...c, blocked: true, word: data.clue.word } : c)),
                isSubmittingClue: data.clueGiverUsername === user.username,
                clueGiverUsername: data.clueGiverUsername,
                activeClue: null,
                guesses: [],
            }));
            setTimeLeft(data.timeLeft);
            setNotification({
                message: gameState.isKeeper
                    ? `You blocked "${data.clue.from}" by guessing the word "${data.clue.word}"`
                    : `The keeper blocked "${data.clue.from}" by guessing the word "${data.clue.word}"`,
                type: gameState.isKeeper ? "success" : "notification",
            });
        });

        socket.on(SOCKET_EVENTS.SERVER_NEW_CLUE_TO_BLOCK, (data) => {
            const clue = data.clues[data.clues.length - 1];
            setGameState((prev) => ({
                ...prev,
                status: data.status,
                logMessage: `A clue was submitted by ${clue.from}. You may block it.`,
                clues: data.clues,
                activeClue: clue,
            }));
            setTimeLeft(data.timeLeft);
            setNotification({
                message: `new clue definition by ${clue.from}: "${clue.definition}"`,
                type: "notification",
            });
        });

        socket.on(SOCKET_EVENTS.SERVER_GUESS_FAILED, (guesses) => {
            setGameState((prev) => ({ ...prev, guesses }));
        });

        return () => {
            socket.off(SOCKET_EVENTS.SERVER_GAME_JOIN);
            socket.off(SOCKET_EVENTS.SERVER_KEEPER_WORD_CHOSEN);
            socket.off(SOCKET_EVENTS.SERVER_CLUETACT_SUCCESS);
            socket.off(SOCKET_EVENTS.SERVER_CLUE_REVEALED);
            socket.off(SOCKET_EVENTS.SERVER_CLUE_BLOCKED);
            socket.off(SOCKET_EVENTS.SERVER_NEW_CLUE_TO_BLOCK);
            socket.off(SOCKET_EVENTS.SERVER_GUESS_FAILED);
            socket.off(SOCKET_EVENTS.SERVER_CLUE_SUBMISSION_TIMEOUT);
            socket.off(SOCKET_EVENTS.SERVER_RACE_TIMEOUT);
        };
    }, [user?.username, gameState.isKeeper]);

    useEffect(() => {
        socket.on(SOCKET_EVENTS.SERVER_PLAYER_EXITED_ROOM, (data) => {
            setGameState((prev) => ({
                ...prev,
                players: data.players,
                isSubmittingClue: data.clueGiverUsername === user?.username,
                clueGiverUsername: data.clueGiverUsername,
                status: data.status,
                logMessage: data.message,
            }));
            setNotification({
                message: `${data.username} has left the game`,
                type: "notification",
            });
        });

        return () => {
            socket.off(SOCKET_EVENTS.SERVER_PLAYER_EXITED_ROOM);
        };
    }, []);

    useEffect(() => {
        socket.on(SOCKET_EVENTS.SERVER_KEEPER_WORD_TIMEOUT, (data) => {
            const keeper = gameStateRef.current.players.find((player) => player.role === "keeper");
            setNotification({
                message: `Choosing word timeout! Keeper ${keeper.username} didn't submit a word on time! Moving to the next keeper`,
                type: "notification",
            });
            setGameState((prev) => ({ ...prev, ...data }));
        });

        socket.on(SOCKET_EVENTS.SERVER_GAME_ENDED, (data) => {
            if (data.reason === "keeper word timeout") {
                const keeper = gameStateRef.current.players.find((player) => player.role === "keeper");
                setNotification({
                    message: `Choosing word timeout! Keeper ${keeper.username} didn't submit a word on time! Moving to the next keeper`,
                    type: "notification",
                });
            }
            setGameState((prev) => ({ ...prev, ...data }));
        });

        return () => {
            socket.off(SOCKET_EVENTS.SERVER_KEEPER_WORD_TIMEOUT);
            socket.off(SOCKET_EVENTS.SERVER_GAME_ENDED);
        };
    }, []);

    useEffect(() => {
        socket.on(SOCKET_EVENTS.SERVER_READY_FOR_EVENTS, () => {
            socket.emit(SOCKET_EVENTS.CLIENT_JOIN_ROOM, { roomId });
        });
        socket.emit(SOCKET_EVENTS.CLIENT_CHECK_EVENTS_AVAILABILITY);

        return () => {
            socket.off(SOCKET_EVENTS.SERVER_READY_FOR_EVENTS);
        };
    }, [roomId]);

    return {
        gameState,
        setKeeperWord,
        loading,
        setCluetact,
        handleGuessSubmit,
        handleExitGame,
        notification,
        setNotification,
        timeLeft,
        setTimeLeft,
        isKeeperWordRejected,
        setIsKeeperWordRejected,
    };
}
