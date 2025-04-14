import styles from './Spinner.module.css';

function Spinner() {
    return (
        <div className={styles.spinner}>
            <div className={styles.ring}>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
        </div>
    )
}

export default Spinner;