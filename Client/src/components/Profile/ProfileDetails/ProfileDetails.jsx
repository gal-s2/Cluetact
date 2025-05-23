import { useUser } from "../../../contexts/UserContext";
import { useState } from "react";
import styles from "./ProfileDetails.module.css";
import AvatarPicker from "../AvatarPicker/AvatarPicker";

function ProfileDetails() {
    const { user } = useUser();
    const [email, setEmail] = useState(user.email || "");
    const [password, setPassword] = useState("");
    const [isAvatarShown, setAvatarShown] = useState(false);

    const handleUpdate = () => {
        // TODO: שלח לשרת עדכון פרטי משתמש
        alert("Update sent!");
    };

    const ShowAvatarPicker = () => {
        setAvatarShown(!isAvatarShown);
    };

    return (
        <div className={styles.container}>
            <h2>Profile Details</h2>

            <img onClick={ShowAvatarPicker} src={user.avatarUrl || "src/assets/avatars/avatar_0.png"} alt="Avatar" className={styles.avatar} />

            <div className={styles.field}>
                <label>Email:</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div className={styles.field}>
                <label>New Password:</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            <button onClick={handleUpdate}>Update Profile</button>

            {/* Avatar Picker Floating */}
            {isAvatarShown && (
                <div className={styles.avatarPopup}>
                    <AvatarPicker onClose={() => setAvatarShown(false)} />
                </div>
            )}
        </div>
    );
}

export default ProfileDetails;
