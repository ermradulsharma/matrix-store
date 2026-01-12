# Matrix Store

Matrix Store is a modern, full-featured e-commerce platform built with the MERN stack (MongoDB, Express, React, Node.js). It provides a seamless shopping experience for users and a robust management interface for administrators.

## Features

- **User Authentication**: Secure sign-up and login functionality using JWT.
- **Product Management**: Browse, search, and filter a wide range of products.
- **Shopping Cart**: Add products to the cart, manage quantities, and proceed to checkout.
- **Order Processing**: Streamlined checkout process with address management.
- **Admin Dashboard**: Manage products, users, and orders (if applicable).
- **Responsive Design**: Fully responsive UI built with React and Bootstrap.

## Tech Stack

- **Frontend**: React, React Router, Redux (if used) / Context API, Bootstrap, React Bootstrap.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB with Mongoose.
- **Authentication**: JSON Web Tokens (JWT), Bcrypt.

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas)
- [Git](https://git-scm.com/)

## Installation

1.  **Clone the repository**

    ```bash
    git clone https://github.com/ermradulsharma/matrix-store.git
    cd matrix-store
    ```

2.  **Install Backend Dependencies**

    ```bash
    cd backend
    npm install
    ```

3.  **Install Frontend Dependencies**

    ```bash
    cd ../frontend
    npm install
    ```

## Configuration

Create a `.env` file in the `backend` directory and configure the following variables:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
# Add other necessary variables here (e.g., SMTP for emails, Payment Gateway keys)
```

## Usage

### Running the Backend

From the `backend` directory:

```bash
# Start in production mode
npm start

# Start in development mode (with Nodemon)
npm run dev
```

### Running the Frontend

From the `frontend` directory:

```bash
npm start
```

The frontend application will run on `http://localhost:3000` and the backend server on `http://localhost:5000`.

### Database Seeding

To seed the database with initial data (roles and products):

```bash
cd backend
npm run seed        # Seeds roles
npm run seed:products # Seeds products
```

## Contributing

We welcome contributions! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to submit pull requests and report issues.

## License

This project is licensed under the GNU General Public License v3.0. See the [LICENSE](LICENSE) file for details.

## Contact

**Mradul Sharma**

- GitHub: [@ermradulsharma](https://github.com/ermradulsharma)
