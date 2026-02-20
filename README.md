<div align="center">
  <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Shield.png" alt="Shield" width="100" />
  
  #  ShieldDOS
  
  **An Enterprise-Grade Edge Proxy & DDoS Protection Network**

  <p align="center">
    <a href="https://github.com/essex580/shielddos/blob/master/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg?style=for-the-badge&color=000000" alt="License"></a>
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
    <img src="https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D" alt="Vue">
    <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS">
    <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis">
  </p>

  <p align="center">
    <i>Protect your infrastructure. cache your static assets. Drop malicious traffic at the Edge.</i>
  </p>
</div>

---

## ⚡ Overview

**ShieldDOS** is a high-performance, self-hosted reverse proxy and traffic monitoring platform. It acts as an impregnable shield sitting in front of your web servers, API endpoints, and applications. 

By terminating SSL, inspecting packets in real-time, and evaluating complex threat intelligence rules *before* traffic ever reaches your backend container, ShieldDOS guarantees maximum uptime, pristine origin server logs, and advanced threat elimination.


---

## 🏗️ Architecture Stack

ShieldDOS is composed of three interconnected microservices, managed elegantly via Docker Compose.

### 1. 🚦 The Edge Proxy (`Node.js`)
The core routing engine that faces the internet. It handles massive concurrency and intercepts traffic patterns at Layer 7.
- **SSL/TLS Termination:** Connects users over secure `HTTPS (443)`, encrypts the traffic, and forwards it to your origin silently.
- **Payload & Connection Defenders:** Instantly drops slow connections (Slowloris mitigation) and strictly enforces a 15MB payload size limit to prevent memory exhaustion.
- **Real-IP Injection:** Identifies the true client IP and injects standard proxy headers (`X-Forwarded-For`, `X-Shield-Connecting-IP`, `X-Shield-Country`) allowing your origin server to read traffic natively.
- **Static Asset Caching (Redis):** Intercepts requests for `.js`, `.css`, and images. Caches them seamlessly in Redis RAM and serves subsequent hits in milliseconds without waking up your origin server.

### 2. 🧠 The Control API (`NestJS & PostgreSQL`)
The central nervous system linking the Edge Proxy to the UI Dashboard.
- **Rule Synchronization:** Manages domain configurations, WAF toggles, and IP lists in a persistent PostgreSQL database.
- **Live Traffic Sockets:** Streams real-time HTTP metrics directly from the Edge Proxy to the Frontend UI via high-speed WebSockets (`socket.io`).
- **Telemetry & Analytics:** Aggregates rate limits, WAF blocks, and IP challenges into time-series visual stats.

### 3. 🖥️ The Dashboard (`Vue 3 + TailwindCSS`)
A premium, terminal-inspired dark-mode GUI control center for your infrastructure.
- Monitor live network graphs, active threats, and active proxy nodes.
- Configure Web Application Firewall (WAF) sensitivities.
- Update firewall rules and rate limits without ever restarting the proxy.

---

## 🛡️ Ultimate Protection Features

| Feature | Description |
| :--- | :--- |
| **Global Threat Blacklist** | Actively synchronizes with world-wide threat intelligence feeds to automatically drop connections from known botnets and malicious actors at the socket layer. |
| **Advanced WAF** | Inspects request paths, headers, and payloads to intercept OWASP Top 10 vulnerabilities (SQLi, XSS, Path Traversal, Command Injection). |
| **Dynamic Rate Limiting** | Set custom request-per-minute limits independently for each domain. Offending IPs receive an `HTTP 429` block instantly. |
| **JS Challenge Mode** | Flip the "Under Attack" switch to serve an interstitial validation page checking the browser's JavaScript capabilities before granting access. |
| **Complex Custom Rules** | An edge rule-engine allowing you to match traffic by `URI Path`, `HTTP Header`, or `Query Parameter` (e.g., *If URI contains `/admin` AND Country is NOT `US`, Drop Connection*). |
| **Geo-IP Blocking** | Block specific countries or entire ASNs from interacting with your application. |

---

## 🚀 Getting Started

Deploying ShieldDOS takes entirely under a minute utilizing Docker Compose.

### 1. Clone & Prepare
```bash
git clone https://github.com/essex580/shielddos.git
cd shielddos
```

### 2. Generate SSL Certificates (Optional but Recommended)
To enable HTTPS termination, generate a local self-signed certificate (or place your valid certs in the `/certs` folder).
```bash
mkdir certs
openssl req -nodes -new -x509 -keyout certs/server.key -out certs/server.cert -days 365 -subj "/CN=localhost"
```

### 3. Spin Up the Infrastructure
```bash
docker-compose up --build -d
```
Docker will map the highly-optimized proxy to ports `8080`(HTTP) and `443`(HTTPS).

### 4. Access the Command Center
Open your browser and navigate to:
**[http://localhost:5173](http://localhost:5173)**

*Default Login info can be found in the API `.env` variables or configured via PostgreSQL directly.*

---

## 📡 Live Event Tailing
ShieldDOS features a **Live Tail** event viewer. You no longer need to `tail -f /var/log/nginx/access.log`. Every single connection, block, drop, or challenge is streamed live onto your Dashboard screen via WebSockets, color-coded by HTTP method and threat severity.

---
<div align="center">
  <b>Built for Performance. Engineered for Security.</b><br>
  <i>Developed with ❤️ by Essex.</i>
</div>
