import { useUser } from "../../../contexts/UserContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ProfileDetails.module.css";
import AvatarPicker from "../AvatarPicker/AvatarPicker";

function ProfileDetails() {
    const { user } = useUser();
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [selectedAvatar, setSelectedAvatar] = useState(null);
    const [isAvatarShown, setAvatarShown] = useState(false);

    const handleUpdate = () => {
        // TODO: שלח לשרת עדכון פרטי משתמש
        alert("Profile updated!");
    };

    const showAvatarPicker = () => {
        setAvatarShown(true);
    };

    const handleAvatarSelect = (avatarUrl) => {
        setSelectedAvatar(avatarUrl);
        setAvatarShown(false);
    };

    const handleBack = () => {
        navigate("/lobby");
    };

    // Check if update button should be enabled
    const isUpdateEnabled = (selectedAvatar && selectedAvatar !== user.avatarUrl) || password.length >= 6;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <button className={styles.backButton} onClick={handleBack}>
                    ← Back
                </button>
                <h2>Profile Details</h2>
            </div>

            <div className={styles.profileContent}>
                <div className={styles.avatarSection}>
                    <img src={selectedAvatar || user.avatarUrl || "/src/assets/avatars/avatar_0.png"} alt="Avatar" className={styles.avatar} />
                    <button className={styles.changeAvatarButton} onClick={showAvatarPicker}>
                        Change Avatar
                    </button>
                </div>

                <div className={styles.field}>
                    <label>New Password (optional):</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter new password (min 6 characters)" />
                    {password.length > 0 && password.length < 6 && <span className={styles.error}>Password must be at least 6 characters</span>}
                </div>

                <button className={`${styles.updateButton} ${isUpdateEnabled ? styles.enabled : styles.disabled}`} onClick={handleUpdate} disabled={!isUpdateEnabled}>
                    Update Profile
                </button>
            </div>

            {/* Avatar Picker Modal */}
            {isAvatarShown && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h3>Choose Your Avatar</h3>
                        <AvatarPicker onAvatarSelect={handleAvatarSelect} />
                        <button className={styles.cancelButton} onClick={() => setAvatarShown(false)}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProfileDetails;
