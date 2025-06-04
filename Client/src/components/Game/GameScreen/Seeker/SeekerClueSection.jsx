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

    // Auto-scroll to bottom when new clues are added
    useEffect(() => {
        if (activeListRef.current) {
            activeListRef.current.scrollTop = activeListRef.current.scrollHeight;
        }
    }, [activeClues]);

    // Automatically select the last (most recent) clue
    useEffect(() => {
        if (activeClues.length > 0) {
            const lastClue = activeClues[activeClues.length - 1];
            // Only auto-select if no clue is currently selected or if the last clue changed
            if (!selectedClue || selectedClue.id !== lastClue.id) {
                onClueSelect(lastClue);
            }
        } else {
            // Clear selection if no active clues
            onClueSelect(null);
        }
    }, [activeClues, selectedClue, onClueSelect]);

    return (
        <div className={styles.clueSection}>
            <h3 className={styles.heading}>Clues in Play</h3>
            {activeClues.length === 0 ? (
                <p className={styles.emptyMessage}>No active clues yet.</p>
            ) : (
                <div ref={activeListRef} className={styles.scrollableClueList} data-clue-count={activeClues.length}>
                    {activeClues.map((clue, index) => {
                        const isLatest = index === activeClues.length - 1;
                        const isSelected = selectedClue && selectedClue.id === clue.id;

                        return (
                            <ClueBubble
                                key={clue.id}
                                from={clue.from}
                                definition={clue.definition}
                                blocked={clue.blocked}
                                selected={isSelected}
                                isLatest={isLatest}
                                word={""}
                                // Remove click handler since clues are no longer manually selectable
                                onGuess={null}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default SeekerClueSection;
