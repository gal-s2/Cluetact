import { Navigate } from "react-router-dom";
import { useUser } from "../../../contexts/UserContext";
import Spinner from "../Spinner/Spinner";

function PrivateRoute({ children }) {
    const { user, loading } = useUser();

    if (loading) return <Spinner />;
    return user ? children : <Navigate to="/" replace />;
}

export default PrivateRoute;
