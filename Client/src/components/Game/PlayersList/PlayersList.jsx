import React, { useState } from "react";
import PlayerCard from "../PlayerCard/PlayerCard";
import { useUser } from "@contexts/UserContext";
import { useGameRoom } from "@contexts/GameRoomContext";
import styles from "./PlayersList.module.css";

export default function PlayersList({ onSendEmoji, registerAnchor }) {
    const { user } = useUser();
    const { gameState } = useGameRoom();
    const { players } = gameState;
    const [selectedPlayer, setSelectedPlayer] = useState(null);

    const keeper = players.find((p) => p.role === "keeper");
    const seekers = players.filter((p) => p.role === "seeker");

    return (
        <div className={styles.playersTable}>
            {keeper && (
                <div className={styles.keeperSection}>
                    <div className={styles.sectionHeader}>
                        <h3 className={styles.keeperTitle}>🔐 Keeper</h3>
                        <span className={styles.keeperSubtitle}>Defends the secret word</span>
                    </div>
                    <div className={styles.keeperContainer}>
                        <PlayerCard key={keeper.username} player={keeper} me={keeper.username === user.username} isActiveClueGiver={false} selectedPlayer={selectedPlayer} setSelectedPlayer={setSelectedPlayer} onSendEmoji={onSendEmoji} registerAnchor={registerAnchor} />
                    </div>
                </div>
            )}

            <div className={styles.divider}>
                <span className={styles.vsText}>VS</span>
            </div>

            <div className={styles.seekersSection}>
                <div className={styles.sectionHeader}>
                    <h3 className={styles.seekersTitle}>🔍 Seekers</h3>
                    <span className={styles.seekersSubtitle}>Guess words that start with {gameState.revealedWord}</span>
                </div>
                <div className={styles.seekersContainer}>
                    {seekers.map((p) => (
                        <PlayerCard key={p.username} player={p} me={p.username === user.username} isActiveClueGiver={p.username === gameState.clueGiverUsername} selectedPlayer={selectedPlayer} setSelectedPlayer={setSelectedPlayer} onSendEmoji={onSendEmoji} registerAnchor={registerAnchor} />
                    ))}
                </div>
            </div>
        </div>
    );
}
