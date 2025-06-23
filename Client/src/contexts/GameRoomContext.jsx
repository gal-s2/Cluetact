import { createContext, useContext } from "react";
import useGameRoomSocket from "../hooks/useGameRoomSocket";

const GameRoomContext = createContext(null);

export const GameRoomProvider = ({ children, roomId, hasJoinedRef }) => {
    const gameRoom = useGameRoomSocket(roomId, hasJoinedRef);
    return <GameRoomContext.Provider value={gameRoom}>{children}</GameRoomContext.Provider>;
};

export const useGameRoom = () => {
    const context = useContext(GameRoomContext);
    if (!context) {
        throw new Error("useGameRoom must be used within a GameRoomProvider");
    }
    return context;
};
