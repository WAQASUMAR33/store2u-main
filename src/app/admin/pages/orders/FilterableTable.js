'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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
  TablePagination,
  Chip,
  Avatar,
  Tooltip,
  Divider,
  InputAdornment,
} from '@mui/material';
import { Search as SearchIcon, Add as AddIcon, Inventory as InventoryIcon, Delete as DeleteIcon, CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { styled } from '@mui/system';

// Custom styled loading bar for API fetching
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
    background: 'linear-gradient(90deg, #F25C2C, #F97316, #FB923C, #FBBF24, #F25C2C)', // Orange-based looping gradient
    backgroundSize: '200% 100%',
    animation: 'flow 1.5s infinite ease-in-out',
  },
  '@keyframes flow': {
    '0%': { backgroundPosition: '200% 0' },
    '100%': { backgroundPosition: '-200% 0' },
  },
}));

// Custom styled Typography for loading label with animated dots
const AnimatedLabel = styled(Typography)(({ theme }) => ({
  fontSize: '1.5rem',
  fontWeight: '600',
  color: '#FFFFFF',
  background: 'linear-gradient(45deg, #F25C2C, #FB923C)', // Orange gradient
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
  const s = status?.toLowerCase() || '';
  if (s.includes('pending')) return { bgcolor: '#FEF3C7', color: '#B45309', border: '1px solid #FCD34D' };
  if (s.includes('confirmed')) return { bgcolor: '#FFF7ED', color: '#EA580C', border: '1px solid #FFEDD5' }; // Orange theme for confirmed
  if (s.includes('paid')) return { bgcolor: '#FFF7ED', color: '#F25C2C', border: '1px solid #FFEDD5' };    // F25C2C theme
  if (s.includes('shipped')) return { bgcolor: '#E0E7FF', color: '#4F46E5', border: '1px solid #C7D2FE' }; // 6366F1 theme
  if (s.includes('completed')) return { bgcolor: '#D1FAE5', color: '#059669', border: '1px solid #6EE7B7' }; // 10B981 theme
  if (s.includes('cancelled')) return { bgcolor: '#FEE2E2', color: '#DC2626', border: '1px solid #FCA5A5' }; // EF4444 theme
  return { bgcolor: '#F3F4F6', color: '#6B7280', border: '1px solid #E5E7EB' };
};

// Payment Method Color Helper
const getPaymentMethodStyles = (method) => {
  const m = method?.toLowerCase() || '';
  if (m.includes('bank')) return { color: '#9333EA', bgcolor: '#F5F3FF' };
  if (m.includes('cod') || m.includes('cash')) return { color: '#059669', bgcolor: '#ECFDF5' };
  if (m.includes('card') || m.includes('stripe') || m.includes('paypal')) return { color: '#F25C2C', bgcolor: '#FFF7ED' };
  return { color: '#6B7280', bgcolor: '#F9FAFB' };
};

const FilterableTable = ({ data = [], fetchData }) => {
  const [filter, setFilter] = useState('');
  const [filteredData, setFilteredData] = useState(data);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [newItem, setNewItem] = useState({
    id: null,
    userId: '',
    total: '',
    status: '',
    orderItems: [],
    image: null,
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  const router = useRouter();

  useEffect(() => {
    if (Array.isArray(data)) {
      setFilteredData(
        data
          .filter((item) =>
            Object.values(item).some((val) =>
              String(val).toLowerCase().includes(filter.toLowerCase())
            )
          )
          .sort((a, b) => b.id - a.id)
      );
    }
  }, [filter, data]);

  const handleRowClick = (id) => {
    router.push(`/admin/pages/orders/${id}`);
  };

  const handleAddNewItem = async () => {
    setIsFetching(true);
    const formData = new FormData();
    formData.append('userId', newItem.userId);
    formData.append('total', newItem.total);
    formData.append('status', newItem.status);
    newItem.orderItems.forEach((item, index) => {
      formData.append(`orderItems[${index}][productId]`, item.productId);
      formData.append(`orderItems[${index}][quantity]`, item.quantity);
      formData.append(`orderItems[${index}][price]`, item.price);
    });
    if (newItem.image) {
      formData.append('image', newItem.image);
    }

    try {
      const url = newItem.id ? `/api/orders/${newItem.id}` : '/api/orders';
      const method = newItem.id ? 'PUT' : 'POST';

      const payload = newItem.id ? {
        id: newItem.id,
        userId: newItem.userId,
        total: newItem.total,
        status: newItem.status,
        paymentMethod: 'Other', // Default or from newItem if added
        paymentInfo: null
      } : formData;

      const options = newItem.id ? {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      } : {
        method,
        body: formData
      };

      const response = await fetch(url, options);
      const result = await response.json();
      await fetchData();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving item:', error);
    }
    setIsFetching(false);
  };

  const handleDeleteItem = async (id) => {
    setIsFetching(true);
    try {
      await fetch(`/api/orders/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      await fetchData();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
    setIsFetching(false);
  };

  const handleEditItem = (item) => {
    setNewItem(item);
    setIsModalOpen(true);
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
      {/* New Designed Loading Bar for API Fetching */}
      {isFetching && (
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
            <AnimatedLabel sx={{ mt: 2 }}>
              Loading
            </AnimatedLabel>
          </Box>
        </Box>
      )}

      {/* Main Content */}
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
              Order Management
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.5, fontWeight: 500 }}>
              Track and manage customer transactions effortlessly
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
                '&:hover': {
                  bgcolor: isSearchVisible ? '#2563EB' : '#E5E7EB',
                  transform: 'translateY(-1px)'
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <SearchIcon sx={{ fontSize: '1.25rem' }} />
            </IconButton>
            <IconButton
              onClick={() => {
                setNewItem({
                  id: null,
                  userId: '',
                  total: '',
                  status: '',
                  orderItems: [],
                  image: null,
                });
                setIsModalOpen(true);
              }}
              sx={{
                bgcolor: '#F25C2C',
                color: '#fff',
                borderRadius: '12px',
                width: '42px',
                height: '42px',
                boxShadow: '0 4px 12px rgba(242, 92, 44, 0.3)',
                '&:hover': {
                  bgcolor: '#E04E1D',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 6px 16px rgba(242, 92, 44, 0.4)'
                },
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
            placeholder="Search by ID, name, or transaction..."
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
                '& .MuiInputBase-input': {
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  color: '#111827',
                  '&::placeholder': {
                    color: '#9CA3AF',
                    opacity: 1
                  }
                }
              },
              boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
            }}
          />
        )}

        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#F9FAFB', color: '#374151' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#F9FAFB', color: '#374151' }}>Product</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#F9FAFB', color: '#374151' }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#F9FAFB', color: '#374151' }}>Total Amount</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#F9FAFB', color: '#374151', textAlign: 'center' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#F9FAFB', color: '#374151' }}>Date & Time</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#F9FAFB', color: '#374151' }}>Payment</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#F9FAFB', color: '#374151', textAlign: 'right' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.isArray(paginatedData) &&
                paginatedData.map((item, index) => (
                  <TableRow
                    key={item.id}
                    sx={{ bgcolor: index % 2 === 0 ? 'white' : '#F9FAFB', cursor: 'pointer' }}
                    onClick={() => handleRowClick(item.id)}
                  >
                    <TableCell sx={{ fontWeight: 600, color: '#3B82F6', fontSize: '0.8rem' }}>#{item.id}</TableCell>
                    <TableCell sx={{ fontSize: '0.8rem' }}>
                      {item.orderItems && item.orderItems.length > 0 && item.orderItems[0].product?.images?.[0] ? (
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: '8px',
                            overflow: 'hidden',
                            border: '1px solid #E5E7EB',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: '#F9FAFB'
                          }}
                        >
                          <Image
                            src={`${process.env.NEXT_PUBLIC_UPLOADED_IMAGE_URL}/${item.orderItems[0].product.images[0].url}`}
                            alt="Product"
                            width={36}
                            height={36}
                            style={{ objectFit: 'cover' }}
                          />
                        </Box>
                      ) : (
                        <Box sx={{ width: 36, height: 36, bgcolor: '#F3F4F6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <InventoryIcon sx={{ fontSize: 16, color: '#9CA3AF' }} />
                        </Box>
                      )}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8rem' }}>
                      {item.user ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 28, height: 28, bgcolor: '#F3F4F6', color: '#F25C2C', fontSize: '0.75rem', fontWeight: 'bold' }}>
                            {item.user?.name?.charAt(0) || 'U'}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827', fontSize: '0.8rem' }}>{item.user?.name || item.recipientName || 'Guest'}</Typography>
                            <Typography variant="caption" sx={{ color: '#6B7280', fontSize: '0.7rem' }}>ID: {item.userId || 'Guest'}</Typography>
                          </Box>
                        </Box>
                      ) : (
                        <Typography variant="body2" sx={{ color: '#9CA3AF', fontStyle: 'italic', fontSize: '0.8rem' }}>Guest User</Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#111827', fontSize: '0.8rem' }}>
                      {item.total?.toLocaleString() || 0} Rs.
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center', fontSize: '0.8rem' }}>
                      <Chip
                        label={item.status}
                        size="small"
                        sx={{
                          ...getStatusStyles(item.status),
                          fontWeight: 700,
                          fontSize: '0.65rem',
                          textTransform: 'uppercase',
                          px: 0.5,
                          height: '20px'
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: '#6B7280', fontSize: '0.8rem' }}>
                      {new Date(item.updatedAt).toLocaleDateString()}
                      <br />
                      <Typography variant="caption" sx={{ color: '#9CA3AF', fontSize: '0.7rem' }}>
                        {new Date(item.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8rem' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            px: 1,
                            py: 0.5,
                            borderRadius: '4px',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            ...getPaymentMethodStyles(item.paymentMethod)
                          }}
                        >
                          {item.paymentMethod || 'N/A'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right', fontSize: '0.8rem' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(item.id);
                          }}
                          sx={{
                            textTransform: 'none',
                            borderRadius: '8px',
                            bgcolor: '#fff',
                            color: '#F25C2C',
                            border: '1px solid #E5E7EB',
                            boxShadow: 'none',
                            fontSize: '0.75rem',
                            padding: '2px 10px',
                            '&:hover': { bgcolor: '#F3F4F6', boxShadow: 'none' }
                          }}
                        >
                          Details
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 15, 25, 50]}
          component="div"
          count={filteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
          }
        }}
      >
        <DialogTitle sx={{
          pb: 1,
          pt: 3,
          px: 4,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5
        }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#111827' }}>
            {newItem.id ? 'Edit Order' : 'Create New Order'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 500 }}>
            Fill in the details below to {newItem.id ? 'update the' : 'add a new'} order to the system
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ px: 4, py: 2 }}>
          {/* Section 1: Order Details */}
          <Box sx={{ mb: 4, mt: 1 }}>
            <Typography variant="subtitle2" sx={{ color: '#F25C2C', fontWeight: 700, textTransform: 'uppercase', mb: 2, letterSpacing: '0.5px' }}>
              Order Information
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                fullWidth
                label="User ID"
                type="number"
                value={newItem.userId}
                onChange={(e) => setNewItem({ ...newItem, userId: e.target.value })}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    bgcolor: '#F9FAFB',
                    '&:hover fieldset': { borderColor: '#F25C2C' }
                  }
                }}
              />
              <TextField
                fullWidth
                label="Status"
                value={newItem.status}
                onChange={(e) => setNewItem({ ...newItem, status: e.target.value })}
                variant="outlined"
                placeholder="e.g. PENDING"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    bgcolor: '#F9FAFB',
                    '&:hover fieldset': { borderColor: '#F25C2C' }
                  }
                }}
              />
              <TextField
                fullWidth
                label="Total Amount"
                type="number"
                value={newItem.total}
                onChange={(e) => setNewItem({ ...newItem, total: e.target.value })}
                variant="outlined"
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1, color: '#9CA3AF', fontWeight: 600 }}>Rs.</Typography>
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    bgcolor: '#F9FAFB',
                    '&:hover fieldset': { borderColor: '#F25C2C' }
                  }
                }}
              />
              <Box sx={{ position: 'relative' }}>
                <Typography variant="caption" sx={{ position: 'absolute', top: -10, left: 12, bgcolor: '#fff', px: 0.5, color: '#6B7280', zIndex: 1, fontWeight: 500 }}>
                  Image/Attachment
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: '10.5px 14px',
                    borderRadius: '12px',
                    border: '1px solid #E5E7EB',
                    bgcolor: '#F9FAFB',
                    '&:hover': { borderColor: '#F25C2C' },
                    transition: 'border-color 0.2s'
                  }}
                >
                  <Button
                    component="label"
                    variant="contained"
                    startIcon={<CloudUploadIcon />}
                    sx={{
                      textTransform: 'none',
                      borderRadius: '8px',
                      bgcolor: '#F25C2C',
                      fontSize: '0.75rem',
                      py: 0.5,
                      '&:hover': { bgcolor: '#E04E1D' }
                    }}
                  >
                    Choose File
                    <input
                      type="file"
                      hidden
                      onChange={(e) => setNewItem({ ...newItem, image: e.target.files[0] })}
                    />
                  </Button>
                  <Typography variant="body2" sx={{ color: newItem.image ? '#111827' : '#9CA3AF', fontWeight: 500, fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {newItem.image ? newItem.image.name : 'No file chosen'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          <Divider sx={{ my: 3, borderColor: '#F3F4F6' }} />

          {/* Section 2: Order Items */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle2" sx={{ color: '#F25C2C', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Order Items
              </Typography>
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={() =>
                  setNewItem({
                    ...newItem,
                    orderItems: [...newItem.orderItems, { productId: '', quantity: '', price: '' }],
                  })
                }
                sx={{
                  textTransform: 'none',
                  borderRadius: '10px',
                  bgcolor: '#F25C2C',
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(242, 92, 44, 0.2)',
                  '&:hover': { bgcolor: '#E04E1D', boxShadow: '0 6px 16px rgba(242, 92, 44, 0.3)' }
                }}
              >
                Add Item
              </Button>
            </Box>

            {newItem.orderItems.length === 0 ? (
              <Box sx={{ p: 4, bgcolor: '#F9FAFB', borderRadius: '16px', border: '2px dashed #E5E7EB', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <InventoryIcon sx={{ fontSize: 32, color: '#9CA3AF' }} />
                <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 500 }}>No items added yet</Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {newItem.orderItems.map((orderItem, index) => (
                  <Paper
                    key={index}
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: '16px',
                      bgcolor: '#F9FAFB',
                      border: '1px solid #E5E7EB',
                      position: 'relative',
                      display: 'grid',
                      gridTemplateColumns: '2fr 1fr 1fr 40px',
                      gap: 2,
                      alignItems: 'center'
                    }}
                  >
                    <TextField
                      fullWidth
                      label="Product ID"
                      size="small"
                      type="number"
                      value={orderItem.productId}
                      onChange={(e) => {
                        const updatedOrderItems = [...newItem.orderItems];
                        updatedOrderItems[index].productId = e.target.value;
                        setNewItem({ ...newItem, orderItems: updatedOrderItems });
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: '#fff' } }}
                    />
                    <TextField
                      fullWidth
                      label="Qty"
                      size="small"
                      type="number"
                      value={orderItem.quantity}
                      onChange={(e) => {
                        const updatedOrderItems = [...newItem.orderItems];
                        updatedOrderItems[index].quantity = e.target.value;
                        setNewItem({ ...newItem, orderItems: updatedOrderItems });
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: '#fff' } }}
                    />
                    <TextField
                      fullWidth
                      label="Price"
                      size="small"
                      type="number"
                      value={orderItem.price}
                      onChange={(e) => {
                        const updatedOrderItems = [...newItem.orderItems];
                        updatedOrderItems[index].price = e.target.value;
                        setNewItem({ ...newItem, orderItems: updatedOrderItems });
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: '#fff' } }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => {
                        const updatedOrderItems = newItem.orderItems.filter((_, i) => i !== index);
                        setNewItem({ ...newItem, orderItems: updatedOrderItems });
                      }}
                      sx={{ color: '#EF4444', bgcolor: '#FEE2E2', '&:hover': { bgcolor: '#FECACA' } }}
                    >
                      <DeleteIcon sx={{ fontSize: '1.2rem' }} />
                    </IconButton>
                  </Paper>
                ))}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 4, pt: 2, display: 'flex', gap: 2 }}>
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
            {newItem.id ? 'Save Changes' : 'Create Order'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FilterableTable;