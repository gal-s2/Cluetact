import Button from "../UI/Button/Button";
import styles from "./Lobby.module.css";

export default function DropdownCard({ isOpen, setIsOpen, buttonLabel, buttonColor = "light-blue", menuItems = [] }) {
    return (
        <div className={styles.card}>
            <Button color={buttonColor} onClick={setIsOpen}>
                {buttonLabel}
            </Button>

            {isOpen && (
                <div className={styles.dropdown} role="menu">
                    {menuItems.map((item, index) => (
                        <button key={index} onClick={item.onClick} role="menuitem">
                            {item.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
