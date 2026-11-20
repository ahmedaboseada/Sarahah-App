# Sarhony (Sarahah-App) — Anonymous Messaging Backend

A RESTful anonymous messaging backend inspired by Sarahah, built with Node.js, Express 5, and MongoDB (Mongoose). Anyone can send an anonymous message to a user's public link; registered users sign in to read their inbox. The codebase follows a NestJS-inspired modular architecture in Express, with clear separation between controllers, services, and Joi validation schemas.

## Features

- **Anonymous messaging** — anyone can post a message to `/users/:id/messages/sendMessage` without an account; messages are stored without sender identity.
- **Private inbox** — authenticated users list and read only their own received messages.
- **Authentication** — JWT access/refresh tokens (separate secrets per role), email confirmation, OTP-based password reset.
- **User profiles** — public profile lookup, profile updates with avatar and cover uploads (Cloudinary), password change.
- **Account controls** — freeze/unfreeze account, logout, resend confirmation email.
- **Admin controls** — user management with role-based restrictions.
- **Security** — bcrypt password hashing, Helmet, CORS, express-rate-limit, Joi request validation.

## Tech Stack

| Area | Tools |
|---|---|
| Backend | Node.js (v22.11.0), Express 5 |
| Database | MongoDB (Mongoose) |
| Auth | JWT (access + refresh), OTP, bcrypt |
| Validation | Joi |
| Media | Cloudinary (avatars & covers) |
| API testing | Postman |
| Deployment | Vercel (`@vercel/node`) |

## Project Structure

```
├── index.js                  # Vercel serverless entry point
├── vercel.json
└── src/
    ├── app.controller.js     # bootstrap, security middleware, route mounting
    ├── config/               # DB, Cloudinary, constants
    ├── middlewares/          # authentication, validation, error handling
    ├── models/               # Mongoose models
    ├── utils/                # token, hash, encryption, email helpers
    └── modules/
        ├── userModel/            # auth, profiles, account controls, admin
        └── messageModel/         # anonymous send + authenticated inbox
```

## Getting Started

Note: these steps were prepared by inspecting the code and have not been run end-to-end; some services require their own accounts and keys before the app fully works.

**Prerequisites:** Node.js v22.11.0, a MongoDB connection string.

```bash
npm install
```

Create a `.env` file in the repository root. Variable names below are the ones the code reads:

```env
PORT=3000
MONGO_URI_ONLINE=<your-mongodb-uri>

JWT_ACCESS_USER_SECRET=<secret>
JWT_ACCESS_ADMIN_SECRET=<secret>
JWT_REFRESH_USER_SECRET=<secret>
JWT_REFRESH_ADMIN_SECRET=<secret>

CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-key>
CLOUDINARY_API_SECRET=<your-secret>

NODE_MAILER_USER=<your-email-user>
NODE_MAILER_PASS=<your-email-password>
```

Run:

```bash
npm run dev     # development with nodemon
npm start       # production
```

## API Overview

- `POST /users/signup`, `POST /users/signin`, `GET /users/confirmEmail/:token`, `POST /users/refreshToken`
- `POST /users/forgetPassword`, `POST /users/checkOTP`
- `POST /users/:id/messages/sendMessage` — public, anonymous
- `GET /users/:id/messages` — authenticated inbox (owner only)
- `GET /users/profile/:id` — public profile

Endpoints are documented and tested with Postman. No Swagger/OpenAPI spec is included in this repository.
