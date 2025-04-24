// client/src/components/Profile/ProfileDetails.jsx
import { useUser } from "../UserContext";
import { useState } from "react";
import styles from "./ProfileDetails.module.css";

function ProfileDetails() {
    const { user } = useUser();
    const [email, setEmail] = useState(user.email || "");
    const [password, setPassword] = useState("");

    const handleUpdate = () => {
        // TODO: שלח לשרת עדכון פרטי משתמש
        alert("Update sent!");
    };

    return (
        <div className={styles.container}>
            <h2>Profile Details</h2>
            <img
                src={user.avatarUrl || "/path/to/default-avatar.png"}
                alt="Avatar"
                className={styles.avatar}
            />
            <div className={styles.field}>
                <label>Email:</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div className={styles.field}>
                <label>New Password:</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            <button onClick={handleUpdate}>Update Profile</button>
        </div>
    );
}

export default ProfileDetails;
