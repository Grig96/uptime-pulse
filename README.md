# Uptime Pulse

A lightweight, real-time service availability monitoring web application.

![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=flat&logo=docker&logoColor=white)
![Kubernetes](https://img.shields.io/badge/kubernetes-%23326ce5.svg?style=flat&logo=kubernetes&logoColor=white)
![Nginx](https://img.shields.io/badge/nginx-%23009639.svg?style=flat&logo=nginx&logoColor=white)

## Features

- Real-time URL health checking
- Response time metrics with color-coded indicators
- Status code tracking
- Check history (last 10 checks)
- Dark theme optimized for DevOps workflows
- Lightweight (~5MB container image)

## Quick Start

### Docker Compose (Recommended)

```bash
# Build and run
docker-compose up -d

# Access at http://localhost:8080
```

### Docker CLI

```bash
# Build the image
docker build -t uptime-checker:latest .

# Run the container
docker run -d \
  --name uptime-checker \
  -p 8080:80 \
  --restart unless-stopped \
  uptime-checker:latest

# Access at http://localhost:8080
```

### Kubernetes

```bash
# Apply all manifests
kubectl apply -f k8s/deployment.yaml

# Check deployment status
kubectl get pods -n uptime-checker

# Port-forward for local testing
kubectl port-forward svc/uptime-checker 8080:80 -n uptime-checker
```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NGINX_PORT` | `80` | Internal nginx port |

### Kubernetes Ingress

Edit `k8s/deployment.yaml` to configure:
- Your domain in `spec.rules[].host`
- TLS settings (uncomment the tls section)
- Ingress annotations for your ingress controller

## Endpoints

| Path | Description |
|------|-------------|
| `/` | Main application |
| `/health` | Liveness probe endpoint |
| `/ready` | Readiness probe endpoint |

## Project Structure

```
uptime-checker/
├── Dockerfile           # Multi-stage build for minimal image
├── docker-compose.yml   # Local development & deployment
├── nginx.conf          # Nginx configuration with security headers
├── html/
│   └── index.html      # Main application
├── k8s/
│   └── deployment.yaml # Kubernetes manifests (Deployment, Service, Ingress)
└── README.md
```

## Resource Requirements

| Resource | Request | Limit |
|----------|---------|-------|
| CPU | 50m | 100m |
| Memory | 32Mi | 64Mi |

## Security

- Security headers configured (X-Frame-Options, X-Content-Type-Options, etc.)
- Non-root container execution supported
- Minimal attack surface with Alpine-based nginx image

## Monitoring

The container includes health checks compatible with:
- Docker health checks
- Kubernetes liveness/readiness probes
- Load balancer health checks

## License

MIT
