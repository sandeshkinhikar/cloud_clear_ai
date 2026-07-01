# CloudClear AI

CloudClear AI is a generative AI platform for cloud removal and reconstruction of LISS-IV satellite imagery. It combines cloud segmentation, fusion-guided reconstruction, confidence estimation, and a polished research dashboard for rapid visual assessment.

## Highlights

- Automatic cloud detection over optical imagery
- Diffusion-inspired reconstruction for cloud-covered regions
- SAR and multispectral support for more realistic restoration
- Interactive dashboard with comparison slider and confidence map
- End-to-end API for upload, detection, reconstruction, metrics, and history

## Project Structure

- frontend/: Vite + React + TypeScript dashboard
- backend/: FastAPI services and API endpoints
- docs/: Architecture, workflow, and deployment documentation
- deployment/: Docker and CI/CD assets

## Quick Start

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Demo Flow

1. Upload a cloudy LISS-IV image.
2. Run cloud detection to generate a mask.
3. Run reconstruction to produce a cloud-free estimate.
4. Review metrics and confidence output in the dashboard.
