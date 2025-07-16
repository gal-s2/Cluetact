import styles from "./Button.module.css";

function Button({ children, type, disabled, onClick }) {
    return (
        <button className={`${styles.customButton} ${disabled ? styles["disabled"] : styles[type]}`} onClick={onClick} disabled={disabled}>
            {children}
        </button>
    );
}

export default Button;
