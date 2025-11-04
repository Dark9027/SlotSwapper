# SlotSwapper

A peer-to-peer time-slot scheduling app built with Node.js/Express (backend), React/TypeScript (frontend), and MongoDB.

## Setup

1. Install dependencies:
   - Backend: `cd backend && npm install`
   - Frontend: `cd frontend && npm install`

2. Set up environment:
   - Copy `.env.example` to `.env` in `backend/` and fill in values (e.g., JWT_SECRET).

3. Start services:
   - Local: `docker-compose up` (includes MongoDB, backend, frontend).
   - Manual:
     - MongoDB: Run `mongod` or use Docker: `docker run -p 27017:27017 mongo`.
     - Backend: `cd backend && npm run dev`.
     - Frontend: `cd frontend && npm start`.

4. Access:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Features
- User auth (JWT).
- CRUD for events.
- Swap requests with logic (pending, accept/reject).
- Dynamic UI updates.

## Testing
- Backend: `cd backend && npm test`.

## Deployment
- Backend: Render/Heroku.
- Frontend: Vercel/Netlify.
- Update API URL in frontend for prod.

## Tech Stack
- Backend: Node/Express/Mongoose/JWT/bcrypt.
- Frontend: React/TS/Axios/React Router.
- DB: MongoDB.
- Dockerized.
