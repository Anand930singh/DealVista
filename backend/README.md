# Backend - dealVista Coupon Management System

## Overview
Spring Boot 3.4.1 REST API for managing coupons, user authentication, redemptions, and AI-powered coupon extraction.

---

## 📐 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT (Frontend)                            │
└────────────────────────────┬────────────────────────────────────────┘
                             │ HTTP/REST
┌────────────────────────────▼────────────────────────────────────────┐
│                      FILTER LAYER                                    │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ CorsConfig | SecurityFilters | JWT Validation                 │ │
│  └────────────────────────────────────────────────────────────────┘ │
└────────────────────────────┬────────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│                    CONTROLLER LAYER                                  │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ AuthController | CouponController | UserController            │ │
│  │ EmailController | JsonExtractorController | LogHistoryController│
│  │ HealthController                                               │ │
│  └────────────────────────────────────────────────────────────────┘ │
└────────────────────────────┬────────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│                    SERVICE LAYER                                     │
│  ┌──────────────────┬──────────────────┬──────────────────────────┐ │
│  │  AuthService     │  CouponServices  │  UserService             │ │
│  │                  │  (Browse, List,  │  CustomUserDetailsService│
│  │                  │   Redemption)    │  EmailService            │ │
│  │                  │                  │  JsonExtractorService    │ │
│  │                  │  RewardPoints    │  DailyReportService      │ │
│  │                  │  LogHistoryService                          │ │
│  └──────────────────┴──────────────────┴──────────────────────────┘ │
└────────────────────────────┬────────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│                    DTO LAYER (Data Transfer)                         │
│  CouponRequestDto | CouponResponseDto | UserDetailsRequestDto       │
│  UserProfileDto | RedeemedCouponDto | ExtractRequestDto             │
└────────────────────────────┬────────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│                  MAPPER LAYER (Entity ↔ DTO)                        │
└────────────────────────────┬────────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│                  REPOSITORY LAYER (Data Access)                     │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ CouponRepository | UserDetailRepository | LogHistoryRepository│ │
│  │ CouponRedemptionRepository | CouponSpecification              │ │
│  └────────────────────────────────────────────────────────────────┘ │
└────────────────────────────┬────────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│              PERSISTENCE LAYER (PostgreSQL Database)                 │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ UserDetail | Coupon | CouponRedemption | LogHistory           │ │
│  └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘

    ▲                          ▲                    ▲
    │                          │                    │
    └──────────┬───────────────┴────────────────────┘
               │
        ┌──────▼──────┐
        │ External    │
        │ Services    │
        ├─────────────┤
        │ Google GenAI│ (Coupon extraction)
        │ Email SMTP  │ (Notifications)
        │ Scheduler   │ (Daily reports)
        └─────────────┘
```

---

## 🏗️ Class Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                           ENTITIES                                   │
├─────────────────────────────────────────────────────────────────────┤
│
│ ┌──────────────────┐      ┌──────────────────┐
│ │   UserDetail     │      │   Coupon         │
│ ├──────────────────┤      ├──────────────────┤
│ │ - id: Long       │      │ - id: Long       │
│ │ - username       │      │ - title          │
│ │ - email          │      │ - description    │
│ │ - password       │      │ - discount       │
│ │ - rewardPoints   │      │ - discountType   │
│ │ - createdAt      │      │ - expiration     │
│ │ - updatedAt      │      │ - categoryId     │
│ └──────────────────┘      │ - createdBy      │
│          │                 │ - createdAt      │
│          │ 1:N             └──────────────────┘
│          │                         │
│          │                         │ 1:N
│          │                 ┌───────▼─────────┐
│          │                 │CouponRedemption │
│          │                 ├─────────────────┤
│          │                 │ - id: Long      │
│          │                 │ - redeemDate    │
│          │                 │ - isRedeemed    │
│          └────────────────►│ - user_id       │
│                             │ - coupon_id     │
│                             │ - rewardPoints  │
│                             └─────────────────┘
│
│ ┌────────────────────┐
│ │   LogHistory       │
│ ├────────────────────┤
│ │ - id: Long         │
│ │ - action           │
│ │ - entityType       │
│ │ - entityId         │
│ │ - userId           │
│ │ - timestamp        │
│ │ - details          │
│ └────────────────────┘
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    SERVICE DEPENDENCIES                              │
├─────────────────────────────────────────────────────────────────────┤
│
│  AuthService          CouponBrowseService
│  ├─ login()          ├─ getBrowseCoupons()
│  ├─ register()       ├─ searchCoupons()
│  ├─ validateToken()  └─ applyCoupon()
│  └─ refreshToken()
│                       CouponListingService
│  UserService         ├─ createCoupon()
│  ├─ updateProfile()  ├─ updateCoupon()
│  ├─ getStats()       ├─ deleteCoupon()
│  └─ changePassword() └─ listUserCoupons()
│
│  CouponRedemptionService  RewardPointsService
│  ├─ redeemCoupon()        ├─ addPoints()
│  ├─ cancelRedemption()    └─ usePoints()
│  └─ getRedemptions()
│                           JsonExtractorService
│  EmailService            └─ extractCoupons()
│  └─ sendEmail()              (Google GenAI)
│
│  DailyReportService       LogHistoryService
│  ├─ generateReport()      ├─ logAction()
│  └─ sendDailyEmail()      └─ getHistory()
│
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                         DTOs FLOW                                    │
├─────────────────────────────────────────────────────────────────────┤
│
│  Request           ┌──────────────────┐        Response
│  ────────►         │ Controller       │        ◄─────────
│                    │ - Validate Input │
│                    │ - Call Service   │
│                    │ - Map Response   │
│                    └────────┬─────────┘
│                             │
│        ┌────────────────────┼────────────────────┐
│        │                    │                    │
│  ┌─────▼────────┐  ┌────────▼────────┐  ┌───────▼─────────┐
│  │CouponRequest │  │UserProfileDto   │  │RedeemedCoupon  │
│  │Dto           │  │                 │  │Dto             │
│  │- title       │  │- username       │  │- couponId      │
│  │- description │  │- email          │  │- redeemDate    │
│  │- discount    │  │- rewardPoints   │  │- pointsEarned  │
│  │- expiration  │  │- joinDate       │  └────────────────┘
│  └──────────────┘  └─────────────────┘
│
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📦 Module Breakdown

| Module | Purpose | Key Classes |
|--------|---------|-------------|
| **Controller** | HTTP endpoints & request handling | AuthController, CouponController, UserController |
| **Service** | Business logic & operations | CouponBrowseService, AuthService, EmailService |
| **Repository** | Database access & queries | CouponRepository, UserDetailRepository |
| **Entity** | JPA entities & DB models | Coupon, UserDetail, CouponRedemption |
| **DTO** | Data transfer objects | CouponResponseDto, UserProfileDto |
| **Config** | Spring configuration | SecurityConfig, CorsConfig, AsyncConfig |
| **Exception** | Error handling | GlobalExceptionHandler |
| **Mapper** | Entity ↔ DTO conversion | ModelMapper implementations |
| **Filter** | Security & request processing | JWT filters, CORS filters |
| **Scheduler** | Async tasks | Daily reports, email jobs |
| **Util** | Utility functions | Helper methods |

---

## 🔄 Data Flow Examples

### User Registration Flow
```
1. POST /auth/register (SingInRequestDto)
   ↓
