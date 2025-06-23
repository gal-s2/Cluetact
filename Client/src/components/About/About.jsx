import styles from "../Lobby/Lobby.module.css";

function About() {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>About Cluetact</h1>
            </div>
            <div className={styles.card} style={{ maxWidth: 600, margin: "0 auto" }}>
                <h2>What is Cluetact?</h2>
                <p>
                    <strong>Cluetact</strong> is a fast-paced, social word game where players work together to guess secret words using clever clues. One player becomes the Keeper, choosing a word, while others submit clues to help their team guess it. But beware—duplicate clues are blocked, so creativity and teamwork are key!
                </p>
                <h2>How to Play</h2>
                <ul>
                    <li>Join a game room or create your own.</li>
                    <li>The Keeper selects a secret word.</li>
                    <li>Other players submit single-word clues—no duplicates allowed!</li>
                    <li>The guesser tries to solve the word based on the unique clues.</li>
                    <li>Score points for correct guesses and clever clues.</li>
                </ul>
                <h2>Features</h2>
                <ul>
                    <li>Real-time multiplayer gameplay</li>
                    <li>Custom avatars and profiles</li>
                    <li>Quick matchmaking and private rooms</li>
                    <li>Fun, modern design and smooth user experience</li>
                </ul>
                <h2>About the Project</h2>
                <p>
                    Cluetact was built by a passionate team of developers who love social games and word puzzles. Our goal is to create a fun, engaging, and fair environment for players of all ages. We hope you enjoy playing as much as we enjoyed building it!
                </p>
                <p style={{ fontSize: "0.95rem", color: "#888" }}>
                    &copy; {new Date().getFullYear()} Cluetact Team. All rights reserved.
                </p>
            </div>
        </div>
    );
}

export default About;