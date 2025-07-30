import styles from "./Button.module.css";

function Button({ children, color, disabled, onClick, ...rest }) {
    return (
        <button className={`${styles.customButton} ${disabled ? styles["disabled"] : styles[color]}`} onClick={onClick} disabled={disabled} {...rest}>
            {children}
        </button>
    );
}

export default Button;
