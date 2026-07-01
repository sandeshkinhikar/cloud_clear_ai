from __future__ import annotations

from typing import Dict, Any


class ModelRegistry:
    """Central registry of model metadata for the inference pipeline."""

    def __init__(self) -> None:
        self.models: Dict[str, Dict[str, Any]] = {
            "cloud_segmentation": {
                "name": "U-Net Cloud Segmentation",
                "type": "segmentation",
                "status": "ready",
            },
            "reconstruction": {
                "name": "Latent Diffusion Reconstruction",
                "type": "generative",
                "status": "ready",
            },
        }

    def list_models(self) -> Dict[str, Dict[str, Any]]:
        return self.models
