# Chat Flow 💬

Chat Flow is a full-stack real-time chat application built with React, TypeScript, Node.js, Express, WebSockets, Prisma, and PostgreSQL.

It was designed to demonstrate practical product engineering skills recruiters care about: authentication, real-time communication, state management, API design, database modeling, and clean separation between frontend and backend.

## 🚀 Live Demo

- 🌐 Production app: https://chat-flow-rho.vercel.app/

## ☁️ Production Deployment

- 🎨 Frontend (React/Vite): Vercel
- 🛠️ Backend API + WebSocket server: Render
- 🗄️ Database (PostgreSQL): Supabase
- 🧩 ORM and migrations: Prisma

## ✨ What This Project Demonstrates

- ✅ End-to-end full-stack ownership (client + server + database)
- ✅ Real production deployment across multiple cloud services
- ✅ JWT authentication flow across REST and WebSocket connections
- ✅ Real-time messaging with room-based event delivery
- ✅ Relational data modeling with Prisma and PostgreSQL
- ✅ Typed contracts across client/server boundaries
- ✅ Production-minded project structure with clear module boundaries

## 🔥 Core Features

- 🔐 Login with JWT-based authentication
- 🆕 Sign-up flow in frontend with automatic authentication after account creation
- 🛡️ Protected routes in the frontend and protected API endpoints in the backend
- ✅ Client-side form validation with Zod + react-hook-form (login and sign-up)
- 🧭 Chat room listing and room selection UI
- ➕ Create group chats from the chat header
- 🔎 Search users and groups with debounced server-side query
- 🤝 Join existing groups from search results
- 👥 Start private 1:1 chats (reuses existing private room when available)
- 🕘 Message history loading per room
- ⚡ Live message delivery over WebSocket
- 🔄 Auto-reconnect behavior in the WebSocket client
- 🔐 Room payloads return safe user data only (no password)
- 📱 Mobile-friendly chat layout (safe-area aware input spacing, wrapped long words, no horizontal overflow)

## 🏗️ Architecture

### Frontend 🖥️

- React + Vite + TypeScript
- Routing with React Router
- Context-based auth state handling
- Tailwind CSS + component primitives
- Drawer/Dialog/Tabs based auth and chat actions UI
- Debounced search + optimistic chat list updates when creating/joining chats

### Backend ⚙️

- Express REST API for auth, rooms, and message history
- WebSocket server for live chat events
- Prisma ORM with PostgreSQL adapter
- Private room reuse logic (prevents duplicate 1:1 rooms)
- Normalized room responses with flattened users arrays

### Data Layer 🧠

- Users, Rooms, Messages, and RoomUser join table
- Room type enum for GROUP vs PRIVATE conversations
- One-to-many: User -> Message
- One-to-many: Room -> Message
- Many-to-many: User <-> Room via RoomUser

## 🧰 Tech Stack

- 🎨 Frontend: React 19, Vite 8, TypeScript 6, Tailwind CSS, Radix-based UI components, react-hook-form, Zod, @hookform/resolvers
- ⚙️ Backend: Node.js, Express 5, ws, TypeScript 6
- 🔐 Auth: JSON Web Tokens + bcrypt
- 🗄️ Database: PostgreSQL + Prisma

## 📁 Project Structure

- client: React application
- server: Express API, WebSocket server, Prisma schema/migrations
- types.ts: shared WebSocket message type

## 🧪 Local Setup

### Prerequisites 📌

- Node.js 20+
- PostgreSQL running locally or remotely

### 1. Install dependencies

At repository root:

cd client && npm install
cd ../server && npm install

### 2. Configure environment variables

Create client/.env with:

VITE_API_URL=http://localhost:5000
VITE_WS_URL=ws://localhost:5000

Create server/.env with:

PORT=5000
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB_NAME
JWT_SECRET=replace_with_a_long_random_secret

### 3. Generate Prisma client and apply migrations

From server:

npx prisma generate
npx prisma migrate dev

### 4. Run backend

From server:

npm run start

### 5. Run frontend

From client:

npm run dev

Frontend default URL: http://localhost:5173

## 🔌 API Overview

### Auth

- POST /users/signup
- POST /users/login

### Rooms

- GET /rooms (auth required)
- POST /rooms (auth required)
- POST /rooms/:roomId/join (auth required)
- POST /rooms/private/:targetUserId (auth required)
- GET /rooms/search?searchQuery=... (auth required)

### Messages

- GET /messages/:roomId (auth required)
- POST /messages/:roomId (auth required)

### Auth header format

Authorization: Bearer YOUR_JWT_TOKEN

## 📡 WebSocket Contract

### Client -> Server

- auth: send token after connect
- join_room: subscribe to room updates
- message: send a message to a room

### Server -> Client

- message: broadcast new message payload to room members
- error: authentication or protocol errors

## 📝 Notes

- Auth UI includes tabbed Login and Sign Up flows.
- Chat header includes create chat, search chat/user, and logout actions.
- Room endpoints normalize `users` as a flat array of safe user objects.
- Real-time chat delivery is implemented with ws events and persisted through Prisma.

## 🛣️ Roadmap

- ✅ Signup page in frontend
- ✅ Group chat creation flow
- ✅ Private chat creation/reuse flow
- ✅ Search users/groups + join group flow
- ✅ Message delivery/read status
- 🟢 Presence indicators (online/typing)
- 🧪 Unit and integration tests
- 🤖 CI pipeline and deployment automation

## 📄 License

MIT (server package is configured with MIT).
