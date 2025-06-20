import React, { useState } from "react";
import styles from "./AvatarPicker.module.css";

// טוען את כל התמונות מהתיקייה
const images = import.meta.glob("../../../assets/avatars/*.png", { eager: true });
const avatarList = Object.values(images).map((mod) => mod.default);

export default function AvatarPicker({ onAvatarSelect }) {
    const [selected, setSelected] = useState(null);

    const handleAvatarClick = (index) => {
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
