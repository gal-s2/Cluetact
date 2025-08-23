import { useState } from "react";
import styles from "../Lobby/Lobby.module.css";
import TutorialPopup from "./TutorialPopup";

export default function InfoSection() {
    const [tutorialOpen, setTutorialOpen] = useState(false);

    return (
        <>
            <div className={styles.infoSection}>
                <div className={styles.infoColumn}>
                    <h3>About</h3>
                    <p>Cluetact is a fast-paced word game where players try to guess a secret word by racing to define related words. Each round is packed with deduction, logic, and surprise twists.</p>
                </div>
                <div className={styles.infoColumn}>
                    <h3>News</h3>
                    <p>
                        🆕 New feature: You can now select custom avatars!
                        <br />✨ Improved game flow and new mystery-themed design!
                        <br />
                        🐞 Bug fixes for mobile responsiveness.
                    </p>
                </div>
                <div className={styles.infoColumn} onClick={() => setTutorialOpen(true)}>
                    <h3>How to Play</h3>
                    <p>The Keeper picks a secret word and reveals only the first letter. Seekers submit clues (definitions) for different words starting with that letter. Everyone races to guess the clue — but beware, the Keeper guesses too!</p>
                    <p>
                        <b>Click here for tutorial</b>
                    </p>
                </div>
            </div>

            {tutorialOpen && <TutorialPopup onClose={() => setTutorialOpen(false)} />}
        </>
    );
}
