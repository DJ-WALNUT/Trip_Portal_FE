import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ requiredRole }) => {
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  const role = localStorage.getItem('adminRole');

  if (!isAdmin) return <Navigate to="/admin" replace />;
  
  // 특정 권한이 필요한 페이지인데 권한이 안 맞을 경우
  if (requiredRole && role !== requiredRole) {
    alert("접근 권한이 없습니다.");
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Outlet />;
};