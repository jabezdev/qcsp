# QCSP - Central Hub & Applications

This repository contains all QCSP applications served under a single domain.

## Structure

```
qcsp/
├── docker-compose.yml      # Main orchestration file
├── nginx/                  # Nginx reverse proxy configuration
│   ├── nginx.conf
│   └── conf.d/
│       └── default.conf
├── qcsp-hub/               # Main landing page / app marketplace
└── qcsp-volunteers/        # Volunteer Matrix application
```

## URL Routing

| URL Path | Application |
|----------|-------------|
| `qcsp.mydomain.com/` | QCSP Hub (Marketplace) |
| `qcsp.mydomain.com/volunteers/` | Volunteer Matrix App |

## Quick Start

### Development

Each app can be run independently for development:

```bash
# Hub (port 8081)
cd qcsp-hub
npm install
npm run dev

# Volunteers (port 8080 for frontend, 3001 for API)
cd qcsp-volunteers
npm install
npm run dev        # Frontend
npm run server     # API server
```

### Production (Docker)

From the root `qcsp` directory:

```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

The stack will be available at `http://localhost` (or your configured domain).

## Adding New Apps

1. Create a new folder: `qcsp-<app-name>/`
2. Follow the same stack (Vite + React + TypeScript + Tailwind)
3. Configure `vite.config.ts` with `base: "/<app-name>/"`
4. Add the service to `docker-compose.yml`
5. Add nginx routing in `nginx/conf.d/default.conf`
6. Add the app card in `qcsp-hub/src/pages/Index.tsx`

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express (per-app API servers)
- **Proxy**: Nginx (reverse proxy for routing)
- **Container**: Docker, Docker Compose

## Configuration

### Environment Variables

**Volunteers App:**
- `PORT` - API server port (default: 3001)
- `DATA_FILE` - Path to data JSON file
- `NODE_ENV` - Environment (development/production)

### DNS Setup

Point your domain to your VPS:
```
qcsp.mydomain.com -> YOUR_VPS_IP
```

No wildcard or multi-level subdomain configuration needed!

## License

Internal use only - QCSP Organization
