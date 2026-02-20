# CouponShare - Community Coupon Marketplace

A full-stack application that enables users to discover, share, and collect verified discount coupons with an integrated reward points system.

## 🌟 Features

### User Features
- **User Authentication**: Secure login and signup with JWT tokens
- **Browse Coupons**: Explore verified coupons from multiple platforms (Amazon, Swiggy, Zomato, PhonePe, GPay, Myntra, Flipkart, etc.)
- **List Coupons**: Upload and share unused coupons with the community
- **Automatic Extraction**: OCR-powered automatic coupon detail extraction from images
- **Coupon Filtering**: Filter by platform, category, discount type, and validity
- **Search Functionality**: Search coupons by title or code
- **View Coupon Codes**: Redeem coupon codes using reward points (5 points per code)

### Reward System
- **Earn Points**: Earn 5 reward points when your coupon is verified and listed
- **Spend Points**: Spend 5 reward points to view coupon codes
- **Points Dashboard**: Track your current reward points in the navbar

### Categories Supported
- Food & Dining
- Shopping
- Travel
- Electronics
- Fashion
- Groceries
- Entertainment
- Health & Beauty
- Services
- Other

## 🏗️ Project Structure

```
coupon_collector/
├── frontend/                    # React + Vite frontend
│   ├── src/
│   │   ├── components/         # Reusable React components
│   │   │   ├── Navbar/         # Navigation bar with auth status
│   │   │   ├── CouponForm/     # Coupon listing form with OCR
│   │   │   ├── CouponDetailModal/  # Coupon details display
│   │   │   ├── Toast/          # Toast notifications
│   │   │   ├── Footer/         # Footer component
│   │   │   └── ProtectedRoute/ # Route protection
│   │   ├── pages/              # Page components
│   │   │   ├── auth/           # Login/Signup page
│   │   │   ├── browsecoupon/   # Browse coupons page
│   │   │   ├── uploadcoupon/   # List coupon page
│   │   │   └── home/           # Home page
│   │   ├── contexts/           # React contexts
│   │   │   └── AuthContext.jsx # Authentication context
│   │   ├── services/           # API services
│   │   │   └── api.js          # API client
│   │   └── styles/             # Global styles
│   ├── package.json
│   ├── vite.config.js
│   └── vercel.json             # Vercel deployment config
│
├── backend/                     # Spring Boot backend
│   ├── src/
│   │   ├── main/java/com/coupon/backend/
│   │   │   ├── controller/     # REST controllers
│   │   │   │   ├── AuthController.java
│   │   │   │   ├── CouponController.java
│   │   │   │   ├── HealthController.java
│   │   │   │   └── JsonExtractorController.java
│   │   │   ├── service/        # Business logic
│   │   │   │   ├── CouponListingService.java
│   │   │   │   ├── CouponBrowseService.java
│   │   │   │   └── RewardPointsService.java
│   │   │   ├── entity/         # JPA entities
│   │   │   ├── repository/     # Spring Data repositories
│   │   │   ├── dto/            # Data transfer objects
│   │   │   ├── mapper/         # Entity-DTO mappers
│   │   │   ├── config/         # Configuration classes
│   │   │   ├── filter/         # Request/Response filters
│   │   │   └── exception/      # Custom exceptions
│   │   └── resources/
│   │       ├── application.properties
│   │       └── application-docker.properties
│   ├── build.gradle
│   ├── Dockerfile
│   └── settings.gradle
│
├── docker-compose.yml          # Docker orchestration
└── README.md                   # This file
```

## 🚀 Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Tesseract.js** - OCR for coupon extraction
- **Lucide React** - Icon library

### Backend
- **Spring Boot 3.x** - Framework
- **Spring Security** - Authentication & Authorization
- **JPA/Hibernate** - ORM
- **Spring Data JPA** - Data access
- **JWT** - Token-based authentication
- **PostgreSQL** - Database

### Deployment
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: Neon (PostgreSQL)
- **Docker**: Containerization

## 📋 Prerequisites

- Node.js 16+ and npm
- Java 17+
- PostgreSQL database
- Docker (optional)

## 🔧 Setup Instructions

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set environment variables (create .env file)
VITE_API_URL=http://localhost:8080/api

# Start development server
npm run dev

# Build for production
npm run build
```

### Backend Setup

```bash
cd backend

# Build the project
./gradlew build

