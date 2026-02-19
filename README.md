# 🛡️ ShieldDOS

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC.svg?style=flat&logo=typescript&logoColor=white)
![Vue.js](https://img.shields.io/badge/Vue.js-35495E.svg?style=flat&logo=vuedotjs&logoColor=4FC08D)
![NestJS](https://img.shields.io/badge/NestJS-E0234E.svg?style=flat&logo=nestjs&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED.svg?style=flat&logo=docker&logoColor=white)

> **A self-hosted, high-performance DDoS protection & monitoring dashboard.**

```
      .
     / \
    /   \
   /  |  \
  /   |   \
 /    |    \    ShieldDOS
 \    |    /    Protection Active
  \   |   /
   \  |  /
    \ | /
     \|/
      '
```

## 🚀 Features

- **Real-time Attack Monitoring**: visualizing traffic spikes instantly.
- **Smart Reverse Proxy**: Intercepts and filters traffic before it hits your server.
- **Dynamic Rule Engine**: Block IPs, User-Agents, or specific patterns.
- **Modern Dashboard**: Built with Vue 3 and TailwindCSS for a premium experience.

## 🛠️ Tech Stack

| Component | Technology | Description |
|-----------|------------|-------------|
| **Backend** | NestJS | Robust API & WebSocket server |
| **Frontend** | Vue 3 + Vite | Blazing fast dashboard |
| **Proxy** | Node.js + TS | High-concurrency request handling |
| **Database** | PostgreSQL | Analytics & Configuration storage |
| **Infra** | Docker Compose | One-command deployment |

## 🏁 Getting Started

### Prerequisites

- Docker Desktop installed & running.

### ⚡ Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/essex580/shielddos.git
   cd shielddos
   ```

2. **Start the engines**
   ```bash
   docker-compose up --build
   ```

3. **Access the Dashboard**
   Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📸 Screenshots

*(Screenshots coming soon...)*

---

Made with ❤️ by Essex.
