# 🍽️ QuickBite

QuickBite is a comprehensive **Restaurant Management and Smart Dining Platform** designed to simplify restaurant operations, improve customer experience, and provide real-time management across multiple restaurants.

---

## 📖 Overview

QuickBite is an all-in-one platform that connects **Admins, Hotels, Managers, Staff, Kitchen, and Customers** through a centralized system.

The platform enables restaurants to manage reservations, food orders, billing, staff, inventory, customer feedback, analytics, and much more — all from a single ecosystem.

---

## 🎯 Project Goals

- Simplify restaurant operations
- Provide seamless table reservations
- Enable online food pre-ordering
- Improve communication between staff and kitchen
- Reduce manual billing
- Track business performance through analytics
- Support multiple restaurants from one platform

---

## 👥 User Roles

The platform consists of six primary user roles:

| Role | Description |
|------|-------------|
| 👑 Admin | Full platform control |
| 🏨 Hotel | Property owner |
| 🧑‍💼 Manager | Restaurant-level operations |
| 👨‍💼 Staff | Floor operations and order management |
| 👨‍🍳 Kitchen | Food preparation and stock |
| 👤 Customer | Booking and ordering |

---

## 🛠️ System Architecture

```
Admin
  │
  └── Hotels
        │
        └── Managers
                │
                ├── Staff
                │
                ├── Kitchen
                │
                └── Customers
```

---

## 👑 Admin Portal

The Admin Portal has complete control over the QuickBite platform.

**Dashboard**
- Platform statistics, revenue analytics, active users
- Hotel statistics, order tracking

**Hotel Management**
- Add, edit, delete, verify, block/unblock hotels

**Manager Management**
- Add manager, assign hotel, block/unblock, delete, reset PIN/fingerprint

**Customer Management**
- View customers, bookings, payment history, feedback

**Payment Management**
- Subscription payments, customer payments, refund management

**Reports & Analytics**
- Daily/monthly sales, revenue reports, customer growth, popular restaurants

**Security**
- Audit logs, login history, permission management, device management

---

## 🏨 Manager Portal

Managers oversee the operations of their assigned restaurant.

**Authentication**
Managers can log in using Fingerprint, PIN, or Pattern Lock.
Fingerprint registration is managed and approved by the Admin.

**Dashboard**
- Today's sales, active bookings, kitchen status, available tables, staff attendance

**Restaurant Management**
- Update details, operating hours, images, dining capacity, settings

**Menu Management**
- Create categories, add/edit/delete food, premium & regular menu, upload images

**Stock Management**
- Daily stock, tomorrow's stock, low stock alerts, out-of-stock management

**Table Management**
- Add/edit/remove tables, table availability, reserved tables, QR code generation

**Staff Management**
- Add/remove/block staff, fingerprint management, attendance tracking

**Billing**
- Search by table, generate bill, print receipt, split bill, payment tracking

**Reports**
- Daily, weekly, monthly reports — food sales, staff performance

---

## 👨‍💼 Staff Portal

The Staff Portal is designed for restaurant floor operations.

**Dashboard**
- Assigned tables, active bookings, pending orders, notifications

**Reservation Management**
- Walk-in bookings, pre-booked tables, table assignment, change table, cancel booking

**Notifications**
- Reservation reminders, premium customer alerts, kitchen updates

**Order Management**
- Select table, browse menu (premium & regular), add special instructions, send to kitchen

**Order History**
Each order records: table number, customer details, items, quantity, date/time, payment status, assigned staff

---

## 👨‍🍳 Kitchen Portal

The Kitchen Portal focuses on food preparation and stock management.

**Live Kitchen Dashboard**
- Pending → Preparing → Ready for serving → Completed

**Order Priority**
1. Premium bookings
2. Pre-booked customers
3. Walk-in customers

**Kitchen Operations**
- Accept orders, start preparation, mark as ready, delay notifications, out-of-stock updates

**Inventory**
- Today's stock, tomorrow's stock, low stock alerts, stock updates

**Notifications**
- New orders, premium orders, urgent requests, low inventory alerts

---

## 👤 Customer Portal

Customers can book restaurants and order food online.

**Authentication**
QuickBite uses OTP-based authentication. Users only need a phone number — no password required.

**Landing Page**
- Featured restaurants, popular dishes, offers, search

**Restaurant Discovery**
- Search with filters, ratings, restaurant information

**Dining Reservation**
- Select restaurant, choose date/time, number of guests, reserve table

**Food Ordering**
- Premium & regular menu, pre-order food, add to cart

**Payment**
- UPI, Card, Cash at counter, Online payment

**Booking Status**
Booked → Confirmed → Preparing → Ready → Completed → Cancelled

**Profile**
- Edit name, update phone (OTP), booking history, order history, reviews & ratings

---

## 🔄 System Workflow

```
Admin → Hotels → Managers → Staff → Kitchen → Customers

Booking Flow:
Customer books a table
        ↓
Staff receives reservation notification
        ↓
Staff confirms booking
        ↓
Customer arrives
        ↓
Order placed
        ↓
Kitchen prepares food
        ↓
Staff serves food
        ↓
Manager generates bill
        ↓
Customer completes payment
        ↓
Customer submits rating & feedback
```

---

## 🗄️ Database Collections

Admins · Hotels · Managers · Staff · Customers · Restaurants · Categories · Menus · Tables · Bookings · Orders · Order Items · Payments · Bills · Stocks · Kitchen Orders · Notifications · Reviews · Attendance · Fingerprints · Audit Logs

---

## 💻 Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query |
| Backend | Node.js, Express.js, Socket.IO, BullMQ, Redis |
| Database | MongoDB, Mongoose |
| Auth | JWT, OTP, Fingerprint, PIN / Pattern Lock |
| Storage | Cloudinary |
| Printing | ESC/POS Thermal Printer Support |

---

## 🚀 Future Enhancements

- AI-powered sales analytics
- Smart table recommendations
- Loyalty & rewards program
- QR code table ordering
- Multi-language support
- Mobile applications
- Offline mode with synchronization
- Inventory forecasting
- AI chatbot for customer support
- Delivery partner integration
- Restaurant subscription plans
- Business intelligence dashboard

---

## 📄 License

No license

---

> QuickBite aims to provide a modern, scalable, and intelligent restaurant management solution that connects restaurant owners, employees, kitchens, and customers through one unified platform.
