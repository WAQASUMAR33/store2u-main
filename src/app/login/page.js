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
    InputAdornment,
    IconButton,
    Paper,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [resendLoading, setResendLoading] = useState(false);
    const [resendSuccess, setResendSuccess] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        if (token) {
            const userRole = localStorage.getItem('role');
            if (userRole === 'ADMIN') {
                router.push('/admin/pages/Main');
            } else if (userRole === 'CUSTOMER') {
                router.push('/');
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
                localStorage.setItem('authToken', token);
                localStorage.setItem('role', user.role);
                localStorage.setItem('userId', user.id);
                localStorage.setItem('userName', user.name);

                if (user.role === 'ADMIN') {
                    toast.success('Login Successful! Welcome Admin.');
                    setTimeout(() => router.push('/admin/pages/Main'), 1500);
                } else if (user.role === 'CUSTOMER') {
                    toast.success('Login Successful!');
                    setTimeout(() => router.push('/'), 1500);
                }
            }
        } catch (error) {
            console.error('Error logging in:', error.message);
            const errorMessage = error.response?.data?.message || 'Failed to log in. Please check your credentials.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleResendVerification = async () => {
        if (!email) {
            setError('Please enter your email address first.');
            return;
        }
        setResendLoading(true);
        setResendSuccess('');
        try {
            const response = await axios.post('/api/resend-verification', { email });
            if (response.data.status) {
                setResendSuccess(response.data.message);
                setError('');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend verification.');
        } finally {
            setResendLoading(false);
        }
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
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
            <ToastContainer />
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
                <Paper sx={{ width: '100%', maxWidth: 450, p: { xs: 4, md: 5 }, borderRadius: '32px', ...glassStyle }}>
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, color: '#111827' }}>
                            Welcome <span style={{ color: '#F25C2C' }}>Back</span>
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 500 }}>
                            Enter your credentials to access your account
                        </Typography>
                    </Box>

                    {error && (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                            <Typography sx={{ mb: 2, p: 1.5, bgcolor: '#FEE2E2', color: '#B91C1C', borderRadius: '12px', fontSize: '0.875rem', fontWeight: 600, textAlign: 'center', border: '1px solid #FCA5A5' }}>
                                {error}
                            </Typography>
                            {error.includes('verify your email') && (
                                <Button onClick={handleResendVerification} disabled={resendLoading} sx={{ mb: 3, width: '100%', textTransform: 'none', color: '#F25C2C', fontWeight: 700 }}>
                                    {resendLoading ? <CircularProgress size={20} /> : 'Resend Verification Email'}
                                </Button>
                            )}
                        </motion.div>
                    )}

                    {resendSuccess && (
                        <Typography sx={{ mb: 3, p: 1.5, bgcolor: '#ECFDF5', color: '#047857', borderRadius: '12px', fontSize: '0.875rem', fontWeight: 600, textAlign: 'center' }}>
                            {resendSuccess}
                        </Typography>
                    )}

                    <form onSubmit={handleLogin}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                            <TextField
                                id="login-email" label="Email Address" type="email" value={email}
                                onChange={(e) => setEmail(e.target.value)} fullWidth required sx={inputStyle}
                                InputProps={{ startAdornment: <InputAdornment position="start"><FiMail color="#9CA3AF" /></InputAdornment> }}
                            />
                            <TextField
                                id="login-password" label="Password" type={showPassword ? 'text' : 'password'} value={password}
                                onChange={(e) => setPassword(e.target.value)} fullWidth required sx={inputStyle}
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
                            <Button type="submit" variant="contained" disabled={loading} sx={{ py: 2, mt: 2, borderRadius: '16px', bgcolor: '#F25C2C', fontWeight: 800, textTransform: 'none', boxShadow: '0 15px 30px rgba(242, 92, 44, 0.3)', '&:hover': { bgcolor: '#EA580C', transform: 'translateY(-2px)' } }}>
                                {loading ? <CircularProgress size={26} sx={{ color: '#fff' }} /> : 'Log In Now'}
                            </Button>
                            <Box sx={{ mt: 3, textAlign: 'center' }}>
                                <Typography variant="body2" sx={{ color: '#6B7280' }}>
                                    Don't have an account?{' '}
                                    <Typography component="span" onClick={() => router.push('/customer/pages/register')} sx={{ color: '#F25C2C', fontWeight: 700, cursor: 'pointer' }}>
                                        Register Instead
                                    </Typography>
                                </Typography>
                            </Box>
                        </Box>
                    </form>
                </Paper>
            </motion.div>
        </Box>
    );
};

export default LoginPage;
