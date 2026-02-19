'use client';

import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, TextField, Button, Grid, Divider, CircularProgress, IconButton, InputAdornment } from '@mui/material';
import { Person as PersonIcon, Lock as LockIcon, Visibility, VisibilityOff, Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const ProfilePage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [userData, setUserData] = useState({ name: '', email: '', id: null });
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const decoded = jwtDecode(token);
                    const res = await axios.get(`/api/users/${decoded.id}`);
                    setUserData({ name: res.data.name, email: res.data.email, id: decoded.id });
                } catch (error) {
                    console.error('Error fetching profile:', error);
                    toast.error('Failed to load profile');
                }
            }
        };
        fetchProfile();
    }, []);

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const res = await axios.put('/api/users/change-password', {
                id: userData.id,
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            if (res.data.status) {
                toast.success('Password updated successfully!');
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                toast.error(res.data.message || 'Failed to update password');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error updating password');
        } finally {
            setLoading(false);
        }
    };

    const inputStyles = {
        '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            '& fieldset': { borderColor: '#E5E7EB' },
            '&:hover fieldset': { borderColor: '#3B82F6' },
            '&.Mui-focused fieldset': { borderColor: '#3B82F6' },
        },
        '& .MuiInputLabel-root.Mui-focused': { color: '#3B82F6' }
    };

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#F9FAFB', minHeight: '100vh' }}>
            <ToastContainer position="top-right" autoClose={3000} />

            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton onClick={() => router.back()} sx={{ bgcolor: '#fff', border: '1px solid #E5E7EB' }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#111827' }}>My Profile</Typography>
            </Box>

            <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', border: '1px solid #E5E7EB' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                            <Box sx={{ p: 1, bgcolor: '#DBEAFE', borderRadius: '10px', color: '#1D4ED8', display: 'flex' }}>
                                <PersonIcon />
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>Personal Information</Typography>
                        </Box>
                        <Divider sx={{ mb: 3 }} />
                        <Stack spacing={3}>
                            <TextField label="Full Name" value={userData.name} disabled fullWidth sx={inputStyles} />
                            <TextField label="Email Address" value={userData.email} disabled fullWidth sx={inputStyles} />
                            <Typography variant="caption" sx={{ color: '#6B7280' }}>
                                * Profile details are managed by system administrators. Contact IT support to change your name or email.
                            </Typography>
                        </Stack>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', border: '1px solid #E5E7EB' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                            <Box sx={{ p: 1, bgcolor: '#FEE2E2', borderRadius: '10px', color: '#DC2626', display: 'flex' }}>
                                <LockIcon />
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>Security & Password</Typography>
                        </Box>
                        <Divider sx={{ mb: 3 }} />

                        <form onSubmit={handleChangePassword}>
                            <Stack spacing={3}>
                                <TextField
                                    label="Current Password"
                                    type={showPassword ? 'text' : 'password'}
                                    fullWidth
                                    required
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    sx={inputStyles}
                                />
                                <TextField
                                    label="New Password"
                                    type={showPassword ? 'text' : 'password'}
                                    fullWidth
                                    required
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    sx={inputStyles}
                                />
                                <TextField
                                    label="Confirm New Password"
                                    type={showPassword ? 'text' : 'password'}
                                    fullWidth
                                    required
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    sx={inputStyles}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={() => setShowPassword(!showPassword)}>
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={loading}
                                    startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                                    sx={{
                                        bgcolor: '#3B82F6',
                                        borderRadius: '12px',
                                        py: 1.5,
                                        fontWeight: 700,
                                        textTransform: 'none',
                                        '&:hover': { bgcolor: '#2563EB' }
                                    }}
                                >
                                    {loading ? 'Updating...' : 'Update Password'}
                                </Button>
                            </Stack>
                        </form>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

// Helper component for stacking
const Stack = ({ children, spacing = 2 }) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: spacing }}>{children}</Box>
);

export default ProfilePage;
