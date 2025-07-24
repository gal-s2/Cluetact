import { useState } from "react";
import styles from "./AvatarPicker.module.css";
import { avatarList } from "../../../utils/loadAvatars";

export default function AvatarPicker({ onAvatarSelect }) {
    const [selected, setSelected] = useState(null);

    const handleAvatarClick = (index) => {
        setSelected(index);
        onAvatarSelect(index);
    };

    return (
        <div className={styles.avatarGrid}>
            {Object.keys(avatarList).map((key) => (
                <img key={key} src={avatarList[key]} alt="Avatar" className={`${styles.avatar} ${selected === key ? styles.selected : ""}`} onClick={() => handleAvatarClick(key)} />
            ))}
        </div>
    );
}
