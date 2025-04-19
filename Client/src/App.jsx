import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AuthForm from "./components/Auth/AuthForm";
import NotFoundPage from "./components/Routes/NotFoundPage";
import GameRoom from "./components/Game/GameRoom";
import Lobby from "./components/Lobby/Lobby";
import PrivateRoute from "./components/Routes/PrivateRoute";
import PublicRoute from "./components/Routes/PublicRoute";
import WelcomePage from "./components/Welcome/WelcomePage";

function App() {
    return (
        <Router>
            <Routes>
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
                    path="*" 
                    element={<NotFoundPage />}
                />
            </Routes>
        </Router>
    )
}

export default App;