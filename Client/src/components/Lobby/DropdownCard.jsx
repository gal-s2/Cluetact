// DropdownCard.jsx
import Button from "@common/Button/Button";
import styles from "./Lobby.module.css";

export default function DropdownCard({
    isOpen,
    setIsOpen,
    buttonLabel,
    buttonColor = "light-blue",
    menuItems = [],
}) {
    return (
        <div className={`${styles.card} ${isOpen ? styles.cardOpen : ""}`}>
            <Button
                color={buttonColor}
                onClick={() => setIsOpen((o) => !o)} // ensure proper toggle
            >
                {buttonLabel}
            </Button>

            {isOpen && (
                <div className={styles.dropdown} role="menu" aria-expanded>
                    {menuItems.map((item, index) => (
                        <button
                            key={index}
                            onClick={item.onClick}
                            role="menuitem"
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
