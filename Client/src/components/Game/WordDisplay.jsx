import styles from './WordDisplay.module.css';

function WordDisplay({ word, length }) {
    let currentDisplay = word;

    for (let i = word.length; i < length; i++) {
        currentDisplay += '_';
    }

    return (
        <div className={styles.wrapper}>
            <b className={styles.word}>
                { currentDisplay }
            </b>
        </div>
    );
}

export default WordDisplay;