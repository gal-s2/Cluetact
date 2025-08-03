import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useUser } from "@contexts/UserContext";
import PrivateRoute from "@components/Routes/PrivateRoute/PrivateRoute";
import PublicRoute from "@components/Routes/PublicRoute/PublicRoute";
import NotFoundPage from "@components/Routes/NotFoundPage/NotFoundPage";
import AuthForm from "@components/Auth/AuthForm/AuthForm";
import GameRoomWrapper from "@components/Game/GameRoomWrapper";
import Lobby from "@components/Lobby/Lobby";
import WelcomePage from "@components/Welcome/WelcomePage";
import StatsPage from "@components/Stats/StatsPage";
import ProfileDetails from "@components/Profile/ProfileDetails/ProfileDetails";
import WaitingRoom from "@components/WaitingRoom/WaitingRoom";
import useSocketNavigation from "@hooks/useSocketNavigation";
import Overwatch from "@components/Overwatch/Overwatch";
import GlobalNotificationBox from "@components/General/GlobalNotificationBox/GlobalNotificationBox";
import About from "@components/About/About";
import AdminRoute from "@components/Routes/AdminRoute/AdminRoute";
import Footer from "@components/General/Footer/Footer";
import SocketPageWrapper from "@components/Routes/SocketPageWrapper/SocketPageWrapper";

function App() {
    const { user } = useUser();

    return (
        <div className="appContainer">
            <Router>
                <AppRoutesWithSocketNavigation user={user} />
                <GlobalNotificationBox />
            </Router>
            <Footer />
        </div>
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
                path="*"
                element={
                    <PublicRoute>
                        <NotFoundPage />
                    </PublicRoute>
                }
            />

            <Route
                path="/lobby"
                element={
                    <PrivateRoute>
                        <SocketPageWrapper>
                            <Lobby />
                        </SocketPageWrapper>
                    </PrivateRoute>
                }
            />

            <Route
                path="/about"
                element={
                    <PublicRoute>
                        <About />
                    </PublicRoute>
                }
            />

            <Route
                path="/game/:roomId"
                element={
                    <PrivateRoute>
                        <SocketPageWrapper>
                            <GameRoomWrapper />
                        </SocketPageWrapper>
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

            <Route
                path="/waiting/:roomId"
                element={
                    <PrivateRoute>
                        <SocketPageWrapper>
                            <WaitingRoom />
                        </SocketPageWrapper>
                    </PrivateRoute>
                }
            />

            <Route
                path="/overwatch"
                element={
                    <AdminRoute>
                        <Overwatch />
                    </AdminRoute>
                }
            />
        </Routes>
    );
}

export default App;
