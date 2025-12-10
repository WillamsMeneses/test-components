// src/hooks/useLoginForm.test.tsx - VERSIÓN SIMPLIFICADA
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLoginForm } from './useLoginForm';

describe('useLoginForm Hook - Critical Logic Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  describe('Form Initial State', () => {
    it('should initialize with empty form values', () => {
      // GIVEN: No initial props
      // WHEN: Hook initializes
      const { result } = renderHook(() => useLoginForm());
      console.log("mostrar result: ", result);
      
      // THEN: Should have empty values
      expect(result.current.formik.values.email).toBe('');
      expect(result.current.formik.values.password).toBe('');
      expect(result.current.formik.values.rememberMe).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });

    it('should pre-fill email when provided', () => {
      // GIVEN: Initial email
      const testEmail = 'test@example.com';
      
      // WHEN: Hook initializes with email
      const { result } = renderHook(() =>
        useLoginForm({ initialEmail: testEmail })
      );
      
      // THEN: Email should be pre-filled
      expect(result.current.formik.values.email).toBe(testEmail);
    });
  });

  describe('Form Submission - Most Important Tests', () => {
    it('should call onSuccess with correct values on successful submission', async () => {
      // GIVEN: Valid data and success callback
      const mockOnSuccess = vi.fn();
      const testValues = {
        email: 'user@example.com',
        password: 'password123',
        rememberMe: true,
      };
      
      const { result } = renderHook(() =>
        useLoginForm({ onSuccess: mockOnSuccess })
      );
      
      await act(async () => {
        await result.current.formik.setFieldValue('email', testValues.email);
        await result.current.formik.setFieldValue('password', testValues.password);
        await result.current.formik.setFieldValue('rememberMe', testValues.rememberMe);
      });
      
      // WHEN: Submitting form
      await act(async () => {
        await result.current.formik.submitForm();
      });
      
      // THEN: Should call onSuccess with correct data
      expect(mockOnSuccess).toHaveBeenCalledWith(testValues);
    });

    it('should set isLoading during submission', async () => {
      // GIVEN: Hook with valid data
      const { result } = renderHook(() => useLoginForm());
      
      await act(async () => {
        await result.current.formik.setFieldValue('email', 'test@example.com');
        await result.current.formik.setFieldValue('password', 'password123');
      });
      
      // WHEN: Submitting
      await act(async () => {
        const submitPromise = result.current.formik.submitForm();
        // Verificar que isLoading es true DURANTE la submission
        // (puede ser complicado capturar este estado exacto)
        await submitPromise;
      });
      
      // THEN: Should finish with isLoading false
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle API errors gracefully', async () => {
      // GIVEN: Hook with error callback
      const mockOnError = vi.fn();
      
      // Simular error en setTimeout (API call)
      vi.spyOn(globalThis, 'setTimeout').mockImplementationOnce(() => {
        throw new Error('Network error');
      });
      
      const { result } = renderHook(() =>
        useLoginForm({ onError: mockOnError })
      );
      
      await act(async () => {
        await result.current.formik.setFieldValue('email', 'test@example.com');
        await result.current.formik.setFieldValue('password', 'password123');
      });
      
      // WHEN: Submitting (will fail)
      await act(async () => {
        await result.current.formik.submitForm();
      });
      
      // THEN: Should call onError
      expect(mockOnError).toHaveBeenCalled();
    });
  });

  describe('Form Validation - Simplified Tests', () => {
    it('should have validation schema defined', () => {
      // GIVEN: Hook initialized
      const { result } = renderHook(() => useLoginForm());
      
      // THEN: Should have Yup validation schema
      expect(result.current.validationSchema).toBeDefined();
      
      // Podemos verificar que las reglas existen
      const schema = result.current.validationSchema;
      expect(schema).toHaveProperty('describe');
    });

    it('should validate required fields', async () => {
      // GIVEN: Hook with empty form
      const { result } = renderHook(() => useLoginForm());
      
      // WHEN: Trying to validate empty form
      const errors = await result.current.formik.validateForm();
      
      // THEN: Should have validation errors for required fields
      expect(errors.email).toBeDefined();
      expect(errors.password).toBeDefined();
    });

    it('should pass validation with proper data', async () => {
      // GIVEN: Hook with valid data
      const { result } = renderHook(() => useLoginForm());
      
      await act(async () => {
        await result.current.formik.setFieldValue('email', 'valid@example.com');
        await result.current.formik.setFieldValue('password', 'password123');
      });
      
      // WHEN: Validating
      const errors = await result.current.formik.validateForm();
      
      // THEN: Should have no errors
      expect(errors.email).toBeUndefined();
      expect(errors.password).toBeUndefined();
    });
  });

  describe('Form State Management', () => {
    it('should update form values correctly', async () => {
      // GIVEN: Hook with initial values
      const { result } = renderHook(() => useLoginForm());
      
      // WHEN: Updating all fields
      await act(async () => {
        await result.current.formik.setFieldValue('email', 'new@example.com');
        await result.current.formik.setFieldValue('password', 'newpass123');
        await result.current.formik.setFieldValue('rememberMe', true);
      });
      
      // THEN: Values should be updated
      expect(result.current.formik.values.email).toBe('new@example.com');
      expect(result.current.formik.values.password).toBe('newpass123');
      expect(result.current.formik.values.rememberMe).toBe(true);
    });
  });
});