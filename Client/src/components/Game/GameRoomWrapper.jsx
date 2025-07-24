import { useRef } from "react";
import { useParams } from "react-router-dom";
import { GameRoomProvider } from "../../contexts/GameRoomContext";
import GameRoom from "./GameRoom";

const GameRoomWrapper = () => {
    const hasJoinedRef = useRef(false);
    const { roomId } = useParams();

    return (
        <GameRoomProvider roomId={roomId} hasJoinedRef={hasJoinedRef}>
            <GameRoom />
        </GameRoomProvider>
    );
};

export default GameRoomWrapper;
