# Matrix Store - Android API Documentation

This guide details how to integrate the Matrix Store backend with an Android application.

## Base URL

> **Note**: For Android Emulators, use `http://10.0.2.2:5000/api/v1` to access localhost.
> For Physical Devices, use your machine's local IP (e.g., `http://192.168.1.5:5000/api/v1`).

**Base URL**: `http://<YOUR_IP>:5000/api/v1`

## Authentication

### 1. Login

**Endpoint**: `POST /login`
**Headers**: `Content-Type: application/json`
**Body**:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK)**:

```json
{
  "success": true,
  "user": {
    "_id": "678...",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "customer"
    // ...other fields
  },
  "token": "eyJhbGciOiJIUzI1..."
}
```

**Integration Tip**: Save the `token` securely (e.g., EncryptedSharedPreferences). Send it in the `Cookie` header for subsequent requests if not using the HTTP-only cookie automatically managed by a WebView/network stack.
_Note: The backend primarily uses Cookies. Ensure your Android networking client (Retrofit/OkHttp) has a CookieJar configured to persist the `token` cookie received in the login response._

### 2. Register

**Endpoint**: `POST /register`
**Body**:

```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirm_password": "password123",
  "mobile_no": "9876543210",
  "role": "customer" // Optional, defaults to customer
}
```

## Products

### 1. Get All Products

**Endpoint**: `GET /products`
**Response**:

```json
{
  "success": true,
  "products": [
    {
      "_id": "...",
      "name": "Laptop",
      "price": 1200,
      "images": [{ "url": "..." }]
    }
  ]
}
```

### 2. Get Product Details

**Endpoint**: `GET /product/:id`

## Orders

> **Requires Authentication** (Cookie or Token)

### 1. Create Order

**Endpoint**: `POST /order/new`
**Body**:

```json
{
  "shippingInfo": {
    "address": "123 St",
    "city": "City",
    "state": "State",
    "country": "Country",
    "pinCode": "123456",
    "phoneNo": "9999999999"
  },
  "orderItems": [
    {
      "product": "PRODUCT_ID",
      "name": "Product Name",
      "price": 100,
      "quantity": 1,
      "image": "image_url"
    }
  ],
  "paymentInfo": {
    "id": "payment_id",
    "status": "succeeded"
  },
  "itemsPrice": 100,
  "taxPrice": 10,
  "shippingPrice": 0,
  "totalPrice": 110
}
```

### 2. Get My Orders

**Endpoint**: `GET /orders/me`

## User Profile

### 1. Get Profile

**Endpoint**: `GET /profile`

### 2. Update Profile

**Endpoint**: `PUT /profile/update`
**Body**:

```json
{
  "first_name": "New Name",
  "last_name": "New Last Name",
  "mobile": "9999999999"
  // ...
}
```

## Error Handling

Standard HTTP Status Codes:

- `200`: Success
- `201`: Created
- `400`: Bad Request (Validation Error)
- `401`: Unauthorized (Login Required)
- `403`: Forbidden (Role not allowed)
- `404`: Not Found
- `500`: Server Error

**Error Response Structure**:

```json
{
  "success": false,
  "message": "Error description here"
}
```
