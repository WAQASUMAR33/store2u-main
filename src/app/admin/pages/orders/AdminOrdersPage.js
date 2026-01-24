'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';

// MUI Imports
import {
  Box,
  Paper,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Button,
  Divider,
  Grid,
  Chip,
  Avatar,
  Card,
  CardContent,
  Tooltip,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import {
  ArrowBackIos as ArrowBackIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  LocalShipping as ShippingIcon,
  LocationOn as MapPinIcon,
  CheckCircle as SuccessIcon,
  CreditCard as PaymentIcon,
  Inventory as InventoryIcon
} from '@mui/icons-material';
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
    background: 'linear-gradient(90deg, #3B82F6, #A855F7, #EC4899, #FBBF24, #3B82F6)', // Blue, purple, pink, yellow, looping gradient
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
  background: 'linear-gradient(45deg, #3B82F6, #EC4899)', // Blue to pink gradient
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

const AdminOrdersPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [order, setOrder] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(''); // New state for dropdown selection
  const { id } = useParams();
  const router = useRouter();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await axios.get(`/api/orders/${id}`);
        const orderData = response.data;
        setOrder(orderData);
        setSelectedStatus(orderData.status); // Initialize dropdown with current status
        setLoading(false);
      } catch (error) {
        console.error('Error fetching order:', error);
        setError('Failed to fetch order details');
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id]);

  const handleStatusChange = async () => {
    if (!selectedStatus) return; // Prevent action if no status is selected
    setLoading(true);
    setError(null);
    try {
      const response = await axios.put(`/api/orders/${id}`, {
        id,
        status: selectedStatus,
      });
      if (response.status === 200) {
        setOrder((prevOrder) => ({ ...prevOrder, status: selectedStatus }));
      } else {
        setError('Failed to update status. Please try again.');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      setError('Failed to update status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleShippingSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/shipping', {
        email: order.email,
        orderId: order.id,
        shippingMethod: order.shippingMethod,
        shippingTerms: order.shippingTerms,
        shipmentDate: order.shipmentDate,
        deliveryDate: order.deliveryDate,
      });
      if (response.status === 200) {
        setOrder((prevOrder) => ({
          ...prevOrder,
          shippingMethod: order.shippingMethod,
          shippingTerms: order.shippingTerms,
          shipmentDate: order.shipmentDate,
          deliveryDate: order.deliveryDate,
        }));
      } else {
        setError('Failed to update shipping information. Please try again.');
      }
    } catch (error) {
      console.error('Error updating shipping information:', error);
      setError('Failed to update shipping information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
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
          <AnimatedLabel sx={{ mt: 2 }}>Loading</AnimatedLabel>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  // Calculate order amounts directly from order data
  const subtotal = order.orderItems.reduce((acc, item) => acc + item.quantity * item.price, 0);
  const subtotalLessDiscount = subtotal - (order.discount ?? 0);
  const totalTax = order.tax ?? 0;
  const total =
    subtotalLessDiscount +
    totalTax +
    (order.deliveryCharge ?? 0) +
    (order.extraDeliveryCharge ?? 0) +
    (order.otherCharges ?? 0);

  return (
    <Box sx={{ bgcolor: '#F9FAFB', minHeight: '100vh', p: { xs: 2, md: 4 } }}>
      {/* Header & Navigation */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
        <Button
          onClick={() => router.back()}
          sx={{
            minWidth: '40px',
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            bgcolor: '#fff',
            color: '#4B5563',
            border: '1px solid #E5E7EB',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
            '&:hover': { bgcolor: '#F3F4F6', color: '#111827' },
            transition: 'all 0.2s'
          }}
        >
          <ArrowBackIcon sx={{ fontSize: '1rem', ml: 0.5 }} />
        </Button>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#111827', letterSpacing: '-1px' }}>
            Order Details
          </Typography>
          <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 500 }}>
            Viewing details for Order <span style={{ color: '#3B82F6', fontWeight: 700 }}>#{order.id}</span>
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 4 },
            borderRadius: '24px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            bgcolor: '#fff'
          }}
        >
          <Grid container spacing={3}>
            {/* General Section */}
            <Grid item xs={12} lg={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Box sx={{ p: 1, bgcolor: '#DBEAFE', borderRadius: '10px', color: '#1D4ED8', display: 'flex' }}>
                  <CalendarIcon sx={{ fontSize: '1.25rem' }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#111827', fontSize: '1.1rem' }}>
                  General Information
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 600, minWidth: '100px' }}>
                    Date Created:
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#111827', fontWeight: 500 }}>
                    {new Date(order.createdAt).toLocaleString('en-US', {
                      dateStyle: 'long',
                      timeStyle: 'short'
                    })}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 600, minWidth: '100px' }}>
                    Status:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FormControl variant="outlined" size="small" sx={{ minWidth: 140 }}>
                      <Select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        sx={{
                          borderRadius: '10px',
                          bgcolor: '#F9FAFB',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E5E7EB' },
                          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#3B82F6' }
                        }}
                      >
                        <MenuItem value="PENDING" sx={{ gap: 1.5, fontSize: '0.85rem', fontWeight: 600 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#94A3B8' }} />
                          Pending
                        </MenuItem>
                        <MenuItem value="PAID" sx={{ gap: 1.5, fontSize: '0.85rem', fontWeight: 600 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10B981' }} />
                          Paid
                        </MenuItem>
                        <MenuItem value="SHIPPED" sx={{ gap: 1.5, fontSize: '0.85rem', fontWeight: 600 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#3B82F6' }} />
                          Shipped
                        </MenuItem>
                        <MenuItem value="COMPLETED" sx={{ gap: 1.5, fontSize: '0.85rem', fontWeight: 600 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#8B5CF6' }} />
                          Completed
                        </MenuItem>
                        <MenuItem value="CANCELLED" sx={{ gap: 1.5, fontSize: '0.85rem', fontWeight: 600 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#EF4444' }} />
                          Cancelled
                        </MenuItem>
                      </Select>
                    </FormControl>
                    <Button
                      variant="contained"
                      onClick={handleStatusChange}
                      disabled={loading || !selectedStatus || selectedStatus === order.status}
                      sx={{
                        textTransform: 'none',
                        borderRadius: '10px',
                        bgcolor: '#3B82F6',
                        fontWeight: 700,
                        px: 2,
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)',
                        '&:hover': { bgcolor: '#2563EB', boxShadow: '0 6px 16px rgba(59, 130, 246, 0.3)' }
                      }}
                    >
                      Update
                    </Button>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 600, minWidth: '100px' }}>
                    Customer:
                  </Typography>
                  <Chip
                    icon={<PersonIcon sx={{ fontSize: '1rem !important' }} />}
                    label={`User ID: ${order.userId}`}
                    size="small"
                    sx={{
                      borderRadius: '8px',
                      bgcolor: '#F3F4F6',
                      fontWeight: 600,
                      color: '#4B5563'
                    }}
                  />
                </Box>
              </Box>
            </Grid>

            {/* Shipping Address Section */}
            <Grid item xs={12} lg={6}>
              <Card
                elevation={0}
                sx={{
                  bgcolor: '#F9FAFB',
                  borderRadius: '16px',
                  border: '1px solid #E5E7EB',
                  height: '100%'
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                    <Box sx={{ p: 1, bgcolor: '#FEF3C7', borderRadius: '10px', color: '#B45309', display: 'flex' }}>
                      <MapPinIcon sx={{ fontSize: '1.25rem' }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#111827', fontSize: '1.1rem' }}>
                      Shipping Address
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <MapPinIcon sx={{ color: '#9CA3AF', fontSize: '1.25rem', mt: 0.5 }} />
                      <Box>
                        <Typography variant="body2" sx={{ color: '#111827', fontWeight: 600, mb: 0.5 }}>
                          Full Address
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#4B5563', lineHeight: 1.6 }}>
                          {order.streetAddress}, {order.apartmentSuite && `${order.apartmentSuite}, `}
                          {order.city}, {order.state} {order.zip}, {order.country}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <EmailIcon sx={{ color: '#9CA3AF', fontSize: '1.25rem', mt: 0.5 }} />
                      <Box>
                        <Typography variant="body2" sx={{ color: '#111827', fontWeight: 600, mb: 0.5 }}>
                          Email Contact
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#3B82F6', fontWeight: 500, textDecoration: 'underline' }}>
                          {order.email}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Shipping Information Form */}
          <Box sx={{ mt: 6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <Box sx={{ p: 1, bgcolor: '#ECFDF5', borderRadius: '10px', color: '#059669', display: 'flex' }}>
                <ShippingIcon sx={{ fontSize: '1.25rem' }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#111827', fontSize: '1.1rem' }}>
                Shipping Details & Tracking
              </Typography>
            </Box>

            <form onSubmit={handleShippingSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Shipping Method"
                    placeholder="e.g. FedEx Standard"
                    value={order.shippingMethod || ''}
                    onChange={(e) => setOrder((prevOrder) => ({ ...prevOrder, shippingMethod: e.target.value }))}
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        bgcolor: '#F9FAFB',
                        '&:hover fieldset': { borderColor: '#3B82F6' }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Shipping Tracking/Details"
                    placeholder="Tracking number or specific terms"
                    value={order.shippingTerms || ''}
                    onChange={(e) => setOrder((prevOrder) => ({ ...prevOrder, shippingTerms: e.target.value }))}
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        bgcolor: '#F9FAFB',
                        '&:hover fieldset': { borderColor: '#3B82F6' }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Shipment Date"
                    type="date"
                    value={order.shipmentDate ? new Date(order.shipmentDate).toISOString().substr(0, 10) : ''}
                    onChange={(e) =>
                      setOrder((prevOrder) => ({
                        ...prevOrder,
                        shipmentDate: e.target.value,
                      }))
                    }
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: new Date().toISOString().split('T')[0] }}
                    onKeyDown={(e) => e.preventDefault()}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        bgcolor: '#F9FAFB',
                        '&:hover fieldset': { borderColor: '#3B82F6' }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Estimated Delivery"
                    type="date"
                    value={order.deliveryDate ? new Date(order.deliveryDate).toISOString().substr(0, 10) : ''}
                    onChange={(e) =>
                      setOrder((prevOrder) => ({
                        ...prevOrder,
                        deliveryDate: e.target.value,
                      }))
                    }
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: new Date().toISOString().split('T')[0] }}
                    onKeyDown={(e) => e.preventDefault()}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        bgcolor: '#F9FAFB',
                        '&:hover fieldset': { borderColor: '#3B82F6' }
                      }
                    }}
                  />
                </Grid>
              </Grid>
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SuccessIcon />}
                  sx={{
                    textTransform: 'none',
                    borderRadius: '12px',
                    bgcolor: '#10B981',
                    fontWeight: 700,
                    px: 3,
                    py: 1.2,
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
                    '&:hover': { bgcolor: '#059669', boxShadow: '0 6px 16px rgba(16, 185, 129, 0.3)' }
                  }}
                >
                  Update Shipping Info
                </Button>
              </Box>
            </form>
          </Box>

          {/* Order Items Table */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'grey.700', textAlign: 'center', py: 1 }}>
              Items
            </Typography>
            <TableContainer sx={{ overflowX: 'auto', mb: 2 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                    <TableCell sx={{ fontWeight: 700, color: '#4B5563', fontSize: '0.85rem' }}>Product</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#4B5563', fontSize: '0.85rem' }}>Details</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#4B5563', fontSize: '0.85rem' }}>QTY</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#4B5563', fontSize: '0.85rem' }}>Unit Price</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#4B5563', fontSize: '0.85rem', textAlign: 'right' }}>Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.orderItems.map((item) => (
                    <TableRow key={item.id} sx={{ '&:hover': { bgcolor: '#FDFDFD' } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          {item.product && item.product.images && item.product.images.length > 0 ? (
                            <Box sx={{
                              position: 'relative',
                              width: 56,
                              height: 56,
                              borderRadius: '12px',
                              overflow: 'hidden',
                              border: '1px solid #F3F4F6',
                              flexShrink: 0
                            }}>
                              <Image
                                fill
                                src={`${process.env.NEXT_PUBLIC_UPLOADED_IMAGE_URL}/${item.product.images[0].url}`}
                                alt={item.product.name}
                                style={{ objectFit: 'cover' }}
                              />
                            </Box>
                          ) : (
                            <Box sx={{
                              width: 56,
                              height: 56,
                              bgcolor: '#F3F4F6',
                              borderRadius: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#9CA3AF',
                              flexShrink: 0
                            }}>
                              <InventoryIcon />
                            </Box>
                          )}
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#111827' }}>
                              {item.product ? item.product.name : 'Unknown Product'}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#6B7280' }}>
                              ID: {item.productId}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          {item.selectedColor && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: item.selectedColor }} />
                              <Typography variant="caption" sx={{ color: '#4B5563', fontWeight: 500 }}>{item.selectedColor}</Typography>
                            </Box>
                          )}
                          {item.selectedSize && (
                            <Typography variant="caption" sx={{ color: '#4B5563', fontWeight: 500 }}>Size: {item.selectedSize}</Typography>
                          )}
                          {!item.selectedColor && !item.selectedSize && (
                            <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Standard</Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827' }}>
                          × {item.quantity}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#4B5563' }}>
                          Rs.{item.price.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#111827' }}>
                          Rs.{(item.quantity * item.price).toLocaleString()}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Order Summary */}
          <Box sx={{ mt: 6 }}>
            <Paper
              elevation={0}
              sx={{
                bgcolor: '#F9FAFB',
                p: 3,
                borderRadius: '20px',
                border: '1px dotted #D1D5DB'
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#6B7280' }}>Subtotal</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#111827' }}>
                    Rs.{subtotal.toLocaleString()}
                  </Typography>
                </Box>
                {order.discount > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#EF4444' }}>Discount</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#EF4444' }}>
                      - Rs.{order.discount.toLocaleString()}
                    </Typography>
                  </Box>
                )}
                <Divider sx={{ borderStyle: 'dashed' }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#6B7280' }}>Delivery Charge</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#111827' }}>
                    Rs.{((order.deliveryCharge ?? 0) + (order.extraDeliveryCharge ?? 0)).toLocaleString()}
                  </Typography>
                </Box>

                {order.tax > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#6B7280' }}>Tax</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#111827' }}>
                      Rs.{order.tax.toLocaleString()}
                    </Typography>
                  </Box>
                )}

                {order.otherCharges > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#6B7280' }}>Other Charges</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#111827' }}>
                      Rs.{order.otherCharges.toLocaleString()}
                    </Typography>
                  </Box>
                )}

                <Box sx={{
                  mt: 2,
                  p: 2,
                  background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                  borderRadius: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  boxShadow: '0 8px 20px rgba(37, 99, 235, 0.2)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:before': {
                    content: '""',
                    position: 'absolute',
                    top: '-50%',
                    left: '-50%',
                    width: '200%',
                    height: '200%',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                    pointerEvents: 'none'
                  }
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{
                      p: 1,
                      bgcolor: 'rgba(255,255,255,0.15)',
                      borderRadius: '10px',
                      color: '#fff',
                      display: 'flex',
                      backdropFilter: 'blur(4px)',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                      <PaymentIcon sx={{ fontSize: '1.2rem' }} />
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600, fontSize: '0.7rem' }}>TOTAL PAYABLE</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 800, color: '#fff', lineHeight: 1 }}>Grand Total</Typography>
                    </Box>
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>
                    Rs.{total.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Box>

        </Paper>
      </Box>
    </Box>
  );
};

export default AdminOrdersPage;