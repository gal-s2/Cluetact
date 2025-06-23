import styles from "./Lobby.module.css";
import { useUser } from "../../contexts/UserContext";

function ProfileCard({ profileMenuOpen, setProfileMenuOpen, navigate, disconnect }) {
    const { user } = useUser();
    const PersonalDetailsMenuOptionString = user.guest === true ? "View & Edit Avatar" : "View & Edit Details";

    return (
        <div className={styles.card}>
            <button className={styles.buttonSecondary} onClick={() => setProfileMenuOpen((prev) => !prev)}>
                My Profile
            </button>

            {profileMenuOpen && (
                <div className={styles.dropdown}>
                    <button onClick={() => navigate("/stats")}>My Stats</button>
                    <button onClick={() => navigate("/profile")}>{PersonalDetailsMenuOptionString}</button>
                    <button className={styles.buttonDanger} onClick={disconnect}>
                        Disconnect
                    </button>
                </div>
            )}
        </div>
    );
}
export default ProfileCard;
