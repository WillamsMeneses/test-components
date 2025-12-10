// src/components/auth/LoginPage.tsx
import React from 'react';
import { Container, Box, Alert, Typography } from '@mui/material';
import { LoginForm } from './LoginForm';
import type { LoginFormValues } from '../../hooks/useLoginForm';

export const LoginPage: React.FC = () => {
  const handleLoginSuccess = (values: LoginFormValues) => {
    console.log('Login exitoso:', values);
    // Aquí redirigirías al usuario
    // navigate('/dashboard');
  };

  const handleForgotPassword = () => {
    console.log('Olvidé mi contraseña');
    // navigate('/forgot-password');
  };

  const handleSignUp = () => {
    console.log('Ir a registro');
    // navigate('/signup');
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          py: 4
        }}
      >
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Mi Aplicación
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Sistema de gestión médica
          </Typography>
        </Box>

        <LoginForm
          onLoginSuccess={handleLoginSuccess}
          onForgotPassword={handleForgotPassword}
          onSignUp={handleSignUp}
        />

        <Alert 
          severity="info" 
          sx={{ mt: 4 }}
          data-testid="demo-alert"
        >
          <strong>Demo:</strong> Usa cualquier email válido y contraseña de al menos 6 caracteres
        </Alert>
      </Box>
    </Container>
  );
};

export default LoginPage;