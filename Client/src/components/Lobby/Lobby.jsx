import axios from "axios";
import { useEffect, useState } from "react";
import { useUser } from "../UserContext";
import { useNavigate } from "react-router-dom";
import socket from "../../socket";
import styles from "./Lobby.module.css";

function generateRoomCode(length = 5) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
  

function Lobby() {
    const { user, setUser } = useUser();
    const navigate = useNavigate();
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [roomCodeInput, setRoomCodeInput] = useState('');
    const [createdRoomCode, setCreatedRoomCode] = useState('');


    useEffect(() => {
        socket.on("new_room", (data) => {
            if (data.roomId) navigate(`/game/${data.roomId}`);
        });

        return () => {
            socket.off("new_room");
        };
    }, []);

    const findGame = () => {
        console.log(socket);
        socket.emit("find_game", { userId: user._id, username: user.username });
    };

    const disconnect = async () => {
        socket.disconnect();
        setUser(null);
        navigate("/");

        try {
            const response = await axios.post(
                "http://localhost:8000/auth/logout",
                { id: user._id }
            );
            console.log(response);
        } catch (error) {
            console.log("Error in disconnect");
        }
    };

    const handleCreateRoom = () => {
        const newCode = generateRoomCode();
        setCreatedRoomCode(newCode);
        setShowCreateModal(true);
      
        // Emit immediately if needed
        socket.emit("create_waiting_lobby", {
          lobbyId: newCode,
          username: user.username,
        });
      
        navigate(`/waiting/${newCode}`); // 👈 this is the missing piece
      };

      const handleJoinRoom = () => {
        socket.emit("join_waiting_lobby", {
          lobbyId: roomCodeInput,
          username: user.username,
        });
      
        navigate(`/waiting/${roomCodeInput}`);
      };
      

      return (
        <div className={styles.container}>
          <h3>Hello, {user.username}</h3>
          <div>
            <button className={styles.blue} onClick={findGame}>
              Find Game
            </button>
            <button
              className={styles.green}
              onClick={() => setShowJoinModal(true)}
            >
              Join Room
            </button>
            <button
              className={styles.orange}
              onClick={handleCreateRoom}
            >
              Create Room
            </button>
            <button onClick={() => navigate("/stats")}>My Stats</button>
            <button className={styles.red} onClick={disconnect}>
              Disconnect
            </button>
          </div>
      
          {showJoinModal && (
            <div className={styles.modal}>
              <h3>Enter Room Code</h3>
              <input
                type="text"
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value)}
                placeholder="ABCD1234"
              />
              <button onClick={() => {
                socket.emit("join_waiting_lobby", {
                  lobbyId: roomCodeInput,
                  username: user.username,
                });
                setShowJoinModal(false);
                navigate(`/waiting/${roomCodeInput}`);
              }}>
                Join
              </button>
              <button onClick={() => setShowJoinModal(false)}>
                Cancel
              </button>
            </div>
          )}
      
          {showCreateModal && (
            <div className={styles.modal}>
              <h3>Room Created</h3>
              <p>Pass-key: <strong>{createdRoomCode}</strong></p>
              <button onClick={() => {
                socket.emit("create_room", {
                  roomId: createdRoomCode,
                  userId: user._id
                });
                setShowCreateModal(false);
              }}>
                Start Room
              </button>
              <button onClick={() => setShowCreateModal(false)}>
                Cancel
              </button>
            </div>
          )}
        </div>
      );
      
}

export default Lobby;
