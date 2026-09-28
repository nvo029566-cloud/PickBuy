# PickBuy - E-Commerce Web Application

PickBuy is a full-stack e-commerce web application built with **React + Node.js + MySQL**, featuring a complete shopping experience for users and an admin dashboard for store management.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router, Axios |
| Backend | Node.js, Express.js |
| Database | MySQL |
| Auth | JWT (JSON Web Token) + bcrypt |
| Tunnel (demo) | ngrok + localhost.run |

---

## Project Structure

```
PickBuy/
├── backend/
│   ├── src/
│   │   ├── server.js          # Entry point, Express configuration
│   │   ├── db.js              # MySQL connection pool
│   │   └── routes/
│   │       ├── auth.js
│   │       ├── products.js
│   │       ├── orders.js
│   │       ├── categories.js
│   │       ├── users.js
│   │       ├── reviews.js
│   │       ├── wishlist.js
│   │       ├── vouchers.js
│   │       ├── carts.js
│   │       └── addresses.js
│   ├── Schema.sql             # Database creation script
│   ├── .env                   # Environment variables (not committed)
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── Logo.png           # Favicon
│   ├── src/
│   │   ├── main.jsx           # React entry point
│   │   ├── App.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── utils/
│   │   │   └── apiClient.js   # Axios instance with auth token
│   │   └── pages/
│   │       ├── Home.jsx
│   │       ├── Products.jsx
│   │       ├── ProductDetail.jsx
│   │       ├── Cart.jsx
│   │       ├── Orders.jsx
│   │       ├── Login.jsx
│   │       ├── Register.jsx
│   │       └── Admin/
│   ├── .env                   # VITE_API_URL (not committed)
│   ├── vite.config.js
│   └── package.json
└── uploads/                   # Uploaded product images
```

---

## Features

### User
- Register / Login (JWT authentication)
- Browse product list and product details
- Search and filter by category
- Add to cart and place orders
- View order history, cancel pending orders
- Write product reviews
- Wishlist management
- Shipping address management
- Apply discount vouchers

### Admin
- Manage products (add, edit, delete, upload images)
- Manage categories
- Manage orders (update order status)
- Manage users
- Manage vouchers

---

## Local Setup

### Requirements
- Node.js >= 18
- MySQL >= 8.0
- npm or yarn

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/PickBuy.git
cd PickBuy
```

### 2. Create the database

Open MySQL Workbench or a MySQL terminal:

```sql
CREATE DATABASE pickbuy;
USE pickbuy;
```

Then import `backend/Schema.sql`:
- MySQL Workbench: **Server → Data Import → Import from Self-Contained File**

### 3. Configure the backend

Create `backend/.env`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=pickbuy
PORT=5000
JWT_SECRET=pickbuy_2026_x7k9mQp2vN8tR4wZ_final_project
JWT_EXPIRES_IN=7d
```

Install packages and run:

```bash
cd backend
npm install
node src/server.js
```

### 4. Configure the frontend

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
```

Install packages and run:

```bash
cd frontend
npm install
npm run dev
```

Visit: [http://localhost:5173](http://localhost:5173)

---

## Reset Account Password

Passwords are hashed with bcrypt. To reset a password:

**Step 1 — Generate a new hash:**
```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('new_password', 10).then(h => console.log(h));"
```

**Step 2 — Update the database:**
```sql
UPDATE Users SET password = '<hash_from_step_1>' WHERE email = 'email@example.com';
```

---

## Database Schema

| Table | Description |
|-------|-------------|
| Users | User accounts |
| Categories | Product categories |
| Products | Products |
| Orders | Orders |
| OrderItems | Line items within an order |
| Reviews | Product reviews |
| Carts | Shopping cart |
| Wishlist | Saved products |
| Addresses | Shipping addresses |
| Vouchers | Discount codes |

---

## Demo Sharing (via ngrok + localhost.run)

This setup allows anyone to access the web app **from anywhere**, no shared WiFi required.

### Step 1 — Start the backend

```bash
cd backend
node src/server.js
```

### Step 2 — Open a tunnel for the backend (ngrok)

```bash
ngrok http 5000
```

Copy the ngrok URL, e.g. `https://attain-wanting-buffing.ngrok-free.app`

### Step 3 — Update frontend/.env

```env
VITE_API_URL=https://attain-wanting-buffing.ngrok-free.app
```

### Step 4 — Start the frontend

```bash
cd frontend
npm run dev
```

### Step 5 — Open a tunnel for the frontend (localhost.run)

Open a new terminal:

```bash
ssh -R 80:localhost:5173 nokey@localhost.run
```

Copy the generated link, e.g. `https://95e58b65f9973c.lhr.life`

Send this link to others so they can access the app.

> **Notes:**
> - Each time you close the terminal, the link changes — redo steps 2 and 5
> - ngrok free plan allows **only 1 tunnel at a time** → use localhost.run for the frontend
> - The ngrok URL is fixed if you have configured an `authtoken` and a static domain

---

## Production Deployment (optional)

| Component | Platform | Notes |
|-----------|----------|-------|
| Frontend | Vercel | Connect GitHub repo, set `VITE_API_URL` in Environment Variables |
| Backend | Railway | Set DB_* and JWT_SECRET in Variables |
| Database | Railway MySQL | Import schema via MySQL Workbench |

> Make sure the backend CORS allows the Vercel domain, or use `origin: '*'` during development.

---

## Important Notes

- `.env` files **must not be committed** to GitHub (already in `.gitignore`)
- The `uploads/` folder contains product images — commit it or back it up separately
- When cloning to a new machine, recreate the `.env` files following the steps above
- MySQL must be running locally when using local mode

---
