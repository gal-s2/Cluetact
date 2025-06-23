import axios from "axios";
import { useUser } from "../../../contexts/UserContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { baseUrl } from "../../../config/baseUrl";
import styles from "./ProfileDetails.module.css";
import AvatarPicker from "../AvatarPicker/AvatarPicker";

function ProfileDetails() {
    const { user, setUser } = useUser();
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [selectedAvatar, setSelectedAvatar] = useState(null);
    const [isAvatarShown, setAvatarShown] = useState(false);

    const extractAvatarNumber = (avatarPath) => {
        const match = avatarPath.match(/avatar_(\d+)/);
        return match ? match[1] : null;
    };

    const handleUpdate = async () => {
        const updateData = {};

        if (selectedAvatar && selectedAvatar !== user.avatarUrl) {
            const avatarNumber = extractAvatarNumber(selectedAvatar);
            console.log("extractedNumber is,", avatarNumber);
            if (avatarNumber !== null) {
                updateData.avatar = avatarNumber;
            }
        }

        if (!user.guest && password.length >= 6) {
            updateData.password = password;
        }

        if (Object.keys(updateData).length === 0) return;

        try {
            const res = await axios.patch(`${baseUrl}/user/update-profile`, updateData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            setUser({
                user: res.data.user,
                token: localStorage.getItem("token"), // re-use existing token
            });

            alert("Profile updated successfully");
        } catch (err) {
            console.error("Update failed:", err);
            alert("Something went wrong while updating your profile.");
        }
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

                {!user.guest && (
                    <div className={styles.field}>
                        <label>New Password (optional):</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter new password (min 6 characters)" />
                        {password.length > 0 && password.length < 6 && <span className={styles.error}>Password must be at least 6 characters</span>}
                    </div>
                )}

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
