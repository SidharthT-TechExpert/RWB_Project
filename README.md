## Hi there 👋

<!--
**Qickbite/Qickbite** is a ✨ _special_ ✨ repository because its `README.md` (this file) appears on your GitHub profile.

Here are some ideas to get you started:

- 🔭 I’m currently working on ...
- 🌱 I’m currently learning ...
- 👯 I’m looking to collaborate on ...
- 🤔 I’m looking for help with ...
- 💬 Ask me about ...
- 📫 How to reach me: ...
- 😄 Pronouns: ...
- ⚡ Fun fact: ...



Here's a professional prompt you can give to an AI coding agent (Claude Code, Cursor, GitHub Copilot, Lovable AI, Bolt, etc.) to generate your project architecture. It emphasizes **microservices**, **clean architecture**, and **scalability**.

---

# AI Prompt: Build QuickBite (Microservices Architecture)

## Project Overview

Build a **production-ready full-stack restaurant pre-booking platform** called **QuickBite**.

The platform allows customers to:

* Discover nearby restaurants
* Reserve tables
* Pre-order food
* Reserve both table and food together
* Skip restaurant waiting time
* Receive real-time booking updates

The goal is to eliminate waiting time and improve the dining experience.

The project must be built using **Microservice Architecture**, **Node.js**, and **React ecosystem** with a clean, scalable codebase.

---

# Technology Stack

## Frontend (Website)

* Next.js (App Router)
* React 19
* TypeScript
* Tailwind CSS
* Shadcn UI
* React Query (TanStack Query)
* Axios
* Framer Motion
* React Hook Form
* Zod Validation

---

## Mobile

React Native (Expo)

Supports

* Android
* iOS

Use the same backend APIs.

---

## Backend

Node.js

Express.js

TypeScript

JWT Authentication

REST APIs

Microservices Architecture

---

## Database

MongoDB

Mongoose ODM

Redis

---

## Storage

Cloudinary

AWS S3

---

## Authentication

JWT

Refresh Token

Google Login

Apple Login

OTP Login

Email Verification

Forgot Password

Role-Based Authentication

---

## Payments

Razorpay

Stripe

---

## Notifications

Firebase Cloud Messaging

Email

SMS

---

## Deployment

Frontend

* Vercel

Backend

* Docker
* Kubernetes Ready
* Nginx
* Render / Railway / AWS

Database

MongoDB Atlas

Redis Cloud

---

# Architecture

Use **Microservices**.

Do NOT build a monolithic application.

Each service must have its own database models, controllers, routes, and business logic.

Use an API Gateway.

Architecture

```
Website (Next.js)
            │
React Native App
            │
        API Gateway
            │
──────────────────────────────────────
Auth Service

User Service

Restaurant Service

Food Service

Booking Service

Order Service

Payment Service

Review Service

Notification Service

Search Service

Location Service

Admin Service

Analytics Service
──────────────────────────────────────
            │
        MongoDB + Redis
```

---

# Backend Folder Structure

Every microservice must use **SRC + MVC architecture**.

Example

```
auth-service

src/

controllers/

services/

repositories/

models/

routes/

middlewares/

validators/

utils/

config/

database/

events/

queues/

interfaces/

types/

constants/

errors/

docs/

tests/

app.ts

server.ts

package.json
```

Follow the same structure for every microservice.

---

# Shared Package

Create a shared package.

```
packages/

shared/

logger/

jwt/

constants/

validators/

response/

middlewares/

types/

utils/

config/
```

Every microservice should reuse these utilities.

---

# API Gateway

Create an API Gateway.

Responsibilities

* Authentication
* Rate Limiting
* Request Validation
* Routing
* Logging
* API Versioning
* CORS
* Security Headers
* Swagger Documentation

---

# Authentication Service

Features

* Register
* Login
* Logout
* Refresh Token
* Email Verification
* OTP Login
* Forgot Password
* Reset Password
* Google Login
* Apple Login
* Role Management

Roles

