# Auth-Boilerplate

> Production-ready authentication starter for Node.js applications. JWT access and refresh tokens with rotation, bcrypt password hashing, role-based authorization, strict input validation, and a clean modular architecture designed to drop into any new project.

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.x-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![JWT](https://img.shields.io/badge/JWT-000000?logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🎯 About

Auth-Boilerplate is a production-grade authentication starter for Node.js applications. It implements the patterns most projects need but typically reinvent — secure password hashing, JWT-based authentication with refresh token rotation, role-based access control, comprehensive request validation, and centralized error handling. The codebase is organized to slot into any new backend project as a battle-tested foundation, eliminating the multi-day boilerplate phase that every authenticated application starts with.

Every design decision in this codebase is documented below, not just to explain what was built but why each pattern was chosen over alternatives.

---

## ✨ Features

### Authentication
- 🔐 JWT-based access tokens with 15-minute lifetime
- 🔄 Refresh token rotation — old tokens invalidated on every refresh
- 🧂 bcrypt password hashing with 10 salt rounds
- 🚪 Logout endpoint that revokes the stored refresh token

### Authorization
- 👥 Role-based access control with USER and ADMIN roles
- 🛡️ Middleware-driven route protection — declare role requirements once
- 🔓 Easy extension to additional roles without changing existing routes

### Validation & Errors
- ✅ Zod schema validation at every route boundary
- 📋 Detailed error messages with field-level feedback
- 🧱 Centralized error handler — uniform JSON responses, no stack traces in production

### Architecture
- 🗄️ Prisma ORM with type-safe queries and migration tracking
- 🧩 Modular folder structure separating controllers, routes, middleware, validators, and utilities
- 🌱 Environment-driven configuration — secrets never in source
- ⚡ Singleton Prisma client pattern for connection efficiency

---

## 💡 Design Decisions

### Why short-lived access tokens with refresh rotation

Long-lived JWTs are a known footgun. If an access token leaks, an attacker has access for its entire lifetime — and JWTs can't be revoked server-side without maintaining a blacklist that defeats their stateless appeal. The solution is a 15-minute access token paired with a 7-day refresh token. The short lifetime keeps the blast radius of a leaked access token small. Refresh tokens are stored server-side and rotated on every use — the previous refresh token is invalidated when a new pair is issued, so token theft becomes immediately detectable when the legitimate user's next refresh fails.

### Why bcrypt instead of newer algorithms

bcrypt has been the production-default password hashing algorithm since 1999 and has survived three decades of cryptanalysis. Argon2 is theoretically stronger but its parameters require careful tuning per deployment, and bcrypt's deterministic work factor (cost parameter) is easier to operate. 10 rounds gives a hashing time around 100ms on modern hardware — slow enough to thwart brute force, fast enough to not bottleneck legitimate logins. Upgrading to 12 rounds is a one-line change when hardware advances make 10 too cheap.

### Why Zod for validation

Express middleware validation libraries have largely converged on schema-based approaches (Joi, Yup, class-validator, Zod). Zod stands out because it generates TypeScript types from schemas — define a schema once, get both runtime validation and compile-time types. The validator middleware applies the schema at the route boundary, so controller code can assume input is already validated and typed. Invalid input never reaches business logic.

### Why singleton Prisma client

Prisma docs warn that creating multiple PrismaClient instances exhausts the database connection pool. The pattern here is to instantiate once in `src/config/prisma.js` and import it everywhere it's needed. This also makes mocking trivial for testing — replace the singleton, all callers automatically use the mock.

### Why centralized error handling

Express's default error handling logs to stderr and returns HTML to the client. For a JSON API, that's wrong on both ends. The custom error middleware catches everything, formats it as a consistent JSON shape `{ error, message, ... }`, hides stack traces in production via `NODE_ENV` check, and logs the full error server-side. Every endpoint trusts that thrown errors will be handled correctly — controllers stay focused on the happy path.

### Why no rate limiting in v1

Rate limiting belongs at the edge — reverse proxy (nginx), CDN (Cloudflare), or API gateway — not in application code. Per-route limits in Express work for small projects but become a performance bottleneck at scale because they share memory or hit Redis on every request. The roadmap includes an opt-in rate limiter for projects that need it standalone, but the default assumes the deployment environment provides it.

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Runtime | Node.js 18+ (ES Modules) |
| Framework | Express 5 |
| Database | PostgreSQL 14+ |
| ORM | Prisma 6.x |
| Auth | jsonwebtoken (JWT) |
| Password Hashing | bcryptjs |
| Validation | Zod 4 |
| Dev Tooling | nodemon, dotenv |

---

## 🏗️ Architecture

```
┌──────────────┐
│   Client     │
└──────┬───────┘
       │ HTTPS
       │ Bearer <token>
       ▼
┌──────────────────────────────────────┐
│  Express App                         │
│  ┌────────────────────────────────┐  │
│  │ Validation middleware (Zod)    │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │ Auth middleware (verify JWT)   │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │ Role middleware (USER/ADMIN)   │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │ Controllers                    │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │ Error handler (centralized)    │  │
│  └────────────────────────────────┘  │
└──────────────┬───────────────────────┘
               │ Prisma (singleton)
               ▼
       ┌───────────────┐
       │  PostgreSQL   │
       └───────────────┘
```

**Authentication flow:**
1. Client sends credentials to `/auth/login`
2. Server validates with Zod, queries user, compares bcrypt hash
3. On success, issues access token (15m) + refresh token (7d), stores refresh in DB
4. Client stores both, sends access token in `Authorization: Bearer` header on protected routes
5. When access token expires, client calls `/auth/refresh` with refresh token
6. Server validates refresh against DB, issues new pair, invalidates old refresh

---

## 📋 Prerequisites

- **Node.js** 18 or higher
- **PostgreSQL** 14 or higher
- **npm** 9+

---

## 🚀 Getting Started

### Clone

```bash
git clone https://github.com/Haseebaleem/Auth-Boilerplate.git
cd Auth-Boilerplate
```

### Install dependencies

```bash
npm install
```

### Configure environment

```bash
cp .env.example .env
```

Edit `.env`:
- `DATABASE_URL` — PostgreSQL connection string (e.g., `postgresql://user:pass@localhost:5432/auth_boilerplate`)
- `JWT_ACCESS_SECRET` — generate with `openssl rand -base64 64`
- `JWT_REFRESH_SECRET` — generate separately with `openssl rand -base64 64`

### Set up the database

```bash
npm run prisma:migrate
```

This creates the `users` table and generates the Prisma client.

### Start the dev server

```bash
npm run dev
```

The API runs on **http://localhost:5000**.

---

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | — | Health check, returns service status |
| POST | `/api/auth/register` | — | Create account, returns access + refresh tokens |
| POST | `/api/auth/login` | — | Authenticate, returns access + refresh tokens |
| POST | `/api/auth/refresh` | — | Rotate refresh token, returns new token pair |
| POST | `/api/auth/logout` | Bearer | Revoke current refresh token |
| GET | `/api/auth/me` | Bearer | Return current user's profile |

### Example: Register

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Haseeb Aleem","email":"haseeb@test.com","password":"Test1234"}'
```

### Example: Authenticated request

```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

---

## 📁 Project Structure

```
Auth-Boilerplate/
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
├── LICENSE
├── package.json
└── README.md
```

---

## 🔐 Security Practices

- Passwords stored as bcrypt hashes (10 rounds) — never plain text, never returned in any response
- Short-lived access tokens (15m) limit blast radius of leaked tokens
- Refresh tokens rotated on every use, previous token invalidated server-side
- Logout endpoint revokes refresh token, preventing further refreshes after sign-out
- JWT secrets loaded from environment, must be supplied at runtime (missing values fail fast)
- Strict Zod validation at route boundary rejects malformed input before reaching business logic
- Centralized error handler hides stack traces and internal error details in production
- `.env` gitignored — secrets never enter version control
- Prisma's parameterized queries (built-in) prevent SQL injection

> **Note:** Token storage on the client (localStorage vs httpOnly cookies) is the consumer's choice. localStorage is appropriate for this boilerplate's API-first design; production deployments handling sensitive data should consider httpOnly cookies with CSRF protection.

---

## 🧪 Testing

Integration tests cover authentication flows, validation rejections, role gating, and token rotation:

```bash
npm test
```

**Coverage:** 28 test assertions across registration, login, refresh rotation, logout revocation, role-based access, and validation edge cases.

---

## 🗺️ Roadmap

### Authentication enhancements
- [ ] Email verification flow with one-time tokens
- [ ] Password reset via email token
- [ ] OAuth providers (Google, GitHub)
- [ ] Two-factor authentication (TOTP)
- [ ] HTTP-only cookie token transport as alternative to Bearer

### Operations
- [ ] Rate limiting on `/auth/login` and `/auth/register` (opt-in)
- [ ] Audit log of login/logout events with IP capture
- [ ] Account lockout after consecutive failed logins
- [ ] Suspicious-login email notifications

### Infrastructure
- [ ] Docker Compose setup (app + Postgres)
- [ ] CI pipeline with integration tests on every push
- [ ] OpenAPI/Swagger spec generation

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file. Use it as a reference, starting point, or learning resource.

---

## 👤 Author

**Haseeb Aleem**
Senior Full Stack Developer & Team Lead

- 💼 **LinkedIn:** [linkedin.com/in/haseeb-aleem-dev](https://www.linkedin.com/in/haseeb-aleem-dev/)
- 💻 **GitHub:** [github.com/Haseebaleem](https://github.com/Haseebaleem)
- 📧 **Email:** haseebaleem2802@gmail.com
- 📍 **Location:** Multan, Pakistan (Open to Saudi Arabia & GCC relocation)

---

⭐ If you found this project useful, consider giving it a star.
