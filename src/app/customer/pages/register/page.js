'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  CircularProgress,
  InputAdornment,
  IconButton,
  Paper,
  Grid
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMail,
  FiLock,
  FiUser,
  FiPhone,
  FiMapPin,
  FiCamera,
  FiArrowRight,
  FiEye,
  FiEyeOff
} from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneno: '',
    city: '',
    role: 'CUSTOMER',
    image: null,
    base64: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'name') {
      const lettersOnly = /^[A-Za-z\s]*$/;
      if (!lettersOnly.test(value)) {
        toast.error('Name should only contain letters.');
        return;
      }
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value;
    if (!value.startsWith('+92')) {
      value = '+92' + value.replace(/^0+/, '');
    }
    setFormData((prev) => ({ ...prev, phoneno: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        image: file,
        base64: reader.result.split(',')[1],
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    const phoneRegex = /^\+92\d{10}$/;
    if (!phoneRegex.test(formData.phoneno)) {
      toast.error("Format: +92xxxxxxxxxx (10 digits)");
      return;
    }

    setLoading(true);
    try {
      const uploadedImageUrl = formData.base64 ? await uploadImage(formData.base64) : '';

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          imageUrl: uploadedImageUrl,
          base64: '',
          confirmPassword: '',
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success('Check your email to verify account!');
        setTimeout(() => router.push('/admin'), 3000);
      } else {
        toast.error(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error(error);
      toast.error('Unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (base64) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_UPLOAD_IMAGE_API}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64 }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Upload failed');
    return result.image_url;
  };

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
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', py: 8, px: 2, background: '#fff'
    }}>
      <ToastContainer />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper sx={{ width: '100%', maxWidth: 500, p: { xs: 3, md: 5 }, borderRadius: '32px', ...glassStyle }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, color: '#111827', letterSpacing: '-0.02em' }}>
              Create <span style={{ color: '#F25C2C' }}>Account</span>
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 500 }}>
              Join Store2u for a seamless shopping experience
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2.5}>
              <Grid item xs={12}>
                <TextField
                  id="reg-name"
                  fullWidth label="Full Name" name="name" required
                  value={formData.name} onChange={handleChange} sx={inputStyle}
                  InputProps={{ startAdornment: <InputAdornment position="start"><FiUser color="#9CA3AF" /></InputAdornment> }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  id="reg-email"
                  fullWidth label="Email Address" name="email" type="email" required
                  value={formData.email} onChange={handleChange} sx={inputStyle}
                  InputProps={{ startAdornment: <InputAdornment position="start"><FiMail color="#9CA3AF" /></InputAdornment> }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  id="reg-password"
                  fullWidth label="Password" name="password" required
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password} onChange={handleChange} sx={inputStyle}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><FiLock color="#9CA3AF" /></InputAdornment>,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  id="reg-confirm"
                  fullWidth label="Confirm" name="confirmPassword" required
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword} onChange={handleChange} sx={inputStyle}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><FiLock color="#9CA3AF" /></InputAdornment>,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                          {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  id="reg-phone"
                  fullWidth label="Phone" name="phoneno" required placeholder="+92xxxxxxxxxx"
                  value={formData.phoneno} onChange={handlePhoneChange} sx={inputStyle}
                  InputProps={{ startAdornment: <InputAdornment position="start"><FiPhone color="#9CA3AF" /></InputAdornment> }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  id="reg-city"
                  fullWidth label="City/Address" name="city" required
                  value={formData.city} onChange={handleChange} sx={inputStyle}
                  InputProps={{ startAdornment: <InputAdornment position="start"><FiMapPin color="#9CA3AF" /></InputAdornment> }}
                />
              </Grid>
              <Grid item xs={12}>
                <input
                  accept="image/*" style={{ display: 'none' }}
                  id="profile-upload" type="file" onChange={handleImageChange}
                />
                <label htmlFor="profile-upload">
                  <Button
                    component="span" fullWidth startIcon={<FiCamera />}
                    sx={{
                      height: '56px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.1)',
                      textTransform: 'none', color: formData.image ? '#F25C2C' : '#6B7280',
                      bgcolor: 'rgba(255, 255, 255, 0.5)', '&:hover': { bgcolor: '#fff', borderColor: '#F25C2C' }
                    }}
                  >
                    {formData.image ? 'Image Selected' : 'Upload Profile Picture'}
                  </Button>
                </label>
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit" variant="contained" fullWidth disabled={loading}
                  sx={{
                    py: 2, borderRadius: '16px', bgcolor: '#F25C2C', fontWeight: 800,
                    fontSize: '1rem', textTransform: 'none',
                    boxShadow: '0 15px 30px rgba(242, 92, 44, 0.3)',
                    '&:hover': { bgcolor: '#EA580C', transform: 'translateY(-2px)' },
                    transition: 'all 0.3s'
                  }}
                >
                  {loading ? <CircularProgress size={26} sx={{ color: '#fff' }} /> : 'Create My Account'}
                </Button>
              </Grid>
              <Grid item xs={12} sx={{ textAlign: 'center', mt: 1 }}>
                <Typography variant="body2" sx={{ color: '#6B7280' }}>
                  Already have an account?{' '}
                  <Typography
                    component="span" onClick={() => router.push('/admin')}
                    sx={{ color: '#F25C2C', fontWeight: 700, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                  >
                    Login Now
                  </Typography>
                </Typography>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default Register;
