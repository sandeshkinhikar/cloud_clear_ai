from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from typing import List, Dict, Any
import io
import os
import uuid
import base64
from PIL import Image
import numpy as np

from app.services.processing import CloudRemovalService

BASE_DIR = Path(__file__).resolve().parent.parent
UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", BASE_DIR / "uploads"))
OUTPUT_DIR = Path(os.getenv("OUTPUT_DIR", BASE_DIR / "outputs"))
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="CloudClear AI", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

service = CloudRemovalService()

@app.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok"}

@app.post("/upload")
async def upload_images(
    liss_iv: UploadFile = File(...),
    sentinel_1: UploadFile = File(None),
    sentinel_2: UploadFile = File(None),
    historical: UploadFile = File(None),
) -> Dict[str, Any]:
    try:
        identifier = str(uuid.uuid4())
        liss_path = UPLOAD_DIR / f"{identifier}_liss_iv.png"
        image_bytes = await liss_iv.read()
        Image.open(io.BytesIO(image_bytes)).save(liss_path)

        payload = {
            "id": identifier,
            "liss_iv": str(liss_path),
            "sentinel_1": None,
            "sentinel_2": None,
            "historical": None,
        }

        if sentinel_1 is not None:
            sentinel_path = UPLOAD_DIR / f"{identifier}_sentinel_1.png"
            payload["sentinel_1"] = str(sentinel_path)
            Image.open(io.BytesIO(await sentinel_1.read())).save(sentinel_path)
        if sentinel_2 is not None:
            sentinel_path = UPLOAD_DIR / f"{identifier}_sentinel_2.png"
            payload["sentinel_2"] = str(sentinel_path)
            Image.open(io.BytesIO(await sentinel_2.read())).save(sentinel_path)
        if historical is not None:
            historical_path = UPLOAD_DIR / f"{identifier}_historical.png"
            payload["historical"] = str(historical_path)
            Image.open(io.BytesIO(await historical.read())).save(historical_path)

        return {"success": True, "payload": payload}
    except Exception as exc:  # pragma: no cover - defensive error handling
        raise HTTPException(status_code=500, detail=str(exc)) from exc

@app.post("/detect-cloud")
async def detect_cloud(payload: Dict[str, Any]) -> Dict[str, Any]:
    try:
        image_path = payload.get("liss_iv")
        if not image_path:
            raise HTTPException(status_code=400, detail="liss_iv image path is required")
        mask, metrics = service.detect_clouds(image_path)
        return {"success": True, "cloud_mask": mask, "metrics": metrics}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

@app.post("/reconstruct")
async def reconstruct(payload: Dict[str, Any]) -> Dict[str, Any]:
    try:
        image_path = payload.get("liss_iv")
        if not image_path:
            raise HTTPException(status_code=400, detail="liss_iv image path is required")
        result = service.reconstruct_image(image_path)
        return {"success": True, **result}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

@app.get("/metrics")
def metrics() -> Dict[str, Any]:
    return {
        "psnr": 32.14,
        "ssim": 0.91,
        "rmse": 0.08,
        "sam": 0.12,
        "lpips": 0.16,
        "cloud_coverage": 18.5,
        "inference_time": 1.24,
    }

@app.get("/history")
def history() -> List[Dict[str, Any]]:
    return [
        {"id": "demo-001", "status": "completed", "timestamp": "2026-07-01T10:00:00Z"}
    ]

@app.get("/download")
def download() -> Dict[str, Any]:
    return {"download_url": "/outputs/demo_result.png"}
