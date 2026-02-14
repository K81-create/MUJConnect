import { Navigate, Outlet } from 'react-router-dom';
import { useAuth, UserRole } from '../../context/auth-context';

interface ProtectedRouteProps {
    allowedRoles?: UserRole[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        // Redirect to their appropriate dashboard if they try to access unauthorized route
        const dashboardMap: Record<UserRole, string> = {
            user: '/user/dashboard',
            stakeholder: '/stakeholder/dashboard',
            admin: '/admin/dashboard',
        };
        return <Navigate to={dashboardMap[user.role]} replace />;
    }

    return <Outlet />;
}
