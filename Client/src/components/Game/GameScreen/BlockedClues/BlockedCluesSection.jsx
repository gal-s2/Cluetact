import { useState, useEffect, useRef } from "react";
import styles from "./BlockedCluesSection.module.css";
import { useGameRoom } from "../../../../contexts/GameRoomContext";

function BlockedCluesSection({ maxVisibleItems = 4, containerClassName = "" }) {
    const { gameState } = useGameRoom();
    const clues = gameState.clues || [];

    const blockedClues = clues.filter((clue) => clue.blocked);
    const [showBlocked, setShowBlocked] = useState(false); // Start collapsed
    const contentRef = useRef(null);
    const listRef = useRef(null);

    // Set CSS custom properties for dynamic height calculation
    useEffect(() => {
        if (listRef.current) {
            listRef.current.style.setProperty("--max-visible-items", maxVisibleItems);
        }
    }, [maxVisibleItems]);

    if (blockedClues.length === 0) {
        return null;
    }

    return (
        <div className={`${styles.blockedSection} ${containerClassName}`}>
            <button className={styles.blockedHeader} onClick={() => setShowBlocked((prev) => !prev)} aria-expanded={showBlocked} aria-controls="blocked-clues-content">
                <h4 className={styles.subHeading}>Blocked Clues ({blockedClues.length})</h4>
                <span className={`${styles.toggleIcon} ${showBlocked ? styles.expanded : ""}`}>▼</span>
            </button>

            <div id="blocked-clues-content" ref={contentRef} className={`${styles.contentWrapper} ${showBlocked ? styles.expanded : styles.collapsed}`}>
                <div ref={listRef} className={styles.scrollableClueList}>
                    {blockedClues.map((clue, index) => (
                        <div key={clue.id || index} className={styles.clueItem}>
                            <div className={styles.clueWord}>{clue.word}</div>
                            <div className={styles.clueDefinition}>{clue.definition}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default BlockedCluesSection;
