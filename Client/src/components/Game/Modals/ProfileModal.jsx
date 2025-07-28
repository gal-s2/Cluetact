import Modal from "../../UI/Modal/Modal";
import styles from "./ProfileModal.module.css";

export default function PlayerProfileModal({ player, onClose }) {
    return (
        <Modal onClose={onClose} showCloseButton={true}>
            <div className={styles.profile}>
                <h2>{player.username}</h2>
                {
                    //player.country &&
                    <span>
                        {<img src="https://flagcdn.com/w40/us.png" srcset="https://flagcdn.com/w80/us.png 2x" width="40" alt="us-flag" />}
                        <span> US </span>
                    </span>
                }
                {/*player.country && <img src={`https://flagcdn.com/24x18/${player.country.toLowerCase()}.png`} alt={`${player.country}-flag`} />*/}
                <p>Wins: {player.wins}</p>
                <p>Total Games: {player.totalGames}</p>
            </div>
        </Modal>
    );
}
