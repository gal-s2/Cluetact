import styles from "./Modal.module.css";

export default function Modal({ children, onClose, showCloseButton = false, className = "" }) {
    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={`${styles.modal} ${className}`} onClick={(e) => e.stopPropagation()}>
                {showCloseButton && (
                    <button className={styles.closeButton} onClick={onClose}>
                        &times;
                    </button>
                )}
                {children}
            </div>
        </div>
    );
}
