# Matrix Store

Matrix Store is a modern, full-stack e-commerce platform built with the MERN stack (MongoDB, Express, React, Node.js). It features a robust multi-role dashboard for Super Admins, Admins, Managers, and Providers, along with a seamless shopping experience for Customers.

## Features

- **Strict Role-Based Hierarchy (RBAC)**: secure management chain:
  - **Super Admin**: Highest authority. Manages **Admins**.
  - **Admin**: Manages **Managers**. Reports to Super Admin.
  - **Manager**: Manages **Providers**. Reports to Admin.
  - **Provider**: Manages Products. Reports to Manager.
  - **Customer**: End-user. Browse products, place orders, and manage personal profile.
- **Advanced Dashboard**:
  - **System Overview**: Graphical charts for revenue (Yearly/Monthly/Weekly/Daily trends) with "Smart" granularity logic.
  - **Global Search**: Instantly find Users, Products, or Orders via the dashboard header with smart role-based navigation.
  - **User Management**: Strictly scoped views based on hierarchy (e.g., Admins only see their Managers).
  - **Analytics**: Detailed reports with filtering (Year/Period) and downloadable PDF exports.
- **Product Management**: Create, update, and manage inventory with image support.
- **Order Processing**: Complete checkout flow, order tracking, and status updates.
- **Authentication**: Secure JWT-based auth with HTTP-only cookies, password encryption, and responsive login/register flows.

## Tech Stack

- **Frontend**:
  - React.js (v18)
  - React Router DOM (v6)
  - React Context API (Auth, Cart, Wishlist)
  - React Bootstrap & Bootstrap 5
  - Recharts (for Dynamic Analytics & Charts)
  - jsPDF & autoTable (for PDF Reporting)
  - React Icons
- **Backend**:
  - Node.js & Express.js
  - MongoDB & Mongoose
  - JSON Web Tokens (JWT)
  - BcryptJS (Password Hashing)
  - Dotenv (Environment Variables)

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas connection string)
- [Git](https://git-scm.com/)

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/ermradulsharma/matrix-store.git
   cd matrix-store
   ```

2. **Install Backend Dependencies**

   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**

   ```bash
   cd ../frontend
   npm install
   ```

## Configuration

Create a `.env` file in the `backend` directory with the following keys:

```env
PORT=5000
DB_URI=mongodb://127.0.0.1:27017/matrix-store
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d
COOKIE_EXPIRE=7d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SERVICE=gmail
SMTP_MAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_specific_password
```

## Usage

### 1. Seed Database

Initialize the database with the **Advanced Seed Script** to generate the full hierarchy and "Smart" historical data for testing charts.

```bash
cd backend

# Option A: Advanced Seed (Recommended)
# Creates: Hierarchy (SuperAdmin->Admin->Manager->Provider) + 3 Years of smart Order data
node seed_advanced_data.js

# Option B: Basic Seed
# Creates: Basic roles and random data
npm run seed
node create_full_demo_data.js
```

### 2. Start Backend Server

```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

### 3. Start Frontend Application

```bash
cd frontend
npm start
# App runs on http://localhost:3000
```

## Project Structure

```
matrix-store/
├── backend/
│   ├── src/
│   │   ├── controllers/   # Route Controllers
│   │   ├── models/        # Mongoose Models (User, Product, Order, etc.)
│   │   ├── routes/        # API Routes
│   │   ├── seeder/        # Database Seed scripts
│   │   └── utils/         # Helper functions
│   ├── seed_advanced_data.js # Advanced Data Generator
│   ├── config/            # DB Connection logic
│   └── index.js           # App Entry point
└── frontend/
    ├── src/
    │   ├── context/       # React Context
    │   ├── pages/
    │   │   ├── dashboard/ # Dashboard Modules (SuperAdmin, Admin, Manager, etc.)
    │   │   ├── auth/      # Login/Register Pages
    │   │   └── frontend/  # Public Store pages
    │   ├── services/      # Axios API definition
    │   └── App.js         # Main Router
```

## Contributing

We welcome contributions! Please check [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

This project is licensed under the ISC License. See [LICENSE](LICENSE) file for more details.

## Contact

**Mradul Sharma**

- GitHub: [@ermradulsharma](https://github.com/ermradulsharma)
- LinkedIn: [Mradul Sharma](https://linkedin.com/in/mradulsharma)
