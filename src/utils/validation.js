import { AppConstants } from './constants';

// Utilidades de validación (como en tu app Flutter)
export const ValidationUtils = {
  // Validar email con regex
  validateEmail: (email) => {
    if (!email || !email.trim()) {
      return AppConstants.validationMessages.emailRequired;
    }
    if (!AppConstants.emailRegex.test(email)) {
      return AppConstants.validationMessages.emailInvalid;
    }
    return null;
  },

  // Validar nombre (como en CustomTextField de Flutter)
  validateName: (name, fieldName = 'nombre') => {
    if (!name || !name.trim()) {
      return fieldName === 'apellido' 
        ? AppConstants.validationMessages.lastNameRequired 
        : AppConstants.validationMessages.nameRequired;
    }
    if (name.length < AppConstants.nameMinLength) {
      return fieldName === 'apellido' 
        ? AppConstants.validationMessages.lastNameTooShort 
        : AppConstants.validationMessages.nameTooShort;
    }
    return null;
  },

  // Validar contraseña
  validatePassword: (password) => {
    if (!password) {
      return AppConstants.validationMessages.passwordRequired;
    }
    if (password.length < AppConstants.minPasswordLength) {
      return AppConstants.validationMessages.passwordTooShort;
    }
    return null;
  },

  // Validar confirmación de contraseña
  validatePasswordConfirmation: (password, confirmPassword) => {
    if (!confirmPassword) {
      return AppConstants.validationMessages.passwordRequired;
    }
    if (password !== confirmPassword) {
      return AppConstants.validationMessages.passwordsNoMatch;
    }
    return null;
  },

  // Validar formulario completo
  validateLoginForm: (email, password) => {
    const errors = {};
    
    const emailError = ValidationUtils.validateEmail(email);
    if (emailError) errors.email = emailError;
    
    const passwordError = ValidationUtils.validatePassword(password);
    if (passwordError) errors.password = passwordError;
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  // Validar formulario de registro
  validateRegisterForm: (formData) => {
    const errors = {};
    
    const firstNameError = ValidationUtils.validateName(formData.firstName, 'nombre');
    if (firstNameError) errors.firstName = firstNameError;
    
    const lastNameError = ValidationUtils.validateName(formData.lastName, 'apellido');
    if (lastNameError) errors.lastName = lastNameError;
    
    const emailError = ValidationUtils.validateEmail(formData.email);
    if (emailError) errors.email = emailError;
    
    const passwordError = ValidationUtils.validatePassword(formData.password);
    if (passwordError) errors.password = passwordError;
    
    const confirmPasswordError = ValidationUtils.validatePasswordConfirmation(
      formData.password, 
      formData.confirmPassword
    );
    if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;
    
    if (!formData.acceptTerms) {
      errors.terms = AppConstants.validationMessages.termsRequired;
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
};

