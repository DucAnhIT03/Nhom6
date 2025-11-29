import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Component bảo vệ route - chỉ cho phép truy cập khi đã đăng nhập và có quyền phù hợp
 * @param {React.ReactNode} children - Component con cần được bảo vệ
 * @param {Array<string>} allowedRoles - Danh sách role được phép truy cập (optional)
 */
const ProtectedRoute = ({ children, allowedRoles = null }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  // Hiển thị loading khi đang kiểm tra authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Nếu chưa đăng nhập, redirect về trang login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Kiểm tra role nếu có yêu cầu
  if (allowedRoles && user) {
    const userRoles = user.roles || [];
    const hasRole = userRoles.some(r => {
      const roleName = typeof r === 'string' ? r : r.roleName;
      return allowedRoles.includes(roleName);
    });

    if (!hasRole) {
      // Nhân viên chỉ có thể truy cập trang seat-status-monitor
      if (location.pathname !== '/admin/seat-status-monitor') {
        return <Navigate to="/admin/seat-status-monitor" replace />;
      }
      return <Navigate to="/login" replace />;
    }
  }

  // Nếu đã đăng nhập và có quyền, render children
  return <>{children}</>;
};

export default ProtectedRoute;


