# Chat Flow 💬

Chat Flow is a full-stack real-time chat application built with React, TypeScript, Node.js, Express, WebSockets, Prisma, and PostgreSQL.

It was designed to demonstrate practical product engineering skills recruiters care about: authentication, real-time communication, state management, API design, database modeling, and clean separation between frontend and backend.

## 🚀 Live Demo

- 🌐 Production app: https://chat-flow-rho.vercel.app/

## ☁️ Production Deployment

| Layer                          | Service          |
| ------------------------------ | ---------------- |
| Frontend (React/Vite)          | Vercel           |
| Backend API + WebSocket server | Render           |
| Database (PostgreSQL)          | Supabase         |
| File Storage                   | Supabase Storage |
| ORM & Migrations               | Prisma           |

## ✨ What This Project Demonstrates

- ✅ End-to-end full-stack ownership (client + server + database)
- ✅ Real production deployment across multiple cloud services
- ✅ JWT authentication flow across REST and WebSocket connections
- ✅ Real-time messaging with room-based event delivery via Redis pub/sub
- ✅ Server-state management with React Query (queries + mutations)
- ✅ Relational data modeling with Prisma and PostgreSQL
- ✅ Typed contracts across client/server boundaries
- ✅ Role-based room membership (MEMBER / ADMIN)
- ✅ Production-minded project structure with clear module boundaries

## 🔥 Core Features

- 🔐 Login with JWT-based authentication
- 🆕 Sign-up flow with automatic login after account creation
- 🛡️ Protected routes (frontend) and protected API endpoints (backend)
- ✅ Client-side form validation with Zod + react-hook-form
- 👤 User profile editing with custom avatar images (Supabase Storage)
- 🖼️ Room/group images with customizable covers
- 🧭 Chat room listing with last message preview and timestamp
- ➕ Create group chats from the chat header
- 🔎 Search users and groups with debounced input + React Query
- 🤝 Join existing groups from search results
- 👥 Start private 1:1 chats (reuses existing private room when available)
- 🚪 Leave rooms
- 🕘 Message history loading per room
- ⚡ Live message delivery over WebSocket with Redis pub/sub
- 🔄 Auto-reconnect behavior in the WebSocket client
- 🧠 React Query mutations for create chat, join group, leave room, and private chat
- 🔑 Axios API client with auth token interceptor and automatic 401 redirect
- 🔐 Room payloads return safe user data only (no passwords)
- 📱 Mobile-friendly chat layout (safe-area aware, no horizontal overflow)

## 🏗️ Architecture

### Frontend 🖥️

- React 19 + Vite + TypeScript
- Routing with React Router v7
- Context-based auth state handling
- React Query hooks for all data fetching and mutations
- Centralized Axios API client with auth/error interceptors
- Tailwind CSS v4 + Radix-based UI components (shadcn)
- Drawer/Dialog/Tabs based auth and chat action UIs
- Debounced search + optimistic chat list updates when creating/joining rooms
- react-dropzone for image uploads

### Backend ⚙️

- Express 5 REST API for auth, rooms, and message history
- WebSocket server (`ws`) for live chat events with JWT verification
- Redis pub/sub (ioredis) for scalable real-time message broadcasting
- Prisma ORM with PostgreSQL (`@prisma/adapter-pg`)
- Private room reuse logic (prevents duplicate 1:1 rooms)
- Normalized room responses with flattened, safe user arrays
- `ConnectionsManager` for efficient WebSocket client tracking
- `RoomsManager` for organizing users by room subscription

### Data Layer 🧠

| Model      | Description                                                    |
| ---------- | -------------------------------------------------------------- |
| `User`     | id, name, email, password (hashed), imageUrl                   |
| `Room`     | id, name, type (GROUP/PRIVATE), imageUrl, lastMessage\* fields |
| `Message`  | id, content, userId, roomId, createdAt                         |
| `RoomUser` | roomId, userId, role (MEMBER/ADMIN) — join table               |

- One-to-many: `User` → `Message`, `Room` → `Message`
- Many-to-many: `User` ↔ `Room` via `RoomUser`

## 🧰 Tech Stack

