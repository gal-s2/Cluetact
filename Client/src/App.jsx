import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AuthForm from "./components/Auth/AuthForm";
import NotFoundPage from "./components/NotFoundPage";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<AuthForm type="login" />} />
                <Route path="/register" element={<AuthForm type="register" />} />
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="*" element={<NotFoundPage />}/>
            </Routes>
        </Router>
    )
}

export default App;