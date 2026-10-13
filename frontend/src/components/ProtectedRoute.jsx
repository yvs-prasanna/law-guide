import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ user, loading, children }) {
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <div className="spinner" />
        <p style={{ color: 'var(--text-light)', marginTop: '1rem' }}>Checking authorization credentials...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