|              | Technology                                                                                                                                                    |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Frontend** | React 19, Vite, TypeScript 6, Tailwind CSS v4, shadcn/radix-ui, react-hook-form, Zod, @tanstack/react-query, Axios, react-router-dom v7, react-dropzone, vaul |
| **Backend**  | Node.js, Express 5, ws, TypeScript 6, ioredis, tsx                                                                                                            |
| **Auth**     | JSON Web Tokens (jsonwebtoken) + bcrypt                                                                                                                       |
| **Database** | PostgreSQL + Prisma 7 + @prisma/adapter-pg                                                                                                                    |
| **Storage**  | Supabase Storage (@supabase/supabase-js)                                                                                                                      |

## 📁 Project Structure

```
chat-flow/
├── types.ts              # Shared WebSocket message types
├── client/               # React application (Vite)
│   └── src/
│       ├── components/   # UI components (actionsHeader, chatList, etc.)
│       ├── contexts/     # Auth user context
│       ├── hooks/        # React Query hooks (useGetRooms, usePostChat, etc.)
│       ├── lib/          # Axios client, Supabase client, uploadImage util
│       ├── pages/        # chat.tsx, login.tsx
│       └── websocket/    # WebSocket client with auto-reconnect
└── server/               # Express + WebSocket server
    ├── http/
    │   ├── middlewares/  # JWT auth middleware
    │   └── routes/       # userRoutes, roomRoutes, messageRoutes
    ├── services/         # roomService, messageService
    ├── websocket/        # connectionsManager, roomsManager, messageHandler
    ├── redis/            # publisher, subscriber
    ├── database/         # Prisma client setup
    └── prisma/           # schema.prisma + migrations
```

## 🧪 Local Setup

### Prerequisites 📌

- Node.js 20+
- PostgreSQL running locally or remotely
- Redis running locally or remotely

### 1. Install dependencies

```bash
cd client && npm install
cd ../server && npm install
```

### 2. Configure environment variables

**`client/.env`**

```env
VITE_API_URL=http://localhost:5000
VITE_WS_URL=ws://localhost:5000
```

**`server/.env`**

```env
PORT=5000
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB_NAME
JWT_SECRET=replace_with_a_long_random_secret
REDIS_URL=redis://localhost:6379
```

### 3. Generate Prisma client and apply migrations

```bash
cd server
npx prisma generate
npx prisma migrate dev
```

### 4. Run backend

```bash
cd server
npm run start
```

### 5. Run frontend

```bash
cd client
npm run dev
```

Frontend runs at: http://localhost:5173

## 🔌 API Overview

### Auth

| Method | Endpoint         | Auth     |
| ------ | ---------------- | -------- |
| POST   | `/users/signup`  | No       |
| POST   | `/users/login`   | No       |
| PATCH  | `/users/:userId` | Required |

### Rooms

| Method | Endpoint                        | Auth     |
| ------ | ------------------------------- | -------- |
| GET    | `/rooms`                        | Required |
| POST   | `/rooms`                        | Required |
| PATCH  | `/rooms/:roomId`                | Required |
| POST   | `/rooms/:roomId/join`           | Required |
| POST   | `/rooms/:roomId/leave`          | Required |
| POST   | `/rooms/private/:targetUserId`  | Required |
| GET    | `/rooms/search?searchQuery=...` | Required |

### Messages

| Method | Endpoint            | Auth     |
| ------ | ------------------- | -------- |
| GET    | `/messages/:roomId` | Required |
| POST   | `/messages/:roomId` | Required |

**Auth header:** `Authorization: Bearer YOUR_JWT_TOKEN`

## 📡 WebSocket Contract

### Client → Server

| Type        | Payload               | Description                |
| ----------- | --------------------- | -------------------------- |
| `auth`      | `{ token }`           | Authenticate after connect |
| `join_room` | `{ roomId }`          | Subscribe to room events   |
| `message`   | `{ roomId, content }` | Send a message             |

### Server → Client

| Type      | Payload        | Description                           |
| --------- | -------------- | ------------------------------------- |
| `message` | message object | New message broadcast to room members |
| `error`   | `{ message }`  | Auth or protocol errors               |

## 🛣️ Roadmap

- ✅ Sign-up and login flows
- ✅ Group chat creation
- ✅ Private 1:1 chat creation/reuse
- ✅ Search users/groups + join group
- ✅ Leave room
- ✅ Message history with last-message preview
- ✅ Role-based room membership (MEMBER/ADMIN)
- ✅ Custom user and room avatars
- 🟡 Presence indicators (online/typing)
- 🧪 Unit and integration tests
- 🤖 CI pipeline and deployment automation

## 📄 License

MIT (server package is configured with MIT).
