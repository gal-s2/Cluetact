import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import socket from '../../socket';
import WordDisplay from './WordDisplay';
import Table from './Table';
import PlayerCard from './PlayerCard';
import Spinner from '../Routes/Spinner';

import styles from './GameRoom.module.css';

function GameRoom() {
    const [ players, setPlayers ] = useState();
    const [ loading, setLoading ] = useState(true);
    const { roomId } = useParams(); 

    // were currently using ref here becuase of react strict mode
    // which will call useEffect twice
    // and therefore will send join room to server twice
    const hasJoinedRef = useRef(false); 

    useEffect(() => {
        if (!hasJoinedRef.current) {
            socket.emit('join_room', { roomId });
            hasJoinedRef.current = true;
        }

        socket.on('game_start', (data) => {
            setLoading(false);
            console.log('data', data.room);
            setPlayers(data.room.players);
        });

        return () => {
            console.log('Cleaning up game_start listener');
            socket.off('game_start');
        };
    }, [roomId]);

    if (loading) return <Spinner />;

    return (
        <div className={styles.room}>
          <div className={styles.wordDisplay}>
            <WordDisplay word={""} length={0} />
          </div>
      
          <div className={styles.table}>
            {Object.values(players).map((player, index) => (
              <PlayerCard key={player.username} player={player} position={index} />
            ))}
          </div>
        </div>
    );
};
/*

*/
export default GameRoom;