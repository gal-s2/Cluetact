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

export const MusicProvider = ({ children }) => {
    const audioRef = useRef(null);
    const retryTimeoutRef = useRef(null);
    const stateCheckIntervalRef = useRef(null);
    const [isMusicOn, setIsMusicOn] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);
    const [currentTrack, setCurrentTrack] = useState("lobby");
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [autoplayAttempts, setAutoplayAttempts] = useState(0);

    // Add a flag to prevent autoplay when music is intentionally off
    const shouldAutoplayRef = useRef(true);

    const tracks = {
        lobby: lobbyMusic,
        gameRoom: gameRoomMusic,
    };

    // Initialize audio system
    useEffect(() => {
        const initializeAudio = async () => {
            if (!audioRef.current) {
                audioRef.current = new Audio();
                audioRef.current.loop = true;
                audioRef.current.volume = 0.3;
                audioRef.current.preload = "auto";
                audioRef.current.muted = false;

                // Set source
                audioRef.current.src = tracks[currentTrack];

                // Add event listeners
                audioRef.current.addEventListener("loadeddata", () => {
                    setIsInitialized(true);
                    // Only attempt autoplay if music should be on
                    if (shouldAutoplayRef.current && isMusicOn) {
                        attemptAutoplay();
                    }
                });

                audioRef.current.addEventListener("canplaythrough", () => {
                    // Only attempt autoplay if music should be on
                    if (shouldAutoplayRef.current && isMusicOn) {
                        attemptAutoplay();
                    }
                });

                audioRef.current.addEventListener("error", (e) => {
                    console.error("Audio error:", e);
                });

                audioRef.current.addEventListener("play", () => {
                    setHasInteracted(true);
                });

                audioRef.current.addEventListener("pause", () => {});

                audioRef.current.addEventListener("ended", () => {});

                // Start loading
                audioRef.current.load();
            }
        };

        initializeAudio();

        // Set up periodic state synchronization (less frequent and more careful)
        stateCheckIntervalRef.current = setInterval(() => {
            syncMusicState();
        }, 2000); // Check every 2 seconds instead of 1

        return () => {
            if (stateCheckIntervalRef.current) {
                clearInterval(stateCheckIntervalRef.current);
            }
        };
    }, []);

    // More careful state synchronization
    const syncMusicState = () => {
        if (audioRef.current && !isTransitioning) {
            const isActuallyPlaying =
                !audioRef.current.paused && !audioRef.current.ended;

            // Only sync if there's a significant discrepancy and we're not in a transition
            if (isActuallyPlaying !== isMusicOn) {
                // Don't auto-correct if we just toggled music recently
                const timeSinceLastToggle =
                    Date.now() - (window.lastMusicToggle || 0);
                if (timeSinceLastToggle > 3000) {
                    setIsMusicOn(isActuallyPlaying);
                }
            }
        }
    };

    const attemptAutoplay = async () => {
        // Don't attempt autoplay if music is intentionally off
        if (
            !audioRef.current ||
            !isMusicOn ||
            !shouldAutoplayRef.current ||
            hasInteracted ||
            autoplayAttempts >= 5
        ) {
            return;
        }

        setAutoplayAttempts((prev) => prev + 1);

        try {
            await audioRef.current.play();

            setHasInteracted(true);
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
        const handleInteraction = async (event) => {
            if (
                audioRef.current &&
                isMusicOn &&
                shouldAutoplayRef.current &&
                !hasInteracted
            ) {
                try {
                    await audioRef.current.play();
                    setHasInteracted(true);
                } catch (err) {
                    console.error(
                        "Failed to start music after interaction:",
                        err
                    );
                }
            }
        };

        const events = ["click", "touchstart", "keydown", "mousedown"];
        events.forEach((event) => {
            document.addEventListener(event, handleInteraction, {
                once: true,
                passive: true,
                capture: true,
            });
        });
    };

    // Handle track changes
    useEffect(() => {
        const changeTrack = async () => {
            if (!audioRef.current || !tracks[currentTrack] || isTransitioning)
                return;

            const newSrc = tracks[currentTrack];
            const currentSrc = audioRef.current.src;

            // Check if we actually need to change tracks
            const isCorrectTrack =
                (currentTrack === "lobby" &&
                    currentSrc.includes("lobby-music.mp3")) ||
                (currentTrack === "gameRoom" &&
                    currentSrc.includes("game-room-music.mp3"));

            if (isCorrectTrack) return;
            setIsTransitioning(true);

            // Remember if music was playing before the change
            const wasPlaying = !audioRef.current.paused && isMusicOn;

            try {
                // Always pause during track change
                if (!audioRef.current.paused) {
                    audioRef.current.pause();
                }

                audioRef.current.src = newSrc;
                audioRef.current.load();

                // Wait for the new track to load
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

                // Only resume playing if music was on and was playing before
                if (wasPlaying && isMusicOn && hasInteracted) {
                    await audioRef.current.play();
                }
            } catch (err) {
                console.error("Track change failed:", err);
            } finally {
                setIsTransitioning(false);
            }
        };

        if (isInitialized) {
            changeTrack();
        }
    }, [currentTrack, isInitialized]);

    const toggleMusic = async () => {
        if (!audioRef.current || isTransitioning) return;

        // Mark the time of this toggle to prevent auto-correction
        window.lastMusicToggle = Date.now();

        const newState = !isMusicOn;
        shouldAutoplayRef.current = newState;

        try {
            if (newState) {
                await audioRef.current.play();
                setHasInteracted(true);
                setIsMusicOn(true);
            } else {
                audioRef.current.pause();
                setIsMusicOn(false);
            }
        } catch (err) {
            console.error("Toggle failed:", err);
            // Revert state on failure
            setIsMusicOn(!newState);
            shouldAutoplayRef.current = !newState;
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

    // Cleanup
    useEffect(() => {
        return () => {
            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
            }
            if (stateCheckIntervalRef.current) {
                clearInterval(stateCheckIntervalRef.current);
            }
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    const value = {
        isMusicOn,
        toggleMusic,
        setVolume,
        isInitialized,
        hasInteracted,
        currentTrack,
        changeTrack,
    };

    return (
        <MusicContext.Provider value={value}>{children}</MusicContext.Provider>
    );
};
