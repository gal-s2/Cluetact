import styles from "./Button.module.css";

function Button({ children, style, onClick }) {
    return (
        <button className={`${styles.customButton} ${styles[style]}`} onClick={onClick}>
            {children}
        </button>
    );
}

export default Button;
