import { useEffect, useRef } from "react";

const Confetti = ({ trigger }) => {
    const canvasRef = useRef(null);
    const confettiParticles = useRef([]);

    useEffect(() => {
        if (!trigger) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        let animationFrameId;

        const colors = ["#81c784", "#c5e1a5", "#fdd835", "#aed581", "#ffeb3b"];
        const confettiCount = 150;

        // Full screen canvas
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Generate confetti
        confettiParticles.current = Array.from({ length: confettiCount }).map(() => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            r: Math.random() * 6 + 4,
            d: Math.random() * confettiCount,
            color: colors[Math.floor(Math.random() * colors.length)],
            tilt: Math.floor(Math.random() * 10) - 10,
            tiltAngleIncrement: Math.random() * 0.1 + 0.05,
            tiltAngle: 0,
        }));

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            confettiParticles.current.forEach((p) => {
                ctx.beginPath();
                ctx.lineWidth = p.r;
                ctx.strokeStyle = p.color;
                ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
                ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
                ctx.stroke();
            });

            update();
            animationFrameId = requestAnimationFrame(draw);
        };

        const update = () => {
            confettiParticles.current.forEach((p, i) => {
                p.tiltAngle += p.tiltAngleIncrement;
                p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
                p.tilt = Math.sin(p.tiltAngle) * 15;

                if (p.y > canvas.height) {
                    p.x = Math.random() * canvas.width;
                    p.y = -20;
                }
            });
        };

        draw();

        const timeout = setTimeout(() => {
            cancelAnimationFrame(animationFrameId);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }, 4000); // Run for 4 seconds

        return () => {
            cancelAnimationFrame(animationFrameId);
            clearTimeout(timeout);
        };
    }, [trigger]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                pointerEvents: "none",
                zIndex: 9999,
            }}
        />
    );
};

export default Confetti;
