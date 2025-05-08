import React, { useState } from 'react';
import { AccountsApi } from '../api/apis/accounts-api';
import { UserRegistration } from '../api/models/user-registration';
import './RegistrationForm.css';
import ResendVerification from './ResendVerification';

const RegistrationForm = () => {
  const [formData, setFormData] = useState<UserRegistration>({
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password2: ''
  });

  const [errors, setErrors] = useState<Partial<UserRegistration & { general?: string }>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<UserRegistration> = {};
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter';
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one number';
    }
    
    if (formData.password !== formData.password2) {
      newErrors.password2 = 'Passwords do not match';
    }
    
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }
    
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const api = new AccountsApi();
      await api.accountsRegisterCreate(formData);
      setSuccess(true);
    } catch (err: any) {
      if (err.response?.data) {
        // Handle field-specific errors (e.g. email exists)
        if (err.response.data.email) {
          setErrors({
            ...errors,
            email: err.response.data.email[0] // "user with this email already exists."
          });
        }
        // Handle other potential field errors here
      } else {
        setErrors({
          general: 'Registration failed. Please try again later.'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="success-message">
        <h2>Registration Successful!</h2>
        <p>Please check your email to verify your account.</p>
        <ResendVerification defaultEmail={formData.email} />
      </div>
    );
  }

  return (
    
    <form onSubmit={handleSubmit} className="registration-form">
      <h2>Create Account</h2>
      <p className="form-subtitle">Join our community today</p>
      
      {errors.general && (
        <div className="error-message">
          <span className="error-icon">⚠️</span> {errors.general}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="email">Email Address</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={errors.email ? 'error' : ''}
          autoFocus
        />
        {errors.email && <span className="field-error">{errors.email}</span>}
      </div>

      <div className="name-fields">
        <div className="form-group">
          <label htmlFor="first_name">First Name</label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            className={errors.first_name ? 'error' : ''}
          />
          {errors.first_name && <span className="field-error">{errors.first_name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="last_name">Last Name</label>
          <input
            type="text"
            id="last_name"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            className={errors.last_name ? 'error' : ''}
          />
          {errors.last_name && <span className="field-error">{errors.last_name}</span>}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <div className="password-input-container">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={errors.password ? 'error' : ''}
          />
          <button
            type="button"
            className="show-password-btn"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>
        {errors.password ? (
          <span className="field-error">{errors.password}</span>
        ) : (
          <div className="password-hints">
            <span className={formData.password.length >= 8 ? 'valid' : ''}>• 8+ characters</span>
            <span className={/[A-Z]/.test(formData.password) ? 'valid' : ''}>• Uppercase</span>
            <span className={/[0-9]/.test(formData.password) ? 'valid' : ''}>• Number</span>
          </div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="password2">Confirm Password</label>
        <input
          type={showPassword ? "text" : "password"}
          id="password2"
          name="password2"
          value={formData.password2}
          onChange={handleChange}
          className={errors.password2 ? 'error' : ''}
        />
        {errors.password2 && <span className="field-error">{errors.password2}</span>}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={`submit-btn ${isLoading ? 'loading' : ''}`}
      >
        {isLoading ? (
          <>
            <span className="spinner"></span> Processing...
          </>
        ) : (
          'Create Account'
        )}
      </button>

      <div className="login-link">
        Already have an account? <a href="/login">Sign in</a>
      </div>
    </form>
    
    
  );
};

export default RegistrationForm;