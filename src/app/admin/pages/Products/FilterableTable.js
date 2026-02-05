'use client';
import React, { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// MUI Imports
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select as MuiSelect,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import InventoryIcon from '@mui/icons-material/Inventory';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import InfoIcon from '@mui/icons-material/Info';
import DescriptionIcon from '@mui/icons-material/Description';
import PublicIcon from '@mui/icons-material/Public';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import StyleIcon from '@mui/icons-material/Style';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';

const FilterableTable = ({
  products = [],
  fetchProducts,
  categories = [],
  subcategories = [],
  colors = [],
  sizes = [],
}) => {
  const [filter, setFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [topRatedFilter, setTopRatedFilter] = useState('all');
  const [filteredData, setFilteredData] = useState(products);
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [itemSlugToDelete, setItemSlugToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    stock: '',
    subcategorySlug: '',
    colors: [],
    sizes: [],
    discount: '',
    isTopRated: false,
    images: [],
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    sku: '',
  });

  const [existingImages, setExistingImages] = useState([]);
  const [page, setPage] = useState(0); // Current page
  const [rowsPerPage, setRowsPerPage] = useState(15); // Rows per page
  const fileInputRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    let result = products;

    // Search filter (Name, SKU, ID, etc.)
    if (filter) {
      result = result.filter((item) =>
        Object.values(item).some((val) =>
          String(val).toLowerCase().includes(filter.toLowerCase())
        ) ||
        String(item.id).includes(filter) ||
        String(item.sku || '').toLowerCase().includes(filter.toLowerCase())
      );
    }

    // Stock level filter
    if (stockFilter !== 'all') {
      result = result.filter((item) => {
        const stock = parseInt(item.stock || 0);
        if (stockFilter === 'out') return stock === 0;
        if (stockFilter === 'low') return stock > 0 && stock < 10;
        if (stockFilter === 'medium') return stock >= 10 && stock < 50;
        if (stockFilter === 'healthy') return stock >= 50;
        return true;
      });
    }

    // Top Rated filter
    if (topRatedFilter !== 'all') {
      const isTop = topRatedFilter === 'top';
      result = result.filter((item) => item.isTopRated === isTop);
    }

    setFilteredData(result);
    setPage(0);
  }, [filter, stockFilter, topRatedFilter, products]);

  useEffect(() => {
    if (subcategories.length) {
      setFilteredSubcategories(subcategories);
    } else {
      setFilteredSubcategories([]);
    }
  }, [selectedCategory, subcategories]);

  const handleDeleteClick = (slug) => {
    setItemSlugToDelete(slug);
    setIsPopupVisible(true);
  };

  const handleDeleteItem = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/products/${itemSlugToDelete}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        fetchProducts();
        setIsPopupVisible(false);
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
    setIsLoading(false);
  };

  const handleCancelDelete = () => {
    setIsPopupVisible(false);
    setItemSlugToDelete(null);
  };

  const roundToTwoDecimalPlaces = (num) => Math.round(num * 100) / 100;

  const inputStyles = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      bgcolor: '#fff',
      '&:hover fieldset': { borderColor: '#3B82F6' },
      '&.Mui-focused fieldset': { borderColor: '#3B82F6' },
    },
    '& .MuiInputLabel-root.Mui-focused': { color: '#3B82F6' },
  };

  const sectionHeaderStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
    mb: 2.5,
    pb: 1,
    borderBottom: '1px solid #F3F4F6'
  };

  const selectMenuProps = {
    PaperProps: {
      sx: {
        borderRadius: '12px',
        mt: 1,
        boxShadow: '0 8px 16px -4px rgba(0,0,0,0.1), 0 4px 8px -4px rgba(0,0,0,0.06)',
        border: '1px solid #F3F4F6',
        '& .MuiList-root': { p: 1 },
        '& .MuiMenuItem-root': {
          fontSize: '0.9rem',
          fontWeight: 500,
          borderRadius: '8px',
          mb: 0.5,
          '&:last-child': { mb: 0 },
          color: '#4B5563',
          '&:hover': { bgcolor: '#F3F4F6', color: '#3B82F6' },
          '&.Mui-selected': {
            bgcolor: '#EFF6FF',
            color: '#3B82F6',
            fontWeight: 700,
            '&:hover': { bgcolor: '#DBEAFE' }
          },
        }
      }
    }
  };

  const handleEditItem = (item) => {
    setEditProduct(item);

    let itemColors = [];
    try {
      if (Array.isArray(item.colors)) {
        itemColors = item.colors;
      } else if (typeof item.colors === 'string') {
        // Handle "null" string or valid JSON
        if (item.colors === 'null') itemColors = [];
        else itemColors = JSON.parse(item.colors);
      }
      // Ensure it's an array purely
      if (!Array.isArray(itemColors)) itemColors = [];
    } catch (e) {
      console.error("Error parsing colors for edit:", e);
      itemColors = [];
    }

    let itemSizes = [];
    try {
      if (Array.isArray(item.sizes)) {
        itemSizes = item.sizes;
      } else if (typeof item.sizes === 'string') {
        if (item.sizes === 'null') itemSizes = [];
        else itemSizes = JSON.parse(item.sizes);
      }
      if (!Array.isArray(itemSizes)) itemSizes = [];
    } catch (e) {
      console.error("Error parsing sizes for edit:", e);
      itemSizes = [];
    }

    const existingColors = colors
      .filter((color) => itemColors.includes(color.id))
      .map((color) => ({
        value: color.id,
        label: `${color.name} (${color.hex})`,
        hex: color.hex,
      }));

    const existingSizes = sizes
      .filter((size) => itemSizes.includes(size.id))
      .map((size) => ({ value: size.id, label: size.name }));

    setProductForm({
      name: item.name,
      slug: item.slug,
      description: item.description,
      price: item.price,
      stock: item.stock,
      subcategorySlug: item.subcategorySlug,
      colors: existingColors,
      sizes: existingSizes,
      discount: item.discount || '',
      isTopRated: item.isTopRated || false,
      images: [],
      meta_title: item.meta_title || '',
      meta_description: item.meta_description || '',
      meta_keywords: item.meta_keywords || '',
      sku: item.sku,
    });
    setExistingImages(item.images.map((img) => img.url));
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue =
      type === 'checkbox' ? checked : name === 'stock' ? Math.max(0, parseInt(value) || 0) : value;
    setProductForm({ ...productForm, [name]: newValue });
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const uploadedImages = await Promise.all(
        productForm.images.map(async (file) => {
          const imageBase64 = await convertToBase64(file);
          const response = await fetch(process.env.NEXT_PUBLIC_UPLOAD_IMAGE_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: imageBase64 }),
          });
          const result = await response.json();
          if (response.ok) return result.image_url;
          throw new Error(result.error || 'Failed to upload image');
        })
      );

      const productData = {
        ...productForm,
        stock: parseInt(productForm.stock) || 0,
        images: [...existingImages, ...uploadedImages],
        discount: productForm.discount ? productForm.discount : null,
        colors: productForm.colors.map((color) => color.value),
        sizes: productForm.sizes.map((size) => size.value),
      };

      const response = await fetch(`/api/products/${editProduct.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        fetchProducts();
        setEditProduct(null);
        setProductForm({
          name: '',
          slug: '',
          description: '',
          price: '',
          stock: '',
          subcategorySlug: '',
          colors: [],
          sizes: [],
          discount: '',
          isTopRated: false,
          images: [],
          meta_title: '',
          meta_description: '',
          meta_keywords: '',
          sku: '',
        });
        setExistingImages([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error updating product:', error);
    }
    setIsLoading(false);
  };

  const handleCancelEdit = () => {
    setEditProduct(null);
    setProductForm({
      name: '',
      slug: '',
      description: '',
      price: '',
      stock: '',
      subcategorySlug: '',
      colors: [],
      sizes: [],
      discount: '',
      isTopRated: false,
      images: [],
      meta_title: '',
      meta_description: '',
      meta_keywords: '',
      sku: '',
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setProductForm((prevForm) => ({
      ...prevForm,
      images: [...prevForm.images, ...files],
    }));
  };

  const handleRemoveExistingImage = (index) => {
    setExistingImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const handleRemoveImage = (index) => {
    setProductForm((prevForm) => ({
      ...prevForm,
      images: prevForm.images.filter((_, i) => i !== index),
    }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Pagination Handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page when rows per page changes
  };

  // Calculate paginated data
  const paginatedData = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Stock level helper function
  const getStockStatus = (stock) => {
    const stockNum = parseInt(stock) || 0;
    if (stockNum === 0) {
      return { label: 'Out of Stock', color: 'error', severity: 'error', icon: <WarningIcon /> };
    } else if (stockNum < 10) {
      return { label: 'Low Stock', color: 'warning', severity: 'warning', icon: <WarningIcon /> };
    } else if (stockNum < 50) {
      return { label: 'Medium Stock', color: 'info', severity: 'info', icon: <InventoryIcon /> };
    } else {
      return { label: 'In Stock', color: 'success', severity: 'success', icon: <CheckCircleIcon /> };
    }
  };

  // Stock display component
  const StockDisplay = ({ stock }) => {
    const stockNum = parseInt(stock) || 0;
    const status = getStockStatus(stock);

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Chip
          icon={status.icon}
          label={`${stockNum} units`}
          color={status.color}
          size="small"
          sx={{
            fontWeight: 600,
            fontSize: '0.75rem',
          }}
        />
        <Typography
          variant="caption"
          sx={{
            color: status.color === 'error' ? 'error.main' :
              status.color === 'warning' ? 'warning.main' :
                status.color === 'info' ? 'info.main' : 'success.main',
            fontWeight: 500,
            fontSize: '0.7rem',
          }}
        >
          {status.label}
        </Typography>
      </Box>
    );
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 2 }}>
      {/* Confirmation Dialog */}
      <Dialog
        open={isPopupVisible}
        onClose={handleCancelDelete}
        PaperProps={{
          sx: { borderRadius: '24px', p: 1, maxWidth: '400px' }
        }}
      >
        <DialogTitle sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, pt: 4 }}>
          <Box sx={{ p: 2, bgcolor: '#FEF2F2', borderRadius: '50%', color: '#EF4444', display: 'flex' }}>
            <WarningIcon sx={{ fontSize: '2.5rem' }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#111827' }}>Are you sure?</Typography>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', pb: 0 }}>
          <Typography variant="body1" sx={{ color: '#4B5563', fontWeight: 500 }}>
            Deleting this product will also remove all associated order history. This action is <span style={{ color: '#EF4444', fontWeight: 700 }}>irreversible</span>.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 4, pt: 3, justifyContent: 'center', gap: 2 }}>
          <Button
            onClick={handleCancelDelete}
            sx={{
              textTransform: 'none',
              borderRadius: '12px',
              px: 3,
              fontWeight: 700,
              color: '#6B7280',
              bgcolor: '#F3F4F6',
              '&:hover': { bgcolor: '#E5E7EB' }
            }}
          >
            No, Cancel
          </Button>
          <Button
            onClick={handleDeleteItem}
            disabled={isLoading}
            variant="contained"
            sx={{
              textTransform: 'none',
              borderRadius: '12px',
              px: 3,
              fontWeight: 800,
              bgcolor: '#EF4444',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
              '&:hover': { bgcolor: '#DC2626', boxShadow: '0 6px 16px rgba(239, 68, 68, 0.3)' }
            }}
          >
            {isLoading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Yes, Delete Product'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Loading Overlay */}
      {isLoading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {/* Products List */}
      <Card elevation={0} sx={{ borderRadius: '24px', border: '1px solid #E5E7EB', bgcolor: '#fff', overflow: 'hidden' }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#111827', letterSpacing: '-1px' }}>
                All Products
              </Typography>
              <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 500 }}>
                Inventory management and stock control center
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button
                variant="outlined"
                onClick={() => setIsSearchVisible(!isSearchVisible)}
                startIcon={<SearchIcon />}
                sx={{
                  textTransform: 'none',
                  borderRadius: '12px',
                  px: 2,
                  fontWeight: 700,
                  borderColor: isSearchVisible ? '#3B82F6' : '#E5E7EB',
                  color: isSearchVisible ? '#3B82F6' : '#4B5563',
                  bgcolor: isSearchVisible ? '#EFF6FF' : 'transparent',
                  '&:hover': { borderColor: '#3B82F6', bgcolor: '#EFF6FF' }
                }}
              >
                Search
              </Button>
              <Button
                variant="contained"
                onClick={() => router.push('/admin/pages/add-product')}
                startIcon={<PlusIcon className="h-5 w-5" />}
                sx={{
                  textTransform: 'none',
                  borderRadius: '12px',
                  px: 3,
                  fontWeight: 800,
                  bgcolor: '#3B82F6',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                  '&:hover': { bgcolor: '#2563EB', boxShadow: '0 6px 16px rgba(59, 130, 246, 0.4)' }
                }}
              >
                Add Product
              </Button>
            </Box>
          </Box>

          {/* Search Input */}
          {isSearchVisible && (
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Filter by name, SKU, or details..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#9CA3AF' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 4,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  bgcolor: '#F9FAFB',
                  '&:hover fieldset': { borderColor: '#3B82F6' },
                  '&.Mui-focused fieldset': { borderColor: '#3B82F6' },
                },
              }}
            />
          )}

          {/* Stock Summary Cards */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {[
              { label: 'Out of Stock', count: filteredData.filter((p) => parseInt(p.stock || 0) === 0).length, color: '#EF4444', icon: <WarningIcon sx={{ fontSize: '1.2rem', color: '#EF4444' }} /> },
              { label: 'Low Stock', count: filteredData.filter((p) => { const s = parseInt(p.stock || 0); return s > 0 && s < 10; }).length, color: '#F59E0B', icon: <WarningIcon sx={{ fontSize: '1.2rem', color: '#F59E0B' }} /> },
              { label: 'Medium Stock', count: filteredData.filter((p) => { const s = parseInt(p.stock || 0); return s >= 10 && s < 50; }).length, color: '#3B82F6', icon: <InventoryIcon sx={{ fontSize: '1.2rem', color: '#3B82F6' }} /> },
              { label: 'Healthy Stock', count: filteredData.filter((p) => parseInt(p.stock || 0) >= 50).length, color: '#10B981', icon: <CheckCircleIcon sx={{ fontSize: '1.2rem', color: '#10B981' }} /> }
            ].map((card, idx) => (
              <Grid item xs={12} sm={6} md={3} key={idx}>
                <Card sx={{
                  p: 2.5,
                  borderRadius: '20px',
                  border: '1px solid rgba(26, 32, 44, 0.08)',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                  background: `linear-gradient(135deg, #fff 60%, ${card.color}15 100%)`,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                    <Typography variant="caption" sx={{ color: '#6B7280', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {card.label}
                    </Typography>
                    <Box sx={{
                      p: 0.75,
                      bgcolor: `${card.color}15`,
                      borderRadius: '10px',
                      display: 'flex'
                    }}>
                      {card.icon}
                    </Box>
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 900, color: '#111827' }}>
                    {card.count} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#6B7280' }}>Items</span>
                  </Typography>
                  <Box sx={{ height: '4px', bgcolor: card.color, width: '40%', borderRadius: '2px', mt: 'auto', pt: 0, opacity: 0.6 }} />
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Advanced Filters Row */}
          <Box sx={{
            display: 'flex',
            gap: 2,
            mb: 4,
            flexWrap: 'wrap',
            bgcolor: '#F9FAFB',
            p: 2,
            borderRadius: '16px',
            border: '1px solid #F3F4F6'
          }}>
            <Box sx={{ minWidth: '150px', flex: 1 }}>
              <TextField
                fullWidth
                size="small"
                label="Search by ID"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                sx={inputStyles}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: '#9CA3AF', mr: 1, fontSize: '1.1rem' }} />
                }}
              />
            </Box>
            <Box sx={{ minWidth: '200px', flex: 1 }}>
              <FormControl fullWidth size="small" sx={inputStyles}>
                <InputLabel>Stock Status</InputLabel>
                <MuiSelect
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value)}
                  label="Stock Status"
                  MenuProps={selectMenuProps}
                >
                  <MenuItem value="all">All Inventory</MenuItem>
                  <MenuItem value="healthy">Healthy Stock (50+)</MenuItem>
                  <MenuItem value="medium">Medium Stock (10-49)</MenuItem>
                  <MenuItem value="low">Low Stock (1-9)</MenuItem>
                  <MenuItem value="out">Out of Stock (0)</MenuItem>
                </MuiSelect>
              </FormControl>
            </Box>
            <Box sx={{ minWidth: '180px', flex: 1 }}>
              <FormControl fullWidth size="small" sx={inputStyles}>
                <InputLabel>Rating Status</InputLabel>
                <MuiSelect
                  value={topRatedFilter}
                  onChange={(e) => setTopRatedFilter(e.target.value)}
                  label="Rating Status"
                  MenuProps={selectMenuProps}
                >
                  <MenuItem value="all">Any Rating</MenuItem>
                  <MenuItem value="top">Top Rated Only</MenuItem>
                  <MenuItem value="regular">Regular Items</MenuItem>
                </MuiSelect>
              </FormControl>
            </Box>
            <Button
              variant="text"
              onClick={() => {
                setFilter('');
                setStockFilter('all');
                setTopRatedFilter('all');
              }}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                color: '#EF4444',
                '&:hover': { bgcolor: '#FEF2F2' }
              }}
            >
              Reset Filters
            </Button>
          </Box>

          {/* Products Table */}
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              borderRadius: '16px',
              border: '1px solid #F3F4F6',
              overflow: 'hidden',
            }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                  {['ID', 'Product', 'SKU', 'Price', 'Inventory', 'Updated', 'Actions'].map((head) => (
                    <TableCell key={head} sx={{ color: '#4B5563', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', py: 2 }}>
                      {head}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.isArray(paginatedData) && paginatedData.length > 0 ? (
                  paginatedData.map((item) => (
                    <TableRow
                      key={item.slug}
                      sx={{
                        '&:hover': { bgcolor: '#FDFDFD' },
                        transition: 'background-color 0.2s',
                      }}
                    >
                      <TableCell sx={{ fontWeight: 600, color: '#6B7280', fontSize: '0.8rem' }}>#{item.id}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box sx={{
                            width: 48, height: 48, borderRadius: '10px', overflow: 'hidden',
                            border: '1px solid #F3F4F6', bgcolor: '#F9FAFB', flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}>
                            {item.images && item.images.length > 0 ? (
                              <Image
                                width={48}
                                height={48}
                                src={item.images[0].url.startsWith('https://') ? item.images[0].url : `${process.env.NEXT_PUBLIC_UPLOADED_IMAGE_URL}/${item.images[0].url}`}
                                alt=""
                                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                              />
                            ) : (
                              <InventoryIcon sx={{ fontSize: '1.2rem', color: '#D1D5DB' }} />
                            )}
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#111827', maxWidth: 200, lineHeight: 1.2 }}>
                            {item.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={item.sku || 'No SKU'} size="small" sx={{ bgcolor: '#F3F4F6', fontWeight: 600, borderRadius: '6px' }} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#3B82F6' }}>
                          Rs.{parseFloat(item.price || 0).toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <StockDisplay stock={item.stock} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 500 }}>
                          {new Date(item.updatedAt).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton size="small" color="primary" onClick={() => handleEditItem(item)} sx={{ bgcolor: '#EFF6FF', '&:hover': { bgcolor: '#DBEAFE' } }}>
                            <EditIcon sx={{ fontSize: '1.1rem' }} />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => handleDeleteClick(item.slug)} sx={{ bgcolor: '#FEF2F2', '&:hover': { bgcolor: '#FEE2E2' } }}>
                            <DeleteIcon sx={{ fontSize: '1.1rem' }} />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                      <Box sx={{ opacity: 0.5, textAlign: 'center' }}>
                        <InventoryIcon sx={{ fontSize: '3rem', mb: 1, color: '#9CA3AF' }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>No products found</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <TablePagination
              rowsPerPageOptions={[5, 10, 15, 25, 50]}
              component="div"
              count={filteredData.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{ border: 'none' }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Edit Product Dialog */}
      {editProduct && (
        <Dialog
          open={Boolean(editProduct)}
          onClose={handleCancelEdit}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: { borderRadius: '28px', bgcolor: '#F9FAFB', backgroundImage: 'none' }
          }}
        >
          <DialogTitle sx={{ p: 3, pb: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#111827', letterSpacing: '-0.5px' }}>Edit Product</Typography>
              <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 500 }}>Update details for product ID: #{editProduct.id}</Typography>
            </Box>
            <IconButton onClick={handleCancelEdit} sx={{ bgcolor: '#F3F4F6', '&:hover': { bgcolor: '#E5E7EB' } }}>
              <CloseIcon sx={{ fontSize: '1.25rem' }} />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Grid container spacing={3} sx={{ mt: 0 }}>
              {/* Left Column: General & Description & SEO */}
              <Grid item xs={12} lg={8}>
                <Stack spacing={3}>
                  {/* General Info Card */}
                  <Paper elevation={0} sx={{ p: 3, borderRadius: '24px', border: '1px solid #E5E7EB' }}>
                    <Box sx={sectionHeaderStyles}>
                      <Box sx={{ p: 1, bgcolor: '#DBEAFE', borderRadius: '10px', color: '#1D4ED8', display: 'flex' }}>
                        <InfoIcon sx={{ fontSize: '1.25rem' }} />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', fontSize: '1rem' }}>General Details</Typography>
                    </Box>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Product Name"
                          name="name"
                          value={productForm.name}
                          onChange={handleFormChange}
                          sx={inputStyles}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Product URL Slug"
                          name="slug"
                          value={productForm.slug}
                          onChange={(e) => setProductForm({ ...productForm, slug: e.target.value.replace(/\s+/g, '-') })}
                          sx={inputStyles}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="SKU number"
                          name="sku"
                          value={productForm.sku}
                          onChange={handleFormChange}
                          sx={inputStyles}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl fullWidth sx={inputStyles}>
                          <InputLabel>Subcategory</InputLabel>
                          <MuiSelect
                            name="subcategorySlug"
                            value={productForm.subcategorySlug}
                            onChange={handleFormChange}
                            label="Subcategory"
                            MenuProps={selectMenuProps}
                          >
                            <MenuItem value="">Select Subcategory</MenuItem>
                            {filteredSubcategories.map((subcat) => (
                              <MenuItem key={subcat.id} value={subcat.slug}>{subcat.name}</MenuItem>
                            ))}
                          </MuiSelect>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </Paper>

                  {/* Description Card */}
                  <Paper elevation={0} sx={{ p: 3, borderRadius: '24px', border: '1px solid #E5E7EB' }}>
                    <Box sx={sectionHeaderStyles}>
                      <Box sx={{ p: 1, bgcolor: '#F3E8FF', borderRadius: '10px', color: '#7E22CE', display: 'flex' }}>
                        <DescriptionIcon sx={{ fontSize: '1.25rem' }} />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', fontSize: '1rem' }}>Product Description</Typography>
                    </Box>
                    <Box sx={{
                      '& .ql-toolbar': { borderRadius: '12px 12px 0 0', borderColor: '#E5E7EB', bgcolor: '#F9FAFB' },
                      '& .ql-container': { borderRadius: '0 0 12px 12px', borderColor: '#E5E7EB', minHeight: '200px', fontSize: '1rem' }
                    }}>
                      <ReactQuill
                        value={productForm.description}
                        onChange={(value) => setProductForm({ ...productForm, description: value })}
                      />
                    </Box>
                  </Paper>

                  {/* SEO Card */}
                  <Paper elevation={0} sx={{ p: 3, borderRadius: '24px', border: '1px solid #E5E7EB' }}>
                    <Box sx={sectionHeaderStyles}>
                      <Box sx={{ p: 1, bgcolor: '#ECFDF5', borderRadius: '10px', color: '#059669', display: 'flex' }}>
                        <PublicIcon sx={{ fontSize: '1.25rem' }} />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', fontSize: '1rem' }}>Search Optimization</Typography>
                    </Box>
                    <Stack spacing={3}>
                      <TextField
                        fullWidth
                        label="Meta Title"
                        value={productForm.meta_title}
                        onChange={(e) => setProductForm({ ...productForm, meta_title: e.target.value.slice(0, 60) })}
                        sx={inputStyles}
                        helperText={`${productForm.meta_title.length}/60 characters`}
                      />
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Meta Description"
                        value={productForm.meta_description}
                        onChange={(e) => setProductForm({ ...productForm, meta_description: e.target.value.slice(0, 160) })}
                        sx={inputStyles}
                        helperText={`${productForm.meta_description.length}/160 characters`}
                      />
                    </Stack>
                  </Paper>
                </Stack>
              </Grid>

              {/* Right Column: Pricing, Media & Attributes */}
              <Grid item xs={12} lg={4}>
                <Stack spacing={3}>
                  {/* Pricing Card */}
                  <Paper elevation={0} sx={{ p: 3, borderRadius: '24px', border: '1px solid #E5E7EB' }}>
                    <Box sx={sectionHeaderStyles}>
                      <Box sx={{ p: 1, bgcolor: '#DCFCE7', borderRadius: '10px', color: '#16A34A', display: 'flex' }}>
                        <LocalOfferIcon sx={{ fontSize: '1.25rem' }} />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', fontSize: '1rem' }}>Pricing & Stock</Typography>
                    </Box>
                    <Stack spacing={3}>
                      <TextField
                        fullWidth
                        label="Price (Rs.)"
                        name="price"
                        type="number"
                        value={productForm.price}
                        onChange={handleFormChange}
                        sx={inputStyles}
                      />
                      <TextField
                        fullWidth
                        label="Discount (%)"
                        name="discount"
                        type="number"
                        value={productForm.discount}
                        onChange={(e) => setProductForm({ ...productForm, discount: roundToTwoDecimalPlaces(parseFloat(e.target.value) || 0) })}
                        sx={inputStyles}
                      />
                      <Box sx={{ bgcolor: '#F9FAFB', p: 2, borderRadius: '16px', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#4B5563' }}>Stock Level</Typography>
                        <TextField
                          type="number"
                          size="small"
                          name="stock"
                          value={productForm.stock}
                          onChange={handleFormChange}
                          sx={{ width: '80px', '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: '#fff' } }}
                        />
                      </Box>
                      <FormControlLabel
                        control={<Checkbox checked={productForm.isTopRated} onChange={handleFormChange} name="isTopRated" sx={{ color: '#3B82F6', '&.Mui-checked': { color: '#3B82F6' } }} />}
                        label={<Typography variant="body2" sx={{ fontWeight: 600, color: '#4B5563' }}>Top Rated</Typography>}
                      />
                    </Stack>
                  </Paper>

                  {/* Media Gallery Card */}
                  <Paper elevation={0} sx={{ p: 3, borderRadius: '24px', border: '1px solid #E5E7EB' }}>
                    <Box sx={sectionHeaderStyles}>
                      <Box sx={{ p: 1, bgcolor: '#FFEDD5', borderRadius: '10px', color: '#EA580C', display: 'flex' }}>
                        <CloudUploadIcon sx={{ fontSize: '1.25rem' }} />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', fontSize: '1rem' }}>Media Gallery</Typography>
                    </Box>
                    <Box
                      onClick={() => fileInputRef.current.click()}
                      sx={{
                        border: '2px dashed #D1D5DB',
                        borderRadius: '16px',
                        p: 3,
                        textAlign: 'center',
                        cursor: 'pointer',
                        mb: 2,
                        '&:hover': { bgcolor: '#F3F4F6', borderColor: '#3B82F6' }
                      }}
                    >
                      <CloudUploadIcon sx={{ fontSize: '2rem', color: '#9CA3AF', mb: 1 }} />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#4B5563' }}>Click to upload</Typography>
                      <input type="file" hidden ref={fileInputRef} onChange={handleImageChange} multiple accept="image/*" />
                    </Box>
                    <Grid container spacing={1}>
                      {existingImages.map((img, index) => (
                        <Grid item xs={4} key={`existing-${index}`}>
                          <Box sx={{ position: 'relative', pt: '100%', borderRadius: '10px', overflow: 'hidden', border: '1px solid #E5E7EB' }}>
                            <Image fill src={`${process.env.NEXT_PUBLIC_UPLOADED_IMAGE_URL}/${img}`} alt="" style={{ objectFit: 'cover' }} />
                            <IconButton
                              size="small"
                              onClick={() => handleRemoveExistingImage(index)}
                              sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'rgba(255,255,255,0.9)', '&:hover': { bgcolor: '#FEE2E2', color: '#EF4444' } }}
                            >
                              <CloseIcon sx={{ fontSize: '0.9rem' }} />
                            </IconButton>
                          </Box>
                        </Grid>
                      ))}
                      {productForm.images.map((img, index) => (
                        <Grid item xs={4} key={`new-${index}`}>
                          <Box sx={{ position: 'relative', pt: '100%', borderRadius: '10px', overflow: 'hidden', border: '1px solid #3B82F6' }}>
                            <Image fill src={URL.createObjectURL(img)} alt="" style={{ objectFit: 'cover' }} />
                            <IconButton
                              size="small"
                              onClick={() => handleRemoveImage(index)}
                              sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'rgba(255,255,255,0.9)', '&:hover': { bgcolor: '#FEE2E2', color: '#EF4444' } }}
                            >
                              <CloseIcon sx={{ fontSize: '0.9rem' }} />
                            </IconButton>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Paper>

                  {/* Attributes Card */}
                  <Paper elevation={0} sx={{ p: 3, borderRadius: '24px', border: '1px solid #E5E7EB' }}>
                    <Box sx={sectionHeaderStyles}>
                      <Box sx={{ p: 1, bgcolor: '#FEF3C7', borderRadius: '10px', color: '#D97706', display: 'flex' }}>
                        <StyleIcon sx={{ fontSize: '1.25rem' }} />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', fontSize: '1rem' }}>Attributes</Typography>
                    </Box>
                    <Stack spacing={2}>
                      <FormControl fullWidth sx={inputStyles}>
                        <InputLabel>Colors</InputLabel>
                        <MuiSelect
                          multiple
                          value={productForm.colors}
                          onChange={(e) => setProductForm({ ...productForm, colors: e.target.value })}
                          label="Colors"
                          MenuProps={selectMenuProps}
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {selected.map((color) => (
                                <Chip
                                  key={color.value}
                                  label={color.label}
                                  size="small"
                                  sx={{ bgcolor: '#F3F4F6', fontWeight: 600 }}
                                />
                              ))}
                            </Box>
                          )}
                        >
                          {colors.map((color) => (
                            <MenuItem key={color.id} value={{ value: color.id, label: color.name, hex: color.hex }}>
                              <Checkbox checked={productForm.colors.some((c) => c.value === color.id)} />
                              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: color.hex, mr: 1, border: '1px solid #E5E7EB' }} />
                              {color.name}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                      <FormControl fullWidth sx={inputStyles}>
                        <InputLabel>Sizes</InputLabel>
                        <MuiSelect
                          multiple
                          value={productForm.sizes}
                          onChange={(e) => setProductForm({ ...productForm, sizes: e.target.value })}
                          label="Sizes"
                          MenuProps={selectMenuProps}
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {selected.map((size) => (
                                <Chip
                                  key={size.value}
                                  label={size.label}
                                  size="small"
                                  sx={{ bgcolor: '#F3F4F6', fontWeight: 600 }}
                                />
                              ))}
                            </Box>
                          )}
                        >
                          {sizes.map((size) => (
                            <MenuItem key={size.id} value={{ value: size.id, label: size.name }}>
                              <Checkbox checked={productForm.sizes.some((s) => s.value === size.id)} />
                              {size.name}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </Stack>
                  </Paper>
                </Stack>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3, bgcolor: '#fff', borderTop: '1px solid #F3F4F6' }}>
            <Button onClick={handleCancelEdit} sx={{ textTransform: 'none', fontWeight: 700, color: '#6B7280', borderRadius: '10px' }}>Cancel</Button>
            <Button
              onClick={handleFormSubmit}
              variant="contained"
              startIcon={<SaveIcon />}
              sx={{
                textTransform: 'none',
                borderRadius: '12px',
                px: 4,
                fontWeight: 800,
                bgcolor: '#3B82F6',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                '&:hover': { bgcolor: '#2563EB', boxShadow: '0 6px 16px rgba(59, 130, 246, 0.4)' }
              }}
            >
              Update Product
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default FilterableTable;