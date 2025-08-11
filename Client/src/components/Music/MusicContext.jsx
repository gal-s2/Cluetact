import { createContext, useContext, useRef, useEffect, useState } from "react";
// Import the audio files directly - from components/Music/ to assets/audio/
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
    const [isMusicOn, setIsMusicOn] = useState(true);
    const [isInitialized, setIsInitialized] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);
    const [currentTrack, setCurrentTrack] = useState("lobby");
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Music track mapping - using imported files
    const tracks = {
        lobby: lobbyMusic,
        gameRoom: gameRoomMusic,
    };

    // Initialize audio element
    useEffect(() => {
        console.log("Initializing audio with track:", currentTrack);
        console.log("Track URL:", tracks[currentTrack]);

        if (!audioRef.current) {
            audioRef.current = new Audio(tracks[currentTrack]);
            audioRef.current.volume = 0.3;
            audioRef.current.loop = true;
            audioRef.current.preload = "auto";

            // Add event listeners for better mobile support
            audioRef.current.addEventListener("canplaythrough", () => {
                console.log("Audio can play through");
                setIsInitialized(true);
            });

            audioRef.current.addEventListener("loadstart", () => {
                console.log("Audio load started");
            });

            audioRef.current.addEventListener("loadeddata", () => {
                console.log("Audio data loaded");
            });

            audioRef.current.addEventListener("error", (e) => {
                console.error("Audio loading error:", e);
                console.error("Audio src:", audioRef.current.src);
                console.error(
                    "Audio error code:",
                    audioRef.current.error?.code
                );
                console.error(
                    "Audio error message:",
                    audioRef.current.error?.message
                );

                // Try to get more specific error info
                if (audioRef.current.error) {
                    switch (audioRef.current.error.code) {
                        case audioRef.current.error.MEDIA_ERR_ABORTED:
                            console.error("Audio error: MEDIA_ERR_ABORTED");
                            break;
                        case audioRef.current.error.MEDIA_ERR_NETWORK:
                            console.error("Audio error: MEDIA_ERR_NETWORK");
                            break;
                        case audioRef.current.error.MEDIA_ERR_DECODE:
                            console.error("Audio error: MEDIA_ERR_DECODE");
                            break;
                        case audioRef.current.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                            console.error(
                                "Audio error: MEDIA_ERR_SRC_NOT_SUPPORTED"
                            );
                            break;
                        default:
                            console.error("Audio error: Unknown error");
                    }
                }
            });
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.removeEventListener(
                    "canplaythrough",
                    () => {}
                );
                audioRef.current.removeEventListener("loadstart", () => {});
                audioRef.current.removeEventListener("loadeddata", () => {});
                audioRef.current.removeEventListener("error", () => {});
            }
        };
    }, [currentTrack]);

    // Handle track changes
    useEffect(() => {
        const changeTrackAsync = async () => {
            if (audioRef.current && tracks[currentTrack] && !isTransitioning) {
                const newSrc = tracks[currentTrack];
                const currentSrc = audioRef.current.src;

                console.log("Checking track change:", { currentSrc, newSrc });

                // Check if we actually need to change tracks (compare the actual URLs)
                if (currentSrc !== newSrc) {
                    console.log("Starting track change to:", newSrc);
                    setIsTransitioning(true);
                    const wasPlaying = !audioRef.current.paused;

                    try {
                        // Pause current track first
                        if (wasPlaying) {
                            console.log("Pausing current track");
                            audioRef.current.pause();
                        }

                        // Small delay to ensure pause completes
                        await new Promise((resolve) =>
                            setTimeout(resolve, 100)
                        );

                        // Change source and load new track
                        console.log("Loading new track:", newSrc);
                        audioRef.current.src = newSrc;
                        audioRef.current.load();

                        // Wait for the new track to be ready
                        await new Promise((resolve, reject) => {
                            const timeout = setTimeout(() => {
                                audioRef.current.removeEventListener(
                                    "canplay",
                                    onCanPlay
                                );
                                audioRef.current.removeEventListener(
                                    "error",
                                    onError
                                );
                                reject(new Error("Audio load timeout"));
                            }, 10000); // 10 second timeout

                            const onCanPlay = () => {
                                clearTimeout(timeout);
                                audioRef.current.removeEventListener(
                                    "canplay",
                                    onCanPlay
                                );
                                audioRef.current.removeEventListener(
                                    "error",
                                    onError
                                );
                                console.log("New track ready to play");
                                resolve();
                            };
                            const onError = (e) => {
                                clearTimeout(timeout);
                                audioRef.current.removeEventListener(
                                    "canplay",
                                    onCanPlay
                                );
                                audioRef.current.removeEventListener(
                                    "error",
                                    onError
                                );
                                console.error("Error loading new track:", e);
                                reject(e);
                            };

                            audioRef.current.addEventListener(
                                "canplay",
                                onCanPlay
                            );
                            audioRef.current.addEventListener("error", onError);
                        });

                        // Play if music should be playing
                        if (wasPlaying && isMusicOn && hasInteracted) {
                            console.log("Playing new track");
                            await audioRef.current.play();
                        }

                        console.log("Track change completed successfully");
                        setIsTransitioning(false);
                    } catch (err) {
                        console.error("Track change failed:", err);
                        setIsTransitioning(false);
                    }
                } else {
                    console.log(
                        "Track change not needed, already on correct track"
                    );
                }
            }
        };

        changeTrackAsync();
    }, [currentTrack, isMusicOn, hasInteracted]);

    // Handle first user interaction for mobile autoplay
    useEffect(() => {
        const handleFirstInteraction = async () => {
            if (!hasInteracted && audioRef.current && isMusicOn) {
                console.log("First user interaction detected");
                setHasInteracted(true);
                try {
                    await audioRef.current.play();
                    console.log("Auto-play successful");
                } catch (err) {
                    console.log("Autoplay prevented:", err);
                }
            }
        };

        // Add listeners for various interaction types
        const events = ["click", "touchstart", "keydown"];
        events.forEach((event) => {
            document.addEventListener(event, handleFirstInteraction, {
                once: true,
            });
        });

        return () => {
            events.forEach((event) => {
                document.removeEventListener(event, handleFirstInteraction);
            });
        };
    }, [hasInteracted, isMusicOn]);

    // Auto-start music when initialized and user wants it on
    useEffect(() => {
        if (isInitialized && isMusicOn && hasInteracted && audioRef.current) {
            console.log("Attempting to auto-start music");
            audioRef.current.play().catch((err) => {
                console.log("Auto-start play failed:", err);
            });
        }
    }, [isInitialized, isMusicOn, hasInteracted]);

    const toggleMusic = async () => {
        if (!audioRef.current || isTransitioning) return;

        const newMusicState = !isMusicOn;
        console.log("Toggling music:", isMusicOn ? "OFF" : "ON");
        setIsMusicOn(newMusicState);

        try {
            if (newMusicState) {
                // Turn music on
                if (!hasInteracted) {
                    setHasInteracted(true);
                }
                await audioRef.current.play();
                console.log("Music turned ON");
            } else {
                // Turn music off
                audioRef.current.pause();
                console.log("Music turned OFF");
            }
        } catch (err) {
            console.error("Music toggle failed:", err);
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
            console.log(`Switching track from ${currentTrack} to ${trackName}`);
            setCurrentTrack(trackName);
        } else {
            console.log(`Track change blocked or not needed:`, {
                trackExists: !!tracks[trackName],
                isDifferent: trackName !== currentTrack,
                notTransitioning: !isTransitioning,
            });
        }
    };

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
