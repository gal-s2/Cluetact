import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AuthForm from "./components/Auth/AuthForm";
import NotFoundPage from "./components/NotFoundPage";
import GameRoom from "./components/Game/GameRoom";
import Lobby from "./components/Lobby/Lobby";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<AuthForm type="login" />} />
                <Route path="/register" element={<AuthForm type="register" />} />
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/lobby" element={<Lobby />} />
                <Route path="/game" element={<GameRoom /> } />
                <Route path="*" element={<NotFoundPage />}/>
            </Routes>
        </Router>
    )
}

export default App;