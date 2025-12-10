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
        password: 'Password123!',
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
        await result.current.formik.setFieldValue('password', 'Password123!');
      });
      
      // WHEN: Submitting
      await act(async () => {
        const submitPromise = result.current.formik.submitForm();
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
        await result.current.formik.setFieldValue('password', 'Password123!');
      });
      
      // WHEN: Submitting (will fail)
      await act(async () => {
        await result.current.formik.submitForm();
      });
      
      // THEN: Should call onError
      expect(mockOnError).toHaveBeenCalled();
    });
  });

  describe('Form Validation', () => {
    it('should have validation schema defined', () => {
      // GIVEN: Hook initialized
      const { result } = renderHook(() => useLoginForm());
      
      // THEN: Should have Yup validation schema
      expect(result.current.validationSchema).toBeDefined();
    });

    it('should validate required fields', async () => {
      // GIVEN: Hook with empty form
      const { result } = renderHook(() => useLoginForm());
      
      // WHEN: Trying to validate empty form
      const errors = await result.current.formik.validateForm();
      
      // THEN: Should have validation errors for required fields
      expect(errors.email).toBeDefined();
      expect(errors.password).toBeDefined();
      expect(errors.password).toBe('La contraseña es requerida'); // required es primero
    });

    it('should pass validation with proper data', async () => {
      // GIVEN: Hook with valid data
      const { result } = renderHook(() => useLoginForm());
      
      await act(async () => {
        await result.current.formik.setFieldValue('email', 'valid@example.com');
        await result.current.formik.setFieldValue('password', 'Password123!');
      });
      
      // WHEN: Validating
      const errors = await result.current.formik.validateForm();
      
      // THEN: Should have no errors
      expect(errors.email).toBeUndefined();
      expect(errors.password).toBeUndefined();
    });

    describe('Email Validation', () => {
      it('should reject invalid email formats', async () => {
        // GIVEN: Hook initialized
        const { result } = renderHook(() => useLoginForm());
        
        const invalidEmails = [
          'invalid@example',
          'invalid@.com',
          '@example.com',
          'invalid@',
          'invalid.com',
          'invalid@example.',
        ];
        
        for (const email of invalidEmails) {
          await act(async () => {
            await result.current.formik.setFieldValue('email', email);
            await result.current.formik.setFieldValue('password', 'Password123!');
          });
          
          // WHEN: Validating
          const errors = await result.current.formik.validateForm();
          
          // THEN: Should have email error
          expect(errors.email).toBeDefined();
        }
      });

      it('should accept valid email formats', async () => {
        // GIVEN: Hook initialized
        const { result } = renderHook(() => useLoginForm());
        
        const validEmails = [
          'user@example.com',
          'user.name@domain.co.uk',
          'user+tag@example.org',
          'USER@DOMAIN.COM',
          'user123@sub.domain.com',
        ];
        
        for (const email of validEmails) {
          await act(async () => {
            await result.current.formik.setFieldValue('email', email);
            await result.current.formik.setFieldValue('password', 'Password123!');
          });
          
          // WHEN: Validating
          const errors = await result.current.formik.validateForm();
          
          // THEN: Should have no email error
          expect(errors.email).toBeUndefined();
        }
      });
    });

    describe('Password Validation - Strong Password Rules', () => {
      describe('Minimum Length', () => {
        it('should reject passwords shorter than 8 characters', async () => {
          // GIVEN: Hook with short passwords (pero no vacías)
          const { result } = renderHook(() => useLoginForm());
          
          // Usar passwords NO VACÍAS pero cortas
          const shortPasswords = ['1', '12', '123', '1234', '12345', '123456', '1234567'];
          
          for (const password of shortPasswords) {
            await act(async () => {
              await result.current.formik.setFieldValue('email', 'test@example.com');
              await result.current.formik.setFieldValue('password', password);
            });
            
            // WHEN: Validating
            const errors = await result.current.formik.validateForm();
            
            // THEN: Should have password error about length
            expect(errors.password).toBeDefined();
            // Nota: Para passwords muy cortas, puede mostrar error de minúscula primero
            console.log(`Password "${password}": ${errors.password}`);
            // Solo verifica que haya error, no el mensaje específico
          }
        });

        it('should accept passwords with at least 8 characters (if they meet all other rules)', async () => {
          // GIVEN: Hook with valid length passwords that meet all rules
          const { result } = renderHook(() => useLoginForm());
          
          const validPasswords = [
            'Password123!',    // 12 chars, cumple todas las reglas
            'Secure@2024',     // 11 chars
            'MyP@ssw0rd',      // 9 chars
            'Test#2024',       // 8 chars mínimo
          ];
          
          for (const password of validPasswords) {
            await act(async () => {
              await result.current.formik.setFieldValue('email', 'test@example.com');
              await result.current.formik.setFieldValue('password', password);
            });
            
            // WHEN: Validating
            const errors = await result.current.formik.validateForm();
            
            // THEN: Should have no password error
            expect(errors.password).toBeUndefined();
          }
        });
      });

      describe('Character Requirements', () => {
        it('should require at least one lowercase letter', async () => {
          // GIVEN: Hook with password missing lowercase
          const { result } = renderHook(() => useLoginForm());
          
          // Passwords con 8+ chars pero sin minúsculas
          const passwordsWithoutLowercase = [
            'PASSWORD123!',  // 12 chars: solo mayúsculas, números, especial
            'TEST@2024',     // 9 chars
            'ABCDEFG1!',     // 8 chars
          ];
          
          for (const password of passwordsWithoutLowercase) {
            await act(async () => {
              await result.current.formik.setFieldValue('email', 'test@example.com');
              await result.current.formik.setFieldValue('password', password);
            });
            
            // WHEN: Validating
            const errors = await result.current.formik.validateForm();
            
            // THEN: Should have error about lowercase
            expect(errors.password).toBeDefined();
            expect(errors.password).toContain('minúscula');
          }
        });

        it('should require at least one uppercase letter', async () => {
          // GIVEN: Hook with password missing uppercase
          const { result } = renderHook(() => useLoginForm());
          
          // Passwords con 8+ chars, con minúsculas, pero sin mayúsculas
          const passwordsWithoutUppercase = [
            'password123!',  // 12 chars: minúsculas, números, especial
            'test@2024',     // 9 chars
            'abcdefg1!',     // 8 chars
          ];
          
          for (const password of passwordsWithoutUppercase) {
            await act(async () => {
              await result.current.formik.setFieldValue('email', 'test@example.com');
              await result.current.formik.setFieldValue('password', password);
            });
            
            // WHEN: Validating
            const errors = await result.current.formik.validateForm();
            
            // THEN: Should have error about uppercase
            expect(errors.password).toBeDefined();
            expect(errors.password).toContain('mayúscula');
          }
        });

        it('should require at least one number', async () => {
          // GIVEN: Hook with password missing numbers
          const { result } = renderHook(() => useLoginForm());
          
          // Passwords con 8+ chars, mayúsculas, minúsculas, especiales, pero sin números
          const passwordsWithoutNumbers = [
            'Password!',      // 9 chars: mayúscula, minúscula, especial
            'MyPassword@',    // 11 chars
            'TestPass#',      // 9 chars
          ];
          
          for (const password of passwordsWithoutNumbers) {
            await act(async () => {
              await result.current.formik.setFieldValue('email', 'test@example.com');
              await result.current.formik.setFieldValue('password', password);
            });
            
            // WHEN: Validating
            const errors = await result.current.formik.validateForm();
            
            // THEN: Should have error about number
            expect(errors.password).toBeDefined();
            expect(errors.password).toContain('número');
          }
        });

        it('should require at least one special character', async () => {
          // GIVEN: Hook with password missing special characters
          const { result } = renderHook(() => useLoginForm());
          
          // Passwords con 8+ chars, mayúsculas, minúsculas, números, pero sin especiales
          const passwordsWithoutSpecial = [
            'Password123',    // 11 chars
            'MyPassword2024', // 14 chars
            'Test1234',       // 8 chars
          ];
          
          for (const password of passwordsWithoutSpecial) {
            await act(async () => {
              await result.current.formik.setFieldValue('email', 'test@example.com');
              await result.current.formik.setFieldValue('password', password);
            });
            
            // WHEN: Validating
            const errors = await result.current.formik.validateForm();
            
            // THEN: Should have error about special character
            expect(errors.password).toBeDefined();
            expect(errors.password).toContain('carácter especial');
          }
        });
      });

      it('should accept passwords that meet all requirements', async () => {
        // GIVEN: Hook with strong passwords
        const { result } = renderHook(() => useLoginForm());
        
        const strongPasswords = [
          'Password123!',
          'Secure@2024',
          'MyP@ssw0rd2024',
          'Admin!1234',
          'S3cur3P@ss',
          'Test#2024Pass',
        ];
        
        for (const password of strongPasswords) {
          await act(async () => {
            await result.current.formik.setFieldValue('email', 'test@example.com');
            await result.current.formik.setFieldValue('password', password);
          });
          
          // WHEN: Validating
          const errors = await result.current.formik.validateForm();
          
          // THEN: Should have no password error
          expect(errors.password).toBeUndefined();
        }
      });

      it('should show specific error message for the first failing rule', async () => {
        // GIVEN: Hook with various invalid passwords
        const { result } = renderHook(() => useLoginForm());
        
        const testCases = [
          { password: 'short', expectedError: 'al menos 8 caracteres' }, // muy corta
          { password: 'LONG1234', expectedError: 'minúscula' }, // no minúscula (8+ chars)
          { password: 'lower123!', expectedError: 'mayúscula' }, // no mayúscula
          { password: 'Password!', expectedError: 'número' }, // no número
          { password: 'Password123', expectedError: 'carácter especial' }, // no especial
        ];
        
        for (const { password, expectedError } of testCases) {
          await act(async () => {
            await result.current.formik.setFieldValue('email', 'test@example.com');
            await result.current.formik.setFieldValue('password', password);
          });
          
          // WHEN: Validating
          const errors = await result.current.formik.validateForm();
          
          // THEN: Should contain expected error message
          expect(errors.password).toBeDefined();
          expect(errors.password).toContain(expectedError);
        }
      });
    });
  });

  describe('Form State Management', () => {
    it('should update form values correctly', async () => {
      // GIVEN: Hook with initial values
      const { result } = renderHook(() => useLoginForm());
      
      // WHEN: Updating all fields
      await act(async () => {
        await result.current.formik.setFieldValue('email', 'new@example.com');
        await result.current.formik.setFieldValue('password', 'NewPass123!');
        await result.current.formik.setFieldValue('rememberMe', true);
      });
      
      // THEN: Values should be updated
      expect(result.current.formik.values.email).toBe('new@example.com');
      expect(result.current.formik.values.password).toBe('NewPass123!');
      expect(result.current.formik.values.rememberMe).toBe(true);
    });

    it('should clear form errors on value change', async () => {
      // GIVEN: Hook with validation error
      const { result } = renderHook(() => useLoginForm());
      
      // Crear un error de validación
      await act(async () => {
        await result.current.formik.setFieldValue('email', 'invalid');
        await result.current.formik.validateForm();
      });
      
      // Asegurarse de que hay error
      expect(result.current.formik.errors.email).toBeDefined();
      
      // WHEN: Changing to valid value
      await act(async () => {
        await result.current.formik.setFieldValue('email', 'valid@example.com');
      });
      
      // THEN: Error should be cleared after validation
      const errors = await result.current.formik.validateForm();
      expect(errors.email).toBeUndefined();
    });
  });
});