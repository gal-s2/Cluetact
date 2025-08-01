import styles from "./Input.module.css";

function Input({ children, type = "text", color = "green", className = "", isInvalid = false, ...props }) {
    const inputClass = `
        ${styles.customInput} 
        ${styles[color]} 
        ${isInvalid ? styles.invalidInput : ""} 
        ${className}
    `.trim();

    // need to handle password visibility toggle - check error in className
    if (type === "password") {
        return (
            <div className={styles.passwordWrapper}>
                <input type={showPassword ? "text" : "password"} className={errors.password ? styles.invalidInput : ""} />
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className={styles.eyeIcon} onClick={() => setShowPassword((prev) => !prev)} />
            </div>
        );
    }

    return <input type={type} className={inputClass} {...props} />;
}

export default Input;
