'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Cookies from "js-cookie"; // Import Cookies

// MUI Imports
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Badge,
  Box,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Mail as MailIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';

const Header = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null); // State for dropdown menu
  const router = useRouter();

  // Check if the user is authenticated by looking for the token in localStorage
  useEffect(() => {
    const token = Cookies.get("token") || localStorage.getItem("token"); // Consistent token check
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      router.push('/admin'); // Redirect to login if not authenticated
    }
  }, [router]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    Cookies.remove("token");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    handleMenuClose();
    window.location.href = "/admin"; // Force reload to clear all state
  };

  // Render nothing until authentication status is known
  if (!isAuthenticated) {
    return null;
  }

  return (
    <AppBar
      position="sticky"
      sx={{
        bgcolor: '#1a202c', // Match sidebar
        color: 'white',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        zIndex: 1100,
      }}
    >
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', px: 4, minHeight: '64px !important' }}>
        {/* Left Section */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              color: 'white',
              letterSpacing: '-0.5px',
              fontSize: '1.25rem'
            }}
          >
            Dashboard
          </Typography>
        </Box>

        {/* Right Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Notifications Placeholder */}
          <IconButton
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              bgcolor: 'rgba(255, 255, 255, 0.05)',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
            }}
          >
            <NotificationsIcon fontSize="small" />
          </IconButton>

          <Divider orientation="vertical" flexItem sx={{ mx: 1, my: 2, bgcolor: 'rgba(255, 255, 255, 0.1)' }} />

          {/* Profile */}
          <Box
            onClick={handleMenuOpen}
            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              padding: '6px 12px',
              borderRadius: '50px',
              transition: 'all 0.2s',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' }
            }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                bgcolor: '#F25C2C',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.875rem'
              }}
            >
              A
            </Box>
            <Typography variant="body2" sx={{ ml: 1.5, fontWeight: 600, color: 'white' }}>
              Admin
            </Typography>
            <ExpandMoreIcon fontSize="small" sx={{ ml: 0.5, color: 'rgba(255, 255, 255, 0.7)' }} />
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 8px 16px rgba(0,0,0,0.1))',
                mt: 1.5,
                borderRadius: '16px',
                border: '1px solid #E5E7EB',
                minWidth: 180,
                '& .MuiMenuItem-root': {
                  px: 2,
                  py: 1.2,
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  borderRadius: '8px',
                  mx: 1,
                  my: 0.5,
                  '&:hover': { bgcolor: '#F3F4F6' },
                },
              },
            }}
          >
            <MenuItem onClick={handleMenuClose}>
              <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
              My Profile
            </MenuItem>
            <Divider sx={{ my: 0.5 }} />
            <MenuItem onClick={handleLogout} sx={{ color: '#EF4444' }}>
              <ListItemIcon><LogoutIcon fontSize="small" sx={{ color: '#EF4444' }} /></ListItemIcon>
              Sign Out
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;