# Run locally
./gradlew bootRun

# Set environment variables
export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/coupondb
export SPRING_DATASOURCE_USERNAME=postgres
export SPRING_DATASOURCE_PASSWORD=password
```

### Database Setup

```bash
# Create PostgreSQL database
createdb coupondb

# JPA will auto-create tables on first run
```

### Docker Setup

```bash
# Build and run with Docker Compose
docker-compose up -d

# Access frontend: http://localhost:5173
# Access backend: http://localhost:8080
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/signin` - Login user
- `GET /api/health` - Health check (GET & HEAD)

### Coupons
- `GET /api/coupons/browse` - Browse active coupons
- `POST /api/coupons` - List new coupon (requires auth)
- `GET /api/coupons/{id}` - Get coupon details
- `POST /api/coupons/{id}/view-code` - View coupon code (requires auth, costs 5 points)

### Extraction
- `POST /api/extract/from-text` - Extract coupon details from text

## 🎯 User Workflows

### Listing a Coupon

1. User logs in
2. Navigate to "List Coupon" page
3. Upload coupon image
4. OCR automatically extracts details
5. Review and edit details if needed
6. Submit coupon
7. Earn 5 reward points once verified

### Finding and Using a Coupon

1. Browse coupons page with filters
2. Search by platform, category, or discount type
3. Click "View Details" to see coupon information
4. Click "View Code" to see coupon code (costs 5 points)
5. Copy code and use on retailer website

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Encryption**: BCrypt hashing for passwords
- **CORS Configuration**: Restricted to allowed origins
- **Authorization Checks**: Role-based access control
- **Duplicate Prevention**: Coupon code uniqueness validation
- **Input Validation**: Request DTO validation

## 🎨 Responsive Design

- **Mobile First**: Optimized for all screen sizes
- **Breakpoints**: 
  - Mobile: < 480px
  - Tablet: 480px - 768px
  - Desktop: 768px+
- **Touch Optimized**: Mobile-friendly navigation and buttons

## 📊 Database Schema

### Key Tables
- **users** - User accounts and authentication
- **coupons** - Coupon listings
- **reward_points** - User reward point transactions
- **categories** - Coupon categories
- **platforms** - Supported platforms

## 🚨 Error Handling

- Duplicate coupon validation
- User not found errors
- Authentication failures
- Validation errors with specific field messages
- Database constraint violations with user-friendly messages

## 🔄 Data Flow

1. **User Registration** → User → Backend → Database
2. **Coupon Upload** → OCR extracts text → Backend validates → Database stores → Points awarded
3. **Browse Coupons** → Frontend filters → Backend queries → Returns paginated results
4. **View Code** → Checks points balance → Deducts 5 points → Reveals coupon code

## 🌐 Deployment

### Frontend (Vercel)
```bash
# Automatic deployment on git push
# Vercel rewrites all routes to index.html for SPA routing
```

### Backend (Render)
```bash
# Docker-based deployment
# Auto-redeployed on git push to main
# Environment variables configured in Render dashboard
```

## 🔌 External APIs

- **Google Gemini API** - Coupon detail extraction using AI
- **Tesseract.js** - Client-side OCR for coupon images

## 📝 Logging

- **Frontend**: Toast notifications for user feedback
- **Backend**: Structured logging with SLF4J/Logback
- **Database**: Query logging (disabled by default)

## 🐛 Common Issues

### Duplicate Coupon Error
- **Issue**: "Coupon code already listed"
- **Solution**: Use a different coupon code

### OCR Extraction Fails
- **Issue**: OCR timeout or unclear image
- **Solution**: Upload clearer coupon image or manually enter details

### CORS Errors
- **Issue**: Frontend can't reach backend
- **Solution**: Verify backend URL and CORS configuration

## 📈 Performance Optimizations

- Database query optimization with proper indexes
- Connection pooling with HikariCP
- Frontend lazy loading of components
- Image optimization for coupon uploads
- API response caching where applicable

## 🤝 Contributing

1. Create feature branch (`git checkout -b feature/AmazingFeature`)
2. Commit changes (`git commit -m 'Add AmazingFeature'`)
3. Push to branch (`git push origin feature/AmazingFeature`)
4. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👤 Author

Anand Singh

## 📞 Support

For issues or questions, please open an issue in the repository.

---

**Happy Coupon Collecting! 🎉**