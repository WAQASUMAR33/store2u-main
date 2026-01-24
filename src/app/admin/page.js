'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

// MUI Imports
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  CircularProgress,
  FormControlLabel,
  Switch,
  InputAdornment,
  IconButton,
  Paper,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiUser, FiPhone, FiMapPin, FiCamera, FiArrowRight, FiArrowLeft, FiEye, FiEyeOff } from 'react-icons/fi';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phoneno: '',
    city: '',
    role: 'ADMIN',
    image: null,
    base64: '',
  });

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const userRole = localStorage.getItem('role');
      if (userRole === 'ADMIN') {
        router.push('/admin/pages/Main');
      } else if (userRole === 'CUSTOMER') {
        router.push('/customer/pages/login');
      }
    }
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/login', { email, password });
      if (response.data.success) {
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('role', user.role);

        if (user.role === 'ADMIN') {
          alert('Login Successfully');
          router.push('/admin/pages/Main');
        } else if (user.role === 'CUSTOMER') {
          alert('This ID exists for a customer');
          router.push('/customer/pages/login');
        } else {
          setError('Unknown role. Please contact support.');
        }
      } else {
        setError(response.data.message || 'Failed to log in. Please try again.');
      }
    } catch (error) {
      console.error('Error logging in:', error.message);
      setError('Failed to log in. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const uploadedImageUrl = await uploadImage(formData.base64);

      const formDataToSend = {
        ...formData,
        imageUrl: uploadedImageUrl,
        base64: '',
      };

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formDataToSend),
      });

      const data = await response.json();
      if (data) {
        router.push('/admin');
      }

      if (data.status !== 100) {
        alert(data.message);
      } else {
        router.push('/admin/pages/register');
      }
    } catch (error) {
      console.error('Error registering user:', error);
    }
  };

  const uploadImage = async (base64) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_UPLOAD_IMAGE_API}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: base64 }),
      });
      const result = await response.json();
      if (response.ok) {
        return result.image_url;
      } else {
        throw new Error(result.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const [showPassword, setShowPassword] = useState(false);

  const glassStyle = {
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(0, 0, 0, 0.05)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
  };

  const inputStyle = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '16px',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      bgcolor: 'transparent',
      '& fieldset': { borderColor: 'rgba(0,0,0,0.1)' },
      '&:hover fieldset': { borderColor: '#F25C2C' },
      '&.Mui-focused fieldset': { borderColor: '#F25C2C', borderWidth: '2px' },
      '&.Mui-focused': { bgcolor: '#fff' },
      '& input': {
        '&:-webkit-autofill': {
          WebkitBoxShadow: '0 0 0 100px white inset !important',
          WebkitTextFillColor: 'inherit !important',
        },
      }
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: '#fff',
      }}
    >
      <AnimatePresence mode="wait">
        {!isRegistering ? (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <Paper sx={{ width: '100%', maxWidth: 450, p: { xs: 4, md: 5 }, borderRadius: '32px', ...glassStyle }}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, color: '#111827', letterSpacing: '-0.02em' }}>
                  Admin <span style={{ color: '#F25C2C' }}>Portal</span>
                </Typography>
                <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 500 }}>
                  Enter your credentials to manage Store2u
                </Typography>
              </Box>

              {error && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                  <Typography sx={{ mb: 3, p: 1.5, bgcolor: '#FEE2E2', color: '#B91C1C', borderRadius: '12px', fontSize: '0.875rem', fontWeight: 600, textAlign: 'center', border: '1px solid #FCA5A5' }}>
                    {error}
                  </Typography>
                </motion.div>
              )}

              <form onSubmit={handleLogin}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <TextField
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    fullWidth
                    required
                    sx={inputStyle}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <FiMail style={{ color: '#9CA3AF' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    fullWidth
                    required
                    sx={inputStyle}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <FiLock style={{ color: '#9CA3AF' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                            {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    sx={{
                      py: 2,
                      mt: 2,
                      borderRadius: '16px',
                      bgcolor: '#F25C2C',
                      fontWeight: 800,
                      fontSize: '1rem',
                      textTransform: 'none',
                      boxShadow: '0 15px 30px rgba(242, 92, 44, 0.3)',
                      '&:hover': { bgcolor: '#EA580C', transform: 'translateY(-2px)', boxShadow: '0 20px 40px rgba(242, 92, 44, 0.4)' },
                      transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                    }}
                  >
                    {loading ? <CircularProgress size={26} sx={{ color: '#fff' }} /> : 'Log In to Dashboard'}
                  </Button>

                  <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#6B7280' }}>
                      Don't have an admin account?{' '}
                      <Typography
                        component="span"
                        onClick={() => setIsRegistering(true)}
                        sx={{ color: '#F25C2C', fontWeight: 700, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                      >
                        Register Instead
                      </Typography>
                    </Typography>
                  </Box>
                </Box>
              </form>
            </Paper>
          </motion.div>
        ) : (
          <motion.div
            key="register"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <Paper sx={{ width: '100%', maxWidth: 500, p: { xs: 3, md: 5 }, borderRadius: '32px', ...glassStyle }}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, color: '#111827', letterSpacing: '-0.02em' }}>
                  Admin <span style={{ color: '#F25C2C' }}>Sign Up</span>
                </Typography>
                <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 500 }}>
                  Create an account to join the admin team
                </Typography>
              </Box>

              <form onSubmit={handleRegister}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
                  <TextField
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    fullWidth
                    required
                    sx={inputStyle}
                    InputProps={{ startAdornment: <InputAdornment position="start"><FiUser style={{ color: '#9CA3AF' }} /></InputAdornment> }}
                  />
                  <TextField
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    fullWidth
                    required
                    sx={inputStyle}
                    InputProps={{ startAdornment: <InputAdornment position="start"><FiMail style={{ color: '#9CA3AF' }} /></InputAdornment> }}
                  />
                  <TextField
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    fullWidth
                    required
                    sx={inputStyle}
                    InputProps={{ startAdornment: <InputAdornment position="start"><FiLock style={{ color: '#9CA3AF' }} /></InputAdornment> }}
                  />
                  <TextField
                    label="Phone"
                    name="phoneno"
                    value={formData.phoneno}
                    onChange={handleChange}
                    fullWidth
                    required
                    sx={inputStyle}
                    InputProps={{ startAdornment: <InputAdornment position="start"><FiPhone style={{ color: '#9CA3AF' }} /></InputAdornment> }}
                  />
                  <TextField
                    label="City"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    fullWidth
                    required
                    sx={inputStyle}
                    InputProps={{ startAdornment: <InputAdornment position="start"><FiMapPin style={{ color: '#9CA3AF' }} /></InputAdornment> }}
                  />
                  <Box>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="prof-img"
                      type="file"
                      onChange={handleImageChange}
                    />
                    <label htmlFor="prof-img">
                      <Button
                        component="span"
                        fullWidth
                        startIcon={<FiCamera />}
                        sx={{
                          height: '56px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.1)',
                          textTransform: 'none', color: formData.image ? '#F25C2C' : '#6B7280',
                          bgcolor: 'rgba(255, 255, 255, 0.5)', '&:hover': { bgcolor: '#fff', borderColor: '#F25C2C' }
                        }}
                      >
                        {formData.image ? 'Image Selected' : 'Avatar'}
                      </Button>
                    </label>
                  </Box>

                  <Box sx={{ gridColumn: { sm: 'span 2' }, mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      sx={{
                        py: 2, borderRadius: '16px', bgcolor: '#F25C2C', fontWeight: 800,
                        textTransform: 'none', fontSize: '1rem',
                        boxShadow: '0 15px 30px rgba(242, 92, 44, 0.3)',
                        '&:hover': { bgcolor: '#EA580C', transform: 'translateY(-2px)' }
                      }}
                    >
                      Complete Registration
                    </Button>
                    <Button
                      fullWidth
                      onClick={() => setIsRegistering(false)}
                      startIcon={<FiArrowLeft />}
                      sx={{ textTransform: 'none', color: '#6B7280', py: 1.5, borderRadius: '16px', fontWeight: 600 }}
                    >
                      Back to Login
                    </Button>
                  </Box>
                </Box>
              </form>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default LoginPage;