* Customer
* Restaurant Owner
* Admin
* Delivery Partner

---

# User Service

Profile

Addresses

Favorites

Wallet

Coupons

Order History

Booking History

Notifications

Saved Payments

---

# Restaurant Service

Restaurant Registration

Restaurant Profile

Restaurant Verification

Opening Hours

Tables

Menu

Offers

Gallery

Restaurant Settings

Live Availability

---

# Food Service

Categories

Menu Items

Variants

Add-ons

Availability

Preparation Time

Nutrition

Images

---

# Booking Service

Reserve Table

Reserve Food

Reserve Both

Booking Status

Arrival Time

Cancellation

Modification

Live Queue

Booking History

---

# Order Service

Pre-orders

Kitchen Status

Order Tracking

Estimated Completion Time

Order History

Reorder

Invoices

---

# Payment Service

Razorpay

Stripe

Refunds

Wallet

Coupons

Taxes

Invoices

Payment History

---

# Review Service

Ratings

Reviews

Photos

Replies

Report Review

Helpful Votes

---

# Search Service

Restaurant Search

Food Search

Cuisine Search

Filters

Sorting

Nearby Search

Popular Search

Recent Search

---

# Location Service

Google Maps

Nearby Restaurants

Distance Calculation

ETA

Navigation

---

# Notification Service

Push Notifications

Email Notifications

SMS

Booking Updates

Order Updates

Promotions

---

# Admin Service

Dashboard

Restaurant Approval

User Management

Reports

Analytics

Coupons

Categories

CMS

Settings

---

# Analytics Service

Revenue

Bookings

Popular Foods

Popular Restaurants

Peak Hours

User Growth

Sales Reports

Restaurant Reports

---

# Database Design

Use MongoDB.

Every service owns its own collections.

Never allow direct database access between services.

Communication should happen via APIs or an event bus.

---

# Communication

REST API

Event-driven communication using RabbitMQ (or Apache Kafka for larger scale).

---

# Security

Helmet

Rate Limiter

CORS

JWT

Refresh Tokens

Password Hashing

CSRF Protection (where applicable)

Input Validation

Zod

XSS Protection

SQL/NoSQL Injection Protection

---

# Logging

Winston or Pino

Morgan

Centralized logging

Error tracking

---

# Testing

Jest

Supertest

Unit Tests

Integration Tests

API Tests

---

# Documentation

Swagger / OpenAPI

Every endpoint documented.

---

# Frontend Pages

* Home
* Restaurant Listing
* Restaurant Details
* Menu
* Search
* Booking
* Checkout
* Payment
* Booking Success
* Order Tracking
* Favorites
* Profile
* Notifications
* Wallet
* Booking History
* Settings
* Help Center

---

# Restaurant Dashboard

* Dashboard
* Menu Management
* Table Management
* Orders
* Bookings
* Analytics
* Reviews
* Promotions
* Employees
* Settings

---

# Admin Dashboard

* Dashboard
* Users
* Restaurants
* Orders
* Bookings
* Payments
* Reports
* CMS
* Coupons
* Analytics
* Settings

---

# UI Design

Use a modern design inspired by Apple, Airbnb, Uber Eats, and Zomato.

Requirements:

* Fully responsive
* Dark & Light mode
* Accessible (WCAG)
* Smooth animations
* Skeleton loaders
* Toast notifications
* Reusable component library
* Consistent design system

---

# Code Standards

* Clean Architecture principles
* SOLID principles
* Repository Pattern
* Service Layer
* Dependency Injection where appropriate
* ESLint + Prettier
* Husky + lint-staged
* Conventional Commits
* Environment-based configuration
* Docker support
* CI/CD-ready

---

## Final Goal

Generate a **production-ready, scalable, enterprise-grade QuickBite platform** with:

* One shared backend powering the web app and React Native mobile apps.
* Independent microservices using **`src/` + MVC** structure.
* Secure authentication, payment integration, notifications, and documentation.
* Clean, maintainable, and extensible code suitable for real-world deployment.





-->


