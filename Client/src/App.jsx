import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./components/Routes/PrivateRoute";
import PublicRoute from "./components/Routes/PublicRoute";
import NotFoundPage from "./components/Routes/NotFoundPage";
import AuthForm from "./components/Auth/AuthForm";
import GameRoom from "./components/Game/GameRoom";
import Lobby from "./components/Lobby/Lobby";
import WelcomePage from "./components/Welcome/WelcomePage";
import StatsPage from "./components/Statistics/StatsPage";
import ProfileDetails from "./components/Profile/ProfileDetails";
import WaitingRoom from "./components/WaitingRoom/WaitingRoom";
import { useUser } from "./components/UserContext";
import useSocketNavigation from "./hooks/useSocketNavigation";

// function App() {
//     const { user } = useUser();

//     return (
//         <Router>
//             <AppRoutesWithSocketNavigation user={user} />
//             <Routes key={user ? "logged-in" : "logged-out"}>
//                 <Route
//                     path="/login"
//                     element={
//                         <PublicRoute>
//                             <AuthForm type="login" />
//                         </PublicRoute>
//                     }
//                 />

//                 <Route
//                     path="/register"
//                     element={
//                         <PublicRoute>
//                             <AuthForm type="register" />
//                         </PublicRoute>
//                     }
//                 />

//                 <Route
//                     path="/"
//                     element={
//                         <PublicRoute>
//                             <WelcomePage />
//                         </PublicRoute>
//                     }
//                 />

//                 <Route
//                     path="/lobby"
//                     element={
//                         <PrivateRoute>
//                             <Lobby />
//                         </PrivateRoute>
//                     }
//                 />

//                 <Route
//                     path="/game/:roomId"
//                     element={
//                         <PrivateRoute>
//                             <GameRoom />
//                         </PrivateRoute>
//                     }
//                 />
//                 <Route
//                     path="/stats"
//                     element={
//                         <PrivateRoute>
//                             <StatsPage />
//                         </PrivateRoute>
//                     }
//                 />
//                 <Route
//                     path="/profile"
//                     element={
//                         <PrivateRoute>
//                             <ProfileDetails />
//                         </PrivateRoute>
//                     }
//                 />

//                 <Route path="*" element={<NotFoundPage />} />
//                 <Route path="/waiting/:roomId" element={<WaitingRoom />} />
//             </Routes>
//         </Router>
//     );
// }

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

            <Route path="*" element={<NotFoundPage />} />
            <Route path="/waiting/:roomId" element={<WaitingRoom />} />
        </Routes>
    );
}

export default App;
