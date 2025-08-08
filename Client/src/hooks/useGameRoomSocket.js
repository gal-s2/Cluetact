import { useEffect, useRef, useState } from "react";
import socket from "@services/socket";
import { useUser } from "@contexts/UserContext";
import SOCKET_EVENTS from "@shared/socketEvents.json";

export default function useGameRoomSocket(roomId) {
    const { user } = useUser();
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({ message: "", type: "notification" });
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

    const handleNextRound = () => {};

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
                activeClue: data.clues[data.clues.length - 1]?.active || null,
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
            } else {
                setIsKeeperWordRejected(true);
                setNotification({ message: data.message, type: "error" });
            }
        });

        socket.on(SOCKET_EVENTS.SERVER_CLUETACT_SUCCESS, ({ guesser, clues, word, revealed, isWordComplete, keeper, players, winners, clueGiverUsername, keeperWord, status }) => {
            if (isWordComplete) {
                setGameState((prev) => ({
                    ...prev,
                    status: status,
                    winners,
                    isKeeper: keeper === user.username,
                    isWordChosen: false,
                }));
            }
            setGameState((prev) => ({
                ...prev,
                status: status,
                cluetact: { guesser, word },
                players,
                clues,
                isSubmittingClue: clueGiverUsername === user.username,
                clueGiverUsername,
                activeClue: null,
                revealedWord: revealed,
                isWordComplete,
                guesses: [],
                keeperWord,
            }));
        });

        socket.on(SOCKET_EVENTS.SERVER_RACE_TIMEOUT, (data) => {
            setGameState((prev) => ({
                ...prev,
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

            setNotification({
                message: `guesser failed to guess ${data.prevClueGiverUsername} clue, turn moves to ${data.clueGiverUsername}`,
                type: "notification",
            });
        });

        socket.on(SOCKET_EVENTS.SERVER_CLUE_REVEALED, ({ clues, timeLeft }) => {
            const lastClue = clues[clues.length - 1];
            setGameState((prev) => ({
                ...prev,
                clues,
                activeClue: lastClue || null,
            }));
            if (lastClue?.from !== user.username) {
                setNotification({
                    message: `new clue definition by ${lastClue.from}: "${lastClue.definition}"`,
                    type: "notification",
                });
            }
            setTimeLeft(timeLeft);
        });

        socket.on(SOCKET_EVENTS.SERVER_CLUE_BLOCKED, ({ clue, clueGiverUsername }) => {
            setGameState((prev) => ({
                ...prev,
                clues: prev.clues.map((c) => (c.id === clue.id ? { ...c, blocked: true, word: clue.word } : c)),
                isSubmittingClue: clueGiverUsername === user.username,
                clueGiverUsername,
                activeClue: null,
                guesses: [],
            }));
            setNotification({
                message: gameState.isKeeper ? `You blocked "${clue.from}" by guessing the word "${clue.word}"` : `The keeper blocked "${clue.from}" by guessing the word "${clue.word}"`,
                type: gameState.isKeeper ? "success" : "notification",
            });
        });

        socket.on(SOCKET_EVENTS.SERVER_NEW_CLUE_TO_BLOCK, ({ clues, timeLeft }) => {
            const clue = clues[clues.length - 1];
            setGameState((prev) => ({
                ...prev,
                logMessage: `A clue was submitted by ${clue.from}. You may block it.`,
                clues,
                activeClue: clue,
            }));
            setTimeLeft(timeLeft);
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
        };
    }, [user?.username, gameState.isKeeper]);

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
        handleNextRound,
        handleExitGame,
        notification,
        setNotification,
        timeLeft,
        setTimeLeft,
        isKeeperWordRejected,
        setIsKeeperWordRejected,
    };
}
