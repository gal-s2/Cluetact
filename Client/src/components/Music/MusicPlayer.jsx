import { useEffect, useRef } from "react";

function MusicPlayer({ src, volume = 0.5 }) {
    const audioRef = useRef(null);

    useEffect(() => {
        const audio = audioRef.current;
        if (audio) {
            audio.volume = volume;
            audio.play().catch((err) => {
                console.warn("Autoplay prevented:", err);
            });
        }

        return () => {
            audio.pause();
        };
    }, [src, volume]);

    return <audio ref={audioRef} src={src} loop />;
}

export default MusicPlayer;
