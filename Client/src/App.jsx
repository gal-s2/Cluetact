import { useState } from "react";
import WelcomePage from "./pages/WelcomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

export default function App() {
  const [currentPage, setCurrentPage] = useState("welcome");

  return (
    <div>
      {currentPage === "welcome" && <WelcomePage onNavigate={setCurrentPage} />}
      {currentPage === "login" && <LoginPage onNavigate={setCurrentPage} />}
      {currentPage === "register" && <RegisterPage onNavigate={setCurrentPage} />}
    </div>
  );
}
