import { useState, useEffect } from 'react';
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

    useEffect(() => { // send to server that player joined the room in client
        socket.emit('join_room', { roomId });

        socket.on('game_start', (data) => {
            setLoading(false);
            setPlayers(data.players);
        });
    
        return () => {
            socket.off('game_start');
        };
    }, [roomId]);

    if (loading) return <Spinner />;

    return (
        <div className={styles.room}>
            <WordDisplay word={""} length={0} />
            <Table>
                
            </Table>
        </div>
    )
};
/*
{players.map((player, index) => {
                    <PlayerCard key={player.id} player={player} position={index} />
                })}
*/
export default GameRoom;