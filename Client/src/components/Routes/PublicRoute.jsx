import { Navigate } from "react-router-dom";
import { useUser } from "../UserContext";
import Spinner from "./Spinner";

function PublicRoute({ children }) {
    const { user, loading } = useUser();
    
    if (loading) return <Spinner />
    return user ? <Navigate to="/lobby" replace /> : children;
}

export default PublicRoute;