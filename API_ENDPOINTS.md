# Django Backend API Endpoints Guide

This document describes the API endpoints that your Django backend should implement to work with the React frontend.

## Authentication Endpoints

### Register User
```
POST /api/auth/register/
Content-Type: application/json

Body:
{
  "username": "string",
  "email": "string",
  "password": "string",
  "full_name": "string",
  "user_age": number (optional),
  "user_gender": "Male|Female|Other|Prefer not to say"
}

Response (201 Created):
{
  "token": "string",
  "user": {
    "id": number,
    "username": "string",
    "email": "string",
    "full_name": "string",
    "user_age": number,
    "user_gender": "string",
    "created_at": "datetime"
  }
}
```

### Login User
```
POST /api/auth/login/
Content-Type: application/json

Body:
{
  "email": "string",
  "password": "string"
}

Response (200 OK):
{
  "token": "string",
  "user": {
    "id": number,
    "username": "string",
    "email": "string",
    "full_name": "string",
    "user_age": number,
    "user_gender": "string",
    "created_at": "datetime"
  }
}
```

### Get Current User
```
GET /api/auth/user/
Authorization: Bearer {token}

Response (200 OK):
{
  "id": number,
  "username": "string",
  "email": "string",
  "full_name": "string",
  "user_age": number,
  "user_gender": "string",
  "created_at": "datetime"
}
```

### Update User Profile
```
PATCH /api/auth/user/
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "full_name": "string",
  "user_age": number,
  "user_gender": "string"
}

Response (200 OK):
{
  "id": number,
  "username": "string",
  "email": "string",
  "full_name": "string",
  "user_age": number,
  "user_gender": "string",
  "created_at": "datetime"
}
```

## Product Endpoints

### List All Products
```
GET /api/products/
Optional Query Params: ?min_price=10&max_price=100

Response (200 OK):
[
  {
    "id": number,
    "product_name": "string",
    "base_price": "decimal",
    "stock_quantity": number
  }
]
```

### Get Product Details
```
GET /api/products/{id}/

Response (200 OK):
{
  "id": number,
  "product_name": "string",
  "base_price": "decimal",
  "stock_quantity": number
}
```

### Search Products
```
GET /api/products/search/?q={query}

Response (200 OK):
[
  {
    "id": number,
    "product_name": "string",
    "base_price": "decimal",
    "stock_quantity": number
  }
]
```

## Address Endpoints

### List User Addresses
```
GET /api/addresses/
Authorization: Bearer {token}

Response (200 OK):
[
  {
    "id": number,
    "line1": "string",
    "line2": "string",
    "city": "string",
    "state": "string",
    "country": "string",
    "pincode": "string",
    "is_default": boolean,
    "created_at": "datetime"
  }
]
```

### Get Address Details
```
GET /api/addresses/{id}/
Authorization: Bearer {token}

Response (200 OK):
{
  "id": number,
  "line1": "string",
  "line2": "string",
  "city": "string",
  "state": "string",
  "country": "string",
  "pincode": "string",
  "is_default": boolean,
  "created_at": "datetime"
}
```

### Create Address
```
POST /api/addresses/
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "line1": "string",
  "line2": "string" (optional),
  "city": "string",
  "state": "string",
  "country": "string",
  "pincode": "string",
  "is_default": boolean
}

Response (201 Created):
{
  "id": number,
  "line1": "string",
  "line2": "string",
  "city": "string",
  "state": "string",
  "country": "string",
  "pincode": "string",
  "is_default": boolean,
  "created_at": "datetime"
}
```

### Update Address
```
PATCH /api/addresses/{id}/
Authorization: Bearer {token}
Content-Type: application/json

Body: (all fields optional)
{
  "line1": "string",
  "line2": "string",
  "city": "string",
  "state": "string",
  "country": "string",
  "pincode": "string",
  "is_default": boolean
}

Response (200 OK):
{
  "id": number,
  "line1": "string",
  "line2": "string",
  "city": "string",
  "state": "string",
  "country": "string",
  "pincode": "string",
  "is_default": boolean,
  "created_at": "datetime"
}
```

