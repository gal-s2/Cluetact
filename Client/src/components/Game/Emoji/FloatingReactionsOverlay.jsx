import React from "react";
import ClientPortal from "@components/common/ClientPortal";
import styles from "./FloatingReactionsOverlay.module.css";

export default function FloatingReactionsOverlay({ items }) {
    if (!items?.length) return null;
    return (
        <ClientPortal>
            <div className={styles.layer} aria-hidden>
                {items.map((it) => (
                    <div
                        key={it.id}
                        className={styles.floatItem}
                        style={{ left: it.x, top: it.y }}
                    >
                        <span className={styles.mainEmoji}>{it.emoji}</span>
                        <span className={styles.sparkles} aria-hidden>
                            ✨
                        </span>
                    </div>
                ))}
            </div>
        </ClientPortal>
    );
}
