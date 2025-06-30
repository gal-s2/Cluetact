import React, { useEffect, useState } from "react";
import PlayerCard from "./PlayerCard";
import PlayerProfileModal from "../../Modals/ProfileModal";
import { useUser } from "../../../../contexts/UserContext";
import { useGameRoom } from "../../../../contexts/GameRoomContext";
import styles from "./PlayersTable.module.css";

export default function PlayersTable() {
    const { user } = useUser();
    const { gameState } = useGameRoom();
    const { players } = gameState;
    const [selectedPlayer, setSelectedPlayer] = useState(null);

    const handlePlayerCardClick = (player) => {
        const userData = players.find((p) => p.username === player.username);
        setSelectedPlayer(userData);
        console.log("recognized selected player ", player);
    };

    return (
        <div className={styles.playersTable}>
            {players.map((player) => (
                <PlayerCard key={player.username} player={player} me={player.username === user.username} onClick={handlePlayerCardClick} setSelectedPlayer={setSelectedPlayer} />
            ))}
            {selectedPlayer && <PlayerProfileModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />}
        </div>
    );
}
