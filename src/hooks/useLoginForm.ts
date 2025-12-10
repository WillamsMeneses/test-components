// src/hooks/useLoginForm.ts
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useState } from 'react';

export interface LoginFormValues {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface UseLoginFormProps {
  initialEmail?: string;
  onSuccess?: (values: LoginFormValues) => void;
  onError?: (error: string) => void;
}

export const useLoginForm = ({
  initialEmail = '',
  onSuccess,
  onError
}: UseLoginFormProps = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Correo electrónico inválido')
      .matches(
        /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        'Correo electrónico inválido'
      )
      .required('El correo electrónico es requerido'),
    password: Yup.string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .matches(/[a-z]/, 'Debe contener al menos una minúscula')
      .matches(/[A-Z]/, 'Debe contener al menos una mayúscula')
      .matches(/[0-9]/, 'Debe contener al menos un número')
      .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Debe contener al menos un carácter especial')
      .required('La contraseña es requerida'),
    rememberMe: Yup.boolean()
  });

  const formik = useFormik<LoginFormValues>({
    initialValues: {
      email: initialEmail,
      password: '',
      rememberMe: false
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        // Simular llamada a API
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Aquí iría la llamada real a tu API
        // const response = await authService.login(values);

        if (onSuccess) {
          onSuccess(values);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error en el login';
        if (onError) {
          onError(errorMessage);
        }
        formik.setFieldError('password', errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
  });

  return {
    formik,
    isLoading,
    validationSchema
  };
};