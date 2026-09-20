# 🛍️ PickBuy — Online Shopping Platform

> Final project for the **Web Application Development** course

PickBuy is a full-featured e-commerce website built with React + Express + MySQL, allowing users to browse products, place orders, review products, apply discount vouchers, and manage a shipping address book — while administrators can manage the entire system through a dedicated, permission-protected Admin panel.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Project Structure](#-project-structure)
- [Database Structure](#-database-structure)
- [API Endpoints](#-api-endpoints)
- [Installation & Local Setup](#-installation--local-setup)
- [Deployment](#-deployment)
- [Demo Accounts](#-demo-accounts)
- [Screenshots](#-screenshots)
- [Future Improvements](#-future-improvements)

---

## ✨ Features

### 🧑‍💼 Customer Side

**Account**
- Register / Login using JWT, passwords hashed with bcrypt
- Login session persists and auto-restores on page reload

**Browsing & Search**
- Homepage with an auto-rotating promotional banner carousel
- Browse by category (horizontally scrollable icon strip)
- Search products by name (search bar in the header, synced via URL query string)
- Filter by price range (preset dropdown)
- Sort by: newest (randomized on each load), price ascending, price descending, highest rated
- "Load more" style pagination — products aren't all loaded at once
- Filters persist in the URL — using the browser's Back/Forward buttons keeps the filter state; refreshing (F5) resets to default

**Product Detail Page**
- Displays image, name, price, description, stock
- Custom specification table per product (stored as JSON)
- Quick info row: average rating, product code, in-stock/out-of-stock status
- Product reviews: interactive star rating picker, written comments; review list from other users shown with initial-letter avatars
- **Add to Cart** and **Buy Now** buttons (Buy Now skips the cart and goes straight to checkout)
- **Wishlist** button — requires login
- Out-of-stock products: purchase buttons disabled, status clearly shown
- The entire product detail page requires login (protected via a private route)

**Shopping Cart**
- Synced per account (stored server-side in the `carts` table)
- Guests can still use a temporary cart (localStorage), which automatically merges into the server cart upon login
- Select individual items (checkboxes) to include in checkout — no need to purchase the entire cart at once
- Increase/decrease quantity, remove individual items or clear the whole cart

**Checkout**
- Address book: save multiple addresses, set a default one, add/edit/delete right during checkout
- Available discount vouchers displayed visually, automatically checked against eligibility (minimum order), discount calculated instantly upon selection
- Sticky order summary card: subtotal, discount, shipping fee, total payment
- Payment method: Cash on Delivery (COD)
- Toast notifications confirming successful actions

**My Orders**
- Order list showing the first product's image in each order, with the product name as the title
- Filter by status: Pending / Processing / Shipping / Completed / Cancelled (with counts for each)
- **Self-cancel orders** while still in "Pending" status — automatically restores product stock

### 🛠️ Admin Side

The entire `/admin` area is protected by a dedicated route, accessible only to accounts with `role = admin`.

**Dashboard**
- Overview statistics: total products, categories, orders, users, pending orders, low-stock products, revenue (calculated from completed orders)

**Product Management**
- Full CRUD: add / edit / delete products
- Upload images directly to the server or paste an external image URL
- Add custom specifications per product (unlimited key–value pairs)
- **Bulk import from Excel/CSV** — validates each row, reports detailed errors by row number for missing data or unmatched categories

**Category Management**
- CRUD for product categories

**Order Management**
- View all orders from every customer, filter by status, search by order ID/customer name/email
- View order details (modal) including product list, images, quantity, price
- Update order status via dropdown — automatically restores stock when changed to "Cancelled"

**User Management**
- View user list, change roles (customer / admin), delete accounts
- Cannot change one's own role or delete one's own currently logged-in account

**Voucher Management**
- Create vouchers with discount %, maximum discount cap, minimum order value, usage limit, expiration date
- Edit / delete vouchers, track usage count

---

## 🛠️ Tech Stack

**Frontend**

| Technology | Role |
|---|---|
| React 18 + Vite | UI construction, fast build tooling |
| React Router DOM v6 | Routing, protected routes (Private/Admin Route) |
| Axios | API calls, automatically attaches JWT token via interceptor |
| Context API | Global state management (Auth, Cart, Wishlist, Toast) |
| Plain CSS | Custom-designed UI, no UI framework used |

**Backend**

| Technology | Role |
|---|---|
| Node.js + Express | REST API server |
| MySQL (mysql2) | Relational database |
| jsonwebtoken (JWT) | User authentication |
| bcryptjs | Password hashing |
| Multer | File upload handling (images, Excel) |
| xlsx | Reads Excel/CSV files for bulk product import |
| cors, dotenv | Environment configuration, CORS security |

---

## 🏗️ System Architecture

```
┌─────────────────┐      HTTPS / JSON       ┌──────────────────┐         SQL         ┌─────────────┐
│                  │ ──────────────────────► │                  │ ──────────────────► │             │
│  React (Vite)    │                         │   Express API    │                     │    MySQL    │
│  Frontend        │ ◄────────────────────── │   Backend        │ ◄────────────────── │   Database  │
│                  │                         │                  │                     │             │
└─────────────────┘                         └──────────────────┘                     └─────────────┘
    Port 5173                                    Port 5000
```

- The frontend calls the API through an Axios instance that automatically attaches the JWT token (if logged in)
- The backend verifies the token via the `authMiddleware` middleware, and checks Admin permissions via `adminOnly`
- Uploaded product images are stored in `backend/uploads/`, served through the static `/uploads` route

---

## 📁 Project Structure

```
Pickbuy/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.js           # Register, login
│   │   │   ├── products.js       # Product CRUD, image upload, Excel import
│   │   │   ├── categories.js     # Category CRUD
│   │   │   ├── orders.js         # Place orders, order history, cancel, admin management
│   │   │   ├── carts.js          # Server-synced shopping cart
│   │   │   ├── wishlist.js       # Wishlist
│   │   │   ├── reviews.js        # Product reviews
│   │   │   ├── vouchers.js       # Discount vouchers
│   │   │   ├── addresses.js      # Shipping address book
│   │   │   └── users.js          # User management (admin)
│   │   ├── middleware/
│   │   │   ├── auth.js           # authMiddleware, adminOnly
│   │   │   ├── upload.js         # Multer for images
│   │   │   └── uploadExcel.js    # Multer for Excel/CSV files
│   │   ├── db.js                 # MySQL connection pool
│   │   └── server.js             # Express entry point, mounts routes
│   ├── uploads/                  # Uploaded product images
│   ├── schema.sql                # Full database schema
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx              # Homepage: banner, categories, filters, products
│   │   │   ├── ProductDetail.jsx     # Product detail, reviews
│   │   │   ├── Cart.jsx              # Shopping cart
│   │   │   ├── Checkout.jsx          # Checkout, address, voucher
│   │   │   ├── Orders.jsx            # Order history
│   │   │   ├── Login.jsx / Register.jsx
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.jsx
│   │   │       ├── AdminProducts.jsx
│   │   │       ├── AdminCategories.jsx
│   │   │       ├── AdminOrders.jsx
│   │   │       ├── AdminUsers.jsx
│   │   │       └── AdminVouchers.jsx
│   │   ├── components/
│   │   │   ├── ProductCard.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── PromoCarousel.jsx
│   │   │   ├── PrivateRoute.jsx      # Protects routes that require login
│   │   │   └── AdminRoute.jsx        # Protects routes that require admin role
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   ├── CartContext.jsx
│   │   │   ├── WishlistContext.jsx
│   │   │   └── ToastContext.jsx
│   │   ├── utils/
│   │   │   └── apiClient.js          # Axios instance with JWT attached
│   │   ├── App.jsx                   # Router, layout, Header
│   │   └── index.css                 # All styling
│   └── package.json
│
└── README.md
```

---

## 🗄️ Database Structure

Main tables in MySQL:

| Table | Description |
|---|---|
| `users` | User accounts, role (customer/admin) |
| `categories` | Product categories |
| `products` | Products — name, price, stock, description, specifications (JSON), average rating |
| `orders` | Orders — status, total amount, shipping address, applied voucher code |
| `orderitems` | Product details within each order |
| `carts` | Cart items synced per account |
| `wishlist` | Each user's list of favorite products |
| `reviews` | Product reviews (star rating + comment) |
| `vouchers` | Discount vouchers — % off, conditions, usage count |
| `addresses` | User shipping address book |

> See the full `CREATE TABLE` statements in `backend/schema.sql`.

---

## 🔌 API Endpoints

### Auth (`/api/auth`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/register` | Register an account | Public |
| POST | `/login` | Log in | Public |

### Products (`/api/products`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/` | List products (filter, search, sort, paginate) | Public |
| GET | `/:id` | Get a single product's details | Public |
| POST | `/` | Add a product | Admin |
| PUT | `/:id` | Edit a product | Admin |
| DELETE | `/:id` | Delete a product | Admin |
| POST | `/upload` | Upload a product image | Admin |
| POST | `/import` | Bulk import products from Excel/CSV | Admin |

### Categories (`/api/categories`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/` | List categories | Public |
| POST / PUT / DELETE | `/`, `/:id` | Manage categories | Admin |

### Orders (`/api/orders`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/` | Create a new order | Logged in |
| GET | `/` | Own order history | Logged in |
| GET | `/:id` | Own order details | Logged in |
| PUT | `/:id/cancel` | Self-cancel an order (while "Pending") | Logged in |
| GET | `/admin/all` | All orders | Admin |
| GET | `/admin/:id` | Any order's details | Admin |
| PUT | `/:id/status` | Update order status | Admin |

### Carts (`/api/carts`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET / POST / PUT / DELETE | `/`, `/:productId` | Manage personal cart | Logged in |

### Wishlist (`/api/wishlist`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET / POST / DELETE | `/`, `/:productId` | Manage wishlist | Logged in |

### Reviews (`/api/reviews`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/product/:productId` | Get a product's reviews | Public |
| POST | `/` | Submit a review | Logged in |
| DELETE | `/:id` | Delete own review | Logged in |

### Vouchers (`/api/vouchers`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/available` | Currently valid vouchers | Logged in |
| POST | `/validate` | Validate & calculate discount | Logged in |
| GET / POST / PUT / DELETE | `/`, `/:id` | Manage vouchers | Admin |

### Addresses (`/api/addresses`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET / POST / PUT / DELETE | `/`, `/:id` | Shipping address book | Logged in |

### Users (`/api/users`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/` | List users | Admin |
| PUT | `/:id/role` | Change role | Admin |
| DELETE | `/:id` | Delete a user | Admin |

---

## 🚀 Installation & Local Setup

### Requirements

- Node.js v18 or higher
- MySQL 8
- Git

### Step 1 — Clone the project

```bash
git clone https://github.com/your-username/PickBuy.git
cd Pickbuy
```

### Step 2 — Set up the database

1. Open MySQL Workbench, create a database named `pickbuy`
2. Import `backend/schema.sql` to create all tables

### Step 3 — Configure & run the Backend

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=<your MySQL password>
DB_NAME=pickbuy
JWT_SECRET=<any secret string>
JWT_EXPIRES_IN=7d
```

Run:

```bash
npm run dev
```

The backend runs at `http://localhost:5000`

### Step 4 — Configure & run the Frontend

Open a new terminal:

```bash
cd frontend
npm install
```

Create a `.env` file in `frontend/`:

```env
VITE_API_URL=http://localhost:5000
```

Run:

```bash
npm run dev
```

The frontend runs at `http://localhost:5173`

### Step 5 — Create an Admin account

1. Register an account through the `/register` page
2. In MySQL, run:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your_email@example.com';
```

3. Log out and log back in to receive Admin privileges

---

## 🌐 Deployment

The project can be deployed for free using a three-service model:

| Component | Suggested Service |
|---|---|
| Frontend | [Vercel](https://vercel.com) |
| Backend | [Render](https://render.com) |
| Database | [Railway](https://railway.app) |

General steps:

1. Push the code to GitHub
2. Create a MySQL database on Railway, import `schema.sql`
3. Deploy `backend/` to Render, configure environment variables pointing to the Railway database
4. Deploy `frontend/` to Vercel, configure `VITE_API_URL` to point to the Render backend URL
5. Update CORS on the backend (`FRONTEND_URL`) to point to the real Vercel domain

> Note: Render's free tier goes to sleep after 15 minutes of inactivity; the first request after that may take 30–50 seconds to wake it back up.

---

## 👤 Demo Accounts

| Role | Email | Password |
|---|---|---|
| Admin | _(fill in after creating one)_ | _(fill in after creating one)_ |
| Customer | _(fill in after creating one)_ | _(fill in after creating one)_ |

---

## 📸 Screenshots

_(Insert screenshots of the homepage, product detail page, cart, checkout, and admin panel here before submission)_

---

## 🔭 Future Improvements

Features to consider if more time is available:

- Product variants by color/size, each with its own price
- Multi-image gallery per product
- Real online payment gateway integration (VNPay, Momo)
- Real-time notifications when order status updates
- Live chat between customers and the seller

---

