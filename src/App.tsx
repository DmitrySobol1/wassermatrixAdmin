import { Navigate, Route, Routes, HashRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { routes } from './navigations/routes.tsx';

export function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          {routes.map((route) => (
            <Route 
              key={route.path} 
              path={route.path} 
              element={route.element || (route.Component ? <route.Component /> : null)} 
            />
          ))}
          <Route path="*" element={<Navigate to="/signin" />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}
