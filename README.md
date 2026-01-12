# Matrix Store Backend

This is the backend API for the Matrix Store application, built with Node.js, Express, and MongoDB. It provides authentication, role-based access control, product management, and other e-commerce functionalities.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Seeding](#database-seeding)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Folder Structure](#folder-structure)
- [License](#license)

## Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) using [Mongoose](https://mongoosejs.com/)
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs, cors
- **Utilities**: nodemailer, slugify, validator, dotenv

## Prerequisites

Before you begin, ensure you have met the following requirements:

- **Node.js**: v14 or higher installed.
- **MongoDB**: A local or remote MongoDB instance running.

## Installation

1. **Clone the repository:**

   ```bash
   git clone <repository_url>
   cd backend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

## Configuration

1. **Create a `.env` file** in the root directory. You can use `.env.example` as a template:

   ```bash
   cp .env.example .env
   ```

2. **Update the `.env` file** with your specific configuration:

   ```env
   PORT=5000
   DB_URI=mongodb://127.0.0.1:27017/your_database_name
   JWT_SECRET=your_super_secret_key_here
   JWT_EXPIRE=7d
   COOKIE_EXPIRE=7d
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SERVICE=gmail
   SMTP_MAIL=your_email@example.com
   SMTP_PASSWORD=your_email_password
   ```

## Database Seeding

To populate your database with initial data (roles and products), run the following commands:

- **Seed Roles:**

  ```bash
  npm run seed
  ```

- **Seed Products:**

  ```bash
  npm run seed:products
  ```

## Usage

- **Start the server in production mode:**

  ```bash
  npm start
  ```

- **Start the server in development mode (with nodemon):**

  ```bash
  npm run dev
  ```

- **Run tests:**

  ```bash
  npm test
  ```

The server will typically run on `http://localhost:5000` (or whatever port you specified in `.env`).

## API Endpoints

Here is a high-level overview of the available API routes.

### User & Authentication

- `POST /api/register` - Register a new user
- `POST /api/login` - Login user
- `GET /api/logout` - Logout user
- `POST /api/password/forgot` - Request password reset
- `PUT /api/password/reset/:token` - Reset password
- `PUT /api/password/change` - Change password (Auth required)
- `GET /api/profile` - Get user profile (Auth required)
- `PUT /api/profile/update` - Update user profile (Auth required)

### Admin User Management

- `GET /api/admin/users` - Get all users
- `PUT /api/admin/user/:id` - Update a user
- `DELETE /api/admin/user/:id` - Delete a user

### Products

- `GET /api/products` - Get all products
- `GET /api/product/:id` - Get product details
- `POST /api/product/new` - Create product (Admin/Manager)
- `PUT /api/product/:id` - Update product (Admin/Manager)
- `DELETE /api/product/:id` - Delete product (Admin)
- `PUT /api/product/review/:id` - Add review
- `GET /api/product/reviews/:id` - Get reviews

### Categories

- `POST /api/category/new` - Create category (Admin)
- `GET /api/categories` - Get all categories
- `GET /api/category/:id` - Get category details
- `PUT /api/category/:id` - Update category (Admin)
- `DELETE /api/category/:id` - Delete category (Admin)

### Providers & Requirements

- `POST /api/provider/create` - Create provider
- `GET /api/providers` - Get all providers
- `POST /api/requirement/create` - Create requirement
- `GET /api/requirements` - Get all requirements

### Invoices

- `POST /api/invoice/create` - Create invoice
- `GET /api/invoices` - Get all invoices
- `PUT /api/invoice/:id/approve` - Approve invoice
- `PUT /api/invoice/:id/mark-paid` - Mark invoice as paid

_Note: The actual base URL for routes might depend on how they are mounted in `app.js` or `index.js`. Assuming `/api` prefix based on common practices._

## Folder Structure

```
backend/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Route controllers (logic)
│   ├── middlewares/    # Custom middlewares (auth, errors)
│   ├── models/         # Mongoose models
│   ├── routes/         # API route definitions
│   ├── seeder/         # Scripts to seed database
│   ├── services/       # Business logic services
│   ├── utils/          # Utility functions
│   ├── app.js          # Express app setup
│   └── index.js        # Entry point
├── .env.example        # Environment variables example
├── package.json        # Dependencies and scripts
└── README.md           # Project documentation
```

## License

This project is licensed under the ISC License.
