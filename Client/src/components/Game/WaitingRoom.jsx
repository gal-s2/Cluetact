export default function WaitingRoom() {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [creator, setCreator] = useState("");
    const [username, setUsername] = useState(""); // TODO: replace with real username
  
    useEffect(() => {
      socket.emit("join_waiting_lobby", { lobbyId: roomId, username });
  
      socket.on("lobby_update", (userList) => {
        setUsers(userList);
      });
  
      socket.on("game_started", ({ roomId }) => {
        navigate(`/game/${roomId}`);
      });
  
      return () => {
        socket.off("lobby_update");
        socket.off("game_started");
      };
    }, [roomId, username]);
  
    const handleStart = () => {
      socket.emit("start_game_from_lobby", { lobbyId: roomId });
    };
  
    return (
        <div className={styles.backdrop}>
          <div className={styles.modal}>
            <h2 className={styles.heading}>Waiting Room</h2>
            <p>Waiting for other players to join...</p>
      
            <ul className={styles.userList}>
              {users.map((user) => (
                <li key={user}>
                  <span className={styles.greenDot}></span> {user}
                </li>
              ))}
            </ul>
      
            {username === creator && users.length >= 3 && (
              <button className={styles.startButton} onClick={handleStart}>
                Start Game
              </button>
            )}
          </div>
        </div>
      );
      
  }
  