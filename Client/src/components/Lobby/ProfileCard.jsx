import styles from "./Lobby.module.css";

function ProfileCard({ profileMenuOpen, setProfileMenuOpen, navigate, disconnect }) {
    return (
        <div className={styles.card}>
            <button className={styles.buttonSecondary} onClick={() => setProfileMenuOpen((prev) => !prev)}>
                My Profile
            </button>

            {profileMenuOpen && (
                <div className={styles.dropdown}>
                    <button onClick={() => navigate("/stats")}>My Stats</button>
                    <button onClick={() => navigate("/profile")}>View & Edit Details</button>
                    <button className={styles.buttonDanger} onClick={disconnect}>
                        Disconnect
                    </button>
                </div>
            )}
        </div>
    );
}
export default ProfileCard;
