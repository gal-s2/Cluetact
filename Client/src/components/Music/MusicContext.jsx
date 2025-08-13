import { createContext, useContext, useRef, useEffect, useState } from "react";
import lobbyMusic from "../../assets/audio/lobby-music.mp3";
import gameRoomMusic from "../../assets/audio/game-room-music.mp3";

const MusicContext = createContext();

export const useMusic = () => {
    const context = useContext(MusicContext);
    if (!context) {
        throw new Error("useMusic must be used within a MusicProvider");
    }
    return context;
};

const MUSIC_ON_KEY = "cluetact_music_on";

export const MusicProvider = ({ children }) => {
    const audioRef = useRef(null);
    const retryTimeoutRef = useRef(null);
    const stateCheckIntervalRef = useRef(null);

    // Persisted ON/OFF (default ON if nothing saved)
    const [isMusicOn, setIsMusicOn] = useState(() => {
        const saved = localStorage.getItem(MUSIC_ON_KEY);
        return saved === null ? true : saved === "true";
    });

    const [isInitialized, setIsInitialized] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);
    const [currentTrack, setCurrentTrack] = useState("lobby");
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [autoplayAttempts, setAutoplayAttempts] = useState(0);

    const tracks = {
        lobby: lobbyMusic,
        gameRoom: gameRoomMusic,
    };

    // Aggressive autoplay initialization
    useEffect(() => {
        const initializeAudio = async () => {
            if (!audioRef.current) {
                audioRef.current = new Audio();
                audioRef.current.loop = true;
                audioRef.current.volume = 0.3;
                audioRef.current.preload = "auto";
                audioRef.current.muted = false;
                audioRef.current.src = tracks[currentTrack];

                audioRef.current.addEventListener("loadeddata", () => {
                    setIsInitialized(true);
                    attemptAutoplay();
                });

                audioRef.current.addEventListener("canplaythrough", () => {
                    attemptAutoplay();
                });

                audioRef.current.addEventListener("error", (e) => {
                    console.error("Audio error:", e);
                });

                audioRef.current.addEventListener("play", () => {
                    setHasInteracted(true);
                    setIsMusicOn(true); // Sync state when audio starts
                });

                audioRef.current.addEventListener("pause", () => {
                    if (!isTransitioning) setIsMusicOn(false);
                });

                // Start loading
                audioRef.current.load();
            }
        };

        initializeAudio();

        // Periodic state synchronization
        stateCheckIntervalRef.current = setInterval(() => {
            syncMusicState();
        }, 1000);

        return () => {
            if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
            if (stateCheckIntervalRef.current)
                clearInterval(stateCheckIntervalRef.current);
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Persist ON/OFF and enforce pause/play accordingly
    useEffect(() => {
        localStorage.setItem(MUSIC_ON_KEY, String(isMusicOn));
        if (!audioRef.current) return;

        if (isMusicOn) {
            if (hasInteracted) {
                audioRef.current.play().catch(() => {
                    /* Silent fail → periodic sync will reconcile */
                });
            }
        } else {
            if (!audioRef.current.paused) audioRef.current.pause();
        }
    }, [isMusicOn, hasInteracted]);

    // Sync UI state with actual audio state
    const syncMusicState = () => {
        if (audioRef.current && !isTransitioning) {
            const isActuallyPlaying =
                !audioRef.current.paused && !audioRef.current.ended;
            if (isActuallyPlaying !== isMusicOn) {
                setIsMusicOn(isActuallyPlaying);
            }
        }
    };

    const attemptAutoplay = async () => {
        if (
            !audioRef.current ||
            !isMusicOn ||
            hasInteracted ||
            autoplayAttempts >= 5
        )
            return;

        setAutoplayAttempts((prev) => prev + 1);

        try {
            const strategies = [
                () => audioRef.current.play(),
                async () => {
                    audioRef.current.muted = true;
                    await audioRef.current.play();
                    setTimeout(() => {
                        if (audioRef.current) audioRef.current.muted = false;
                    }, 100);
                },
                async () => {
                    const originalVolume = audioRef.current.volume;
                    audioRef.current.volume = 0.01;
                    await audioRef.current.play();
                    setTimeout(() => {
                        if (audioRef.current)
                            audioRef.current.volume = originalVolume;
                    }, 100);
                },
            ];

            const strategy = strategies[autoplayAttempts % strategies.length];
            await strategy();

            setHasInteracted(true);
            setIsMusicOn(true);
        } catch (error) {
            if (autoplayAttempts < 4) {
                retryTimeoutRef.current = setTimeout(() => {
                    attemptAutoplay();
                }, 1000 + autoplayAttempts * 500);
            } else {
                setupInteractionListeners();
            }
        }
    };

    const setupInteractionListeners = () => {
        const handleInteraction = async () => {
            if (audioRef.current && isMusicOn && !hasInteracted) {
                try {
                    await audioRef.current.play();
                    setHasInteracted(true);
                    setIsMusicOn(true);
                } catch (err) {
                    console.error(
                        "Failed to start music after interaction:",
                        err
                    );
                    setIsMusicOn(false);
                }
            }
        };

        const events = [
            "click",
            "touchstart",
            "touchend",
            "mousedown",
            "mouseup",
            "mousemove",
            "keydown",
            "keyup",
            "scroll",
            "wheel",
            "focus",
            "blur",
            "resize",
        ];

        events.forEach((event) => {
            document.addEventListener(event, handleInteraction, {
                once: true,
                passive: true,
                capture: true,
            });
        });

        window.addEventListener("focus", handleInteraction, { once: true });

        document.addEventListener(
            "visibilitychange",
            () => {
                if (!document.hidden && !hasInteracted) handleInteraction();
            },
            { once: true }
        );

        setTimeout(() => {
            if (!hasInteracted) attemptAutoplay();
        }, 1000);
        setTimeout(() => {
            if (!hasInteracted) attemptAutoplay();
        }, 3000);
    };

    // Track changes (respect saved ON/OFF)
    useEffect(() => {
        const changeTrack = async () => {
            if (!audioRef.current || !tracks[currentTrack] || isTransitioning)
                return;

            const newSrc = tracks[currentTrack];
            if (audioRef.current.src.endsWith(newSrc)) return;

            setIsTransitioning(true);

            // If user wants music and has interacted, we should play after swap
            const shouldPlay = isMusicOn && hasInteracted;

            try {
                if (!audioRef.current.paused) audioRef.current.pause();

                audioRef.current.src = newSrc;
                audioRef.current.load();

                await new Promise((resolve, reject) => {
                    const timeout = setTimeout(
                        () => reject(new Error("Load timeout")),
                        10000
                    );

                    const onLoad = () => {
                        clearTimeout(timeout);
                        audioRef.current.removeEventListener("canplay", onLoad);
                        audioRef.current.removeEventListener("error", onError);
                        resolve();
                    };

                    const onError = (e) => {
                        clearTimeout(timeout);
                        audioRef.current.removeEventListener("canplay", onLoad);
                        audioRef.current.removeEventListener("error", onError);
                        reject(e);
                    };

                    audioRef.current.addEventListener("canplay", onLoad);
                    audioRef.current.addEventListener("error", onError);
                });

                if (shouldPlay) {
                    await audioRef.current.play();
                    // Verify it really started
                    setTimeout(() => {
                        if (
                            audioRef.current &&
                            audioRef.current.paused &&
                            isMusicOn
                        ) {
                            setIsMusicOn(false);
                        }
                    }, 100);
                } else {
                    if (audioRef.current && !audioRef.current.paused)
                        audioRef.current.pause();
                }
            } catch (err) {
                console.error("Track change failed:", err);
            } finally {
                setIsTransitioning(false);
            }
        };

        if (isInitialized) changeTrack();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentTrack, isInitialized, isMusicOn, hasInteracted]);

    const toggleMusic = async () => {
        if (!audioRef.current || isTransitioning) return;

        // Use *actual* state to avoid drift
        const isActuallyPlaying =
            !audioRef.current.paused && !audioRef.current.ended;
        const newState = !isActuallyPlaying;

        try {
            if (newState) {
                await audioRef.current.play();
                setHasInteracted(true);
                setIsMusicOn(true);
                setTimeout(() => {
                    if (audioRef.current && audioRef.current.paused)
                        setIsMusicOn(false);
                }, 100);
            } else {
                audioRef.current.pause();
                setIsMusicOn(false);
            }
        } catch (err) {
            console.error("Toggle failed:", err);
            setIsMusicOn(!newState); // revert
        }
    };

    const setVolume = (volume) => {
        if (audioRef.current) {
            audioRef.current.volume = Math.max(0, Math.min(1, volume));
        }
    };

    const changeTrack = (trackName) => {
        if (
            tracks[trackName] &&
            trackName !== currentTrack &&
            !isTransitioning
        ) {
            setCurrentTrack(trackName);
        }
    };

    const forceSyncState = () => {
        syncMusicState();
    };

    const value = {
        isMusicOn,
        toggleMusic,
        setVolume,
        isInitialized,
        hasInteracted,
        currentTrack,
        changeTrack,
        forceSyncState,
    };

    return (
        <MusicContext.Provider value={value}>{children}</MusicContext.Provider>
    );
};
