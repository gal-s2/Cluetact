import styles from './GameRoom.module.css';
import socket from '../../socket';

function KeeperWordPopup({ keeperWord, setKeeperWord, logMessage }) {
    const handleSubmit = () => {
        socket.emit('keeper_word_submission', { word: keeperWord });
    };
    
    return (
        <div className={styles.keeperPopup}>
          <p>{logMessage}</p>
          <input
            type="text"
            value={keeperWord}
            onChange={(e) => setKeeperWord(e.target.value)}
            placeholder="Enter your secret word"
          />
          <button onClick={handleSubmit} disabled={keeperWord.trim() === ''}>
            Submit
          </button>
        </div>
      );
}

export default KeeperWordPopup;