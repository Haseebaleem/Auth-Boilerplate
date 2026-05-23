# 🔐 Auth Boilerplate — Node.js + Express + PostgreSQL + Prisma

> A production-ready authentication starter with JWT access + refresh tokens, bcrypt hashing, Zod validation, and role-based authorization. Clone, configure, and ship.

---

## ✨ Features

- 🔑 **JWT Authentication** — short-lived access tokens (15m) + long-lived refresh tokens (7d)
- 🔄 **Refresh Token Rotation** — old refresh tokens are invalidated on every refresh
- 🧂 **bcrypt Password Hashing** — 10 salt rounds, never store plain text
- ✅ **Zod Input Validation** — strict schemas for every request body, with detailed error messages
- 👥 **Role-Based Authorization** — `USER` and `ADMIN` roles, easy to extend
- 🧱 **Centralized Error Handling** — uniform JSON error responses, dev stack traces hidden in prod
- 🗄️ **Prisma ORM** — type-safe queries against PostgreSQL, with migration tracking
- 🚪 **Logout Revocation** — clears the stored refresh token to prevent reuse
- 🧩 **Modular Folder Structure** — controllers, routes, middleware, validators, utils, config

---

## 🛠️ Tech Stack

| Layer        | Tech                          |
| ------------ | ----------------------------- |
| Runtime      | Node.js 18+ (ES Modules)      |
| Framework    | Express 5                     |
| Database     | PostgreSQL 14+                |
| ORM          | Prisma 6                      |
| Auth         | jsonwebtoken (JWT)            |
| Hashing      | bcryptjs                      |
| Validation   | Zod 4                         |
| Dev Tooling  | nodemon, dotenv               |

---

## 📋 Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- **PostgreSQL** ≥ 14 running locally (or a remote URL)
- **Git**

---

## 🚀 Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/Haseebaleem/auth-boilerplate.git
cd auth-boilerplate
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create your `.env`
```bash
cp .env.example .env
```
Then edit `.env` and fill in:
- `DATABASE_URL` — your PostgreSQL connection string
- `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` — generate strong random strings (e.g. `openssl rand -base64 64`)

### 4. Set up the database
```bash
npm run prisma:migrate
```
This creates the `users` table and generates the Prisma client.

### 5. Start the dev server
```bash
npm run dev
```
The API will be live at **http://localhost:5000**.

---

## 📡 API Endpoints

| Method | Endpoint                | Auth      | Description                                     |
| ------ | ----------------------- | --------- | ----------------------------------------------- |
| GET    | `/health`               | —         | Health check                                    |
| POST   | `/api/auth/register`    | —         | Create a new account, returns tokens            |
| POST   | `/api/auth/login`       | —         | Authenticate, returns tokens                    |
| POST   | `/api/auth/refresh`     | —         | Rotate refresh token, returns a new token pair  |
| POST   | `/api/auth/logout`      | Bearer    | Revoke the current refresh token                |
| GET    | `/api/auth/me`          | Bearer    | Return the current user's profile               |

---

## 🧪 Example Requests

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Haseeb Aleem","email":"haseeb@test.com","password":"Test1234"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"haseeb@test.com","password":"Test1234"}'
```

### Get current user
```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

---

## 📁 Project Structure

```
auth-boilerplate/
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── src/
│   ├── config/
│   │   └── prisma.js
│   ├── controllers/
│   │   └── auth.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   └── validate.middleware.js
│   ├── routes/
│   │   └── auth.routes.js
│   ├── utils/
│   │   ├── jwt.utils.js
│   │   └── password.utils.js
│   ├── validators/
│   │   └── auth.validator.js
│   └── index.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 🔐 Security Practices Implemented

- Passwords stored as bcrypt hashes (10 rounds), never in plain text
- Short-lived access tokens (15m) limit the blast radius of a leaked token
- Refresh tokens are rotated on every use; the previous one is invalidated server-side
- Logout revokes the stored refresh token, preventing further refreshes
- Strict Zod validation at the route boundary rejects malformed input early
- Centralized error handler avoids leaking stack traces in production
- `.env` is gitignored — secrets never enter version control
- JWT secrets must be supplied at runtime; missing values fail fast

---

## 🗺️ Roadmap

- [ ] Email verification flow
- [ ] Password reset via email token
- [ ] OAuth providers (Google, GitHub)
- [ ] Rate limiting on auth endpoints
- [ ] Two-factor authentication (TOTP)
- [ ] HTTP-only cookie token transport (optional alternative to Bearer)
- [ ] Audit log of login/logout events
- [ ] Docker Compose setup (app + Postgres)
- [ ] CI pipeline with integration tests

---

## 📄 License

[MIT](LICENSE) © Haseeb Aleem

---

## 👤 Author

**Haseeb Aleem** — Senior Full Stack Developer & Team Lead

- 💼 LinkedIn: [haseeb-aleem-dev](https://www.linkedin.com/in/haseeb-aleem-dev/)
- 🐙 GitHub: [@Haseebaleem](https://github.com/Haseebaleem)
- 📧 Email: [haseebaleem2802@gmail.com](mailto:haseebaleem2802@gmail.com)
