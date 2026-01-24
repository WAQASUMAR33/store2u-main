'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Image from 'next/image';

// MUI Imports
import {
  Box,
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Divider,
  Stack,
  Card,
  CardContent,
} from '@mui/material';
import {
  Close as CloseIcon,
  Description as DescriptionIcon,
  Info as InfoIcon,
  LocalOffer as LocalOfferIcon,
  Inventory as InventoryIcon,
  Style as StyleIcon,
  Public as PublicIcon,
  CloudUpload as CloudUploadIcon,
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
} from '@mui/icons-material';

// React Quill (dynamically imported as in your code)
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';

const AddProductPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get('id');

  const [newProduct, setNewProduct] = useState({
    id: null,
    name: '',
    slug: '',
    richDescription: '',
    price: '',
    stock: '',
    categorySlug: '',
    subcategorySlug: '',
    colors: [],
    sizes: [],
    image: [],
    imageUrl: '',
    discount: '',
    isTopRated: false,
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    sku: '',
  });

  const [categories, setCategories] = useState([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchCategories();
    fetchColors();
    fetchSizes();

    if (productId) {
      fetchProductData(productId);
    }
  }, [productId]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const fetchSubcategories = async (categorySlug) => {
    try {
      const response = await fetch(`/api/subcategories/${categorySlug}`);
      if (!response.ok) throw new Error('Failed to fetch subcategories');
      const data = await response.json();
      setFilteredSubcategories(data?.data || []);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      setFilteredSubcategories([]);
    }
  };

  const fetchColors = async () => {
    try {
      const response = await fetch('/api/colors');
      if (!response.ok) throw new Error('Failed to fetch colors');
      const data = await response.json();
      const mappedColors = data.map((color) => ({
        value: color.id,
        label: `${color.name} (${color.hex})`,
        hex: color.hex,
      }));
      setColors(mappedColors);
    } catch (error) {
      console.error('Error fetching colors:', error);
      setColors([]);
    }
  };

  const fetchSizes = async () => {
    try {
      const response = await fetch('/api/sizes');
      if (!response.ok) throw new Error('Failed to fetch sizes');
      const data = await response.json();
      const mappedSizes = data.map((size) => ({
        value: size.id,
        label: size.name,
      }));
      setSizes(mappedSizes);
    } catch (error) {
      console.error('Error fetching sizes:', error);
      setSizes([]);
    }
  };

  const fetchProductData = async (id) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/products/${id}`);
      if (!response.ok) throw new Error('Failed to fetch product data');
      const data = await response.json();

      const parsedColors = Array.isArray(data.colors)
        ? data.colors.map((color) => ({
          value: color.id,
          label: `${color.name} (${color.hex})`,
          hex: color.hex,
        }))
        : [];
      const parsedSizes = Array.isArray(data.sizes)
        ? data.sizes.map((size) => ({
          value: size.id,
          label: size.name,
        }))
        : [];

      setNewProduct({
        ...data,
        colors: parsedColors,
        sizes: parsedSizes,
      });
      setExistingImages(data.images || []);
      if (data.categoryId) await fetchSubcategories(data.categoryId);
    } catch (error) {
      console.error('Error fetching product data:', error);
    }
    setIsLoading(false);
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleAddNewItem = async () => {
    const requiredFields = [
      { name: 'name', label: 'Product Name' },
      { name: 'slug', label: 'Slug' },
      { name: 'richDescription', label: 'Description' },
      { name: 'price', label: 'Price' },
      { name: 'stock', label: 'Stock' },
      { name: 'categorySlug', label: 'Category' },
      { name: 'subcategorySlug', label: 'Subcategory' },
    ];

    const missingFields = requiredFields
      .filter((field) => typeof newProduct[field.name] === 'string' && !newProduct[field.name].trim())
      .map((field) => field.label);

    if (missingFields.length > 0) {
      alert(`Please fill in the following fields: ${missingFields.join(', ')}`);
      return;
    }

    setIsLoading(true);

    try {
      const existingProductResponse = await fetch(`/api/products/${newProduct.slug}`);
      const existingData = await existingProductResponse.json();

      if (existingData.status === false) {
        alert('Product with this slug already exists.');
        setIsLoading(false);
        return;
      }

      const uploadedImages = await Promise.all(
        images.map(async (img) => {
          const imageBase64 = await convertToBase64(img);
          const response = await fetch(`${process.env.NEXT_PUBLIC_UPLOAD_IMAGE_API}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: imageBase64 }),
          });
          const result = await response.json();
          if (response.ok) return result.image_url;
          throw new Error(result.error || 'Failed to upload image');
        })
      );

      const imageUrls = uploadedImages.map((filename) => `${filename}`);

      const productToSubmit = {
        ...newProduct,
        description: newProduct.richDescription,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock, 10),
        subcategorySlug: newProduct.subcategorySlug,
        colors: JSON.stringify(newProduct.colors.map((color) => color.value)),
        sizes: JSON.stringify(newProduct.sizes.map((size) => size.value)),
        images: imageUrls,
        discount: newProduct.discount ? roundToTwoDecimalPlaces(parseFloat(newProduct.discount)) : null,
        isTopRated: newProduct.isTopRated,
        meta_title: newProduct.meta_title,
        meta_description: newProduct.meta_description,
        meta_keywords: newProduct.meta_keywords,
        sku: newProduct.sku,
      };

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productToSubmit),
      });

      if (response.ok) {
        router.push('/admin/pages/Products');
      } else {
        const errorData = await response.json();
        console.error('Failed to create product:', errorData.message);
        alert(`Failed to create product: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error adding item:', error);
      alert(`Error adding product: ${error.message}`);
    }

    setIsLoading(false);
  };

  const roundToTwoDecimalPlaces = (num) => {
    return Math.round(num * 100) / 100;
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prevImages) => [...prevImages, ...files]);
  };

  const handleRemoveImage = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveExistingImage = (index) => {
    setExistingImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

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

  return (
    <Box sx={{ bgcolor: '#F9FAFB', minHeight: '100vh', p: { xs: 2, md: 3 } }}>
      {/* Loading Overlay */}
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
            zIndex: 100,
            transition: 'opacity 0.3s ease-in-out',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: 'rgba(255, 255, 255, 0.15)',
              borderRadius: '20px',
              p: 4,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <CircularProgress sx={{ color: '#fff', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>Processing Request...</Typography>
          </Box>
        </Box>
      )}

      {/* Header & Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
            <ArrowBackIcon sx={{ fontSize: '1.2rem' }} />
          </Button>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#111827', letterSpacing: '-1px' }}>
              {newProduct.id ? 'Edit Product' : 'Add New Product'}
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 500 }}>
              {newProduct.id ? `Modifying existing product ID: ${newProduct.id}` : 'Create a fresh entry in your product catalog'}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => router.push('/admin/pages/Products')}
            sx={{
              textTransform: 'none',
              borderRadius: '12px',
              px: 3,
              fontWeight: 700,
              borderColor: '#E5E7EB',
              color: '#4B5563',
              '&:hover': { borderColor: '#9CA3AF', bgcolor: '#F9FAFB' }
            }}
          >
            Discard
          </Button>
          <Button
            variant="contained"
            onClick={handleAddNewItem}
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
            {newProduct.id ? 'Save Changes' : 'Create Product'}
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column: General & Description & Attributes */}
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
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    placeholder="Enter a descriptive product name"
                    sx={inputStyles}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Product URL Slug"
                    value={newProduct.slug}
                    onChange={(e) => setNewProduct({ ...newProduct, slug: e.target.value.replace(/\s+/g, '-') })}
                    placeholder="product-name-slug"
                    sx={inputStyles}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="SKU ID"
                    value={newProduct.sku}
                    onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                    placeholder="Unique identifier"
                    sx={inputStyles}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth sx={inputStyles}>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={newProduct.categorySlug}
                      onChange={(e) => {
                        const categorySlug = e.target.value;
                        setNewProduct({ ...newProduct, categorySlug, subcategorySlug: '' });
                        fetchSubcategories(categorySlug);
                      }}
                      label="Category"
                      MenuProps={selectMenuProps}
                    >
                      <MenuItem value="">Select Category</MenuItem>
                      {Array.isArray(categories.data) &&
                        categories.data.map((category) => (
                          <MenuItem key={category.slug} value={category.slug}>{category.name}</MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth sx={inputStyles} disabled={!filteredSubcategories.length}>
                    <InputLabel>Subcategory</InputLabel>
                    <Select
                      value={newProduct.subcategorySlug}
                      onChange={(e) => setNewProduct({ ...newProduct, subcategorySlug: e.target.value })}
                      label="Subcategory"
                      MenuProps={selectMenuProps}
                    >
                      <MenuItem value="">Select Subcategory</MenuItem>
                      {filteredSubcategories.map((subcategory) => (
                        <MenuItem key={subcategory.slug} value={subcategory.slug}>{subcategory.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Paper>

            {/* Description Card */}
            <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', border: '1px solid #E5E7EB' }}>
              <Box sx={sectionHeaderStyles}>
                <Box sx={{ p: 1, bgcolor: '#F3E8FF', borderRadius: '10px', color: '#7E22CE', display: 'flex' }}>
                  <DescriptionIcon sx={{ fontSize: '1.25rem' }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', fontSize: '1rem' }}>Product Description</Typography>
              </Box>
              <Box sx={{
                '& .ql-toolbar': { borderRadius: '12px 12px 0 0', borderColor: '#E5E7EB', bgcolor: '#F9FAFB' },
                '& .ql-container': { borderRadius: '0 0 12px 12px', borderColor: '#E5E7EB', minHeight: '250px', fontSize: '1rem' }
              }}>
                <ReactQuill
                  value={newProduct.richDescription}
                  onChange={(value) => setNewProduct({ ...newProduct, richDescription: value })}
                  placeholder="Tell customers about your product..."
                />
              </Box>
            </Paper>



            {/* SEO Card */}
            <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', border: '1px solid #E5E7EB' }}>
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
                  value={newProduct.meta_title}
                  onChange={(e) => setNewProduct({ ...newProduct, meta_title: e.target.value.slice(0, 60) })}
                  sx={inputStyles}
                  helperText={`${newProduct.meta_title.length}/60 characters`}
                />
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Meta Description"
                  value={newProduct.meta_description}
                  onChange={(e) => setNewProduct({ ...newProduct, meta_description: e.target.value.slice(0, 160) })}
                  sx={inputStyles}
                  helperText={`${newProduct.meta_description.length}/160 characters`}
                />
                <TextField
                  fullWidth
                  label="Meta Keywords"
                  value={newProduct.meta_keywords}
                  onChange={(e) => setNewProduct({ ...newProduct, meta_keywords: e.target.value })}
                  placeholder="e.g. clothing, fashion, summer"
                  sx={inputStyles}
                />
              </Stack>
            </Paper>
          </Stack>
        </Grid>

        {/* Right Column: Pricing & Media */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={4}>
            {/* Pricing Card */}
            <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', border: '1px solid #E5E7EB' }}>
              <Box sx={sectionHeaderStyles}>
                <Box sx={{ p: 1, bgcolor: '#DCFCE7', borderRadius: '10px', color: '#16A34A', display: 'flex' }}>
                  <LocalOfferIcon sx={{ fontSize: '1.25rem' }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', fontSize: '1rem' }}>Pricing & Stock</Typography>
              </Box>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Display Price (Rs.)"
                  type="number"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  sx={inputStyles}
                  InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                />
                <TextField
                  fullWidth
                  label="Discount Percentage (%)"
                  type="number"
                  value={newProduct.discount}
                  onChange={(e) => setNewProduct({ ...newProduct, discount: e.target.value })}
                  sx={inputStyles}
                  InputProps={{ inputProps: { min: 0, max: 100, step: 0.01 } }}
                />
                <Box sx={{
                  bgcolor: '#F9FAFB',
                  p: 2,
                  borderRadius: '16px',
                  border: '1px solid #E5E7EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <InventoryIcon sx={{ color: '#6B7280' }} />
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#4B5563' }}>Current Stock</Typography>
                  </Box>
                  <TextField
                    type="number"
                    size="small"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    sx={{ width: '100px', '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: '#fff' } }}
                  />
                </Box>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={newProduct.isTopRated}
                      onChange={(e) => setNewProduct({ ...newProduct, isTopRated: e.target.checked })}
                      sx={{ color: '#3B82F6', '&.Mui-checked': { color: '#3B82F6' } }}
                    />
                  }
                  label={<Typography variant="body2" sx={{ fontWeight: 600, color: '#4B5563' }}>Mark as Top Rated</Typography>}
                />
              </Stack>
            </Paper>

            {/* Media Card */}
            <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', border: '1px solid #E5E7EB' }}>
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
                  p: 4,
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: '#F9FAFB', borderColor: '#3B82F6' },
                  transition: 'all 0.2s',
                  mb: 3
                }}
              >
                <CloudUploadIcon sx={{ fontSize: '2.5rem', color: '#9CA3AF', mb: 1.5 }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#4B5563' }}>Click to upload images</Typography>
                <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Multiple images supported (JPG, PNG)</Typography>
                <input
                  type="file"
                  hidden
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  multiple
                  accept="image/*"
                />
              </Box>

              <Grid container spacing={1.5}>
                {existingImages.map((img, index) => (
                  <Grid item xs={4} key={`existing-${index}`}>
                    <Box sx={{ position: 'relative', pt: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #E5E7EB' }}>
                      <Image
                        fill
                        src={`${process.env.NEXT_PUBLIC_UPLOADED_IMAGE_URL}/${img}`}
                        alt="Existing"
                        style={{ objectFit: 'cover' }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveExistingImage(index)}
                        sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(255,255,255,0.8)', '&:hover': { bgcolor: '#FEE2E2', color: '#EF4444' } }}
                      >
                        <CloseIcon sx={{ fontSize: '0.8rem' }} />
                      </IconButton>
                    </Box>
                  </Grid>
                ))}
                {images.map((img, index) => (
                  <Grid item xs={4} key={`new-${index}`}>
                    <Box sx={{ position: 'relative', pt: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #3B82F6' }}>
                      <Image
                        fill
                        src={URL.createObjectURL(img)}
                        alt="New"
                        style={{ objectFit: 'cover' }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveImage(index)}
                        sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(255,255,255,0.8)', '&:hover': { bgcolor: '#FEE2E2', color: '#EF4444' } }}
                      >
                        <CloseIcon sx={{ fontSize: '0.8rem' }} />
                      </IconButton>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>

            {/* Attributes Card */}
            <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', border: '1px solid #E5E7EB' }}>
              <Box sx={sectionHeaderStyles}>
                <Box sx={{ p: 1, bgcolor: '#FEF3C7', borderRadius: '10px', color: '#D97706', display: 'flex' }}>
                  <StyleIcon sx={{ fontSize: '1.25rem' }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', fontSize: '1rem' }}>Attributes & Options</Typography>
              </Box>
              <Stack spacing={3}>
                <FormControl fullWidth sx={inputStyles}>
                  <InputLabel>Available Colors</InputLabel>
                  <Select
                    multiple
                    value={newProduct.colors}
                    onChange={(e) => setNewProduct({ ...newProduct, colors: e.target.value })}
                    label="Available Colors"
                    MenuProps={selectMenuProps}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((color) => (
                          <Chip
                            key={color.value}
                            label={color.label}
                            size="small"
                            sx={{
                              bgcolor: '#F3F4F6',
                              fontWeight: 600,
                              '& .MuiChip-label': { display: 'flex', alignItems: 'center', gap: 1 }
                            }}
                            icon={<Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: color.hex, ml: 1 }} />}
                          />
                        ))}
                      </Box>
                    )}
                  >
                    {colors.map((color) => (
                      <MenuItem key={color.value} value={color}>
                        <Checkbox checked={newProduct.colors.some((c) => c.value === color.value)} sx={{ color: color.hex, '&.Mui-checked': { color: color.hex } }} />
                        {color.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth sx={inputStyles}>
                  <InputLabel>Available Sizes</InputLabel>
                  <Select
                    multiple
                    value={newProduct.sizes}
                    onChange={(e) => setNewProduct({ ...newProduct, sizes: e.target.value })}
                    label="Available Sizes"
                    MenuProps={selectMenuProps}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((size) => (
                          <Chip key={size.value} label={size.label} size="small" sx={{ bgcolor: '#F3F4F6', fontWeight: 600 }} />
                        ))}
                      </Box>
                    )}
                  >
                    {sizes.map((size) => (
                      <MenuItem key={size.value} value={size}>
                        <Checkbox checked={newProduct.sizes.some((s) => s.value === size.value)} />
                        {size.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

const AddProductPage = () => {
  return (
    <Suspense fallback={<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>Loading...</Box>}>
      <AddProductPageContent />
    </Suspense>
  );
};

export default AddProductPage;