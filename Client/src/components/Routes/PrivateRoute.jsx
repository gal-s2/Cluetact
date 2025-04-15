import { Navigate } from "react-router-dom";
import { useUser } from "../UserContext";
import Spinner from "./Spinner";

function PrivateRoute({ children }) {
    const { user, loading } = useUser();

    if (loading) return <Spinner />
    return user ? children : <Navigate to="/login" replace />;
}

export default PrivateRoute;