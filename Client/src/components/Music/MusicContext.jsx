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
    const [isMusicOn, setIsMusicOn] = useState(true);
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
            console.log("Initializing audio system...");

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
                    console.log("Audio data loaded");
                    setIsInitialized(true);
                    attemptAutoplay();
                });

                audioRef.current.addEventListener("canplaythrough", () => {
                    console.log("Audio can play through");
                    attemptAutoplay();
                });

                audioRef.current.addEventListener("error", (e) => {
                    console.error("Audio error:", e);
                });

                audioRef.current.addEventListener("play", () => {
                    console.log("Audio started playing");
                    setHasInteracted(true);
                    setIsMusicOn(true); // Sync state when audio starts
                });

                audioRef.current.addEventListener("pause", () => {
                    console.log("Audio paused");
                    // Only update state if it wasn't an intentional pause during track change
                    if (!isTransitioning) {
                        setIsMusicOn(false);
                    }
                });

                audioRef.current.addEventListener("ended", () => {
                    console.log("Audio ended");
                    // For looping audio, this shouldn't happen, but just in case
                    if (!audioRef.current.loop && !isTransitioning) {
                        setIsMusicOn(false);
                    }
                });

                // Start loading
                audioRef.current.load();
            }
        };

        initializeAudio();

        // Set up periodic state synchronization
        stateCheckIntervalRef.current = setInterval(() => {
            syncMusicState();
        }, 1000); // Check every second
    }, []);

    // Sync UI state with actual audio state
    const syncMusicState = () => {
        if (audioRef.current && !isTransitioning) {
            const isActuallyPlaying =
                !audioRef.current.paused && !audioRef.current.ended;

            if (isActuallyPlaying !== isMusicOn) {
                console.log(
                    `Music state out of sync. UI: ${isMusicOn}, Actual: ${isActuallyPlaying}`
                );
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
        ) {
            return;
        }

        setAutoplayAttempts((prev) => prev + 1);
        console.log(`Autoplay attempt #${autoplayAttempts + 1}`);

        try {
            // Try multiple strategies
            const strategies = [
                // Strategy 1: Direct play
                () => audioRef.current.play(),

                // Strategy 2: Muted play first, then unmute
                async () => {
                    audioRef.current.muted = true;
                    await audioRef.current.play();
                    setTimeout(() => {
                        if (audioRef.current) {
                            audioRef.current.muted = false;
                        }
                    }, 100);
                },

                // Strategy 3: Very low volume, then increase
                async () => {
                    const originalVolume = audioRef.current.volume;
                    audioRef.current.volume = 0.01;
                    await audioRef.current.play();
                    setTimeout(() => {
                        if (audioRef.current) {
                            audioRef.current.volume = originalVolume;
                        }
                    }, 100);
                },
            ];

            const strategy = strategies[autoplayAttempts % strategies.length];
            await strategy();

            console.log("Autoplay successful!");
            setHasInteracted(true);
            // Ensure state is synced after successful autoplay
            setIsMusicOn(true);
        } catch (error) {
            console.log(
                `Autoplay attempt ${autoplayAttempts + 1} failed:`,
                error
            );

            // Schedule retry
            if (autoplayAttempts < 4) {
                retryTimeoutRef.current = setTimeout(() => {
                    attemptAutoplay();
                }, 1000 + autoplayAttempts * 500); // Increasing delay
            } else {
                console.log(
                    "All autoplay attempts failed, setting up interaction listeners"
                );
                setupInteractionListeners();
            }
        }
    };

    const setupInteractionListeners = () => {
        const handleInteraction = async (event) => {
            console.log("User interaction detected:", event.type);

            if (audioRef.current && isMusicOn && !hasInteracted) {
                try {
                    await audioRef.current.play();
                    setHasInteracted(true);
                    setIsMusicOn(true); // Ensure state is synced
                    console.log("Music started after interaction!");
                } catch (err) {
                    console.error(
                        "Failed to start music after interaction:",
                        err
                    );
                    setIsMusicOn(false); // Ensure state reflects failure
                }
            }
        };

        // Cast a wide net for interactions
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

        // Also listen on window
        window.addEventListener("focus", handleInteraction, { once: true });

        // Try when page becomes visible
        document.addEventListener(
            "visibilitychange",
            () => {
                if (!document.hidden && !hasInteracted) {
                    handleInteraction({ type: "visibilitychange" });
                }
            },
            { once: true }
        );

        // Try after a short delay (sometimes works)
        setTimeout(() => {
            if (!hasInteracted) {
                attemptAutoplay();
            }
        }, 1000);

        setTimeout(() => {
            if (!hasInteracted) {
                attemptAutoplay();
            }
        }, 3000);
    };

    // Track changes
    useEffect(() => {
        const changeTrack = async () => {
            if (!audioRef.current || !tracks[currentTrack] || isTransitioning)
                return;

            const newSrc = tracks[currentTrack];
            if (audioRef.current.src.endsWith(newSrc)) return;

            console.log("Changing track to:", currentTrack);
            setIsTransitioning(true);

            const wasPlaying = !audioRef.current.paused;

            try {
                if (wasPlaying) {
                    audioRef.current.pause();
                }

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

                if (wasPlaying && isMusicOn && hasInteracted) {
                    await audioRef.current.play();
                    // Verify the play actually worked
                    setTimeout(() => {
                        if (
                            audioRef.current &&
                            audioRef.current.paused &&
                            isMusicOn
                        ) {
                            console.log("Play failed silently, syncing state");
                            setIsMusicOn(false);
                        }
                    }, 100);
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

        console.log("Toggle music requested. Current state:", isMusicOn);

        // First, check the actual audio state
        const isActuallyPlaying =
            !audioRef.current.paused && !audioRef.current.ended;

        // If states are out of sync, sync them first
        if (isActuallyPlaying !== isMusicOn) {
            console.log("States out of sync during toggle. Syncing first.");
            setIsMusicOn(isActuallyPlaying);
        }

        const newState = !isActuallyPlaying; // Use actual state, not UI state
        console.log("Setting music to:", newState);

        try {
            if (newState) {
                await audioRef.current.play();
                setHasInteracted(true);
                setIsMusicOn(true);

                // Verify it actually started playing
                setTimeout(() => {
                    if (audioRef.current && audioRef.current.paused) {
                        console.log("Play command failed silently");
                        setIsMusicOn(false);
                    }
                }, 100);
            } else {
                audioRef.current.pause();
                setIsMusicOn(false);
            }
        } catch (err) {
            console.error("Toggle failed:", err);
            setIsMusicOn(!newState); // Revert state on failure
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

    // Expose method to manually sync state (useful for debugging)
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
        forceSyncState, // Add this for debugging
    };

    return (
        <MusicContext.Provider value={value}>{children}</MusicContext.Provider>
    );
};
