// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LoginPage } from './components/auth/LoginPage';

// Tema por defecto de Material UI
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// Componente de Dashboard (placeholder por ahora)
const DashboardPage = () => (
  <div style={{ padding: '2rem' }}>
    <h1>Dashboard</h1>
    <p>Bienvenido al sistema de gestión médica</p>
  </div>
);

// Componente de Registro (placeholder por ahora)
const SignUpPage = () => (
  <div style={{ padding: '2rem' }}>
    <h1>Registro</h1>
    <p>Página de registro de usuarios</p>
  </div>
);

// Componente de Recuperar Contraseña (placeholder por ahora)
const ForgotPasswordPage = () => (
  <div style={{ padding: '2rem' }}>
    <h1>Recuperar Contraseña</h1>
    <p>Página para recuperar contraseña</p>
  </div>
);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Ruta por defecto redirige a login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Ruta de login */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Ruta de dashboard (protegida - por ahora pública) */}
          <Route path="/dashboard" element={<DashboardPage />} />
          
          {/* Ruta de registro */}
          <Route path="/signup" element={<SignUpPage />} />
          
          {/* Ruta de recuperar contraseña */}
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          
          {/* Ruta 404 */}
          <Route path="*" element={
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <h1>404 - Página no encontrada</h1>
              <p>La página que buscas no existe.</p>
            </div>
          } />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;