import { createContext, useContext, useState, useEffect } from "react";
import socket from "@services/socket";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUserState] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!loading && user) {
            //console.log("[UserContext] User loaded, connecting socket...");
            //console.log("Token in localStorage (connecting socket):", localStorage.getItem("token"));
            socket.auth = { token: localStorage.getItem("token") };
            //console.log("Calling socket.connect() with auth:", socket.auth);
            socket.connect();
        }
    }, [loading, user]);

    // Load user from localStorage on first render
    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");
        if (storedUser && token) {
            setUserState(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    // Wrap setUser to also store in localStorage
    const setUser = (userData) => {
        console.log("set user updated data:", userData);
        if (userData && userData.user) {
            localStorage.setItem("token", userData.token);
            localStorage.setItem("user", JSON.stringify(userData.user));
            setUserState(userData.user);
        } else {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setUserState(null);
        }
    };

    return <UserContext.Provider value={{ user, setUser, loading }}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext(UserContext);
