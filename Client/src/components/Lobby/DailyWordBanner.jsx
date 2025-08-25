// Client: components/Lobby/DailyWordBanner.jsx
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
                const { data } = await axios.get(`${baseUrl}/api/daily-word`);
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
                <div className={styles.fallback}>
                    📚 Daily Word currently unavailable — check console for
                    details
                </div>
            </div>
        );
    }

    // Build the single line of scrolling text
    const scrollingText = `📚 Word of the Day: ${wordData.word} (${wordData.partOfSpeech}) — ${wordData.meaning} • Etymology: ${wordData.origin} • Pronunciation: /${wordData.pronunciation}/`;

    return (
        <div className={styles.banner}>
            {/* Only adds scrolling behavior; outer .banner keeps your original style */}
            <div
                className={styles.track}
                style={{ "--speed": "18s", "--gap": "2rem" }} // tweak speed/gap as you like
            >
                <span className={styles.item}>{scrollingText}</span>
                {/* Duplicate once for seamless wrap */}
                <span className={styles.item} aria-hidden="true">
                    {scrollingText}
                </span>
            </div>
        </div>
    );
};

export default DailyWordBanner;
