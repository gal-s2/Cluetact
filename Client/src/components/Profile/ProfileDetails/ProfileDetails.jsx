import axios from "axios";
import { useUser } from "@contexts/UserContext";
import { useState, useEffect } from "react";
import styles from "./ProfileDetails.module.css";
import AvatarPicker from "../AvatarPicker/AvatarPicker";
import BackToLobbyButton from "../../General/BackToLobbyButton/BackToLobbyButton";
import { useGlobalNotification } from "@contexts/GlobalNotificationContext";
import { baseUrl } from "@config/baseUrl";
import { avatarList } from "@utils/loadAvatars";
import MusicToggleButton from "../../General/MusicToggleButton/MusicToggleButton.jsx";

function ProfileDetails() {
    const { user, setUser } = useUser();
    const [password, setPassword] = useState("");
    const [selectedAvatar, setSelectedAvatar] = useState(null);
    const [isAvatarPickerShown, setAvatarPickerShown] = useState(false);
    const { setGlobalNotification } = useGlobalNotification();
    const LOCAL_USER = "local";

    useEffect(() => {
        if (user?.avatar != null && avatarList[user.avatar]) {
            setSelectedAvatar(user.avatar);
        }
    }, [user?.avatar]);

    const handleUpdate = async () => {
        const updateData = {};

        if (selectedAvatar && selectedAvatar !== user.avatar) {
            updateData.avatar = selectedAvatar;
        }

        if (user.authProvider === LOCAL_USER && password.length >= 6) {
            updateData.password = password;
        }

        if (Object.keys(updateData).length === 0) return;

        try {
            const res = await axios.patch(
                `${baseUrl}/user/update-profile`,
                updateData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                    },
                }
            );

            setUser({
                user: res.data.user,
                token: localStorage.getItem("token"), // re-use existing token
            });

            setGlobalNotification({
                message: "Profile updated successfully!",
                type: "success",
            });
        } catch (err) {
            console.error("Update failed:", err);
            alert("Something went wrong while updating your profile.");
        } finally {
            setSelectedAvatar(null);
            setPassword("");
        }
    };

    const showAvatarPicker = () => {
        setAvatarPickerShown(true);
    };

    const handleAvatarSelect = (avatar) => {
        setSelectedAvatar(avatar);
        setAvatarPickerShown(false);
    };

    // Check if update button should be enabled
    const isUpdateEnabled =
        (selectedAvatar && selectedAvatar !== user.avatar) ||
        password.length >= 6;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <BackToLobbyButton />
                <h2>Profile Details</h2>
            </div>

            <div className={styles.profileContent}>
                <div className={styles.avatarSection}>
                    <img
                        src={avatarList[selectedAvatar]}
                        alt="Avatar"
                        className={styles.avatar}
                    />
                    <button
                        className={styles.changeAvatarButton}
                        onClick={showAvatarPicker}
                    >
                        Change Avatar
                    </button>
                </div>

                {user.authProvider === LOCAL_USER && (
                    <div className={styles.field}>
                        <label>New Password (optional):</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter new password (min 6 characters)"
                        />
                        {password.length > 0 && password.length < 6 && (
                            <span className={styles.error}>
                                Password must be at least 6 characters
                            </span>
                        )}
                    </div>
                )}

                <button
                    className={`${styles.updateButton} ${
                        isUpdateEnabled ? styles.enabled : styles.disabled
                    }`}
                    onClick={handleUpdate}
                    disabled={!isUpdateEnabled}
                >
                    Update Profile
                </button>
            </div>

            {/* Avatar Picker Modal */}
            {isAvatarPickerShown && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h3>Choose Your Avatar</h3>
                        <AvatarPicker onAvatarSelect={handleAvatarSelect} />
                        <button
                            className={styles.cancelButton}
                            onClick={() => setAvatarPickerShown(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
            <MusicToggleButton />
        </div>
    );
}

export default ProfileDetails;
