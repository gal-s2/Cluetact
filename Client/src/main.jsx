import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { UserProvider } from "./contexts/UserContext.jsx";
import { GlobalNotificationProvider } from "./contexts/GlobalNotificationContext.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";

createRoot(document.getElementById("root")).render(
    //<StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <GlobalNotificationProvider>
            <UserProvider>
                <App />
            </UserProvider>
        </GlobalNotificationProvider>
    </GoogleOAuthProvider>
    //</StrictMode>
);
