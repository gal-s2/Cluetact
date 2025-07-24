import { Navigate } from "react-router-dom";
import { useUser } from "../../../contexts/UserContext";
import Spinner from "../Spinner/Spinner";

function PrivateRoute({ children, requireAdmin = false }) {
    const { user, loading } = useUser();

    if (loading) return <Spinner />;

    if (!user) {
        return <Navigate to="/" replace />;
    }

    if (requireAdmin && !user.isAdmin) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
}

export default PrivateRoute;
