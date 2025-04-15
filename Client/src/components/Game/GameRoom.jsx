import WordDisplay from './WordDisplay';
import Table from './Table';
import PlayerCard from './PlayerCard';

import styles from './GameRoom.module.css';

function GameRoom({ word, length }) {
    return (
        <div className={styles.room}>
            <WordDisplay word={""} length={4} />
            <Table>
              
            </Table>
        </div>
    )
};

export default GameRoom;

  // {players.map((player, index) => {
                //    <PlayerCard key={player.id} player={player} position={index} />
                //})}