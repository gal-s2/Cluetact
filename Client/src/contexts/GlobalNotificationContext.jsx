import { createContext, useContext, useState, useEffect } from "react";

const GlobalNotificationContext = createContext();

export function GlobalNotificationProvider({ children }) {
    const [globalNotification, setGlobalNotification] = useState({ message: "", type: "notification" });
    const [showText, setShowText] = useState(false);

    useEffect(() => {
        if (globalNotification.message) {
            setShowText(true);
            const fadeTimer = setTimeout(() => setShowText(false), 4000);
            const clearTimer = setTimeout(() => {
                setGlobalNotification({ message: "", type: "notification" });
            }, 5000);
            return () => {
                clearTimeout(fadeTimer);
                clearTimeout(clearTimer);
            };
        } else {
            setShowText(false);
        }
    }, [globalNotification.message]);

    return <GlobalNotificationContext.Provider value={{ globalNotification, setGlobalNotification, showText }}>{children}</GlobalNotificationContext.Provider>;
}

export function useGlobalNotification() {
    return useContext(GlobalNotificationContext);
}
