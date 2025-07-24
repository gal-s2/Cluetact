import PrivateRoute from "../PrivateRoute/PrivateRoute";

export default function AdminRoute({ children }) {
    return <PrivateRoute requireAdmin>{children}</PrivateRoute>;
}
