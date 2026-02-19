# ShieldDOS

A self-hosted, simplified "Cloudflare-like" DDoS protection and monitoring dashboard.

## Structure

- **apps/api**: NestJS Backend (Manage sites, users, analytics).
- **apps/proxy**: TypeScript Reverse Proxy (Intercepts and filters traffic).
- **apps/frontend**: Vue 3 Dashboard (Real-time monitoring).

## Getting Started

### Prerequisites

- Docker and Docker Compose

### Running Locally

1. Build and start the services:
   ```bash
   docker-compose up --build
   ```

2. Access the Dashboard:
   - URL: `http://localhost:5173`

3. API is available at `http://localhost:3000`.
4. Proxy is listening on `http://localhost:8080`.

## Development

This project uses Turborepo.

- Install dependencies: `npm install`
- Run dev mode: `npm run dev` (requires Node.js locally if not using Docker)
