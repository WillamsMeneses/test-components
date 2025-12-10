// src/components/auth/LoginForm.tsx
import React from 'react';
import {
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Box,
  Typography,
  Alert,
  Paper,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon
} from '@mui/icons-material';
import { useLoginForm, type LoginFormValues} from '../../hooks/useLoginForm';

export interface LoginFormProps {
  initialEmail?: string;
  onLoginSuccess?: (values: LoginFormValues) => void;
  onForgotPassword?: () => void;
  onSignUp?: () => void;
  testId?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  initialEmail = '',
  onLoginSuccess,
  onForgotPassword,
  onSignUp,
  testId = 'login-form'
}) => {
  const [showPassword, setShowPassword] = React.useState(false);
  
  const {
    formik,
    isLoading
  } = useLoginForm({
    initialEmail,
    onSuccess: onLoginSuccess
  });

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        maxWidth: 400, 
        margin: 'auto', 
        padding: 4,
        borderRadius: 2
      }}
      data-testid={testId}
    >
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom 
        align="center"
        data-testid="login-title"
      >
        Iniciar Sesión
      </Typography>

      <Typography 
        variant="body2" 
        color="textSecondary" 
        align="center" 
        sx={{ mb: 3 }}
      >
        Ingresa tus credenciales para continuar
      </Typography>

      <form onSubmit={formik.handleSubmit} noValidate>
        <TextField
          fullWidth
          id="email"
          name="email"
          label="Correo Electrónico"
          type="email"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.email && Boolean(formik.errors.email)}
          helperText={formik.touched.email && formik.errors.email}
          margin="normal"
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailIcon color="action" />
              </InputAdornment>
            ),
          }}
          disabled={isLoading}
          inputProps={{
            'data-testid': 'email-input'
          }}
        />

        <TextField
          fullWidth
          id="password"
          name="password"
          label="Contraseña"
          type={showPassword ? 'text' : 'password'}
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.password && Boolean(formik.errors.password)}
          helperText={formik.touched.password && formik.errors.password}
          margin="normal"
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleTogglePassword}
                  edge="end"
                  data-testid="toggle-password"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          disabled={isLoading}
          inputProps={{
            'data-testid': 'password-input'
          }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                id="rememberMe"
                name="rememberMe"
                checked={formik.values.rememberMe}
                onChange={formik.handleChange}
                color="primary"
                data-testid="remember-me-checkbox"
              />
            }
            label="Recordarme"
          />

          {onForgotPassword && (
            <Button
              type="button"
              onClick={onForgotPassword}
              sx={{ textTransform: 'none' }}
              disabled={isLoading}
              data-testid="forgot-password-button"
            >
              ¿Olvidaste tu contraseña?
            </Button>
          )}
        </Box>

        {formik.status && (
          <Alert 
            severity="error" 
            sx={{ mt: 2 }}
            data-testid="error-alert"
          >
            {formik.status}
          </Alert>
        )}

        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          disabled={isLoading || !formik.isValid}
          sx={{ mt: 3, mb: 2, py: 1.5 }}
          data-testid="submit-button"
        >
          {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </Button>

        {onSignUp && (
          <Box textAlign="center">
            <Typography variant="body2" color="textSecondary">
              ¿No tienes una cuenta?{' '}
              <Button
                type="button"
                onClick={onSignUp}
                sx={{ textTransform: 'none' }}
                disabled={isLoading}
                data-testid="signup-button"
              >
                Regístrate
              </Button>
            </Typography>
          </Box>
        )}
      </form>
    </Paper>
  );
};

export default LoginForm;