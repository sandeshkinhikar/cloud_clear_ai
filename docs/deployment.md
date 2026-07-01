# Deployment Guide

## Docker

```bash
docker build -t cloudclear-ai -f deployment/Dockerfile .
docker run -p 8000:8000 cloudclear-ai
```

## CI/CD

GitHub Actions workflows are located in .github/workflows/ci.yml and validate backend compilation and frontend production builds.
