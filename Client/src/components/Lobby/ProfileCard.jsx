import styles from "./Lobby.module.css";
import { useUser } from "../../contexts/UserContext";

function ProfileCard({ profileMenuOpen, setProfileMenuOpen, disconnect, onNavigateToStats, onNavigateToProfile }) {
    const { user } = useUser();
    const PersonalDetailsMenuOptionString = user.guest === true ? "View & Edit Avatar" : "View & Edit Details";

    return (
        <div className={styles.card}>
            <button className={styles.buttonSecondary} onClick={setProfileMenuOpen} aria-expanded={profileMenuOpen} aria-haspopup="true">
                My Profile
            </button>

            {profileMenuOpen && (
                <div className={styles.dropdown} role="menu">
                    <button onClick={onNavigateToStats} role="menuitem">
                        My Stats
                    </button>
                    <button onClick={onNavigateToProfile} role="menuitem">
                        {PersonalDetailsMenuOptionString}
                    </button>
                    <button className={styles.buttonDanger} onClick={disconnect} role="menuitem">
                        Disconnect
                    </button>
                </div>
            )}
        </div>
    );
}

export default ProfileCard;
