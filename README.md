# E-Commerce Frontend

A modern React-based ecommerce frontend built with Vite, React Router, Axios, and Tailwind CSS.

## Features

- 🔐 **Authentication**: Login, Register, and Protected Routes
- 🛍️ **Product Management**: Browse, search, and view product details
- 🛒 **Shopping Cart**: Add to cart, update quantities, and checkout
- 📦 **Order Management**: View orders, order details, and return items
- 👤 **User Profile**: Update profile information
- 📍 **Address Management**: Add, edit, delete, and set default addresses
- 🎨 **Responsive Design**: Built with Tailwind CSS for all screen sizes

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **React Router v6** - Client-side routing
- **Axios** - HTTP client for API calls
- **Tailwind CSS** - Utility-first CSS framework
- **Context API** - State management for auth and cart

## Project Structure

```
src/
├── components/        # Reusable components
│   ├── Header.jsx
│   └── ProtectedRoute.jsx
├── contexts/          # React Context providers
│   ├── AuthContext.jsx
│   └── CartContext.jsx
├── pages/            # Page components
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── ProductList.jsx
│   ├── ProductDetail.jsx
│   ├── Cart.jsx
│   ├── Checkout.jsx
│   ├── Orders.jsx
│   ├── OrderDetail.jsx
│   ├── Profile.jsx
│   └── Addresses.jsx
├── services/         # API service layers
│   ├── api.js
│   ├── authService.js
│   ├── productService.js
│   ├── orderService.js
│   └── addressService.js
├── App.jsx           # Main app component with routing
└── main.jsx          # Entry point
```

## Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn installed
- Django backend running on `http://localhost:8000`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## API Integration

The frontend expects the Django backend to provide these API endpoints:

### Authentication
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Login user
- `GET /api/auth/user/` - Get current user
- `PATCH /api/auth/user/` - Update user profile

### Products
- `GET /api/products/` - List all products
- `GET /api/products/:id/` - Get product details
- `GET /api/products/search/?q=query` - Search products

### Orders
- `GET /api/orders/` - List user orders
- `GET /api/orders/:id/` - Get order details
- `POST /api/orders/` - Create new order
- `POST /api/order-details/:id/return/` - Return an item
- `POST /api/order-details/:id/exchange/` - Exchange an item

### Addresses
- `GET /api/addresses/` - List user addresses
- `GET /api/addresses/:id/` - Get address details
- `POST /api/addresses/` - Create address
- `PATCH /api/addresses/:id/` - Update address
- `DELETE /api/addresses/:id/` - Delete address
- `POST /api/addresses/:id/set-default/` - Set default address

## Key Features Explained

### Authentication Flow
- JWT token-based authentication
- Token stored in localStorage
- Automatic token injection in API requests via Axios interceptor
- Auto-redirect to login on 401 responses

### Shopping Cart
- Client-side cart stored in localStorage
- Persistent across page reloads
- Cart context provides global cart state

### Protected Routes
- Routes requiring authentication wrapped with `ProtectedRoute` component
- Automatic redirect to login for unauthenticated users

### Order Management
- View all orders
- See detailed order information
- Return items with reason
- Track return status and dates

## Environment Configuration

The API base URL is configured in `src/services/api.js`:
```javascript
const API_BASE_URL = 'http://localhost:8000/api';
```

Update this if your backend runs on a different URL.

## Styling

This project uses Tailwind CSS for styling. The configuration is in `tailwind.config.js`.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Browser Support

Modern browsers that support ES6+ features.

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## License

MIT
