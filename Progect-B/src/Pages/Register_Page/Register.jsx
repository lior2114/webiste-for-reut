import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person,
  Email,
  Lock,
  Badge
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { UseUser } from '../../Contexts/UserContexts';
import { checkEmailAvailability } from '../../api/api';
import { useUi } from '../../Contexts/UiContext';
import styles from './Register.module.css';

export function Register() {
  const navigate = useNavigate();
  const { register, loading, error, clearError } = UseUser();
  const { language } = useUi();
  const t = (he, en) => (language === 'he' ? he : en);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    user_email: '',
    user_password: ''
  });
  
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [emailChecking, setEmailChecking] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateField = (name, value) => {
    switch (name) {
      case 'first_name':
        if (!value.trim()) return 'שם פרטי הוא שדה חובה';
        if (!/^[א-תa-zA-Z\s]+$/.test(value)) return 'שם פרטי יכול להכיל רק אותיות';
        return '';
      case 'last_name':
        if (!value.trim()) return 'שם משפחה הוא שדה חובה';
        if (!/^[א-תa-zA-Z\s]+$/.test(value)) return 'שם משפחה יכול להכיל רק אותיות';
        return '';
      case 'user_email':
        if (!value.trim()) return 'אימייל הוא שדה חובה';
        if (!emailRegex.test(value)) return 'פורמט אימייל לא תקין';
        return '';
      case 'user_password':
        if (!value) return 'סיסמה היא שדה חובה';
        if (value.length < 4) return 'סיסמה חייבת להיות לפחות 4 תווים';
        return '';
      default:
        return '';
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
    const fieldError = validateField(name, value);
    if (fieldError) setErrors(prev => ({ ...prev, [name]: fieldError }));
  };

  const checkEmail = async (email) => {
    if (!emailRegex.test(email)) return;
    setEmailChecking(true);
    try {
      const result = await checkEmailAvailability(email);
      if (result.Message === "email alredy exists in system") {
        setErrors(prev => ({ ...prev, user_email: 'אימייל זה כבר קיים במערכת' }));
      } else if (result.Message === "email not exists") {
        setErrors(prev => ({ ...prev, user_email: '' }));
      }
    } catch (error) {
      console.error('Error checking email:', error);
    } finally {
      setEmailChecking(false);
    }
  };

  React.useEffect(() => {
    if (formData.user_email && emailRegex.test(formData.user_email)) {
      const timeoutId = setTimeout(() => {
        checkEmail(formData.user_email);
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [formData.user_email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    try {
      await register(formData);
      navigate('/vacations');
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const isFormValid = () => {
    return Object.keys(formData).every(key => 
      formData[key].trim() && !errors[key]
    ) && !emailChecking;
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box className={styles.containerBox}>
        <Paper elevation={3} className={styles.paper}>
          <Typography component="h1" variant="h4" className={styles.title} color="primary.main">
            {t('הרשמה למערכת', 'Register')}
          </Typography>
          
          {error && (
            <Alert severity="error" className={styles.alert}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} className={styles.formBox}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="first_name"
              label={t('שם פרטי', 'First name')}
              name="first_name"
              autoComplete="given-name"
              autoFocus
              value={formData.first_name}
              onChange={handleInputChange}
              error={!!errors.first_name}
              helperText={errors.first_name}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="action" />
                  </InputAdornment>
                ),
              }}
              InputLabelProps={{ shrink: true }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="last_name"
              label={t('שם משפחה', 'Last name')}
              name="last_name"
              autoComplete="family-name"
              value={formData.last_name}
              onChange={handleInputChange}
              error={!!errors.last_name}
              helperText={errors.last_name}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Badge color="action" />
                  </InputAdornment>
                ),
              }}
              InputLabelProps={{ shrink: true }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="user_email"
              label={t('אימייל', 'Email')}
              name="user_email"
              autoComplete="email"
              type="email"
              value={formData.user_email}
              onChange={handleInputChange}
              error={!!errors.user_email}
              helperText={errors.user_email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
                endAdornment: emailChecking && (
                  <InputAdornment position="end">
                    <CircularProgress size={20} />
                  </InputAdornment>
                ),
              }}
              InputLabelProps={{ shrink: true }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="user_password"
              label={t('סיסמה', 'Password')}
              type={showPassword ? 'text' : 'password'}
              id="user_password"
              autoComplete="new-password"
              value={formData.user_password}
              onChange={handleInputChange}
              error={!!errors.user_password}
              helperText={errors.user_password}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              InputLabelProps={{ shrink: true }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              className={styles.submitBtn}
              disabled={loading || !isFormValid()}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                t('הרשמה', 'Register')
              )}
            </Button>
            
            <Button
              fullWidth
              variant="text"
              onClick={() => navigate('/login')}
              className={styles.linkBtn}
            >
              {t('כבר יש לך חשבון? התחבר כאן', 'Already have an account? Login here')}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}


