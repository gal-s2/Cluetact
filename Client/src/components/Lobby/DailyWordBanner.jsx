import React, { useState, useEffect } from "react";
import axios from "axios";
import baseUrl from "@config/baseUrl";
import styles from "./DailyWordBanner.module.css";

const DailyWordBanner = () => {
    const [wordData, setWordData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDailyWord = async () => {
            try {
                // Fetch today's word
                const { data } = await axios.get(`${baseUrl}/daily-word`);
                if (data?.success) {
                    setWordData(data.data);
                } else {
                    setError("Failed to load daily word");
                }
            } catch (e) {
                setError("Failed to load daily word");
            } finally {
                setLoading(false);
            }
        };
        fetchDailyWord();
    }, []);

    if (loading) {
        return (
            <div className={styles.banner}>
                <div className={styles.fallback}>Loading today's word...</div>
            </div>
        );
    }

    if (error || !wordData) {
        return (
            <div className={styles.banner}>
                <div className={styles.fallback}>📚 Daily Word currently unavailable — check console for details</div>
            </div>
        );
    }

    const scrollingText = `📚 Word of the Day: ${wordData.word} (${wordData.partOfSpeech}) — ${wordData.meaning} • Etymology: ${wordData.origin} • Pronunciation: /${wordData.pronunciation}/`;

    return (
        <div className={styles.banner}>
            <div className={styles.track} style={{ "--speed": "30s", "--gap": "2rem" }}>
                <span className={styles.item}>{scrollingText}</span>
                <span className={styles.item} aria-hidden="true">
                    {scrollingText}
                </span>
            </div>
        </div>
    );
};

export default DailyWordBanner;
