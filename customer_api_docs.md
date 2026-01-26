# Store2U Customer API Documentation

**Base URL**: `https://store2u.ca`

This document provides a comprehensive list of customer-facing API endpoints. These APIs are publicly accessible and do not require user authentication for simple data retrieval.

---

## 1. Product Discovery (Public Access)

### Get Categories
- **URL**: `https://store2u.ca/api/categories`
- **Method**: `GET`
- **Response Format**:
```json
{
  "status": true,
  "data": [
    {
      "id": 1,
      "name": "Electronics",
      "slug": "electronics",
      "imageUrl": "electronics.jpg"
    }
  ]
}
```

### Get All Products
- **URL**: `https://store2u.ca/api/products`
- **Method**: `GET`
- **Response Format**:
```json
[
  {
    "id": 1,
    "name": "Sample Product",
    "slug": "sample-product",
    "price": 1200.0,
    "discount": 10.0,
    "stock": 50,
    "images": [{ "url": "img1.jpg" }]
  }
]
```

### Product Detail
- **URL**: `https://store2u.ca/api/products/[slug]`
- **Method**: `GET`
- **Response Format**:
```json
{
  "data": {
    "product": {
      "id": 1,
      "name": "Sample Product",
      "price": 1200.0,
      "stock": 50,
      "images": [...]
    },
    "colors": [{ "name": "Red", "hex": "#FF0000" }],
    "sizes": [{ "name": "Large" }],
    "relatedProducts": [...]
  }
}
```

### New Arrivals
- **URL**: `https://store2u.ca/api/products/newArrivals`
- **Method**: `GET`

### Top Rated
- **URL**: `https://store2u.ca/api/products/topRated`
- **Method**: `GET`

### Search Products
- **URL**: `https://store2u.ca/api/products/search/[id]`
- **Method**: `GET`

---

## 2. Information & Blogs (Public Access)

### Blog Feed
- **URL**: `https://store2u.ca/api/blog`
- **Method**: `GET`
- **Response**: List of blog posts.

### FAQ
- **URL**: `https://store2u.ca/api/faq`
- **Method**: `GET`

### Policies
- **Privacy Policy**: `https://store2u.ca/api/privacypolicy` (GET)
- **About Us**: `https://store2u.ca/api/aboutus` (GET)

---

## 3. Account & Checkout

### User Login
- **URL**: `https://store2u.ca/api/login`
- **Method**: `POST`
- **Request Body**: `{ "email": "...", "password": "..." }`

### Place Order
- **URL**: `https://store2u.ca/api/orders`
- **Method**: `POST`
- **Request Body**:
```json
{
  "userId": 1,
  "shippingAddress": {
    "recipientName": "Name",
    "streetAddress": "Address",
    "city": "City",
    "phoneNumber": "...",
    "email": "..."
  },
  "items": [{ "productId": 1, "quantity": 1, "price": 1000 }],
  "paymentMethod": "Cash on Delivery",
  "total": 1000,
  "netTotal": 1200
}
```
