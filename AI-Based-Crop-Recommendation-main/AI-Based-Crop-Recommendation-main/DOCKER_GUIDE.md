# Docker Deployment Guide

This guide explains how to use Docker and Docker Compose for local development and production deployment.

## Prerequisites

- Docker Desktop installed ([download](https://www.docker.com/products/docker-desktop))
- Docker Compose (included with Docker Desktop)
- Git

---

## Local Development with Docker Compose

### 1. Quick Start

```bash
# Clone the repository
git clone <your-repo-url>
cd <repo-directory>

# Start all services (frontend, backend, database)
docker-compose up

# First run only: may take 2-3 minutes to build
# Subsequent runs: ~30 seconds
```

### 2. Access Services

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Database**: localhost:5432 (postgres:postgres)

### 3. Common Docker Compose Commands

```bash
# View logs
docker-compose logs backend              # Backend logs only
docker-compose logs -f                   # Follow all logs
docker-compose logs frontend             # Frontend logs

# Stop services
docker-compose down

# Stop and remove volumes (delete database data)
docker-compose down -v

# Rebuild images
docker-compose build

# Restart a specific service
docker-compose restart backend

# Run a one-off command
docker-compose exec backend python train_model.py
docker-compose exec db psql -U postgres -d agrismart -c "SELECT * FROM farmers;"

# Scale services
docker-compose up --scale backend=3      # Run 3 backend instances
```

### 4. Customizing Docker Compose

Edit `docker-compose.yml` to customize:

```yaml
# Change ports
ports:
  - "8001:8000" # Use 8001 instead of 8000

# Change environment variables
environment:
  VITE_API_BASE_URL: http://your-custom-url:8000

# Add volumes for persistent development
volumes:
  - ./backend:/app # Auto-reload backend on code changes
```

---

## Production Deployment with Docker

### Option A: Docker Hub + Cloud Platform

#### Step 1: Create Docker Hub Account

1. Go to [Docker Hub](https://hub.docker.com)
2. Create a free account
3. Create a repository: `your-username/agrismart-backend`

#### Step 2: Build and Push Image

```bash
cd crop-recommendation-system/backend

# Login to Docker Hub
docker login

# Build image
docker build -t your-username/agrismart-backend:latest .

# Tag for release
docker tag your-username/agrismart-backend:latest your-username/agrismart-backend:v1.0.0

# Push to Docker Hub
docker push your-username/agrismart-backend:latest
docker push your-username/agrismart-backend:v1.0.0
```

#### Step 3: Deploy to Cloud

**Railway**

```bash
# Connect Docker image
railway link your-username/agrismart-backend:latest
```

**AWS ECS**

```bash
# Push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
docker tag your-username/agrismart-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/agrismart:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/agrismart:latest
```

**DigitalOcean**

```bash
# Use doctl
doctl registry create agrismart
doctl registry login
docker tag agrismart-backend:latest registry.digitalocean.com/agrismart/backend:latest
docker push registry.digitalocean.com/agrismart/backend:latest
```

### Option B: Container Orchestration (Kubernetes)

For advanced deployments, use Kubernetes. See [k8s-deployment.yaml](k8s-deployment.yaml) (if available).

---

## Docker Configuration Files

### Dockerfile (Backend)

Located at: `crop-recommendation-system/backend/Dockerfile`

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user for security
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Docker Compose

Located at: `docker-compose.yml`

- PostgreSQL database service
- Backend FastAPI service
- Frontend React/Vite service
- Volume management for development
- Network configuration for service communication

---

## Building Production-Ready Images

### Step 1: Optimize Image Size

```dockerfile
# Multi-stage build to reduce image size
FROM python:3.11-slim as builder

WORKDIR /app
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

FROM python:3.11-slim
WORKDIR /app
COPY --from=builder /root/.local /root/.local
COPY . .

ENV PATH=/root/.local/bin:$PATH
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Step 2: Add Health Check

```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/health')"
```

### Step 3: Security Best Practices

```dockerfile
# Run as non-root user
USER appuser

# Don't run containers as root
# Use specific Python versions
# Minimize image layers
# Use .dockerignore to exclude files
```

---

## Environment Variables for Docker

### Backend (.env)

```bash
DATABASE_URL=postgresql://postgres:postgres@db:5432/agrismart
ALLOWED_ORIGINS=http://localhost:5173,https://yourdomain.com
ENVIRONMENT=production
```

### Frontend (.env.production)

```bash
VITE_API_BASE_URL=http://backend:8000  # For Docker network
VITE_API_BASE_URL=https://api.yourdomain.com  # For production
```

---

## Debugging Docker Containers

### View Container Logs

```bash
docker logs <container-id>
docker logs -f <container-id>  # Follow logs
docker logs --tail 100 <container-id>  # Last 100 lines
```

### Execute Commands in Container

```bash
docker exec -it <container-id> bash
docker exec <container-id> python -c "print('Hello')"
docker exec <container-id> ls -la
```

### Inspect Container

```bash
docker inspect <container-id>
docker ps -a
docker images
```

### Debug Network

```bash
docker network ls
docker network inspect bridge
docker-compose exec backend ping db
```

---

## Scaling with Docker

### Horizontal Scaling

```bash
# Run multiple backend instances
docker-compose up --scale backend=3
```

### Load Balancer

Add Nginx to docker-compose.yml:

```yaml
nginx:
  image: nginx:latest
  ports:
    - "80:80"
  volumes:
    - ./nginx.conf:/etc/nginx/nginx.conf
  depends_on:
    - backend
```

---

## Cleanup and Maintenance

### Remove Unused Images

```bash
docker image prune
docker image prune -a  # Remove all unused images
```

### Remove Unused Containers

```bash
docker container prune
```

### Remove Unused Volumes

```bash
docker volume prune
```

### Remove Everything (Full Cleanup)

```bash
docker system prune -a --volumes
```

---

## Docker on Different Platforms

| Platform               | Command                                            | Documentation                                                                    |
| ---------------------- | -------------------------------------------------- | -------------------------------------------------------------------------------- |
| Mac with Apple Silicon | `docker build --platform linux/amd64`              | [Apple Silicon Support](https://docs.docker.com/desktop/install/mac-install/)    |
| Windows                | Use Docker Desktop                                 | [Windows Installation](https://docs.docker.com/desktop/install/windows-install/) |
| Linux                  | Install Docker Engine                              | [Linux Installation](https://docs.docker.com/engine/install/)                    |
| GitHub Actions         | See [CI/CD Guide](.github/workflows/docker-ci.yml) | [GitHub Docs](https://docs.github.com/en/actions)                                |

---

## Troubleshooting

### Port Already in Use

```bash
# Change port in docker-compose.yml
ports:
  - "8001:8000"  # Use 8001 instead

# Or find and kill process
lsof -i :8000
kill -9 <PID>
```

### Database Connection Error

```bash
# Verify database is running
docker ps
docker logs <database-container-id>

# Check network connectivity
docker-compose exec backend ping db
```

### Image Build Fails

```bash
# Clear build cache
docker build --no-cache .

# Check Dockerfile syntax
docker build --progress=plain .
```

### Permission Denied

```bash
# Add current user to docker group (Linux)
sudo usermod -aG docker $USER
newgrp docker

# Or use sudo
sudo docker-compose up
```

---

## CI/CD with Docker

Example GitHub Actions workflow (`.github/workflows/docker-ci.yml`):

```yaml
name: Docker CI/CD

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: docker/setup-buildx-action@v2

      - name: Build image
        uses: docker/build-push-action@v4
        with:
          context: ./crop-recommendation-system/backend
          push: false
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Run tests
        run: docker-compose run backend pytest
```

---

## Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Docker Hub](https://hub.docker.com)
- [Best Practices](https://docs.docker.com/develop/dev-best-practices/)

---

**Next**: See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for production deployment strategies.
