import { createContext, useContext, useRef, useEffect, useState } from "react";
import bgMusic from "../../assets/audio/lobby-music.mp3";

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

    // Initialize audio element
    useEffect(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio(bgMusic);
            audioRef.current.volume = 0.3;
            audioRef.current.loop = true;
            audioRef.current.preload = "auto";

            // Add event listeners for better mobile support
            audioRef.current.addEventListener("canplaythrough", () => {
                setIsInitialized(true);
            });

            audioRef.current.addEventListener("error", (e) => {
                console.error("Audio loading error:", e);
            });
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.removeEventListener(
                    "canplaythrough",
                    () => {}
                );
                audioRef.current.removeEventListener("error", () => {});
            }
        };
    }, []);

    // Handle first user interaction for mobile autoplay
    useEffect(() => {
        const handleFirstInteraction = async () => {
            if (!hasInteracted && audioRef.current && isMusicOn) {
                setHasInteracted(true);
                try {
                    await audioRef.current.play();
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
            audioRef.current.play().catch((err) => {
                console.log("Music play failed:", err);
            });
        }
    }, [isInitialized, isMusicOn, hasInteracted]);

    const toggleMusic = async () => {
        if (!audioRef.current) return;

        const newMusicState = !isMusicOn;
        setIsMusicOn(newMusicState);

        if (newMusicState) {
            // Turn music on
            if (!hasInteracted) {
                setHasInteracted(true);
            }
            try {
                await audioRef.current.play();
            } catch (err) {
                console.log("Music play failed:", err);
            }
        } else {
            // Turn music off
            audioRef.current.pause();
        }
    };

    const setVolume = (volume) => {
        if (audioRef.current) {
            audioRef.current.volume = Math.max(0, Math.min(1, volume));
        }
    };

    const value = {
        isMusicOn,
        toggleMusic,
        setVolume,
        isInitialized,
        hasInteracted,
    };

    return (
        <MusicContext.Provider value={value}>{children}</MusicContext.Provider>
    );
};
