import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PrivateRoute from "./components/Routes/PrivateRoute/PrivateRoute";
import PublicRoute from "./components/Routes/PublicRoute/PublicRoute";
import NotFoundPage from "./components/Routes/NotFoundPage/NotFoundPage";
import AuthForm from "./components/Auth/AuthForm/AuthForm";
import GameRoom from "./components/Game/GameRoom";
import Lobby from "./components/Lobby/Lobby";
import WelcomePage from "./components/Welcome/WelcomePage";
import StatsPage from "./components/Statistics/StatsPage";
import ProfileDetails from "./components/Profile/ProfileDetails/ProfileDetails";
import WaitingRoom from "./components/WaitingRoom/WaitingRoom";
import { useUser } from "./contexts/UserContext";
import useSocketNavigation from "./hooks/useSocketNavigation";
import Overwatch from "./components/Overwatch/Overwatch";

function App() {
    const { user } = useUser();

    return (
        <Router>
            <AppRoutesWithSocketNavigation user={user} />
        </Router>
    );
}

function AppRoutesWithSocketNavigation({ user }) {
    useSocketNavigation();

    return (
        <Routes key={user ? "logged-in" : "logged-out"}>
            <Route
                path="/login"
                element={
                    <PublicRoute>
                        <AuthForm type="login" />
                    </PublicRoute>
                }
            />

            <Route
                path="/register"
                element={
                    <PublicRoute>
                        <AuthForm type="register" />
                    </PublicRoute>
                }
            />

            <Route
                path="/"
                element={
                    <PublicRoute>
                        <WelcomePage />
                    </PublicRoute>
                }
            />

            <Route
                path="/lobby"
                element={
                    <PrivateRoute>
                        <Lobby />
                    </PrivateRoute>
                }
            />

            <Route
                path="/game/:roomId"
                element={
                    <PrivateRoute>
                        <GameRoom />
                    </PrivateRoute>
                }
            />
            <Route
                path="/stats"
                element={
                    <PrivateRoute>
                        <StatsPage />
                    </PrivateRoute>
                }
            />
            <Route
                path="/profile"
                element={
                    <PrivateRoute>
                        <ProfileDetails />
                    </PrivateRoute>
                }
            />
            <Route path="/overwatch" element={<Overwatch />} />

            <Route path="*" element={<NotFoundPage />} />
            <Route path="/waiting/:roomId" element={<WaitingRoom />} />
        </Routes>
    );
}

export default App;
