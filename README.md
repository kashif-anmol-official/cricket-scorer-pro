# Professional Cricket Scorer

A modern, high-performance cricket scoring application built with React, Node.js, and SQLite.

## Features
- **Live Scoring**: Ball-by-ball recording with instant stat updates.
- **Innings Management**: Seamless transition between innings with automated target calculation.
- **Advanced Match Logic**: Handles wickets, rotations, and over completions automatically.
- **Premium UI**: Glassmorphism design and broadcast-quality scorecard visuals.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, TanStack Query, Lucide Icons.
- **Backend**: Node.js, Express, Prisma ORM.
- **Database**: SQLite.

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/[username]/cricket-scorer.git
   ```

2. Install dependencies for both client and server:
   ```bash
   cd client && npm install
   cd ../server && npm install
   ```

3. Set up the database:
   ```bash
   cd server
   npx prisma db push
   ```

4. Run the application:
   - Start the server: `npm run dev` (in /server)
   - Start the client: `npm run dev` (in /client)

## Deployment
Check the deployment guide for Hostinger or VPS in the conversation history.
