'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';
import { styled } from '@mui/system';

// MUI Imports
import {
  Box,
  Paper,
  Typography,
  IconButton,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Select,
  MenuItem,
  TablePagination,
  Chip,
  Avatar,
  Divider,
  InputAdornment,
} from '@mui/material';

// Custom styled loading bar for API fetching (Matches Orders Page)
const ModernProgress = styled(Box)(({ theme }) => ({
  width: '300px',
  height: '8px',
  background: 'rgba(255, 255, 255, 0.15)',
  borderRadius: '8px',
  overflow: 'hidden',
  position: 'relative',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, #F25C2C, #F97316, #FB923C, #FBBF24, #F25C2C)',
    backgroundSize: '200% 100%',
    animation: 'flow 1.5s infinite ease-in-out',
  },
  '@keyframes flow': {
    '0%': { backgroundPosition: '200% 0' },
    '100%': { backgroundPosition: '-200% 0' },
  },
}));

const AnimatedLabel = styled(Typography)(({ theme }) => ({
  fontSize: '1.5rem',
  fontWeight: '600',
  color: '#FFFFFF',
  background: 'linear-gradient(45deg, #F25C2C, #FB923C)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  textShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
  position: 'relative',
  '&:after': {
    content: '"..."',
    display: 'inline-block',
    animation: 'dots 1.5s infinite steps(4, end)',
  },
  '@keyframes dots': {
    '0%': { content: '"."', opacity: 1 },
    '25%': { content: '".."', opacity: 1 },
    '50%': { content: '"..."', opacity: 1 },
    '75%': { content: '"..."', opacity: 0.5 },
    '100%': { content: '"..."', opacity: 1 },
  },
}));

// Status Color Helper
const getStatusStyles = (status) => {
  if (status === 1) return { bgcolor: '#ECFDF5', color: '#059669', border: '1px solid #6EE7B7' }; // Active
  return { bgcolor: '#FEE2E2', color: '#DC2626', border: '1px solid #FCA5A5' }; // Inactive
};

