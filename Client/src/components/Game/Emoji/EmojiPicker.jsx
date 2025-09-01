import React, { useEffect, useLayoutEffect, useState } from "react";
import ClientPortal from "@components/common/ClientPortal";
import styles from "./EmojiPicker.module.css";

const EMOJIS = [
    "😀",
    "😂",
    "😍",
    "🤔",
    "😮",
    "👍",
    "👎",
    "❤️",
    "🔥",
    "⭐",
    "🎉",
    "😎",
    "🤯",
    "🙄",
    "😴",
    "🤪",
];

export default function EmojiPicker({ isOpen, onSelect, onClose, anchorEl }) {
    const [pos, setPos] = useState({ top: 0, left: 0 });

    useLayoutEffect(() => {
        if (!isOpen || !anchorEl) return;
        const r = anchorEl.getBoundingClientRect();
        const next = {
            top: Math.min(r.bottom + 8, window.innerHeight - 8),
            left: Math.max(8, Math.min(r.left - 120, window.innerWidth - 176)),
        };
        setPos(next);
    }, [isOpen, anchorEl]);

    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e) => e.key === "Escape" && onClose?.();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isOpen, onClose]);

    if (!isOpen || !anchorEl) return null;

    return (
        <ClientPortal>
            <div className={styles.backdrop} onClick={onClose} />
            <div
                className={styles.picker}
                style={{
                    top: pos.top,
                    left: pos.left,
                    position: "fixed",
                    zIndex: 5100,
                }}
            >
                {EMOJIS.map((e, i) => (
                    <button
                        key={i}
                        className={styles.btn}
                        onClick={() => onSelect(e)}
                    >
                        {e}
                    </button>
                ))}
            </div>
        </ClientPortal>
    );
}