2. AuthController.register()
   ↓
3. AuthService.register() + UserService.createUser()
   ↓
4. UserDetailRepository.save(userDetail)
   ↓
5. PostgreSQL stores UserDetail
   ↓
6. Return UserDetailsResponseDto with JWT token
```

### Coupon Redemption Flow
```
1. POST /coupon/redeem
   ↓
2. CouponController.redeemCoupon(id)
   ↓
3. CouponRedemptionService.redeemCoupon()
   ├─ RewardPointsService.addPoints()
   └─ LogHistoryService.logAction()
   ↓
4. CouponRedemptionRepository.save()
   ↓
5. PostgreSQL stores CouponRedemption & updates reward points
   ↓
6. Return RedeemedCouponDto
```

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Spring Boot 3.4.1 |
| **Security** | Spring Security, JWT (JJWT 0.11.5) |
| **Database** | PostgreSQL with JPA/Hibernate |
| **API** | RESTful, Spring Web |
| **Validation** | Spring Validation |
| **AI Integration** | Google GenAI (JSON extraction) |
| **Email** | Spring Mail (SMTP) |
| **Async Processing** | Spring Async (@EnableAsync) |
| **Build** | Gradle |

---

## 🔐 Security Architecture

```
Request → CORS Filter → JWT Filter → SecurityConfig → Endpoint
   │           │            │              │
   │           ▼            ▼              ▼
   │      Allow Origins  Validate Token  Role-based Auth
   │                                    (User/Admin)
   └────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema (Simplified)

```
UserDetail                    Coupon
├─ id (PK)                    ├─ id (PK)
├─ username (UNIQUE)          ├─ title
├─ email (UNIQUE)             ├─ description
├─ password (HASHED)          ├─ discount
├─ rewardPoints               ├─ discountType
├─ createdAt                  ├─ expiration
└─ updatedAt                  ├─ categoryId
     ↑                        ├─ createdBy (FK→UserDetail)
     │ 1:N                    └─ createdAt
     │
CouponRedemption             LogHistory
├─ id (PK)                   ├─ id (PK)
├─ userId (FK→UserDetail)    ├─ action
├─ couponId (FK→Coupon)      ├─ entityType
├─ redeemDate                ├─ entityId
├─ isRedeemed                ├─ userId (FK→UserDetail)
├─ rewardPoints              ├─ timestamp
└─ updatedAt                 └─ details
```

---

## 🚀 Endpoints Overview

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### Coupons
- `GET /coupon/browse` - Browse available coupons
- `POST /coupon/create` - Create new coupon
- `PUT /coupon/{id}` - Update coupon
- `DELETE /coupon/{id}` - Delete coupon
- `POST /coupon/redeem` - Redeem coupon

### User Management
- `GET /user/profile` - Get user profile
- `PUT /user/profile` - Update profile
- `GET /user/stats` - Get user statistics

### Additional
- `POST /email/send` - Send email
- `POST /extract/json` - Extract coupons from text (AI)
- `GET /logs/history` - View action logs
- `GET /health` - Health check

---

## 📋 How to Use This Documentation

**For AI Models & Developers:**
- Use the **Architecture Diagram** to understand request flow
- Reference the **Class Diagram** for entity relationships
- Check **Data Flow Examples** for business logic
- See **Module Breakdown** for finding specific code
- Use **Database Schema** to understand data relationships

This modular structure with clear separation of concerns makes the codebase maintainable and scalable.
