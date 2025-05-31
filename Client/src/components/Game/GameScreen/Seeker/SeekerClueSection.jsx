import { useState, useEffect, useRef } from "react";
import ClueBubble from "./ClueBubble";
import styles from "./SeekerClueSection.module.css";

function SeekerClueSection({ clues, onClueSelect, selectedClue, maxVisibleItems = 4 }) {
    const activeClues = clues.filter((clue) => !clue.blocked);
    const blockedClues = clues.filter((clue) => clue.blocked);
    const [showBlocked, setShowBlocked] = useState(true);
    const activeListRef = useRef(null);
    const blockedListRef = useRef(null);

    // Set CSS custom properties for dynamic height calculation
    useEffect(() => {
        if (activeListRef.current) {
            activeListRef.current.style.setProperty("--max-visible-items", maxVisibleItems);
        }
        if (blockedListRef.current) {
            blockedListRef.current.style.setProperty("--max-visible-items", maxVisibleItems);
        }
    }, [maxVisibleItems]);

    useEffect(() => {
        if (activeListRef.current) {
            activeListRef.current.scrollTop = activeListRef.current.scrollHeight;
        }
    }, [activeClues]);

    const handleClueClick = (clue) => {
        // Toggle selection: if already selected, deselect; otherwise select this one
        if (selectedClue && selectedClue.id === clue.id) {
            onClueSelect(null);
        } else {
            onClueSelect(clue);
        }
    };

    return (
        <div className={styles.clueSection}>
            <h3 className={styles.heading}>Clues in Play</h3>
            {activeClues.length === 0 ? (
                <p className={styles.emptyMessage}>No active clues yet.</p>
            ) : (
                <div ref={activeListRef} className={styles.scrollableClueList} data-clue-count={activeClues.length}>
                    {activeClues.map((clue) => (
                        <ClueBubble
                            key={clue.id}
                            from={clue.from}
                            definition={clue.definition}
                            blocked={clue.blocked}
                            selected={selectedClue && selectedClue.id === clue.id}
                            onGuess={() => handleClueClick(clue)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default SeekerClueSection;