const FilterableCustomerTable = ({ customers, fetchCustomers }) => {
  const [filter, setFilter] = useState('');
  const [filteredData, setFilteredData] = useState(customers || []);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    id: null,
    name: '',
    email: '',
    password: '',
    phoneno: '',
    city: '',
    image: null,
    imageUrl: '',
    role: 'CUSTOMER',
  });
  const [isAdminForm, setIsAdminForm] = useState(false);
  const [images, setImages] = useState([]);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10); // Default to 10 to match Orders feel

  useEffect(() => {
    setFilteredData(
      (customers || [])
        .filter((item) =>
          Object.values(item).some((val) =>
            String(val).toLowerCase().includes(filter.toLowerCase())
          )
        )
        .sort((a, b) => b.id - a.id) // Sort by ID desc by default
    );
  }, [filter, customers]);

  const handleAddNewItem = async () => {
    if (!newCustomer.name || !newCustomer.email || !newCustomer.password || !newCustomer.phoneno || !newCustomer.city) {
      alert('All fields are required');
      return;
    }
    setIsLoading(true);
    try {
      let imageUrl = newCustomer.imageUrl || ''; // Keep existing URL if not changing
      if (images.length > 0) {
        const imageBase64 = await convertToBase64(images[0]);
        const response = await fetch(`${process.env.NEXT_PUBLIC_UPLOAD_IMAGE_API}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: imageBase64 }),
        });
        const result = await response.json();
        if (response.ok) {
          imageUrl = result.image_url;
        } else {
          throw new Error(result.error || 'Failed to upload image');
        }
      }

      const customerToSubmit = { ...newCustomer, imageUrl };
      const endpoint = isAdminForm ? '/api/users/admin-user' : '/api/users';

      const response = newCustomer.id
        ? await fetch(`/api/users/${newCustomer.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(customerToSubmit),
        })
        : await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(customerToSubmit),
        });

      if (response.ok) {
        fetchCustomers();
        setIsModalOpen(false);
        resetForm();
      } else {
        const errorData = await response.json();
        alert(`Failed to save customer: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error adding/updating customer:', error);
      alert('An unexpected error occurred.');
    }
    setIsLoading(false);
  };

  const resetForm = () => {
    setNewCustomer({
      id: null,
      name: '',
      email: '',
      password: '',
      phoneno: '',
      city: '',
      image: null,
      imageUrl: '',
      role: 'CUSTOMER',
    });
    setImages([]);
  };

  const handleDeleteItem = async (id) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        fetchCustomers();
        alert('Customer deleted successfully');
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.message || 'Failed to delete customer';
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert('An unexpected error occurred while deleting the customer.');
    }
    setIsLoading(false);
  };

  const handleEditItem = async (item) => {
    setNewCustomer(item);
    setIsAdminForm(item.role === 'ADMIN');
    setIsModalOpen(true);
  };

  const handleStatusChange = async (id, action) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (response.ok) {
        fetchCustomers();
      } else {
        const errorData = await response.json();
        alert(`Failed to update status: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error updating customer status:', error);
      alert('An unexpected error occurred while updating status.');
    }
    setIsLoading(false);
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImages([file]);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedData = Array.isArray(filteredData) ? filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  ) : [];

  return (
    <Box sx={{ bgcolor: '#F3F4F6', minHeight: '100vh', p: 1 }}>
      {/* Modern Loading State */}
      {isLoading && (
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(6px)',
            zIndex: 50,
            transition: 'opacity 0.3s ease-in-out',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              p: 3,
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <ModernProgress />
            <AnimatedLabel sx={{ mt: 2 }}>Processing</AnimatedLabel>
          </Box>
        </Box>
      )}

      {/* Main Card */}
      <Paper
        sx={{
          p: 3,
          borderRadius: '24px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          background: '#fff',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#111827', letterSpacing: '-0.5px' }}>
              Customer Management
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.5, fontWeight: 500 }}>
              View, edit, and manage all your registered users
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <IconButton
              onClick={() => setIsSearchVisible(!isSearchVisible)}
              sx={{
                bgcolor: isSearchVisible ? '#F25C2C' : '#F3F4F6',
                color: isSearchVisible ? '#fff' : '#4B5563',
                borderRadius: '12px',
                width: '42px',
                height: '42px',
                border: isSearchVisible ? 'none' : '1px solid #E5E7EB',
                boxShadow: isSearchVisible ? '0 4px 12px rgba(242, 92, 44, 0.3)' : 'none',
                '&:hover': { bgcolor: isSearchVisible ? '#E04E1D' : '#E5E7EB', transform: 'translateY(-1px)' },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <SearchIcon sx={{ fontSize: '1.25rem' }} />
            </IconButton>
            <IconButton
              onClick={() => {
                resetForm();
                setIsAdminForm(true); // Default to generic add, can toggle inside
                setIsModalOpen(true);
              }}
              sx={{
                bgcolor: '#F25C2C',
                color: '#fff',
                borderRadius: '12px',
                width: '42px',
                height: '42px',
                boxShadow: '0 4px 12px rgba(242, 92, 44, 0.3)',
                '&:hover': { bgcolor: '#E04E1D', transform: 'translateY(-1px)', boxShadow: '0 6px 16px rgba(242, 92, 44, 0.4)' },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <AddIcon sx={{ fontSize: '1.5rem' }} />
            </IconButton>
          </Box>
        </Box>

        {isSearchVisible && (
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search by name, email, or city..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#9CA3AF', fontSize: '1.2rem' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: '16px',
                bgcolor: '#F9FAFB',
                height: '48px',
                '& fieldset': { borderColor: '#E5E7EB' },
                '&:hover fieldset': { borderColor: '#F25C2C' },
                '&.Mui-focused fieldset': { borderColor: '#F25C2C', borderWidth: '2px' },
              },
              boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
            }}
          />
        )}

        <TableContainer sx={{ maxHeight: '60vh', overflowX: 'auto' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#F9FAFB', color: '#374151' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#F9FAFB', color: '#374151' }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#F9FAFB', color: '#374151' }}>Contact Info</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#F9FAFB', color: '#374151' }}>Location</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#F9FAFB', color: '#374151', textAlign: 'center' }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#F9FAFB', color: '#374151', textAlign: 'center' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#F9FAFB', color: '#374151', textAlign: 'right' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.isArray(paginatedData) && paginatedData.map((item, index) => (
                <TableRow key={item.id} sx={{ bgcolor: index % 2 === 0 ? 'white' : '#F9FAFB', '&:hover': { bgcolor: '#F3F4F6' } }}>
                  <TableCell sx={{ fontWeight: 600, color: '#3B82F6', fontSize: '0.8rem' }}>#{item.id}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar
                        src={item.imageUrl ? `${process.env.NEXT_PUBLIC_UPLOADED_IMAGE_URL}/${item.imageUrl}` : undefined}
                        sx={{ width: 32, height: 32, bgcolor: '#F3F4F6', color: '#F25C2C', fontSize: '0.8rem', fontWeight: 'bold' }}
                      >
                        {item.name?.charAt(0).toUpperCase() || 'U'}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827', fontSize: '0.85rem' }}>{item.name}</Typography>
                        <Typography variant="caption" sx={{ color: '#9CA3AF', fontSize: '0.7rem' }}>Joined: {new Date(item.createdAt || Date.now()).toLocaleDateString()}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="body2" sx={{ color: '#374151', fontSize: '0.8rem' }}>{item.email}</Typography>
                      <Typography variant="caption" sx={{ color: '#6B7280', fontSize: '0.75rem' }}>{item.phoneno}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 150, fontSize: '0.8rem', color: '#4B5563' }}>
                    {item.city || 'N/A'}
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <Chip
                      label={item.role}
                      size="small"
                      sx={{
                        bgcolor: item.role === 'ADMIN' ? '#EFF6FF' : '#F3F4F6',
                        color: item.role === 'ADMIN' ? '#2563EB' : '#4B5563',
                        fontWeight: 700,
                        fontSize: '0.65rem'
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <Chip
                      label={item.status === 1 ? 'Active' : 'Inactive'}
                      size="small"
                      sx={{
                        ...getStatusStyles(item.status),
                        fontWeight: 700,
                        fontSize: '0.65rem',
                        height: '22px'
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ textAlign: 'right' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      <IconButton size="small" onClick={() => handleEditItem(item)} sx={{ color: '#3B82F6', bgcolor: '#EFF6FF', '&:hover': { bgcolor: '#DBEAFE' } }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleStatusChange(item.id, item.status === 1 ? 'deactivate' : 'activate')} sx={{ color: '#F59E0B', bgcolor: '#FFFBEB', '&:hover': { bgcolor: '#FEF3C7' } }}>
                        <Typography sx={{ fontSize: '10px', fontWeight: 900 }}>{item.status === 1 ? 'OFF' : 'ON'}</Typography>
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDeleteItem(item.id)} sx={{ color: '#EF4444', bgcolor: '#FEE2E2', '&:hover': { bgcolor: '#FECACA' } }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Modern Modal */}
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
          }
        }}
      >
        <DialogTitle sx={{ pt: 3, px: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#111827' }}>
            {newCustomer.id ? 'Edit User' : 'Add New User'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 500 }}>
            {newCustomer.id ? 'Update user details and permissions' : 'Create a new customer or admin account'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ px: 4, py: 2 }}>
          <Box sx={{ display: 'grid', gap: 2.5, mt: 1 }}>
            <TextField
              fullWidth
              label="Full Name"
              value={newCustomer.name}
              onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#F9FAFB' } }}
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={newCustomer.email}
                onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                variant="outlined"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#F9FAFB' } }}
              />
              <TextField
                fullWidth
                label="Phone Number"
                value={newCustomer.phoneno}
                onChange={(e) => setNewCustomer({ ...newCustomer, phoneno: e.target.value })}
                variant="outlined"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#F9FAFB' } }}
              />
            </Box>
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={newCustomer.password}
              onChange={(e) => setNewCustomer({ ...newCustomer, password: e.target.value })}
              variant="outlined"
              helperText={newCustomer.id ? "Leave blank to keep current password" : ""}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#F9FAFB' } }}
            />
            <TextField
              fullWidth
              label="City / Address"
              value={newCustomer.city}
              onChange={(e) => setNewCustomer({ ...newCustomer, city: e.target.value })}
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#F9FAFB' } }}
            />

            <Box sx={{ position: 'relative', border: '1px dashed #E5E7EB', borderRadius: '12px', p: 2, bgcolor: '#F9FAFB' }}>
              <Typography variant="caption" sx={{ color: '#6B7280', mb: 1, display: 'block', fontWeight: 600 }}>
                Profile Image
              </Typography>
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                fullWidth
                sx={{
                  textTransform: 'none',
                  borderRadius: '10px',
                  color: '#4B5563',
                  borderColor: '#E5E7EB',
                  bgcolor: '#fff',
                  '&:hover': { bgcolor: '#F3F4F6' }
                }}
              >
                {images.length > 0 ? images[0].name : "Upload Image"}
                <input type="file" hidden onChange={handleImageChange} />
              </Button>
            </Box>

            {!isAdminForm && (
              <Select
                fullWidth
                value={newCustomer.role}
                onChange={(e) => setNewCustomer({ ...newCustomer, role: e.target.value })}
                variant="outlined"
                sx={{ borderRadius: '12px', bgcolor: '#F9FAFB' }}
              >
                <MenuItem value="CUSTOMER">Customer</MenuItem>
                <MenuItem value="ADMIN">Admin</MenuItem>
              </Select>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 4, pt: 2, gap: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => setIsModalOpen(false)}
            sx={{
              borderRadius: '14px',
              py: 1.5,
              color: '#4B5563',
              borderColor: '#E5E7EB',
              textTransform: 'none',
              fontWeight: 700,
              '&:hover': { bgcolor: '#F3F4F6', borderColor: '#D1D5DB' }
            }}
          >
            Cancel
          </Button>
          <Button
            fullWidth
            variant="contained"
            onClick={handleAddNewItem}
            sx={{
              borderRadius: '14px',
              py: 1.5,
              bgcolor: '#F25C2C',
              textTransform: 'none',
              fontWeight: 700,
              boxShadow: '0 8px 16px rgba(242, 92, 44, 0.25)',
              '&:hover': { bgcolor: '#E04E1D', boxShadow: '0 12px 24px rgba(242, 92, 44, 0.35)' }
            }}
          >
            {newCustomer.id ? 'Save Changes' : 'Create User'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FilterableCustomerTable;