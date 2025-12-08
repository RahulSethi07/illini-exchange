# 🏛️ Illini Exchange

> The secure marketplace exclusively for University of Illinois Urbana-Champaign students and staff.

![UIUC Colors](https://img.shields.io/badge/UIUC-Orange%20%23E84A27-orange)
![UIUC Colors](https://img.shields.io/badge/UIUC-Blue%20%2313294B-blue)

## 📋 Project Overview

Illini Exchange is a web application designed for CS 409 at UIUC. It provides a secure platform for UIUC students and staff to buy, sell, and exchange items like textbooks, furniture, and electronics, avoiding the scams commonly found on Facebook Marketplace or Craigslist.

### Key Features

- **🔐 Verified Users Only**: Authentication restricted to @illinois.edu email addresses
- **📍 Safe Exchange Points**: Pre-defined campus locations for secure meetups (Illini Union, UGL, etc.)
- **🔍 Advanced Filters**: Search by category, price range, condition, and campus zone
- **📧 Direct Contact**: Contact sellers via email (mailto:) - simple and effective
- **📱 Fully Responsive**: Works beautifully on mobile, tablet, and desktop

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: MySQL
- **Authentication**: JWT + Google OAuth (simulating NetID SSO)

## 🎨 Design System

### UIUC Brand Colors
- **Illini Orange**: `#E84A27`
- **Illini Blue**: `#13294B`

### Typography
- **Display Font**: Montserrat (headings)
- **Body Font**: Source Sans Pro (body text)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- MySQL 8.0+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   cd illini-exchange
   ```

2. **Set up the Backend**
   ```bash
   cd backend
   npm install
   ```

3. **Configure Environment Variables**
   
   Create a `.env` file in the backend directory:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=illini_exchange

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here

   # Google OAuth (optional - for Google Sign In)
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

   # Server Configuration
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   ```

4. **Initialize the Database**
   ```bash
   npm run init-db
   ```
   This will create the database tables and seed initial data including:
   - 10 Safe Exchange Points on campus
   - A demo user account
   - Sample listings

5. **Start the Backend Server**
   ```bash
   npm run dev
   ```

6. **Set up the Frontend** (in a new terminal)
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

7. **Open the Application**
   
   Visit `http://localhost:3000` in your browser.

### Demo Account

For testing without setting up Google OAuth:
- **Email**: `demo@illinois.edu`
- **Password**: `demo123`

## 📁 Project Structure

```
illini-exchange/
├── backend/
│   ├── config/
│   │   ├── database.js      # MySQL connection
│   │   └── passport.js      # Google OAuth setup
│   ├── middleware/
│   │   └── auth.js          # JWT authentication
│   ├── routes/
│   │   ├── auth.js          # Authentication routes
│   │   ├── listings.js      # Listing CRUD operations
│   │   ├── users.js         # User profile routes
│   │   └── exchangePoints.js # Exchange point routes
│   ├── scripts/
│   │   └── initDb.js        # Database initialization
│   ├── uploads/             # Uploaded images
│   ├── server.js            # Express app entry point
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── ListingCard.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Landing.jsx
│   │   │   ├── Marketplace.jsx
│   │   │   ├── ListingDetails.jsx
│   │   │   ├── CreateListing.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── services/
│   │   │   └── api.js       # API client
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css        # Tailwind + custom styles
│   ├── tailwind.config.js
│   └── package.json
│
└── README.md
```

## 📱 Pages

| Page | Route | Description |
|------|-------|-------------|
| Landing | `/` | Hero section, features, how it works |
| Login | `/login` | Email/password + Google OAuth |
| Register | `/register` | Account creation with @illinois.edu |
| Marketplace | `/marketplace` | Browse listings with filters |
| Listing Details | `/listing/:id` | Full listing view + contact seller |
| Create Listing | `/create-listing` | New listing form (protected) |
| Profile | `/profile` | User's listings management (protected) |

## 🔒 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/me` - Get current user

### Listings
- `GET /api/listings` - Get all listings (with filters)
- `GET /api/listings/:id` - Get single listing
- `POST /api/listings` - Create listing (auth required)
- `PUT /api/listings/:id` - Update listing (owner only)
- `DELETE /api/listings/:id` - Delete listing (owner only)

### Users
- `GET /api/users/profile` - Get own profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/listings` - Get own listings
- `GET /api/users/:id` - Get public profile

### Exchange Points
- `GET /api/exchange-points` - Get all exchange points
- `GET /api/exchange-points/:id` - Get single exchange point

## 🎯 Heuristic Evaluation Notes

Based on feedback received, we implemented the following design decisions:

1. **No In-App Messaging**: Instead of a complex messaging system, we use `mailto:` links to open the user's email client. This is:
   - Simpler to implement
   - No content moderation needed
   - Users have their conversation history in their email
   - Works offline

2. **Safe Exchange Points**: Prominently displayed on listings to encourage safe meetups

3. **Visual Feedback**: 
   - Clear loading states
   - Toast notifications for actions
   - Animated transitions

4. **Error Prevention**:
   - Form validation with clear error messages
   - Confirmation dialogs for destructive actions

## 📊 Grading Breakdown

| Component | Weight | Description |
|-----------|--------|-------------|
| Proposal/Prototypes | 10% | Initial design and wireframes |
| Video | 15% | Demo video showcasing the app |
| Design | 35% | UX, UI, Responsiveness, Heuristic Evaluation |
| Frontend | 15% | React implementation |
| Backend | 15% | Node.js/Express API |
| Authentication | 10% | JWT + Google OAuth |

## 🚢 Deployment

### Backend (e.g., Railway, Render)
1. Set environment variables:
   ```env
   DB_HOST=your_database_host
   DB_USER=your_database_user
   DB_PASSWORD=your_database_password
   DB_NAME=illini_exchange
   JWT_SECRET=your_super_secret_jwt_key_here
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_CALLBACK_URL=https://your-backend-url.com/api/auth/google/callback
   FRONTEND_URL=https://your-vercel-app.vercel.app
   PORT=5000
   NODE_ENV=production
   ```
2. Run `npm run init-db` once for database setup
3. Deploy with `npm start`

### Frontend (Vercel)
1. **Connect your repository to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Set the root directory to `frontend`

2. **Configure Environment Variables in Vercel Dashboard**
   - Go to Project Settings → Environment Variables
   - Add: `VITE_API_URL` = `https://your-backend-url.com/api`
   - Make sure to add it for Production, Preview, and Development environments

3. **Deploy**
   - Vercel will automatically detect Vite and build your app
   - The `vercel.json` file (already included) handles SPA routing

4. **Important Notes:**
   - The `vite.config.js` proxy only works in development mode
   - In production, all API calls will use `VITE_API_URL`
   - Make sure your backend CORS allows your Vercel domain

### Frontend (Netlify)
1. Set `VITE_API_URL` to your backend URL
2. Build with `npm run build`
3. Deploy the `dist` folder
4. Add a `_redirects` file in `public/` with: `/* /index.html 200`

## 👥 Team

CS 409 - The Art and Science of Web Programming  
Fall 2025 - University of Illinois Urbana-Champaign

## 📄 License

This project was created for educational purposes as part of CS 409 coursework.

---

<p align="center">
  Made with 🧡 for the UIUC Community
</p>

