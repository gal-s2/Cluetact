import { useState } from "react";
import styles from "./AvatarPicker.module.css";
import { avatarList } from "../../../utils/loadAvatars";

export default function AvatarPicker({ onAvatarSelect }) {
    const [selected, setSelected] = useState(null);

    const handleAvatarClick = (index) => {
        console.log(index);
        setSelected(index);
        if (onAvatarSelect) {
            onAvatarSelect(avatarList[index]);
        }
    };

    return (
        <div className={styles.avatarGrid}>
            {avatarList.map((src, index) => (
                <img key={index} src={src} alt={`Avatar ${index + 1}`} className={`${styles.avatar} ${selected === index ? styles.selected : ""}`} onClick={() => handleAvatarClick(index)} />
            ))}
        </div>
    );
}