### Delete Address
```
DELETE /api/addresses/{id}/
Authorization: Bearer {token}

Response (204 No Content)
```

### Set Default Address
```
POST /api/addresses/{id}/set-default/
Authorization: Bearer {token}

Response (200 OK):
{
  "id": number,
  "line1": "string",
  "line2": "string",
  "city": "string",
  "state": "string",
  "country": "string",
  "pincode": "string",
  "is_default": true,
  "created_at": "datetime"
}
```

## Order Endpoints

### List User Orders
```
GET /api/orders/
Authorization: Bearer {token}

Response (200 OK):
[
  {
    "id": number,
    "order_date": "datetime",
    "payment_method": "string",
    "shipping_method": "string",
    "shipping_address": {
      "id": number,
      "line1": "string",
      "line2": "string",
      "city": "string",
      "state": "string",
      "country": "string",
      "pincode": "string"
    }
  }
]
```

### Get Order Details
```
GET /api/orders/{id}/
Authorization: Bearer {token}

Response (200 OK):
{
  "id": number,
  "order_date": "datetime",
  "payment_method": "string",
  "shipping_method": "string",
  "shipping_address": {
    "id": number,
    "line1": "string",
    "line2": "string",
    "city": "string",
    "state": "string",
    "country": "string",
    "pincode": "string"
  },
  "items": [
    {
      "id": number,
      "product": {
        "id": number,
        "product_name": "string",
        "base_price": "decimal"
      },
      "order_quantity": number,
      "product_price": "decimal",
      "discount_applied": "decimal",
      "return_status": "Not Returned|Returned",
      "return_date": "datetime",
      "return_reason": "string",
      "days_to_return": number,
      "is_exchanged": boolean,
      "exchange_order": number
    }
  ]
}
```

### Create Order
```
POST /api/orders/
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "shipping_address": number (address ID),
  "payment_method": "Credit Card|Debit Card|PayPal|Gift Card",
  "shipping_method": "Standard|Express|Next-Day",
  "items": [
    {
      "product": number (product ID),
      "order_quantity": number,
      "product_price": "decimal"
    }
  ]
}

Response (201 Created):
{
  "id": number,
  "order_date": "datetime",
  "payment_method": "string",
  "shipping_method": "string",
  "shipping_address": {...},
  "items": [...]
}
```

## Order Detail Endpoints

### Return Item
```
POST /api/order-details/{id}/return/
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "return_reason": "string"
}

Response (200 OK):
{
  "id": number,
  "product": {...},
  "order_quantity": number,
  "product_price": "decimal",
  "discount_applied": "decimal",
  "return_status": "Returned",
  "return_date": "datetime",
  "return_reason": "string",
  "days_to_return": number,
  "is_exchanged": boolean
}
```

### Exchange Item
```
POST /api/order-details/{id}/exchange/
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "new_product": number (product ID)
}

Response (200 OK):
{
  "id": number,
  "product": {...},
  "order_quantity": number,
  "product_price": "decimal",
  "discount_applied": "decimal",
  "return_status": "string",
  "is_exchanged": true,
  "exchange_order": number
}
```

## Error Responses

All endpoints should return appropriate error responses:

### 400 Bad Request
```json
{
  "message": "Error description",
  "errors": {
    "field_name": ["Error message"]
  }
}
```

### 401 Unauthorized
```json
{
  "message": "Authentication required"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Internal server error"
}
```

## CORS Configuration

Make sure your Django backend has CORS configured to accept requests from `http://localhost:3000`:

```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
]

# Or for development
CORS_ALLOW_ALL_ORIGINS = True
```

## Authentication

The frontend uses JWT token authentication. Include the token in the Authorization header:
```
Authorization: Bearer {token}
```

The backend should validate this token and return the appropriate user context.
