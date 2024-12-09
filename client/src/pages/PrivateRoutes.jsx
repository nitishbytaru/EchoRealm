import { Navigate, Outlet } from "react-router-dom";

function PrivateRoutues({ user }) {
  return user ? <Outlet /> : <Navigate to="/" />;
}

export default PrivateRoutues;
