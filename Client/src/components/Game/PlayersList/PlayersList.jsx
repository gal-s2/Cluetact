import React, { useState } from "react";
import PlayerCard from "../PlayerCard/PlayerCard";
import { useUser } from "@contexts/UserContext";
import { useGameRoom } from "@contexts/GameRoomContext";
import styles from "./PlayersList.module.css";

export default function PlayersList() {
    const { user } = useUser();
    const { gameState } = useGameRoom();
    const { players } = gameState;

    const [selectedPlayer, setSelectedPlayer] = useState(null);

    // Separate players by role
    const keeper = players.find((player) => player.role === "keeper");
    const seekers = players.filter((player) => player.role === "seeker");

    return (
        <div className={styles.playersTable}>
            {/* Keeper Section */}
            {keeper && (
                <div className={styles.keeperSection}>
                    <div className={styles.sectionHeader}>
                        <h3 className={styles.keeperTitle}>🔐 Keeper</h3>
                        <span className={styles.keeperSubtitle}>Defends the secret word</span>
                    </div>
                    <div className={styles.keeperContainer}>
                        <PlayerCard key={keeper.username} player={keeper} me={keeper.username === user.username} isActiveClueGiver={false} selectedPlayer={selectedPlayer} setSelectedPlayer={setSelectedPlayer} />
                    </div>
                </div>
            )}

            {/* VS Divider */}
            <div className={styles.divider}>
                <span className={styles.vsText}>VS</span>
            </div>

            {/* Seekers Section */}
            <div className={styles.seekersSection}>
                <div className={styles.sectionHeader}>
                    <h3 className={styles.seekersTitle}>🔍 Seekers</h3>
                    <span className={styles.seekersSubtitle}>Guess words that start with {gameState.revealedWord}</span>
                </div>
                <div className={styles.seekersContainer}>
                    {seekers.map((player) => (
                        <PlayerCard key={player.username} player={player} me={player.username === user.username} isActiveClueGiver={player.username === gameState.clueGiverUsername} selectedPlayer={selectedPlayer} setSelectedPlayer={setSelectedPlayer} />
                    ))}
                </div>
            </div>
        </div>
    );
}
