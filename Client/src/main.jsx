import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { UserProvider } from "./contexts/UserContext.jsx";
import { GlobalNotificationProvider } from "./contexts/GlobalNotificationContext.jsx";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <GlobalNotificationProvider>
            <UserProvider>
                <App />
            </UserProvider>
        </GlobalNotificationProvider>
    </StrictMode>
);
